import { readFile } from "node:fs/promises";
import path from "node:path";
import { describe, expect, it } from "vitest";
import { buildCatalogArtifacts } from "../../tools/artifacts/catalogs";

const root = path.resolve(import.meta.dirname, "../..");

describe("living Kit catalogs", () => {
  it("generates all five traceable offline catalogs deterministically", async () => {
    const first = await buildCatalogArtifacts(root);
    const second = await buildCatalogArtifacts(root);
    expect([...first.keys()]).toEqual(["components.html", "motion.html", "icons.html", "architecture.html", "navigation.html"]);
    expect(first).toEqual(second);
    for (const [name, content] of first) {
      expect(content).toContain("Product OS version");
      expect(content).toContain("Kit version");
      expect(content).toContain("source-sha256");
      expect(content).toContain("Source path");
      expect(content).toContain("Content-Security-Policy");
      expect(content).not.toMatch(/(?:src|href)=["']https?:/i);
      if (name === "motion.html") expect(content).toContain("analyst-cube");
    }
  });

  it("committed catalogs match regeneration", async () => {
    const generated = await buildCatalogArtifacts(root);
    for (const [name, content] of generated) {
      const committed = await readFile(path.join(root, "docs/artifacts", name), "utf8");
      if (name === "motion.html") {
        const sourceHash = content.match(/source-sha256 ([a-f0-9]{64})/)?.[1];
        expect(sourceHash).toBeTruthy();
        expect(committed).toContain(`source-sha256 ${sourceHash}`);
      } else expect(committed).toBe(content);
    }
  });
});
