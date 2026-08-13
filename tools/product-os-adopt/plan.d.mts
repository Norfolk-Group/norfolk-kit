export function sha256(value: string | Uint8Array): string;
export function canonicalJson(value: unknown): string;
export function verifyBundle(bundle: Record<string, unknown>, publicKey: unknown): boolean;
export function resolvePayloadPolicy(payloads: { payloads: Record<string, { allowedSensitivities?: string[] }>; default: { allowedSensitivities?: string[] } }, organization: string): { allowedSensitivities?: string[] };
export function planFile(input: { path: string; sensitivity: string; installedHash?: string; currentHash: string; incomingHash: string; allowedSensitivities: string[]; action?: "add" | "update" | "delete" }): { path: string; action: string; reason?: string; executed?: boolean };
export function preflightAdoption(input: { branch: string; defaultBranch: string; repositoryScoped: boolean; environmentApproved: boolean; compatible: boolean; partialRun: boolean; sameCheckpoint: boolean }): string[];
export function planReportOutputSurface(input: {
  surfaceId: string;
  currentThemeId?: string | null;
  targetThemeId: string;
  rendererPreflight: "passed" | "failed" | "unknown";
  hasApprovedBaseline: boolean;
  locallyModifiedManagedSurface?: boolean;
  approvedException?: { id: string; reason: string; reviewOn?: string } | null;
}): {
  surfaceId: string;
  targetThemeId: string;
  action: string;
  writesExistingSurface: boolean;
  reason?: string;
  cutoverRequiresApproval?: boolean;
  exception?: { id: string; reason: string; reviewOn?: string };
};
export function preflightReportOutputAdoption(input: {
  branch: string;
  defaultBranch: string;
  inventoryCaptured: boolean;
  baselinesCaptured: boolean;
  semanticFixturesCaptured: boolean;
  rendererCapabilitiesVerified: boolean;
  rollbackReady: boolean;
}): string[];
