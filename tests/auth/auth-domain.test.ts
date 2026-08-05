import { describe, expect, it } from "vitest";
import { InMemoryAuthTransactionStore, isSafeReturnIntent, sessionCookieOptions } from "@/modules/auth";
import { validateAuthEnvironment } from "@/modules/auth/runtime";

describe("authentication domain boundary", () => {
  it("allows only configured application-relative return intent", () => {
    expect(isSafeReturnIntent("/reports/weekly", ["/reports", "/home"])).toBe(true);
    for (const target of ["https://evil.test", "//evil.test", "/%2f%2fevil.test", "%2F%2Fevil.test", "/admin", "javascript:alert(1)"]) {
      expect(isSafeReturnIntent(target, ["/reports", "/home"])).toBe(false);
    }
  });

  it("consumes OAuth transactions exactly once and rejects expiry", () => {
    const store = new InMemoryAuthTransactionStore(() => 1_000);
    store.put({ state: "state", codeVerifier: "verifier", nonce: "nonce", returnTo: "/home", expiresAt: 2_000, entryMode: "invite-only" });
    expect(store.consume("state")?.codeVerifier).toBe("verifier");
    expect(store.consume("state")).toBeUndefined();
    store.put({ state: "old", codeVerifier: "verifier", nonce: "nonce", returnTo: "/home", expiresAt: 999, entryMode: "invite-only" });
    expect(store.consume("old")).toBeUndefined();
  });

  it("uses production cookie safety attributes", () => {
    expect(sessionCookieOptions(true)).toMatchObject({ httpOnly: true, secure: true, sameSite: "lax", path: "/" });
  });

  it("preflight catches missing, insecure, and wrong callback configuration", () => {
    const errors = validateAuthEnvironment({ NODE_ENV: "production", WORKOS_API_KEY: "x", WORKOS_CLIENT_ID: "x", WORKOS_COOKIE_PASSWORD: "short", WORKOS_REDIRECT_URI: "http://app.example/wrong", AUTH_RETURN_ALLOWLIST: "https://evil.example" });
    expect(errors.length).toBeGreaterThanOrEqual(4);
  });
});
