import { afterEach, describe, expect, it } from "vitest";
import { createCallerContext } from "@/capabilities/index";
import { createMcpTestClient, type McpTestClient } from "@/adapters/mcp/server";
import { appRouter } from "@/adapters/trpc/router";

describe("adapter parity", () => {
  let mcp: McpTestClient | undefined;

  afterEach(async () => {
    await mcp?.close();
    mcp = undefined;
  });

  it("serves the same capability through real tRPC and MCP adapters", async () => {
    const base = {
      actorId: "person-1",
      actorType: "human" as const,
      permissions: ["reference:read"],
      correlationId: "corr-parity",
    };
    const trpcCaller = appRouter.createCaller(createCallerContext({ ...base, transport: "trpc" }));
    const trpcResult = await trpcCaller.reference.status({ subject: "Product OS" });

    mcp = await createMcpTestClient(createCallerContext({ ...base, transport: "mcp" }));
    const mcpResult = await mcp.callReferenceStatus("Product OS");

    expect(mcpResult).toEqual({
      ...trpcResult,
      caller: { ...trpcResult.caller, transport: "mcp" },
    });
    expect(trpcResult.caller.transport).toBe("trpc");
  });
});
