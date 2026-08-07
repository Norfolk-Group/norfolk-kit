import { requirePermission, type CallerContext } from "./context.js";

export interface ReferenceStatusInput {
  subject: string;
}

export interface ReferenceStatusResult {
  subject: string;
  status: "ready";
  caller: Pick<CallerContext, "actorId" | "actorType" | "correlationId" | "transport">;
}

export async function readReferenceStatus(
  input: ReferenceStatusInput,
  context: CallerContext,
): Promise<ReferenceStatusResult> {
  requirePermission(context, "reference:read");
  return {
    subject: input.subject,
    status: "ready",
    caller: {
      actorId: context.actorId,
      actorType: context.actorType,
      correlationId: context.correlationId,
      transport: context.transport,
    },
  };
}
