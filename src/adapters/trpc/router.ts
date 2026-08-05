import { initTRPC, TRPCError } from "@trpc/server";
import { z } from "zod";
import {
  CapabilityForbiddenError,
  readReferenceStatus,
  type CallerContext,
} from "../../capabilities/index.js";

const t = initTRPC.context<CallerContext>().create();

const authorizedProcedure = t.procedure.use(async ({ ctx, next }) => {
  try {
    return await next({ ctx });
  } catch (cause) {
    if (cause instanceof CapabilityForbiddenError) throw new TRPCError({ code: "FORBIDDEN", cause });
    throw cause;
  }
});

export const appRouter = t.router({
  reference: t.router({
    status: authorizedProcedure
      .input(z.object({ subject: z.string().min(1).max(100) }))
      .query(({ input, ctx }) => readReferenceStatus(input, ctx)),
  }),
});

export type AppRouter = typeof appRouter;
