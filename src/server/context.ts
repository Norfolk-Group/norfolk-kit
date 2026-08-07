import type { Request, Response } from "express";
import { randomUUID } from "node:crypto";
import { authenticatedCaller, createCallerContext, type ActorType } from "../capabilities/index.js";
import { createAuthServiceFromEnvironment, parseCookie } from "../modules/auth/runtime.js";

export class VerifiedIdentityRequiredError extends Error {
  readonly code = "VERIFIED_IDENTITY_REQUIRED";

  constructor() {
    super("Production requests require a verified WorkOS identity adapter");
    this.name = "VerifiedIdentityRequiredError";
  }
}

export async function createHttpContext(request: Request, response?: Response) {
  if (process.env.NODE_ENV === "production") {
    try {
      const service = createAuthServiceFromEnvironment();
      const session = await service.loadSession(parseCookie(request));
      if (session.state !== "authenticated") throw new VerifiedIdentityRequiredError();
      if (session.identity.sealedSession !== parseCookie(request) && response) response.cookie("norfolk_session", session.identity.sealedSession, { httpOnly: true, secure: true, sameSite: "lax", path: "/" });
      return authenticatedCaller(session.identity, "trpc", request.header("x-correlation-id") ?? randomUUID());
    } catch (error) {
      if (error instanceof VerifiedIdentityRequiredError) throw error;
      throw new VerifiedIdentityRequiredError();
    }
  }
  const actorType: ActorType = request.header("x-actor-type") === "agent" ? "agent" : "human";
  return createCallerContext({
    actorId: request.header("x-actor-id") ?? "reference-user",
    actorType,
    permissions: (request.header("x-permissions") ?? "reference:read").split(",").filter(Boolean),
    correlationId: request.header("x-correlation-id") ?? randomUUID(),
    transport: "trpc",
  });
}
