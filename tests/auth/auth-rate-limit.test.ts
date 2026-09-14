import type { AddressInfo } from "node:net";
import express, { type ErrorRequestHandler } from "express";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { AuthService, InMemoryAuthTransactionStore, type AuthProvider } from "@/modules/auth";
import { installAuthRoutes } from "@/modules/auth/runtime";

describe("login rate limiting", () => {
  const shutdowns: Array<() => Promise<void>> = [];
  beforeEach(() => {
    vi.useFakeTimers({ toFake: ["Date"] });
    vi.setSystemTime(new Date("2026-09-14T12:00:00Z"));
  });
  afterEach(async () => {
    await Promise.all(shutdowns.splice(0).map((shutdown) => shutdown()));
    vi.useRealTimers();
  });

  async function start() {
    let loginCalls = 0;
    let exchangeCalls = 0;
    const provider: AuthProvider = {
      async authorizationUrl() {
        loginCalls += 1;
        return { url: "https://auth.example/start", state: `state-${loginCalls}`, codeVerifier: "verifier" };
      },
      async exchange() {
        exchangeCalls += 1;
        return { sealedSession: "sealed", userId: "user-1", permissions: [], sessionId: "session-1" };
      },
      async authenticateSession() { return { authenticated: false, terminal: true, reason: "invalid" }; },
      async logoutUrl() { return "https://auth.example/logout"; },
    };
    const service = new AuthService(provider, new InMemoryAuthTransactionStore(), {
      redirectUri: "https://app.example/auth/callback", returnAllowlist: ["/"], entryMode: "invite-only",
    });
    const app = express();
    const router = express.Router();
    installAuthRoutes(router, service);
    app.use("/auth", router);
    // Keep expected service errors quiet; do not replace auth or limiter behavior.
    const errorHandler: ErrorRequestHandler = (error, _request, response, next) => {
      if (response.headersSent) return next(error);
      response.status(500).end();
    };
    app.use(errorHandler);
    const server = app.listen(0, "127.0.0.1");
    await new Promise<void>((resolve) => server.once("listening", resolve));
    shutdowns.push(() => new Promise<void>((resolve, reject) => server.close((error) => error ? reject(error) : resolve())));
    const base = `http://127.0.0.1:${(server.address() as AddressInfo).port}`;
    return {
      calls: () => ({ loginCalls, exchangeCalls }),
      request: (path = "/login", headers: Record<string, string> = {}) => fetch(`${base}/auth${path}`, { redirect: "manual", headers }),
    };
  }

  it("blocks the eleventh login before provider work, without blocking a valid callback", async () => {
    const app = await start();
    for (let attempt = 0; attempt < 10; attempt += 1) {
      const response = await app.request();
      expect(response.status).toBe(303);
      expect(response.headers.get("location")).toBe("https://auth.example/start");
      await response.text();
    }
    const blocked = await app.request();
    expect(blocked.status).toBe(429);
    expect(blocked.headers.get("retry-after")).toBe("900");
    expect(blocked.headers.get("ratelimit-policy")).toMatch(/q=10;\s*w=900/);
    await expect(blocked.json()).resolves.toEqual({ state: "rate-limited", recovery: "retry after the Retry-After interval" });
    expect(app.calls()).toEqual({ loginCalls: 10, exchangeCalls: 0 });
    const callback = await app.request("/callback?state=state-1&code=code-1");
    expect(callback.status).toBe(303);
    expect(callback.headers.get("set-cookie")).toContain("norfolk_session=sealed");
    await callback.text();
    expect(app.calls().exchangeCalls).toBe(1);
  });

  it("does not let forged forwarding headers reset the direct client's budget", async () => {
    const app = await start();
    const initial = await app.request();
    expect(initial.status).toBe(303);
    await initial.text();
    for (let attempt = 1; attempt <= 10; attempt += 1) {
      const response = await app.request("/login", { "x-forwarded-for": `192.0.2.${attempt}`, forwarded: `for=192.0.2.${attempt}` });
      expect(response.status).toBe(attempt < 10 ? 303 : 429);
      await response.text();
    }
    expect(app.calls().loginCalls).toBe(10);
  });

  it("allows another login after the window resets", async () => {
    const app = await start();
    for (let attempt = 0; attempt < 10; attempt += 1) await (await app.request()).text();
    const blocked = await app.request();
    expect(blocked.status).toBe(429);
    await blocked.text();
    vi.setSystemTime(new Date("2026-09-14T12:15:00Z"));
    const reset = await app.request();
    expect(reset.status).toBe(303);
    await reset.text();
    expect(app.calls().loginCalls).toBe(11);
  });

  it("counts rejected login starts against the same budget", async () => {
    const app = await start();
    for (let attempt = 0; attempt < 10; attempt += 1) {
      const failed = await app.request("/login?returnTo=https%3A%2F%2Fevil.example");
      expect(failed.status).toBe(500);
      await failed.text();
    }
    const blocked = await app.request();
    expect(blocked.status).toBe(429);
    await blocked.text();
    expect(app.calls()).toEqual({ loginCalls: 0, exchangeCalls: 0 });
  });
});
