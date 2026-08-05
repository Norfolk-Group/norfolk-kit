import type { Request } from "express";
import { randomUUID } from "node:crypto";
import { createCallerContext, type ActorType } from "../capabilities/index.js";

export class VerifiedIdentityRequiredError extends Error {
  readonly code = "VERIFIED_IDENTITY_REQUIRED";

  constructor() {
    super("Production requests require a verified WorkOS identity adapter");
    this.name = "VerifiedIdentityRequiredError";
  }
}

export function createHttpContext(request: Request) {
  if (process.env.NODE_ENV === "production") throw new VerifiedIdentityRequiredError();
  const actorType: ActorType = request.header("x-actor-type") === "agent" ? "agent" : "human";
  return createCallerContext({
    actorId: request.header("x-actor-id") ?? "reference-user",
    actorType,
    permissions: (request.header("x-permissions") ?? "reference:read").split(",").filter(Boolean),
    correlationId: request.header("x-correlation-id") ?? randomUUID(),
    transport: "trpc",
  });
}
