import { createHash } from "node:crypto";
import { mkdtemp, readFile } from "node:fs/promises";
import { tmpdir } from "node:os";
import path from "node:path";
import fg from "fast-glob";
import { build } from "vite";
import { viteSingleFile } from "vite-plugin-singlefile";

const hash = (value: string | Buffer) => createHash("sha256").update(value).digest("hex");
const escape = (value: string) => value.replaceAll("&", "&amp;").replaceAll("<", "&lt;").replaceAll(">", "&gt;");

async function sourceRows(root: string, globs: string[]): Promise<string> {
  const files = await fg(globs, { cwd: root, onlyFiles: true });
  files.sort((a, b) => a.localeCompare(b));
  return (await Promise.all(files.map(async (file) => `<tr><td>${escape(file)}</td><td><code>${hash(await readFile(path.join(root, file)))}</code></td></tr>`))).join("");
}

function document(title: string, rows: string, kitVersion: string): string {
  return `<!doctype html><html lang="en"><head><meta charset="utf-8"><meta http-equiv="Content-Security-Policy" content="default-src 'none'; style-src 'unsafe-inline'"><meta name="viewport" content="width=device-width"><title>${escape(title)}</title><style>body{font:15px/1.5 Inter,system-ui,sans-serif;max-width:1100px;margin:auto;padding:32px;background:#f5f1e8;color:#17231f}table{width:100%;border-collapse:collapse;background:#fff}th,td{text-align:left;padding:12px;border-bottom:1px solid #d7ded9}code{font-size:11px;word-break:break-all}.meta{color:#50675f}</style></head><body><p>Private Norfolk AI reference · Product OS version unreleased · Kit version ${escape(kitVersion)}</p><p class="meta">approval candidate · freshness 2026-08-05 · Source path and source-sha256 shown per entry</p><h1>${escape(title)}</h1><table><thead><tr><th>Source path</th><th>source-sha256</th></tr></thead><tbody>${rows}</tbody></table></body></html>`;
}

async function motionDocument(root: string): Promise<string> {
  const motionRoot = path.join(root, "tools/motion-artifact");
  const temporary = await mkdtemp(path.join(tmpdir(), "norfolk-motion-catalog-"));
  await build({ root: motionRoot, configFile: false, mode: "production", logLevel: "silent", define: { "process.env.NODE_ENV": JSON.stringify("production") }, plugins: [viteSingleFile()], resolve: { alias: { "@": path.join(root, "src") } }, build: { outDir: temporary, emptyOutDir: true, modulePreload: { polyfill: false }, assetsInlineLimit: Number.MAX_SAFE_INTEGER, cssCodeSplit: false, minify: true } });
  const html = await readFile(path.join(temporary, "index.html"), "utf8");
  const sourceHash = hash(await readFile(path.join(root, "src/components/animations/AnalystCubeIcon.tsx")));
  return html.replace("__MOTION_SOURCE_HASH__", sourceHash);
}

export async function buildCatalogArtifacts(root: string): Promise<Map<string, string>> {
  const pkg = JSON.parse(await readFile(path.join(root, "package.json"), "utf8")) as { version: string };
  const catalogs = new Map<string, string>();
  catalogs.set("components.html", document("Component catalog", await sourceRows(root, ["src/client/components/**/*.tsx"]), pkg.version));
  catalogs.set("motion.html", await motionDocument(root));
  catalogs.set("icons.html", document("Icon catalog", await sourceRows(root, ["src/**/*.tsx"]), pkg.version));
  catalogs.set("architecture.html", document("Architecture catalog", await sourceRows(root, ["src/capabilities/**/*.ts", "src/adapters/**/*.ts", "src/server/**/*.ts"]), pkg.version));
  catalogs.set("navigation.html", document("Navigation catalog", await sourceRows(root, ["src/client/**/*.tsx"]), pkg.version));
  return catalogs;
}
