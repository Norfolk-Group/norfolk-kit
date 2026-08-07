import { randomBytes } from "node:crypto";
import type { Request, Response, Router } from "express";
import { AuthService, InMemoryAuthTransactionStore, isSafeReturnIntent, sessionCookieOptions, type EntryMode } from "./index.js";
import { WorkOSAuthProvider } from "./workos-provider.js";

export const AUTH_COOKIE = "norfolk_session";

function required(name: string): string {
  const value = process.env[name];
  if (!value) throw new Error(`Missing ${name}`);
  return value;
}

export function parseCookie(request: Request, name = AUTH_COOKIE): string | undefined {
  const header = request.header("cookie") ?? "";
  for (const part of header.split(";")) {
    const [key, ...rest] = part.trim().split("=");
    if (key === name) return decodeURIComponent(rest.join("="));
  }
  return undefined;
}

export function createAuthServiceFromEnvironment() {
  const redirectUri = required("WORKOS_REDIRECT_URI");
  const entryMode = (process.env.AUTH_ENTRY_MODE ?? "invite-only") as EntryMode;
  if (!(["open", "invite-only"] as string[]).includes(entryMode)) throw new Error("AUTH_ENTRY_MODE must be open or invite-only");
  return new AuthService(
    new WorkOSAuthProvider({ apiKey: required("WORKOS_API_KEY"), clientId: required("WORKOS_CLIENT_ID"), cookiePassword: required("WORKOS_COOKIE_PASSWORD") }),
    new InMemoryAuthTransactionStore(),
    { redirectUri, entryMode, returnAllowlist: (process.env.AUTH_RETURN_ALLOWLIST ?? "/").split(",").map((value) => value.trim()).filter(Boolean) },
  );
}

export function installAuthRoutes(router: Router, service: AuthService) {
  router.get("/login", async (request: Request, response: Response) => {
    const returnTo = typeof request.query.returnTo === "string" ? request.query.returnTo : "/";
    const login = await service.beginLogin({ returnTo, nonce: randomBytes(24).toString("base64url") });
    response.redirect(303, login.url);
  });
  router.get("/callback", async (request: Request, response: Response) => {
    if (typeof request.query.state !== "string" || typeof request.query.code !== "string") return response.status(400).json({ state: "callback-failure", recovery: "/auth/login" });
    const result = await service.finishCallback({ state: request.query.state, code: request.query.code });
    response.cookie(AUTH_COOKIE, result.sealedSession, sessionCookieOptions(process.env.NODE_ENV === "production"));
    response.redirect(303, result.returnTo);
  });
  router.post("/logout", async (request: Request, response: Response) => {
    const session = await service.loadSession(parseCookie(request));
    response.clearCookie(AUTH_COOKIE, { path: "/" });
    if (session.state !== "authenticated") return response.status(204).end();
    response.redirect(303, await service.logoutUrl(session.identity.sessionId));
  });
  router.post("/switch-organization", async (request: Request, response: Response) => {
    const organizationId = typeof request.body?.organizationId === "string" ? request.body.organizationId : "";
    if (!organizationId) return response.status(400).json({ state: "organization-selection", error: "organization required" });
    const session = await service.loadSession(parseCookie(request), organizationId);
    if (session.state !== "authenticated") return response.status(401).json(session);
    response.cookie(AUTH_COOKIE, session.identity.sealedSession, sessionCookieOptions(process.env.NODE_ENV === "production"));
    return response.json({ state: "authenticated", organizationId: session.identity.organizationId });
  });
}

export function validateAuthEnvironment(environment = process.env): string[] {
  const errors: string[] = [];
  for (const key of ["WORKOS_API_KEY", "WORKOS_CLIENT_ID", "WORKOS_COOKIE_PASSWORD", "WORKOS_REDIRECT_URI"]) if (!environment[key]) errors.push(`missing ${key}`);
  if ((environment.WORKOS_COOKIE_PASSWORD ?? "").length < 32) errors.push("WORKOS_COOKIE_PASSWORD must be at least 32 characters");
  try {
    const redirect = new URL(environment.WORKOS_REDIRECT_URI ?? "invalid:");
    if (environment.NODE_ENV === "production" && redirect.protocol !== "https:") errors.push("production WORKOS_REDIRECT_URI must use HTTPS");
    if (redirect.pathname !== "/auth/callback") errors.push("WORKOS_REDIRECT_URI must end at /auth/callback");
  } catch { errors.push("WORKOS_REDIRECT_URI must be an absolute URL"); }
  const allowlist = (environment.AUTH_RETURN_ALLOWLIST ?? "/").split(",");
  if (allowlist.some((value) => !isSafeReturnIntent(value.trim(), [value.trim()]))) errors.push("AUTH_RETURN_ALLOWLIST must contain application-relative paths");
  return errors;
}
