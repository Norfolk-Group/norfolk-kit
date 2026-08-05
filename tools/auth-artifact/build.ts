import { build } from "vite";
import { viteSingleFile } from "vite-plugin-singlefile";
import react from "@vitejs/plugin-react";
import path from "node:path";
import { copyFile, rm } from "node:fs/promises";

const root = path.resolve(import.meta.dirname);
const temporary = path.resolve(root, "../../docs/artifacts/.authentication-build");
await build({ root, logLevel: "warn", plugins: [react(), viteSingleFile()], build: { outDir: temporary, emptyOutDir: true }, configFile: false });
await copyFile(path.join(temporary, "index.html"), path.resolve(root, "../../docs/artifacts/authentication.html"));
await rm(temporary, { recursive: true });
