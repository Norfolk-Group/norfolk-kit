import { createCallerContext, type CallerTransport } from "../context.js";
import type { AuthenticatedIdentity } from "../../modules/auth/index.js";

export function authenticatedCaller(identity: AuthenticatedIdentity, transport: CallerTransport, correlationId: string) {
  if (!identity.organizationId) throw new Error("AUTHORIZED_ORGANIZATION_REQUIRED");
  return createCallerContext({ actorId: identity.userId, actorType: "human", permissions: identity.permissions, correlationId, transport });
}
