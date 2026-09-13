import { spawnSync } from "node:child_process";
import { createHash } from "node:crypto";
import { mkdtemp, mkdir, readFile, readdir, rm, symlink, unlink, writeFile } from "node:fs/promises";
import { tmpdir } from "node:os";
import path from "node:path";
import { afterEach, describe, expect, it } from "vitest";

const cli = path.resolve("tools/harness/check.mjs");
const fixtures: string[] = [];
const contracts = ["README", "SYSTEM-GOVERNANCE-RULE", "architecture", "business-logic", "api", "design-system", "security", "config-and-env-map"];
const completeManifest = { packageManager: "pnpm@11.13.0", scripts: { lint: "eslint .", typecheck: "tsc --noEmit", test: "vitest run", build: "vite build" } };
const completeLock = { state: "proposed", productOSVersion: "0.3.0-candidate.1", kitVersion: "0.1.0", sourceManifestSha256: "a".repeat(64), exceptions: [], rollbackRef: "reviewed-before-adoption" };

async function makeFixture() {
  const root = await mkdtemp(path.join(tmpdir(), "norfolk-harness-"));
  fixtures.push(root);
  await mkdir(path.join(root, "docs"));
  await writeFile(path.join(root, "AGENTS.md"), "# Shared rules\nRead docs before changing behavior.\n");
  await writeFile(path.join(root, "CLAUDE.md"), "@AGENTS.md\n");
  for (const contract of contracts) await writeFile(path.join(root, "docs", `${contract}.md`), "# Project contract\nDeclared requirements.\n");
  await writeFile(path.join(root, "package.json"), JSON.stringify(completeManifest));
  await writeFile(path.join(root, "product-os.lock.json"), JSON.stringify(completeLock));
  return root;
}

function run(root: string, extra: string[] = []) {
  const processResult = spawnSync(process.execPath, [cli, "--root", root, "--json", ...extra], { encoding: "utf8" });
  return { ...processResult, report: processResult.stdout ? JSON.parse(processResult.stdout) : null };
}

async function snapshot(root: string): Promise<Record<string, string>> {
  const files: Record<string, string> = {};
  async function walk(directory: string) {
    for (const entry of await readdir(directory, { withFileTypes: true })) {
      const file = path.join(directory, entry.name);
      if (entry.isDirectory()) await walk(file);
      else files[path.relative(root, file)] = createHash("sha256").update(await readFile(file)).digest("hex");
    }
  }
  await walk(root);
  return files;
}

afterEach(async () => {
  await Promise.all(fixtures.splice(0).map((root) => rm(root, { recursive: true, force: true })));
});

describe("read-only Norfolk project harness", () => {
  it("reports declared structure without claiming readiness or requiring optional integrations", async () => {
    const root = await makeFixture();
    const checked = run(root);
    expect(checked.status).toBe(0);
    expect(checked.report.status).toBe("assessment-required");
    expect(checked.report.mode).toBe("read-only-static");
    expect(checked.report.findings.filter((finding: { status: string }) => finding.status === "declared")).toHaveLength(4);
    expect(checked.report.findings).toContainEqual(expect.objectContaining({ id: "adoption", status: "warning", message: expect.stringContaining("proposed, not adopted") }));
    expect(checked.report.findings).toContainEqual(expect.objectContaining({ id: "runtime", status: "warning", message: expect.stringContaining("no tests, services, CI") }));
    expect(checked.report.findings.some((finding: { status: string }) => finding.status === "blocked")).toBe(false);
  });

  it("blocks missing and empty required contracts and non-import Claude mentions", async () => {
    const root = await makeFixture();
    await rm(path.join(root, "docs", "security.md"));
    await writeFile(path.join(root, "AGENTS.md"), " \n");
    await writeFile(path.join(root, "CLAUDE.md"), "Read AGENTS.md.\n<!--\n@AGENTS.md\n-->\n```text\n@AGENTS.md\n```\n~~~text\n@AGENTS.md\n~~~\n");
    const checked = run(root);
    expect(checked.status).toBe(1);
    expect(checked.report.status).toBe("blocked");
    expect(checked.report.findings).toEqual(expect.arrayContaining([
      expect.objectContaining({ file: "docs/security.md", status: "blocked" }),
      expect.objectContaining({ file: "AGENTS.md", status: "blocked" }),
      expect.objectContaining({ id: "claude-bridge", status: "blocked" }),
    ]));
  });

  it("blocks absent or placeholder quality commands without echoing their values", async () => {
    const root = await makeFixture();
    await writeFile(path.join(root, "package.json"), JSON.stringify({ scripts: { lint: "true", typecheck: "echo SETUP_ONLY_SENTINEL", test: "echo no test specified" } }));
    const checked = run(root);
    expect(checked.status).toBe(1);
    expect(checked.report.findings.filter((finding: { id: string; status: string }) => finding.id.startsWith("gate:") && finding.status === "blocked")).toHaveLength(4);
    expect(checked.stdout).not.toContain("SETUP_ONLY_SENTINEL");
  });

  it("redacts malformed JSON parser details and all configuration values", async () => {
    const root = await makeFixture();
    const secretSentinel = "DO_NOT_PRINT_CONFIGURATION_SENTINEL";
    await writeFile(path.join(root, "package.json"), `{"privateValue":"${secretSentinel}",BROKEN}`);
    await writeFile(path.join(root, "product-os.lock.json"), JSON.stringify({ ...completeLock, state: secretSentinel }));
    const checked = run(root);
    expect(checked.status).toBe(1);
    expect(checked.report.findings).toContainEqual(expect.objectContaining({ id: "json:package.json", status: "blocked" }));
    expect(checked.stdout + checked.stderr).not.toContain(secretSentinel);
  });

  it("treats adopted locks as unverified and rejects malformed adoption structure", async () => {
    const root = await makeFixture();
    await writeFile(path.join(root, "product-os.lock.json"), JSON.stringify({ ...completeLock, state: "adopted" }));
    const adopted = run(root);
    expect(adopted.status).toBe(0);
    expect(adopted.report.findings).toContainEqual(expect.objectContaining({ id: "adoption", status: "warning", message: expect.stringContaining("signature, release trust") }));
    await writeFile(path.join(root, "product-os.lock.json"), JSON.stringify({ state: "adopted" }));
    expect(run(root).status).toBe(1);
  });

  it("does not execute target scripts, follow arbitrary links or modify target files", async () => {
    const root = await makeFixture();
    await writeFile(path.join(root, ".env"), "SECRET_FILE_SENTINEL");
    await writeFile(path.join(root, "AGENTS.md"), "# Rules\n[External file](../../outside-secret.md)\n");
    await writeFile(path.join(root, "package.json"), JSON.stringify({ ...completeManifest, scripts: { ...completeManifest.scripts, test: "node -e \"require('fs').writeFileSync('executed.txt','bad')\"" } }));
    const before = await snapshot(root);
    const checked = run(root);
    expect(checked.status).toBe(0);
    expect(await snapshot(root)).toEqual(before);
    expect(checked.stdout).not.toContain("SECRET_FILE_SENTINEL");
    await expect(readFile(path.join(root, "executed.txt"))).rejects.toMatchObject({ code: "ENOENT" });
  });

  it("refuses a symlinked ancestor rather than reading outside the selected root", async () => {
    const root = await makeFixture();
    const outside = await makeFixture();
    await writeFile(path.join(outside, "docs", "security.md"), "OUTSIDE_CONTENT_SENTINEL");
    await rm(path.join(root, "docs"), { recursive: true });
    await symlink(path.join(outside, "docs"), path.join(root, "docs"), process.platform === "win32" ? "junction" : "dir");
    const checked = run(root);
    expect(checked.status).toBe(1);
    expect(checked.report.findings).toContainEqual(expect.objectContaining({ id: "path:docs/security.md", status: "blocked", message: expect.stringContaining("target was not read") }));
    expect(checked.stdout + checked.stderr).not.toContain("OUTSIDE_CONTENT_SENTINEL");
    // Remove the link itself before recursive fixture cleanup.
    await unlink(path.join(root, "docs"));
    expect(await readFile(path.join(outside, "docs", "security.md"), "utf8")).toBe("OUTSIDE_CONTENT_SENTINEL");
  });

  it("refuses oversized contracts and non-regular files", async () => {
    const root = await makeFixture();
    await writeFile(path.join(root, "AGENTS.md"), "x".repeat(1024 * 1024 + 1));
    await rm(path.join(root, "CLAUDE.md"));
    await mkdir(path.join(root, "CLAUDE.md"));
    const checked = run(root);
    expect(checked.status).toBe(1);
    expect(checked.report.findings).toEqual(expect.arrayContaining([
      expect.objectContaining({ file: "AGENTS.md", status: "blocked", message: expect.stringContaining("1 MiB") }),
      expect.objectContaining({ file: "CLAUDE.md", status: "blocked", message: expect.stringContaining("non-regular") }),
    ]));
  });

  it("reports editor declarations honestly without printing values or requiring them", async () => {
    const root = await makeFixture();
    await mkdir(path.join(root, ".claude"));
    await writeFile(path.join(root, ".claude", "settings.json"), JSON.stringify({ env: { PRIVATE_CONFIGURATION: "SETTINGS_SENTINEL" } }));
    const checked = run(root);
    expect(checked.status).toBe(0);
    expect(checked.report.findings).toContainEqual(expect.objectContaining({ id: "editor-plugins", status: "warning", message: expect.stringContaining("remain unverified") }));
    expect(checked.stdout).not.toContain("SETTINGS_SENTINEL");
  });

  it("requires an explicit root and rejects malformed arguments without echoing them", async () => {
    const missing = spawnSync(process.execPath, [cli], { encoding: "utf8" });
    expect(missing.status).toBe(2);
    const root = await makeFixture();
    const invalid = run(root, ["--SECRET_ARGUMENT_SENTINEL"]);
    expect(invalid.status).toBe(2);
    expect(invalid.stdout + invalid.stderr).not.toContain("SECRET_ARGUMENT_SENTINEL");
    expect(run(path.join(root, "missing")).status).toBe(1);
  });
});
