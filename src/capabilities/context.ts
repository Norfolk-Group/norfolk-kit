export type ActorType = "human" | "agent";
export type CallerTransport = "direct" | "trpc" | "mcp" | "scheduler" | "report";

export interface CallerContext {
  actorId: string;
  actorType: ActorType;
  permissions: ReadonlySet<string>;
  correlationId: string;
  transport: CallerTransport;
}

interface CallerContextInput {
  actorId: string;
  actorType: ActorType;
  permissions: string[];
  correlationId: string;
  transport: CallerTransport;
}

export function createCallerContext(input: CallerContextInput): CallerContext {
  if (!input.actorId || !input.correlationId) throw new Error("Caller identity and correlation ID are required");
  return { ...input, permissions: new Set(input.permissions) };
}

export class CapabilityForbiddenError extends Error {
  readonly code = "FORBIDDEN";

  constructor(permission: string) {
    super(`Caller lacks ${permission}`);
    this.name = "CapabilityForbiddenError";
  }
}

export function requirePermission(context: CallerContext, permission: string): void {
  if (!context.permissions.has(permission)) throw new CapabilityForbiddenError(permission);
}
