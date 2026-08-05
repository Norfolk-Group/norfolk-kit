import { mkdtemp, readFile } from "node:fs/promises";
import { tmpdir } from "node:os";
import path from "node:path";
import { describe, expect, it } from "vitest";
import { buildReferenceArtifact } from "../../tools/artifacts/build";

describe("self-contained reference artifact", () => {
  it("is deterministic and has no external request surface", async () => {
    const output = await mkdtemp(path.join(tmpdir(), "norfolk-artifact-"));
    const first = await buildReferenceArtifact(output);
    const firstHtml = await readFile(first.file, "utf8");
    const second = await buildReferenceArtifact(output);
    const secondHtml = await readFile(second.file, "utf8");

    expect(second.sha256).toBe(first.sha256);
    expect(secondHtml).toBe(firstHtml);
    expect(firstHtml).toContain("Norfolk Kit Reference");
    expect(firstHtml).not.toMatch(/(?:src|href)=["']https?:\/\//u);
    expect(firstHtml).not.toContain("type=\"module\" src=");
  });
});
