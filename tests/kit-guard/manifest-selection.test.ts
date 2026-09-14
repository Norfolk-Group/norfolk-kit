import { spawnSync } from "node:child_process";
import { createHash } from "node:crypto";
import { mkdtemp, mkdir, readFile, rm, writeFile } from "node:fs/promises";
import { tmpdir } from "node:os";
import path from "node:path";
import { afterEach, describe, expect, it } from "vitest";

const writer = path.resolve("tools/kit-guard/write-manifest.mjs");
const fixtures: string[] = [];
const kitSha = "a".repeat(40);

async function fixture() {
  const root = await mkdtemp(path.join(tmpdir(), "norfolk-manifest-selection-"));
  fixtures.push(root);
  await mkdir(path.join(root, ".kit"));
  await writeFile(path.join(root, ".kit/markers.json"), JSON.stringify({
    unmatchedDefault: "kit-only", markers: { "AGENTS.md": "client-safe", "CLAUDE.md": "client-safe", "internal.md": "norfolk-only" },
  }));
  await writeFile(path.join(root, ".kit/payloads.json"), JSON.stringify({
    payloads: {}, default: { class: "external", allowedSensitivities: ["client-safe"] },
  }));
  await writeFile(path.join(root, "AGENTS.md"), "Existing project-owned rules.\n");
  await writeFile(path.join(root, "CLAUDE.md"), "@AGENTS.md\n");
  return root;
}

function run(root: string, args: string[]) {
  return spawnSync(process.execPath, [writer, "--kit-sha", kitSha, "--org", "Unknown-Org", ...args], { cwd: root, encoding: "utf8" });
}

afterEach(async () => {
  for (const root of fixtures.splice(0)) await rm(root, { recursive: true, force: true });
});

describe("explicit manifest selection", () => {
  it("rejects discovery without replacing existing ownership evidence", async () => {
    const root = await fixture();
    const previous = '{"files":{}}\n';
    await writeFile(path.join(root, ".kit/manifest.json"), previous);
    const result = run(root, ["--discover"]);
    expect(result.status).toBe(2);
    expect(result.stderr).toContain("explicit");
    expect(await readFile(path.join(root, ".kit/manifest.json"), "utf8")).toBe(previous);
    expect(await readFile(path.join(root, "AGENTS.md"), "utf8")).toBe("Existing project-owned rules.\n");
  });

  it("claims only the reviewed explicit list, leaving foreign files untouched", async () => {
    const root = await fixture();
    expect(run(root, ["--files", "CLAUDE.md"]).status).toBe(0);
    const manifest = JSON.parse(await readFile(path.join(root, ".kit/manifest.json"), "utf8"));
    expect(Object.keys(manifest.files)).toEqual(["CLAUDE.md"]);
    expect(manifest.files["CLAUDE.md"].sha256).toBe(createHash("sha256").update("@AGENTS.md\n").digest("hex"));
    expect(await readFile(path.join(root, "AGENTS.md"), "utf8")).toBe("Existing project-owned rules.\n");
  });

  it("does not bypass sensitivity checks or delete rejected files", async () => {
    const root = await fixture();
    await writeFile(path.join(root, "internal.md"), "Synthetic internal fixture.\n");
    const result = run(root, ["--files", "internal.md"]);
    expect(result.status).toBe(1);
    expect(result.stderr).toContain("Stop and report");
    expect(result.stderr).not.toContain("Remove them");
    await expect(readFile(path.join(root, ".kit/manifest.json"))).rejects.toMatchObject({ code: "ENOENT" });
    expect(await readFile(path.join(root, "internal.md"), "utf8")).toBe("Synthetic internal fixture.\n");
  });

  it.each([".kit/manifest.json", ".kit/MANIFEST.JSON", ".kit/manifest.json.", "tools/../AGENTS.md"])("rejects unsafe explicit selection %s without changing the manifest", async (selected) => {
    const root = await fixture();
    await mkdir(path.join(root, "tools"));
    await writeFile(path.join(root, ".kit/markers.json"), JSON.stringify({
      markers: { ".kit/**": "client-safe", "tools/**": "client-safe" },
    }));
    const previous = '{"files":{}}\n';
    await writeFile(path.join(root, ".kit/manifest.json"), previous);
    expect(run(root, ["--files", selected]).status).toBe(2);
    expect(await readFile(path.join(root, ".kit/manifest.json"), "utf8")).toBe(previous);
  });
});
