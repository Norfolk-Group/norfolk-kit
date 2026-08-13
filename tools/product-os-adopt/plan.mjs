import { createHash, verify } from "node:crypto";

export const sha256 = (value) => createHash("sha256").update(value).digest("hex");

export function canonicalJson(value) {
  if (value === null || typeof value !== "object") return JSON.stringify(value);
  if (Array.isArray(value)) return `[${value.map(canonicalJson).join(",")}]`;
  return `{${Object.entries(value).sort(([a], [b]) => a.localeCompare(b)).map(([key, item]) => `${JSON.stringify(key)}:${canonicalJson(item)}`).join(",")}}`;
}

export function verifyBundle(bundle, publicKey) {
  if (bundle.algorithm !== "Ed25519" || !bundle.signature || !bundle.manifest) return false;
  return verify(null, Buffer.from(canonicalJson(bundle.manifest)), publicKey, Buffer.from(bundle.signature, "base64"));
}

export function resolvePayloadPolicy(payloads, organization) { return payloads.payloads[organization] || payloads.default; }

export function planFile({ path, sensitivity, installedHash, currentHash, incomingHash, allowedSensitivities, action = "update" }) {
  if (!allowedSensitivities.includes(sensitivity)) return { path, action: "blocked", reason: `sensitivity ${sensitivity} is not allowed` };
  if (action === "delete") return { path, action: "destructive-proposal", executed: false, reason: "exact separate approval required" };
  if (installedHash && currentHash !== installedHash) return { path, action: "conflict", reason: "locally edited managed file" };
  if (currentHash === incomingHash) return { path, action: "unchanged" };
  return { path, action: installedHash ? "update" : "add" };
}

export function preflightAdoption({ branch, defaultBranch, repositoryScoped, environmentApproved, compatible, partialRun, sameCheckpoint }) {
  const errors = [];
  if (!branch || branch === defaultBranch || !branch.startsWith("adoption/product-os-")) errors.push("write target must be a deterministic adoption branch");
  if (!repositoryScoped) errors.push("identity must be repository-scoped");
  if (!environmentApproved) errors.push("release environment approval is required");
  if (!compatible) errors.push("Product OS and Kit versions are incompatible");
  if (partialRun && !sameCheckpoint) errors.push("partial run does not match this bundle and repository head");
  return errors;
}

export function planReportOutputSurface({
  surfaceId,
  currentThemeId,
  targetThemeId,
  rendererPreflight,
  hasApprovedBaseline,
  locallyModifiedManagedSurface = false,
  approvedException = null,
}) {
  const base = { surfaceId, targetThemeId, writesExistingSurface: false };

  if (approvedException) {
    return {
      ...base,
      action: "exception",
      exception: approvedException,
      reason: "approved legacy output remains in place until its recorded review condition",
    };
  }
  if (rendererPreflight === "failed") {
    return {
      ...base,
      action: "blocked",
      reason: "the selected renderer cannot satisfy the target output profile",
    };
  }
  if (rendererPreflight !== "passed") {
    return {
      ...base,
      action: "inventory-required",
      reason: "renderer capabilities must be verified before adoption is planned",
    };
  }
  if (locallyModifiedManagedSurface) {
    return {
      ...base,
      action: "conflict",
      reason: "a locally modified Kit-managed report surface requires human reconciliation",
    };
  }
  if (currentThemeId === targetThemeId) {
    return { ...base, action: "compliant" };
  }
  if (hasApprovedBaseline) {
    return {
      ...base,
      action: "parallel-adoption",
      reason: "generate the Kit profile beside the approved legacy artifact; cut over only after semantic and visual approval",
      cutoverRequiresApproval: true,
    };
  }
  return {
    ...base,
    action: "adopt",
    reason: "no approved legacy baseline needs preservation",
    cutoverRequiresApproval: true,
  };
}

export function preflightReportOutputAdoption({
  branch,
  defaultBranch,
  inventoryCaptured,
  baselinesCaptured,
  semanticFixturesCaptured,
  rendererCapabilitiesVerified,
  rollbackReady,
}) {
  const errors = [];
  if (
    !branch
    || branch === defaultBranch
    || !(branch.startsWith("adoption/report-output-") || branch.startsWith("adoption/product-os-"))
  ) {
    errors.push("report-output adoption requires a dedicated adoption branch");
  }
  if (!inventoryCaptured) errors.push("existing report surfaces and renderers must be inventoried");
  if (!baselinesCaptured) errors.push("approved visual artifacts must be captured before changes");
  if (!semanticFixturesCaptured) errors.push("semantic parity fixtures must be captured before changes");
  if (!rendererCapabilitiesVerified) errors.push("renderer SDK/server/plugin capabilities must be verified");
  if (!rollbackReady) errors.push("surface-level rollback must be ready before cutover");
  return errors;
}
