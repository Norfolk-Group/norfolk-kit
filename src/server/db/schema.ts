import { pgTable, text, timestamp, uuid } from "drizzle-orm/pg-core";

export const capabilityAudit = pgTable("capability_audit", {
  id: uuid("id").primaryKey().defaultRandom(),
  actorId: text("actor_id").notNull(),
  capability: text("capability").notNull(),
  outcome: text("outcome").notNull(),
  correlationId: text("correlation_id").notNull(),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
});
