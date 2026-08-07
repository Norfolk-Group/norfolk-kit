import { createHash } from "node:crypto";
import { access, cp, mkdtemp, readFile } from "node:fs/promises";
import { tmpdir } from "node:os";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { build } from "vite";
import { viteSingleFile } from "vite-plugin-singlefile";

const repositoryRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "../..");
const artifactRoot = path.join(repositoryRoot, "tools", "artifacts");

export async function buildReferenceArtifact(outputDirectory: string) {
  await build({
    root: artifactRoot,
    configFile: false,
    logLevel: "silent",
    plugins: [viteSingleFile()],
    build: {
      outDir: outputDirectory,
      emptyOutDir: true,
      assetsInlineLimit: Number.MAX_SAFE_INTEGER,
      cssCodeSplit: false,
      minify: true,
    },
  });
  const file = path.join(outputDirectory, "index.html");
  const content = await readFile(file);
  return { file, sha256: createHash("sha256").update(content).digest("hex") };
}

async function runCli(): Promise<void> {
  const temporary = await mkdtemp(path.join(tmpdir(), "norfolk-reference-artifact-"));
  const generated = await buildReferenceArtifact(temporary);
  const committed = path.join(repositoryRoot, "docs", "artifacts", "reference.html");
  if (process.argv.includes("--check")) {
    try {
      await access(committed);
    } catch {
      throw new Error("docs/artifacts/reference.html is missing; run pnpm docs:artifacts");
    }
    const [generatedContent, committedContent] = await Promise.all([readFile(generated.file), readFile(committed)]);
    if (!generatedContent.equals(committedContent)) throw new Error("Reference artifact is stale; run pnpm docs:artifacts");
    console.log(`Reference artifact is current: ${generated.sha256}`);
    return;
  }
  await cp(generated.file, committed);
  console.log(`Wrote docs/artifacts/reference.html: ${generated.sha256}`);
}

if (process.argv[1] && path.resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  await runCli();
}
