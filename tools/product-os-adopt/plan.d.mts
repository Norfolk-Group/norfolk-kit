export function sha256(value: string | Uint8Array): string;
export function canonicalJson(value: unknown): string;
export function verifyBundle(bundle: Record<string, unknown>, publicKey: unknown): boolean;
export function resolvePayloadPolicy(payloads: { payloads: Record<string, { allowedSensitivities?: string[] }>; default: { allowedSensitivities?: string[] } }, organization: string): { allowedSensitivities?: string[] };
export function planFile(input: { path: string; sensitivity: string; installedHash?: string; currentHash: string; incomingHash: string; allowedSensitivities: string[]; action?: "add" | "update" | "delete" }): { path: string; action: string; reason?: string; executed?: boolean };
export function preflightAdoption(input: { branch: string; defaultBranch: string; repositoryScoped: boolean; environmentApproved: boolean; compatible: boolean; partialRun: boolean; sameCheckpoint: boolean }): string[];
