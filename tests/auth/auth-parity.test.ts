import { describe, expect, it } from "vitest";
import { readAuthSession, createCallerContext } from "@/capabilities";
import { appRouter } from "@/adapters/trpc/router";

describe("auth session capability parity", () => {
  it("direct and tRPC adapters expose the same authorized procedure outcome", async () => {
    const context = createCallerContext({ actorId: "user-1", actorType: "human", permissions: ["reference:read"], correlationId: "trace-1", transport: "trpc" });
    const direct = readAuthSession(context);
    const trpc = await appRouter.createCaller(context).auth.me();
    expect(trpc).toEqual(direct);
  });
});
