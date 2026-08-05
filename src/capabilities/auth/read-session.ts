import type { CallerContext } from "../context.js";

export function readAuthSession(context: CallerContext) {
  return { actorId: context.actorId, actorType: context.actorType, permissions: [...context.permissions].sort(), correlationId: context.correlationId, transport: context.transport };
}
