import { execFileSync, spawnSync } from "node:child_process";
import { lstat, mkdir, mkdtemp, readFile, readdir, rm, writeFile } from "node:fs/promises";
import { tmpdir } from "node:os";
import path from "node:path";
import { afterEach, describe, expect, it } from "vitest";
import { planFile, preflightAdoption, sha256 } from "../../../tools/product-os-adopt/plan.mjs";

const kitRoot = path.resolve(import.meta.dirname, "../../..");
const fixtures: string[] = [];
const fixturePrefix = "norfolk-adoption-integration-";
const fixtureDocs = ["README", "SYSTEM-GOVERNANCE-RULE", "architecture", "business-logic", "api", "design-system", "security", "config-and-env-map"];
const allowedSensitivities = ["client-safe"];

function git(root: string, args: string[]) {
  return execFileSync("git", [
    "-c", "core.autocrlf=false",
    "-c", `core.hooksPath=${path.join(root, ".disabled-hooks")}`,
    "-c", "commit.gpgSign=false",
    "-c", "user.name=Norfolk Fixture",
    "-c", "user.email=fixture@example.invalid",
    ...args,
  ], { cwd: root, encoding: "utf8", stdio: ["ignore", "pipe", "pipe"] }).trim();
}

async function writeFixture(root: string, file: string, content: string) {
  const target = path.join(root, file);
  await mkdir(path.dirname(target), { recursive: true });
  await writeFile(target, content);
}

async function makeFixture(complete: boolean) {
  const root = await mkdtemp(path.join(tmpdir(), fixturePrefix));
  fixtures.push(root);
  git(root, ["init", "--initial-branch=main"]);
  await writeFixture(root, "README.md", "# Disposable local project\nNo customer data or remote.\n");
  if (complete) {
    await writeFixture(root, "AGENTS.md", "# Existing owner rules\nPreserve project customizations.\n");
    await writeFixture(root, "CLAUDE.md", "@AGENTS.md\n");
    for (const doc of fixtureDocs) await writeFixture(root, `docs/${doc}.md`, `# Fixture ${doc}\nExisting project contract.\n`);
    await writeFixture(root, "package.json", JSON.stringify({
      packageManager: "pnpm@11.13.0",
      scripts: {
        lint: "eslint .",
        typecheck: "tsc --noEmit",
        test: "node -e \"require('fs').writeFileSync('SCRIPT_EXECUTED','unexpected')\"",
        build: "vite build",
      },
    }));
    const lock = JSON.parse(await readFile(path.join(kitRoot, "product-os.lock.json"), "utf8"));
    await writeFixture(root, "product-os.lock.json", JSON.stringify({ ...lock, exceptions: ["FIXTURE-EX-1"] }));
    await writeFixture(root, "src/existing.txt", "Unrelated application content.\n");
  }
  git(root, ["add", "--all"]);
  git(root, ["commit", "-m", "Record disposable fixture baseline"]);
  return root;
}

async function snapshot(root: string): Promise<Record<string, string>> {
  const hashes: Record<string, string> = {};
  async function walk(directory: string) {
    for (const entry of await readdir(directory, { withFileTypes: true })) {
      if (entry.name === ".git") continue;
      const file = path.join(directory, entry.name);
      if (entry.isDirectory()) await walk(file);
      else hashes[path.relative(root, file).split(path.sep).join("/")] = sha256(await readFile(file));
    }
  }
  await walk(root);
  return hashes;
}

function assess(root: string) {
  // The real CLI invokes checkHarness; it must never execute the target's scripts.
  const result = spawnSync(process.execPath, [path.join(kitRoot, "tools/harness/check.mjs"), "--root", root, "--json"], { encoding: "utf8" });
  expect(result.error).toBeUndefined();
  return { exitCode: result.status, report: JSON.parse(result.stdout) };
}

afterEach(async () => {
  for (const root of fixtures.splice(0)) {
    // Only remove an ordinary directory created and registered by this test.
    if (path.dirname(root) !== path.resolve(tmpdir()) || !path.basename(root).startsWith(fixturePrefix)) throw new Error("Unsafe fixture cleanup target");
    const info = await lstat(root);
    if (!info.isDirectory() || info.isSymbolicLink()) throw new Error("Fixture root changed type");
    await rm(root, { recursive: true, force: true });
  }
});

describe("disposable filesystem Product OS assessment and planning", () => {
  it("keeps the checked-in candidate proposed rather than fabricating trusted adoption", async () => {
    const lock = JSON.parse(await readFile(path.join(kitRoot, "product-os.lock.json"), "utf8"));
    expect(lock).toMatchObject({ productOSVersion: "0.3.0-candidate.1", kitVersion: "0.1.0", state: "proposed" });
    expect(lock.sourceManifestSha256).toMatch(/^[0-9a-f]{64}$/);
    expect(preflightAdoption({ branch: "main", defaultBranch: "main", repositoryScoped: true, environmentApproved: false, compatible: true, partialRun: false, sameCheckpoint: true })).toEqual([
      "write target must be a deterministic adoption branch",
      "release environment approval is required",
    ]);
  });

  it("assesses an incomplete new repository without writing and plans only the missing file", async () => {
    const root = await makeFixture(false);
    const before = await snapshot(root);
    const head = git(root, ["rev-parse", "HEAD"]);
    const assessment = assess(root);
    expect(assessment.exitCode).toBe(1);
    expect(assessment.report).toMatchObject({ status: "blocked", mode: "read-only-static" });
    expect(assessment.report.findings).toContainEqual(expect.objectContaining({ id: "file:AGENTS.md", status: "blocked" }));
    await expect(readFile(path.join(root, "AGENTS.md"))).rejects.toMatchObject({ code: "ENOENT" });
    expect(planFile({ path: "AGENTS.md", sensitivity: "client-safe", currentHash: "", incomingHash: sha256("# Incoming rules\n"), allowedSensitivities })).toMatchObject({ action: "add" });
    expect(await snapshot(root)).toEqual(before);
    expect(git(root, ["rev-parse", "HEAD"])).toBe(head);
    expect(git(root, ["status", "--porcelain"])).toBe("");
    expect(git(root, ["remote"])).toBe("");
  });

  it.each(["different", "identical"])("does not claim an unmanaged existing file whose incoming bytes are %s", async (comparison) => {
    const root = await makeFixture(true);
    const before = await snapshot(root);
    const current = await readFile(path.join(root, "AGENTS.md"), "utf8");
    const incoming = comparison === "identical" ? current : "# Incoming Kit rules\n";
    const planned = planFile({ path: "AGENTS.md", sensitivity: "client-safe", currentHash: sha256(current), incomingHash: sha256(incoming), allowedSensitivities });
    expect(planned.action).toBe("foreign");
    expect(await snapshot(root)).toEqual(before);
    expect(git(root, ["status", "--porcelain"])).toBe("");
  });

  it("preserves local edits during assessment and restores only deliberately changed fixture paths with Git", async () => {
    const root = await makeFixture(true);
    const baseline = git(root, ["rev-parse", "HEAD"]);
    const installedDesignHash = sha256(await readFile(path.join(root, "docs/design-system.md")));
    const installedSecurityHash = sha256(await readFile(path.join(root, "docs/security.md")));
    await writeFixture(root, "docs/design-system.md", "# Owner-edited design contract\nRetain this uncommitted customization.\n");
    const before = await snapshot(root);
    const priorStatus = git(root, ["status", "--porcelain"]);
    const lockBytes = await readFile(path.join(root, "product-os.lock.json"), "utf8");

    const assessment = assess(root);
    expect(assessment.exitCode).toBe(0);
    expect(assessment.report).toMatchObject({ status: "assessment-required", mode: "read-only-static" });
    expect(assessment.report.findings).toContainEqual(expect.objectContaining({ id: "adoption", status: "warning", message: expect.stringContaining("proposed, not adopted") }));
    expect(await snapshot(root)).toEqual(before);
    expect(git(root, ["status", "--porcelain"])).toBe(priorStatus);
    await expect(readFile(path.join(root, "SCRIPT_EXECUTED"))).rejects.toMatchObject({ code: "ENOENT" });

    const securityUpdate = "# Incoming security contract\nDisposable fixture update.\n";
    const newGuide = "# New fixture guidance\nDisposable addition.\n";
    const dispositions = [
      planFile({ path: "docs/security.md", sensitivity: "client-safe", installedHash: installedSecurityHash, currentHash: before["docs/security.md"], incomingHash: sha256(securityUpdate), allowedSensitivities }),
      planFile({ path: "docs/design-system.md", sensitivity: "client-safe", installedHash: installedDesignHash, currentHash: before["docs/design-system.md"], incomingHash: sha256("# Incoming design\n"), allowedSensitivities }),
      planFile({ path: "AGENTS.md", sensitivity: "client-safe", currentHash: before["AGENTS.md"], incomingHash: sha256("# Incoming rules\n"), allowedSensitivities }),
      planFile({ path: "docs/fixture-added.md", sensitivity: "client-safe", currentHash: "", incomingHash: sha256(newGuide), allowedSensitivities }),
    ];
    expect(dispositions.map(({ action }) => action)).toEqual(["update", "conflict", "foreign", "add"]);
    expect(await snapshot(root)).toEqual(before);

    // Explicit fixture writes exercise Git recovery, not an unimplemented adopter.
    await writeFixture(root, "docs/security.md", securityUpdate);
    await writeFixture(root, "docs/fixture-added.md", newGuide);
    git(root, ["add", "--", "docs/security.md", "docs/fixture-added.md"]);
    expect(await readFile(path.join(root, "docs/security.md"), "utf8")).toBe(securityUpdate);
    expect(await readFile(path.join(root, "docs/fixture-added.md"), "utf8")).toBe(newGuide);
    expect((await snapshot(root))["docs/design-system.md"]).toBe(before["docs/design-system.md"]);
    expect((await snapshot(root))["AGENTS.md"]).toBe(before["AGENTS.md"]);
    expect(await readFile(path.join(root, "product-os.lock.json"), "utf8")).toBe(lockBytes);

    git(root, ["restore", `--source=${baseline}`, "--staged", "--worktree", "--", "docs/security.md", "docs/fixture-added.md"]);
    expect(await snapshot(root)).toEqual(before);
    expect(git(root, ["status", "--porcelain"])).toBe(priorStatus);
    expect(git(root, ["rev-parse", "HEAD"])).toBe(baseline);
    expect(JSON.parse(await readFile(path.join(root, "product-os.lock.json"), "utf8"))).toMatchObject({ state: "proposed", exceptions: ["FIXTURE-EX-1"] });
    expect(planFile({ path: "docs/design-system.md", sensitivity: "client-safe", installedHash: installedDesignHash, currentHash: (await snapshot(root))["docs/design-system.md"], incomingHash: sha256("# Incoming design\n"), allowedSensitivities }).action).toBe("conflict");
  });
});
