import { Client } from "@modelcontextprotocol/sdk/client/index.js";
import { InMemoryTransport } from "@modelcontextprotocol/sdk/inMemory.js";
import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { z } from "zod";
import { readReferenceStatus, type CallerContext, type ReferenceStatusResult } from "../../capabilities/index.js";

const resultSchema = z.object({
  subject: z.string(),
  status: z.literal("ready"),
  caller: z.object({
    actorId: z.string(),
    actorType: z.enum(["human", "agent"]),
    correlationId: z.string(),
    transport: z.enum(["direct", "trpc", "mcp", "scheduler", "report"]),
  }),
});

export interface McpTestClient {
  callReferenceStatus(subject: string): Promise<ReferenceStatusResult>;
  close(): Promise<void>;
}

export function createMcpServer(context: CallerContext): McpServer {
  const server = new McpServer({ name: "norfolk-kit-reference", version: "0.1.0" });
  server.registerTool(
    "reference_status",
    {
      description: "Read the reference foundation status",
      inputSchema: { subject: z.string().min(1).max(100) },
      outputSchema: resultSchema.shape,
    },
    async ({ subject }) => {
      const result = await readReferenceStatus({ subject }, context);
      const structuredContent: Record<string, unknown> = { ...result };
      return {
        content: [{ type: "text", text: JSON.stringify(result) }],
        structuredContent,
      };
    },
  );
  return server;
}

export async function createMcpTestClient(context: CallerContext): Promise<McpTestClient> {
  const [clientTransport, serverTransport] = InMemoryTransport.createLinkedPair();
  const server = createMcpServer(context);
  const client = new Client({ name: "norfolk-kit-test-client", version: "0.1.0" });
  await Promise.all([server.connect(serverTransport), client.connect(clientTransport)]);
  return {
    async callReferenceStatus(subject) {
      const response = await client.callTool({ name: "reference_status", arguments: { subject } });
      return resultSchema.parse(response.structuredContent);
    },
    async close() {
      await Promise.all([client.close(), server.close()]);
    },
  };
}
