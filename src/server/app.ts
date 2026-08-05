import { createServer } from "node:http";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { createExpressMiddleware } from "@trpc/server/adapters/express";
import express, { type Express } from "express";
import { appRouter } from "../adapters/trpc/router.js";
import { createHttpContext } from "./context.js";

export function createApp(): Express {
  const app = express();
  app.disable("x-powered-by");
  app.get("/health", (_request, response) => response.json({ status: "ok", database: "not-required" }));
  app.use("/trpc", createExpressMiddleware({ router: appRouter, createContext: ({ req }) => createHttpContext(req) }));

  const clientDirectory = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "../../client");
  app.use(express.static(clientDirectory));
  return app;
}

export function createHttpServer() {
  return createServer(createApp());
}
