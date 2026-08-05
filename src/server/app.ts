import { createServer } from "node:http";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { createExpressMiddleware } from "@trpc/server/adapters/express";
import express, { type Express } from "express";
import { appRouter } from "../adapters/trpc/router.js";
import { createHttpContext } from "./context.js";
import { createAuthServiceFromEnvironment, installAuthRoutes } from "../modules/auth/runtime.js";

export function createApp(): Express {
  const app = express();
  app.disable("x-powered-by");
  app.use(express.json({ limit: "64kb" }));
  app.get("/health", (_request, response) => response.json({ status: "ok", database: "not-required" }));
  try {
    const auth = express.Router();
    installAuthRoutes(auth, createAuthServiceFromEnvironment());
    app.use("/auth", auth);
  } catch {
    app.use("/auth", (_request, response) => response.status(503).json({ state: "configuration-required", recovery: "run WorkOS preflight" }));
  }
  app.use("/trpc", createExpressMiddleware({ router: appRouter, createContext: ({ req, res }) => createHttpContext(req, res) }));

  const clientDirectory = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "../../client");
  app.use(express.static(clientDirectory));
  return app;
}

export function createHttpServer() {
  return createServer(createApp());
}
