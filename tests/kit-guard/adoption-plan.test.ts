import { generateKeyPairSync, sign } from "node:crypto";
import { describe, expect, it } from "vitest";
import { canonicalJson, planFile, preflightAdoption, resolvePayloadPolicy, verifyBundle } from "../../tools/product-os-adopt/plan.mjs";
import payloads from "../../.kit/payloads.json";

describe("Product OS adoption planner", () => {
  it("verifies the signed immutable manifest and detects tampering", () => {
    const keys = generateKeyPairSync("ed25519");
    const manifest = { version: "0.3.0-candidate.1", files: [] };
    const bundle = { manifest, algorithm: "Ed25519", keyId: "test", signature: sign(null, Buffer.from(canonicalJson(manifest)), keys.privateKey).toString("base64") };
    expect(verifyBundle(bundle, keys.publicKey)).toBe(true);
    bundle.manifest.version = "0.4.0";
    expect(verifyBundle(bundle, keys.publicKey)).toBe(false);
  });

  it("uses the restrictive default for an unknown organization", () => {
    expect(resolvePayloadPolicy(payloads, "Unknown-Org").allowedSensitivities).toEqual(["client-safe"]);
    expect(planFile({ path: "brand/norfolk/x.svg", sensitivity: "norfolk-only", currentHash: "", incomingHash: "new", allowedSensitivities: ["client-safe"] }).action).toBe("blocked");
  });

  it("updates unchanged managed files and preserves local edits as conflicts", () => {
    expect(planFile({ path: "AGENTS.md", sensitivity: "client-safe", installedHash: "old", currentHash: "old", incomingHash: "new", allowedSensitivities: ["client-safe"] }).action).toBe("update");
    expect(planFile({ path: "AGENTS.md", sensitivity: "client-safe", installedHash: "old", currentHash: "edited", incomingHash: "new", allowedSensitivities: ["client-safe"] }).action).toBe("conflict");
  });

  it("separates deletion and refuses unsafe branch, identity, approval, compatibility, or resume", () => {
    expect(planFile({ path: "old.md", sensitivity: "client-safe", currentHash: "old", incomingHash: "", allowedSensitivities: ["client-safe"], action: "delete" })).toMatchObject({ action: "destructive-proposal", executed: false });
    expect(preflightAdoption({ branch: "main", defaultBranch: "main", repositoryScoped: false, environmentApproved: false, compatible: false, partialRun: true, sameCheckpoint: false }).length).toBe(5);
  });
});
