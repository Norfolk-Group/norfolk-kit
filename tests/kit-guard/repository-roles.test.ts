import { mkdirSync, mkdtempSync, readFileSync, rmSync, writeFileSync } from "node:fs";
import { spawnSync } from "node:child_process";
import { tmpdir } from "node:os";
import path from "node:path";
import { describe, expect, it } from "vitest";
import { z } from "zod";
import {
  hasSafeUnmatchedDefault,
  isKitManagedPath,
  matchesMarkerPattern,
  sensitivityOf,
} from "../../tools/kit-guard/markers.mjs";

const liveRepositoryRole = z.enum([
  "project-starter",
  "governance-source",
  "handbook-renderer",
  "brand-source",
  "design-source",
  "integration-source",
  "application",
  "agent-config",
  "plugin-catalog",
  "skill-catalog",
  "sandbox",
]);
const projectBootstrap = z.enum(["canonical-template", "never"]);
const liveLifecycle = z.enum(["active", "legacy", "archived"]);
const repositorySlug = z.string().regex(/^Norfolk-Group\/[A-Za-z0-9._-]+$/);
const singleLine = z.string().trim().min(1).refine((value) => !/[\r\n]/.test(value));
const roleTopic = z.string().max(50).regex(/^repo-role-[a-z0-9-]+$/);

const liveRepositoryEntry = z.object({
  repository: repositorySlug,
  role: liveRepositoryRole,
  projectBootstrap,
  lifecycle: liveLifecycle,
  purpose: singleLine,
  githubDescription: singleLine.max(160),
  githubMetadataWrite: z.literal("blocked-by-archive").optional(),
  projectStarterReplacement: repositorySlug.optional(),
}).strict();

const deletedRepositoryEntry = z.object({
  repository: repositorySlug,
  role: z.literal("legacy-starter"),
  projectBootstrap: z.literal("never"),
  lifecycle: z.literal("deleted"),
  purpose: singleLine,
  projectStarterReplacement: repositorySlug,
}).strict();

const repositoryRoles = z.object({
  $comment: singleLine,
  version: z.literal(1),
  organization: z.literal("Norfolk-Group"),
  scope: z.literal("starter-confusion-risk-repositories"),
  canonicalProjectStarter: repositorySlug,
  roleTopics: z.record(liveRepositoryRole, roleTopic),
  repositories: z.array(liveRepositoryEntry).min(1),
  deletedRepositories: z.array(deletedRepositoryEntry),
}).strict().superRefine((registry, context) => {
  const allRepositories = [...registry.repositories, ...registry.deletedRepositories];
  const bySlug = new Map<string, (typeof allRepositories)[number]>();
  for (const entry of allRepositories) {
    const normalized = entry.repository.toLocaleLowerCase("en-US");
    if (bySlug.has(normalized)) {
      context.addIssue({ code: "custom", path: ["repositories"], message: "repository slugs must be unique case-insensitively" });
    }
    bySlug.set(normalized, entry);
  }

  const topicValues = Object.values(registry.roleTopics);
  if (new Set(topicValues).size !== topicValues.length) {
    context.addIssue({ code: "custom", path: ["roleTopics"], message: "each repository role must have a distinct GitHub topic" });
  }

  const starters = registry.repositories.filter((entry) => entry.projectBootstrap === "canonical-template");
  if (starters.length !== 1) {
    context.addIssue({ code: "custom", path: ["repositories"], message: "exactly one canonical template is required" });
  }
  const starter = starters[0];
  if (registry.canonicalProjectStarter !== "Norfolk-Group/norfolk-kit") {
    context.addIssue({ code: "custom", path: ["canonicalProjectStarter"], message: "Norfolk Kit is the only allowed canonical project starter" });
  }
  if (starter && (starter.repository !== registry.canonicalProjectStarter || starter.role !== "project-starter" || starter.lifecycle !== "active")) {
    context.addIssue({ code: "custom", path: ["repositories"], message: "the canonical template must be the active project-starter entry" });
  }

  for (const [index, entry] of registry.repositories.entries()) {
    const isCanonical = entry.repository === registry.canonicalProjectStarter;
    if ((entry.role === "project-starter") !== isCanonical) {
      context.addIssue({ code: "custom", path: ["repositories", index, "role"], message: "only the canonical repository may use the project-starter role" });
    }
    if (entry.repository !== registry.canonicalProjectStarter && entry.projectBootstrap !== "never") {
      context.addIssue({ code: "custom", path: ["repositories", index, "projectBootstrap"], message: "every non-canonical repository must refuse project bootstrap" });
    }
    if (entry.repository !== registry.canonicalProjectStarter && !/(not an application template|do not use as a project starter)/i.test(entry.githubDescription)) {
      context.addIssue({ code: "custom", path: ["repositories", index, "githubDescription"], message: "non-template descriptions must say they are not an application template" });
    }
    if (entry.lifecycle === "active" && entry.projectStarterReplacement) {
      context.addIssue({ code: "custom", path: ["repositories", index, "projectStarterReplacement"], message: "active repositories cannot declare a starter replacement" });
    }
    if ((entry.lifecycle === "archived") !== (entry.githubMetadataWrite === "blocked-by-archive")) {
      context.addIssue({ code: "custom", path: ["repositories", index, "githubMetadataWrite"], message: "only archived repositories must record that GitHub metadata writes are blocked" });
    }
    if (entry.lifecycle !== "active") {
      validateReplacement(entry, ["repositories", index, "projectStarterReplacement"]);
    }
  }

  for (const [index, entry] of registry.deletedRepositories.entries()) {
    validateReplacement(entry, ["deletedRepositories", index, "projectStarterReplacement"]);
  }

  function validateReplacement(
    entry: (typeof allRepositories)[number],
    issuePath: (string | number)[],
  ) {
    if (!entry.projectStarterReplacement || entry.projectStarterReplacement.toLocaleLowerCase("en-US") === entry.repository.toLocaleLowerCase("en-US")) {
      context.addIssue({ code: "custom", path: issuePath, message: "non-active repositories require a different active starter replacement" });
      return;
    }
    if (entry.projectStarterReplacement.toLocaleLowerCase("en-US") !== registry.canonicalProjectStarter.toLocaleLowerCase("en-US")) {
      context.addIssue({ code: "custom", path: issuePath, message: "starter replacement must point to the canonical project starter" });
      return;
    }
    const replacement = bySlug.get(entry.projectStarterReplacement.toLocaleLowerCase("en-US"));
    if (!replacement || replacement.lifecycle !== "active" || replacement.role !== "project-starter" || replacement.projectBootstrap !== "canonical-template") {
      context.addIssue({ code: "custom", path: issuePath, message: "starter replacement must resolve to the active canonical template entry" });
    }
  }
});

type RepositoryRoles = z.infer<typeof repositoryRoles>;

const root = path.resolve(import.meta.dirname, "../..");
const committedRegistry = JSON.parse(readFileSync(path.join(root, ".kit/repository-roles.json"), "utf8")) as unknown;
const committedMarkers = JSON.parse(readFileSync(path.join(root, ".kit/markers.json"), "utf8")) as {
  markers: Record<string, string>;
  unmatchedDefault?: string;
  $excludeFromPayload: Record<string, string>;
};

const validRegistry = () => repositoryRoles.parse(committedRegistry);
const changedRegistry = (change: (draft: RepositoryRoles) => void) => {
  const draft = structuredClone(validRegistry());
  change(draft);
  return draft;
};

describe("Norfolk shared-repository roles", () => {
  it("declares Norfolk Kit as the sole project template", () => {
    const registry = validRegistry();
    expect(registry.canonicalProjectStarter).toBe("Norfolk-Group/norfolk-kit");
    expect(registry.repositories.filter((entry) => entry.projectBootstrap === "canonical-template")).toEqual([
      expect.objectContaining({ repository: "Norfolk-Group/norfolk-kit", role: "project-starter", lifecycle: "active" }),
    ]);
  });

  it("rejects duplicate slugs and a second project template", () => {
    expect(() => repositoryRoles.parse(changedRegistry((draft) => {
      draft.repositories[1]!.repository = "Norfolk-Group/NORFOLK-KIT";
    }))).toThrow(/unique case-insensitively/);

    expect(() => repositoryRoles.parse(changedRegistry((draft) => {
      draft.repositories[1]!.projectBootstrap = "canonical-template";
      draft.repositories[1]!.role = "project-starter";
    }))).toThrow(/exactly one canonical template/);

    expect(() => repositoryRoles.parse(changedRegistry((draft) => {
      draft.repositories[1]!.role = "project-starter";
    }))).toThrow(/only the canonical repository may use the project-starter role/);
  });

  it("rejects canonical drift, unknown fields, and ambiguous descriptions", () => {
    expect(() => repositoryRoles.parse(changedRegistry((draft) => {
      draft.canonicalProjectStarter = "Norfolk-Group/general";
    }))).toThrow(/Norfolk Kit is the only allowed/);

    expect(() => repositoryRoles.parse({ ...validRegistry(), unexpected: true })).toThrow();

    expect(() => repositoryRoles.parse(changedRegistry((draft) => {
      draft.repositories[1]!.githubDescription = "Product doctrine and governance.";
    }))).toThrow(/must say they are not an application template/);
  });

  it("requires non-active live repositories to name an active replacement", () => {
    const nonActiveIndex = validRegistry().repositories.findIndex((entry) => entry.lifecycle !== "active");
    expect(nonActiveIndex).toBeGreaterThan(-1);

    expect(() => repositoryRoles.parse(changedRegistry((draft) => {
      delete draft.repositories[nonActiveIndex]!.projectStarterReplacement;
    }))).toThrow(/require a different active starter replacement/);

    expect(() => repositoryRoles.parse(changedRegistry((draft) => {
      draft.repositories[nonActiveIndex]!.projectStarterReplacement = draft.repositories[nonActiveIndex]!.repository;
    }))).toThrow(/require a different active starter replacement/);

    expect(() => repositoryRoles.parse(changedRegistry((draft) => {
      draft.repositories[nonActiveIndex]!.projectStarterReplacement = "Norfolk-Group/missing";
    }))).toThrow(/point to the canonical project starter/);

    expect(() => repositoryRoles.parse(changedRegistry((draft) => {
      draft.repositories[nonActiveIndex]!.projectStarterReplacement = "Norfolk-Group/norfolk-ai-product-os";
    }))).toThrow(/point to the canonical project starter/);
  });

  it("tracks deleted predecessors separately from live GitHub metadata", () => {
    const registry = validRegistry();
    expect(registry.deletedRepositories).toEqual([
      expect.objectContaining({
        repository: "Norfolk-Group/norfolk-starter",
        lifecycle: "deleted",
        projectStarterReplacement: "Norfolk-Group/norfolk-kit",
      }),
    ]);
    expect(registry.repositories.map((entry) => entry.repository)).not.toContain("Norfolk-Group/norfolk-starter");
    expect(registry.deletedRepositories[0]).not.toHaveProperty("githubDescription");
    expect(registry.deletedRepositories[0]).not.toHaveProperty("roleTopic");
  });

  it("makes archived GitHub metadata exceptions explicit", () => {
    const registry = validRegistry();
    expect(registry.repositories.filter((entry) => entry.lifecycle === "archived")).not.toHaveLength(0);
    expect(registry.repositories.filter((entry) => entry.lifecycle === "archived")).toEqual(
      expect.arrayContaining([
        expect.objectContaining({ githubMetadataWrite: "blocked-by-archive" }),
      ]),
    );
    expect(registry.repositories.filter((entry) => entry.lifecycle !== "archived")).toEqual(
      expect.not.arrayContaining([
        expect.objectContaining({ githubMetadataWrite: "blocked-by-archive" }),
      ]),
    );
  });

  it("uses one stable GitHub topic per role", () => {
    const registry = validRegistry();
    expect(Object.keys(registry.roleTopics).sort()).toEqual([...liveRepositoryRole.options].sort());

    expect(() => repositoryRoles.parse(changedRegistry((draft) => {
      draft.roleTopics["governance-source"] = draft.roleTopics["project-starter"];
    }))).toThrow(/distinct GitHub topic/);
  });

  it("keeps the organization inventory out of equipped repositories", () => {
    expect(committedMarkers.unmatchedDefault).toBe("kit-only");
    expect(hasSafeUnmatchedDefault(committedMarkers)).toBe(true);
    expect(committedMarkers.markers[".kit/repository-roles.json"]).toBe("kit-only");
    expect(committedMarkers.$excludeFromPayload[".kit/repository-roles.json"]).toBeTruthy();
    expect(matchesMarkerPattern(".kit/**", ".kit/repository-roles.json")).toBe(true);
    expect(isKitManagedPath(committedMarkers, ".kit/repository-roles.json")).toBe(true);
    expect(sensitivityOf(committedMarkers, ".kit/repository-roles.json")).toBe("kit-only");
  });

  it("fails closed to kit-only when marker configuration omits its default", () => {
    expect(sensitivityOf({ markers: {} }, "new-unclassified-file.md")).toBe("kit-only");
    expect(sensitivityOf({ markers: {}, unmatchedDefault: "client-safe" }, "new-unclassified-file.md")).toBe("kit-only");
    expect(hasSafeUnmatchedDefault({ markers: {}, unmatchedDefault: "client-safe" })).toBe(false);
    expect(sensitivityOf({ markers: { "docs/**": "client-safe" } }, "docs/repository-roles.md")).toBe("client-safe");
  });

  it("runs both guard CLIs with the shared fail-closed marker policy", () => {
    const fixtureRoot = mkdtempSync(path.join(tmpdir(), "norfolk-kit-guard-"));
    const writeJson = (relativePath: string, value: unknown) => {
      const target = path.join(fixtureRoot, relativePath);
      mkdirSync(path.dirname(target), { recursive: true });
      writeFileSync(target, `${JSON.stringify(value, null, 2)}\n`);
    };
    const run = (script: string, args: string[]) => spawnSync(
      process.execPath,
      [path.join(root, "tools/kit-guard", script), ...args],
      { cwd: fixtureRoot, encoding: "utf8" },
    );

    try {
      const markers = {
        unmatchedDefault: "kit-only",
        markers: {
          ".kit/**": "client-safe",
          ".kit/repository-roles.json": "kit-only",
          "tools/**": "client-safe",
        },
        $excludeFromPayload: {
          ".kit/repository-roles.json": "organization inventory",
        },
      };
      writeJson(".kit/markers.json", markers);
      writeJson(".kit/payloads.json", {
        payloads: {
          "Norfolk-Group": { class: "norfolk", allowedSensitivities: ["client-safe", "norfolk-only"] },
        },
        default: { class: "unknown", allowedSensitivities: ["client-safe"] },
      });
      writeJson(".kit/repository-roles.json", { fixture: true });
      mkdirSync(path.join(fixtureRoot, "tools"), { recursive: true });
      writeFileSync(path.join(fixtureRoot, "tools", "example.txt"), "example", { flag: "w" });

      const manifestResult = run("write-manifest.mjs", ["--kit-sha", "fixture", "--org", "Norfolk-Group", "--discover"]);
      expect(manifestResult.status, manifestResult.stderr).toBe(0);
      const manifestPath = path.join(fixtureRoot, ".kit/manifest.json");
      const manifest = JSON.parse(readFileSync(manifestPath, "utf8")) as { files: Record<string, { sha256: string; sensitivity?: string }> };
      expect(manifest.files).toHaveProperty("tools/example.txt");
      expect(manifest.files).not.toHaveProperty(".kit/repository-roles.json");

      const passingAudit = run("check.mjs", ["--audit-only"]);
      expect(passingAudit.status, passingAudit.stdout + passingAudit.stderr).toBe(0);

      writeFileSync(path.join(fixtureRoot, "unclassified.txt"), "private-by-default");
      const refusedManifest = run("write-manifest.mjs", ["--kit-sha", "fixture", "--org", "Norfolk-Group", "--files", "unclassified.txt"]);
      expect(refusedManifest.status, refusedManifest.stdout + refusedManifest.stderr).toBe(1);
      expect(refusedManifest.stderr).toContain("kit-only");

      manifest.files["unclassified.txt"] = { sha256: "fixture" };
      writeJson(".kit/manifest.json", manifest);
      const failingAudit = run("check.mjs", ["--audit-only"]);
      expect(failingAudit.status, failingAudit.stdout + failingAudit.stderr).toBe(1);
      expect(failingAudit.stdout).toContain("BRAND-BOUNDARY");

      writeJson(".kit/markers.json", { ...markers, unmatchedDefault: "client-safe" });
      const unsafeWriter = run("write-manifest.mjs", ["--kit-sha", "fixture", "--org", "Norfolk-Group", "--discover"]);
      expect(unsafeWriter.status, unsafeWriter.stdout + unsafeWriter.stderr).toBe(2);
      expect(unsafeWriter.stderr).toContain("unmatchedDefault");
      const unsafeAudit = run("check.mjs", ["--audit-only"]);
      expect(unsafeAudit.status, unsafeAudit.stdout + unsafeAudit.stderr).toBe(1);
      expect(unsafeAudit.stdout).toContain("unmatchedDefault");
    } finally {
      rmSync(fixtureRoot, { recursive: true, force: true });
    }
  });
});
