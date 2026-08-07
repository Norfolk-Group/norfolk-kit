import { describe, expect, it } from "vitest";
import { createModuleRegistry, sampleOptionalModuleManifest } from "@/capabilities/modules";

describe("optional module lifecycle", () => {
  it("keeps optional modules out of the default runtime", () => {
    const registry = createModuleRegistry();

    expect(registry.list()).toEqual([]);
    expect(registry.has(sampleOptionalModuleManifest.id)).toBe(false);
  });

  it("installs and removes a manifest without orphaned configuration", () => {
    const registry = createModuleRegistry();

    registry.install(sampleOptionalModuleManifest);
    expect(registry.snapshot()).toEqual({
      modules: [sampleOptionalModuleManifest],
      routes: ["/optional/sample"],
      configurationKeys: ["SAMPLE_OPTIONAL_MODULE_ENABLED"],
    });

    registry.remove(sampleOptionalModuleManifest.id);
    expect(registry.snapshot()).toEqual({ modules: [], routes: [], configurationKeys: [] });
  });
});
