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
