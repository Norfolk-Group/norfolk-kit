import { WorkOS } from "@workos-inc/node";
import type { AuthProvider, EntryMode } from "./index.js";

interface WorkOSProviderConfig { apiKey: string; clientId: string; cookiePassword: string }

export class WorkOSAuthProvider implements AuthProvider {
  private readonly workos: WorkOS;
  constructor(private readonly config: WorkOSProviderConfig) { this.workos = new WorkOS(config.apiKey, { clientId: config.clientId }); }
  async authorizationUrl(input: { redirectUri: string; nonce: string; entryMode: EntryMode }) {
    return this.workos.userManagement.getAuthorizationUrlWithPKCE({
      clientId: this.config.clientId,
      redirectUri: input.redirectUri,
      provider: "authkit",
      claimNonce: input.nonce,
      screenHint: input.entryMode === "open" ? "sign-up" : "sign-in",
    });
  }
  async exchange(input: { code: string; codeVerifier: string }) {
    const response = await this.workos.userManagement.authenticateWithCode({
      clientId: this.config.clientId,
      code: input.code,
      codeVerifier: input.codeVerifier,
      session: { sealSession: true, cookiePassword: this.config.cookiePassword },
    });
    if (!response.sealedSession) throw new Error("WorkOS did not return sealed session data");
    const session = this.workos.userManagement.loadSealedSession({ sessionData: response.sealedSession, cookiePassword: this.config.cookiePassword });
    const verified = await session.authenticate();
    if (!verified.authenticated) throw new Error(`WorkOS sealed session verification failed: ${verified.reason}`);
    return { sealedSession: response.sealedSession, userId: response.user.id, organizationId: verified.organizationId, permissions: verified.permissions ?? [], sessionId: verified.sessionId };
  }
  async authenticateSession(sealedSession: string, organizationId?: string) {
    const session = this.workos.userManagement.loadSealedSession({ sessionData: sealedSession, cookiePassword: this.config.cookiePassword });
    if (!organizationId) {
      const current = await session.authenticate();
      if (current.authenticated) return { authenticated: true as const, sealedSession, userId: current.user.id, organizationId: current.organizationId, permissions: current.permissions ?? [], sessionId: current.sessionId };
      if (current.reason !== "invalid_jwt") return { authenticated: false as const, terminal: true, reason: current.reason };
    }
    const refreshed = await session.refresh({ organizationId });
    if (!refreshed.authenticated) return { authenticated: false as const, terminal: !refreshed.retryable, reason: refreshed.reason, retryAfter: "retryAfter" in refreshed ? refreshed.retryAfter : undefined };
    if (!refreshed.sealedSession) throw new Error("WorkOS refresh did not return sealed session data");
    return { authenticated: true as const, sealedSession: refreshed.sealedSession, userId: refreshed.user.id, organizationId: refreshed.organizationId, permissions: refreshed.permissions ?? [], sessionId: refreshed.sessionId };
  }
  async logoutUrl(sessionId: string, returnTo?: string) { return this.workos.userManagement.getLogoutUrl({ sessionId, returnTo }); }
}
