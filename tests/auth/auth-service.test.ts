import { describe, expect, it } from "vitest";
import { AuthService, InMemoryAuthTransactionStore } from "@/modules/auth";

describe("first-party WorkOS service", () => {
  it("binds PKCE/state/nonce and returns to safe intent after callback", async () => {
    const provider = {
      async authorizationUrl() { return { url: "https://auth.example/start", state: "state-1", codeVerifier: "verifier-1" }; },
      async exchange() { return { sealedSession: "sealed", userId: "user-1", organizationId: "org-1", permissions: ["reference:read"], sessionId: "session-1" }; },
      async authenticateSession() { return { authenticated: false as const, terminal: true as const, reason: "invalid" }; },
      async logoutUrl() { return "https://auth.example/logout"; },
    };
    const service = new AuthService(provider, new InMemoryAuthTransactionStore(), { redirectUri: "https://app.example/auth/callback", returnAllowlist: ["/home"], entryMode: "invite-only" });
    const login = await service.beginLogin({ returnTo: "/home/work", nonce: "nonce-1" });
    expect(login.url).toContain("auth.example");
    const result = await service.finishCallback({ state: "state-1", code: "code-1" });
    expect(result).toMatchObject({ state: "authenticated", sealedSession: "sealed", returnTo: "/home/work" });
    await expect(service.finishCallback({ state: "state-1", code: "code-1" })).rejects.toMatchObject({ code: "INVALID_AUTH_TRANSACTION" });
  });

  it("preserves a session on transient refresh failure and clears it on terminal failure", async () => {
    const base = { authorizationUrl: async () => ({ url: "x", state: "s", codeVerifier: "v" }), exchange: async () => { throw new Error("unused"); }, logoutUrl: async () => "x" };
    const transient = new AuthService({ ...base, authenticateSession: async () => ({ authenticated: false as const, terminal: false as const, reason: "upstream" }) }, new InMemoryAuthTransactionStore(), { redirectUri: "https://app.example/auth/callback", returnAllowlist: ["/"], entryMode: "open" });
    expect(await transient.loadSession("sealed")).toMatchObject({ state: "retry", preserveCookie: true });
    const terminal = new AuthService({ ...base, authenticateSession: async () => ({ authenticated: false as const, terminal: true as const, reason: "invalid_grant" }) }, new InMemoryAuthTransactionStore(), { redirectUri: "https://app.example/auth/callback", returnAllowlist: ["/"], entryMode: "open" });
    expect(await terminal.loadSession("sealed")).toMatchObject({ state: "reauthenticate", preserveCookie: false });
  });
});
