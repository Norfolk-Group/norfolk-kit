export type EntryMode = "open" | "invite-only";

export interface AuthTransaction {
  state: string;
  codeVerifier: string;
  nonce: string;
  returnTo: string;
  expiresAt: number;
  entryMode: EntryMode;
}

export interface AuthTransactionStore {
  put(value: AuthTransaction): void;
  consume(state: string): AuthTransaction | undefined;
}

export class InMemoryAuthTransactionStore implements AuthTransactionStore {
  private readonly records = new Map<string, AuthTransaction>();
  constructor(private readonly now: () => number = Date.now) {}
  put(value: AuthTransaction) { this.records.set(value.state, value); }
  consume(state: string) {
    const value = this.records.get(state);
    this.records.delete(state);
    return value && value.expiresAt > this.now() ? value : undefined;
  }
}

export function isSafeReturnIntent(value: string, allowlist: string[]): boolean {
  let decoded: string;
  try { decoded = decodeURIComponent(value); } catch { return false; }
  if (!decoded.startsWith("/") || decoded.startsWith("//") || /^(?:[a-z]+:|\\)/i.test(decoded)) return false;
  if (decoded.includes("//") || decoded.includes("\\") || [...decoded].some((character) => character.charCodeAt(0) < 32)) return false;
  const path = decoded.split(/[?#]/, 1)[0];
  return allowlist.some((prefix) => path === prefix || path.startsWith(prefix === "/" ? "/" : `${prefix}/`));
}

export function sessionCookieOptions(production: boolean) {
  return { httpOnly: true, secure: production, sameSite: "lax" as const, path: "/", maxAge: 60 * 60 * 24 * 7 * 1000 };
}

export interface AuthenticatedIdentity {
  sealedSession: string;
  userId: string;
  organizationId?: string;
  permissions: string[];
  sessionId: string;
}

export interface AuthProvider {
  authorizationUrl(input: { redirectUri: string; nonce: string; entryMode: EntryMode }): Promise<{ url: string; state: string; codeVerifier: string }>;
  exchange(input: { code: string; codeVerifier: string }): Promise<AuthenticatedIdentity>;
  authenticateSession(sealedSession: string, organizationId?: string): Promise<({ authenticated: true } & AuthenticatedIdentity) | { authenticated: false; terminal: boolean; reason: string; retryAfter?: number }>;
  logoutUrl(sessionId: string, returnTo?: string): Promise<string>;
}

export interface AuthConfig { redirectUri: string; returnAllowlist: string[]; entryMode: EntryMode; transactionTtlMs?: number }

export class AuthFlowError extends Error {
  constructor(readonly code: "INVALID_RETURN_INTENT" | "INVALID_AUTH_TRANSACTION" | "MISSING_SEALED_SESSION", message: string) { super(message); this.name = "AuthFlowError"; }
}

export class AuthService {
  constructor(private readonly provider: AuthProvider, private readonly transactions: AuthTransactionStore, private readonly config: AuthConfig, private readonly now: () => number = Date.now) {}
  async beginLogin(input: { returnTo: string; nonce: string }) {
    if (!isSafeReturnIntent(input.returnTo, this.config.returnAllowlist)) throw new AuthFlowError("INVALID_RETURN_INTENT", "Return intent is not allowed");
    const result = await this.provider.authorizationUrl({ redirectUri: this.config.redirectUri, nonce: input.nonce, entryMode: this.config.entryMode });
    this.transactions.put({ state: result.state, codeVerifier: result.codeVerifier, nonce: input.nonce, returnTo: input.returnTo, expiresAt: this.now() + (this.config.transactionTtlMs ?? 10 * 60_000), entryMode: this.config.entryMode });
    return { url: result.url };
  }
  async finishCallback(input: { state: string; code: string }) {
    const transaction = this.transactions.consume(input.state);
    if (!transaction) throw new AuthFlowError("INVALID_AUTH_TRANSACTION", "Authentication transaction is expired, reused, or invalid");
    const identity = await this.provider.exchange({ code: input.code, codeVerifier: transaction.codeVerifier });
    return { state: "authenticated" as const, ...identity, returnTo: transaction.returnTo };
  }
  async loadSession(sealedSession: string | undefined, organizationId?: string) {
    if (!sealedSession) return { state: "reauthenticate" as const, preserveCookie: false, reason: "missing" };
    const result = await this.provider.authenticateSession(sealedSession, organizationId);
    if (result.authenticated) return { state: "authenticated" as const, preserveCookie: true, identity: result };
    return result.terminal
      ? { state: "reauthenticate" as const, preserveCookie: false, reason: result.reason }
      : { state: "retry" as const, preserveCookie: true, reason: result.reason, retryAfter: result.retryAfter };
  }
  logoutUrl(sessionId: string, returnTo?: string) { return this.provider.logoutUrl(sessionId, returnTo); }
}
