import { generateKeyPairSync, sign } from "node:crypto";
import { describe, expect, it } from "vitest";
import {
  canonicalJson,
  planFile,
  planReportOutputSurface,
  preflightAdoption,
  preflightReportOutputAdoption,
  resolvePayloadPolicy,
  verifyBundle,
} from "../../tools/product-os-adopt/plan.mjs";
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

  it("plans existing financial reports beside their approved legacy output", () => {
    expect(planReportOutputSurface({
      surfaceId: "investor-reports",
      currentThemeId: "legacy-investor-theme",
      targetThemeId: "norfolk-financial-monochrome",
      rendererPreflight: "passed",
      hasApprovedBaseline: true,
    })).toMatchObject({
      action: "parallel-adoption",
      writesExistingSurface: false,
      cutoverRequiresApproval: true,
    });
  });

  it("blocks unsafe report adoption and preserves approved exceptions", () => {
    expect(planReportOutputSurface({
      surfaceId: "legacy-pdf",
      currentThemeId: "legacy",
      targetThemeId: "norfolk-financial-monochrome",
      rendererPreflight: "failed",
      hasApprovedBaseline: true,
    }).action).toBe("blocked");

    expect(planReportOutputSurface({
      surfaceId: "regulated-statement",
      currentThemeId: "approved-regulatory-layout",
      targetThemeId: "norfolk-financial-monochrome",
      rendererPreflight: "unknown",
      hasApprovedBaseline: true,
      approvedException: { id: "EX-REPORT-1", reason: "regulator-approved fixed form" },
    })).toMatchObject({ action: "exception", writesExistingSurface: false });
  });

  it("treats local report changes as conflicts even when the theme id matches", () => {
    expect(planReportOutputSurface({
      surfaceId: "investor-report-pdf",
      currentThemeId: "norfolk-financial-monochrome",
      targetThemeId: "norfolk-financial-monochrome",
      rendererPreflight: "passed",
      hasApprovedBaseline: true,
      locallyModifiedManagedSurface: true,
    })).toMatchObject({ action: "conflict", writesExistingSurface: false });
  });

  it("requires inventory, baselines, renderer facts, and rollback before report cutover", () => {
    expect(preflightReportOutputAdoption({
      branch: "main",
      defaultBranch: "main",
      inventoryCaptured: false,
      baselinesCaptured: false,
      semanticFixturesCaptured: false,
      rendererCapabilitiesVerified: false,
      rollbackReady: false,
    })).toHaveLength(6);

    expect(preflightReportOutputAdoption({
      branch: "adoption/report-output-financial-v1",
      defaultBranch: "main",
      inventoryCaptured: true,
      baselinesCaptured: true,
      semanticFixturesCaptured: true,
      rendererCapabilitiesVerified: true,
      rollbackReady: true,
    })).toEqual([]);
  });
});
