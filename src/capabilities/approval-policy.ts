import { requirePermission, type CallerContext } from "./context.js";

export const HUMAN_ONLY_POLICY = {
  id: "human-only-consequential-actions-v1",
  approverRole: "Product owner",
  actions: ["send-external-communication", "delete-data", "move-money", "accept-legal-terms"],
} as const;

export type ConsequentialAction = (typeof HUMAN_ONLY_POLICY.actions)[number];

const ACTION_PERMISSION: Record<ConsequentialAction, string> = {
  "send-external-communication": "external-communication:request",
  "delete-data": "data:delete:request",
  "move-money": "money:move:request",
  "accept-legal-terms": "legal:accept:request",
};

export interface ApprovalRequirement {
  policyId: typeof HUMAN_ONLY_POLICY.id;
  action: ConsequentialAction;
  approverRole: typeof HUMAN_ONLY_POLICY.approverRole;
  mode: "human-only";
}

export interface ApprovalAuditEvent {
  policyId: typeof HUMAN_ONLY_POLICY.id;
  action: ConsequentialAction;
  target: string;
  actorId: string;
  correlationId: string;
  outcome: "denied" | "prepared";
}

export class ApprovalRequiredError extends Error {
  readonly code = "HUMAN_APPROVAL_REQUIRED";

  constructor(readonly requirement: ApprovalRequirement) {
    super(`${requirement.action} requires ${requirement.approverRole} approval`);
    this.name = "ApprovalRequiredError";
  }
}

interface ConsequentialActionInput {
  action: ConsequentialAction;
  target: string;
}

export async function requestConsequentialAction(
  input: ConsequentialActionInput,
  context: CallerContext,
  record: (event: ApprovalAuditEvent) => void,
): Promise<{ state: "prepared"; requirement: ApprovalRequirement }> {
  requirePermission(context, ACTION_PERMISSION[input.action]);
  const requirement: ApprovalRequirement = {
    policyId: HUMAN_ONLY_POLICY.id,
    action: input.action,
    approverRole: HUMAN_ONLY_POLICY.approverRole,
    mode: "human-only",
  };
  if (context.actorType === "agent") {
    record({
      policyId: requirement.policyId,
      action: input.action,
      target: input.target,
      actorId: context.actorId,
      correlationId: context.correlationId,
      outcome: "denied",
    });
    throw new ApprovalRequiredError(requirement);
  }
  record({
    policyId: requirement.policyId,
    action: input.action,
    target: input.target,
    actorId: context.actorId,
    correlationId: context.correlationId,
    outcome: "prepared",
  });
  return { state: "prepared", requirement };
}
