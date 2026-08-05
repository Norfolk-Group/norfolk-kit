import { describe, expect, it } from "vitest";
import {
  ApprovalRequiredError,
  createCallerContext,
  readReferenceStatus,
  requestConsequentialAction,
  type ApprovalAuditEvent,
} from "@/capabilities/index";

describe("transport-neutral capabilities", () => {
  it("returns an authorized result with attributable caller context", async () => {
    const context = createCallerContext({
      actorId: "person-1",
      actorType: "human",
      permissions: ["reference:read"],
      correlationId: "corr-1",
      transport: "direct",
    });

    await expect(readReferenceStatus({ subject: "Product OS" }, context)).resolves.toEqual({
      subject: "Product OS",
      status: "ready",
      caller: {
        actorId: "person-1",
        actorType: "human",
        correlationId: "corr-1",
        transport: "direct",
      },
    });
  });

  it("denies a caller without the shared capability permission", async () => {
    const context = createCallerContext({
      actorId: "person-2",
      actorType: "human",
      permissions: [],
      correlationId: "corr-2",
      transport: "direct",
    });

    await expect(readReferenceStatus({ subject: "Product OS" }, context)).rejects.toMatchObject({
      code: "FORBIDDEN",
    });
  });
});

describe("human-only approval policy", () => {
  it("refuses an agent and records the named approval requirement", async () => {
    const events: ApprovalAuditEvent[] = [];
    const context = createCallerContext({
      actorId: "agent-1",
      actorType: "agent",
      permissions: ["external-communication:request"],
      correlationId: "corr-agent",
      transport: "mcp",
    });

    const action = requestConsequentialAction(
      { action: "send-external-communication", target: "synthetic-recipient" },
      context,
      (event) => events.push(event),
    );

    await expect(action).rejects.toBeInstanceOf(ApprovalRequiredError);
    await expect(action).rejects.toMatchObject({
      code: "HUMAN_APPROVAL_REQUIRED",
      requirement: {
        policyId: "human-only-consequential-actions-v1",
        action: "send-external-communication",
        approverRole: "Product owner",
        mode: "human-only",
      },
    });
    expect(events).toEqual([
      expect.objectContaining({
        outcome: "denied",
        actorId: "agent-1",
        correlationId: "corr-agent",
        policyId: "human-only-consequential-actions-v1",
      }),
    ]);
  });

  it("uses the permission belonging to each consequential action", async () => {
    const context = createCallerContext({
      actorId: "agent-2",
      actorType: "agent",
      permissions: ["data:delete:request"],
      correlationId: "corr-delete",
      transport: "mcp",
    });

    await expect(requestConsequentialAction(
      { action: "delete-data", target: "synthetic-record" },
      context,
      () => undefined,
    )).rejects.toMatchObject({
      code: "HUMAN_APPROVAL_REQUIRED",
      requirement: { action: "delete-data" },
    });
  });
});
