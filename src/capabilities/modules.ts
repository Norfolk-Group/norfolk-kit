export interface OptionalModuleManifest {
  id: string;
  version: string;
  routes: string[];
  configurationKeys: string[];
  runtimeEntry: string;
}

export const sampleOptionalModuleManifest: OptionalModuleManifest = {
  id: "sample-optional-module",
  version: "1.0.0",
  routes: ["/optional/sample"],
  configurationKeys: ["SAMPLE_OPTIONAL_MODULE_ENABLED"],
  runtimeEntry: "@norfolk-ai/modules/sample",
};

export function createModuleRegistry() {
  const installed = new Map<string, OptionalModuleManifest>();
  return {
    has: (id: string) => installed.has(id),
    list: () => [...installed.values()],
    install(manifest: OptionalModuleManifest) {
      if (installed.has(manifest.id)) throw new Error(`Module ${manifest.id} is already installed`);
      installed.set(manifest.id, structuredClone(manifest));
    },
    remove(id: string) {
      if (!installed.delete(id)) throw new Error(`Module ${id} is not installed`);
    },
    snapshot() {
      const modules = [...installed.values()];
      return {
        modules,
        routes: modules.flatMap((module) => module.routes),
        configurationKeys: modules.flatMap((module) => module.configurationKeys),
      };
    },
  };
}
