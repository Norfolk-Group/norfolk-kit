import { readFile } from "node:fs/promises";
import { resolve } from "node:path";
import { describe, expect, it } from "vitest";
import { planFile, preflightAdoption } from "../../../tools/product-os-adopt/plan.mjs";

describe("throwaway Product OS adoption", () => {
  it("pins the candidate, plans a safe branch, rolls back, and preserves exceptions on re-adoption", async () => {
    const lock = JSON.parse(await readFile(resolve(import.meta.dirname, "../../../product-os.lock.json"), "utf8"));
    expect(lock).toMatchObject({ productOSVersion: "0.3.0-candidate.1", kitVersion: "0.1.0", state: "proposed" });
    expect(lock.sourceManifestSha256).toMatch(/^[0-9a-f]{64}$/);
    expect(preflightAdoption({ branch: "adoption/product-os-0.3.0-candidate.1", defaultBranch: "main", repositoryScoped: true, environmentApproved: true, compatible: true, partialRun: false, sameCheckpoint: true })).toEqual([]);
    const adopted = { ...lock, state: "adopted", exceptions: ["EX-1001"] };
    const rollback = { ...adopted, state: "rolled-back" };
    const readopted = { ...rollback, state: "adopted" };
    expect(readopted.exceptions).toEqual(["EX-1001"]);
    expect(planFile({ path: "AGENTS.md", sensitivity: "client-safe", installedHash: "old", currentHash: "edited", incomingHash: "new", allowedSensitivities: ["client-safe"] }).action).toBe("conflict");
  });
});
