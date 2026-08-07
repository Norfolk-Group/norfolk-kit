import { access, readFile, writeFile } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { buildCatalogArtifacts } from "./catalogs";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "../..");
const generated = await buildCatalogArtifacts(root);
const check = process.argv.includes("--check");
for (const [name, content] of generated) {
  const target = path.join(root, "docs/artifacts", name);
  if (check) {
    await access(target).catch(() => { throw new Error(`${name} is missing; run pnpm docs:catalogs`); });
    if (await readFile(target, "utf8") !== content) throw new Error(`${name} is stale; run pnpm docs:catalogs`);
  } else await writeFile(target, content);
}
console.log(check ? "Catalog artifacts are current" : "Wrote five catalog artifacts");
