import { createHash } from "node:crypto";
import { execFileSync, spawnSync } from "node:child_process";
import { link, mkdtemp, readFile, rm, symlink, writeFile } from "node:fs/promises";
import { tmpdir } from "node:os";
import path from "node:path";
import { afterEach, describe, expect, it } from "vitest";

const cli = path.resolve("tools/owner-guide/build.mjs");
const temporaryDirectories: string[] = [];

async function fixture(markdown: string) {
  const directory = await mkdtemp(path.join(tmpdir(), "norfolk-owner-guide-test-"));
  temporaryDirectories.push(directory);
  const source = path.join(directory, "guide.md");
  const output = path.join(directory, "guide.html");
  await writeFile(source, markdown);
  return { source, output, args: [cli, "--source", source, "--output", output] };
}

afterEach(async () => {
  await Promise.all(temporaryDirectories.splice(0).map((directory) => rm(directory, { recursive: true, force: true })));
});

describe("offline owner guide", () => {
  it("keeps the committed artifact current with the owner source and renderer", () => {
    const result = spawnSync(process.execPath, [cli, "--check"], { encoding: "utf8" });
    expect(result.stderr).toBe("");
    expect(result.status).toBe(0);
    expect(result.stdout).toContain("Owner guide is current");
  });

  it("renders semantic content, stable unique navigation, and exact selectable prompts", async () => {
    const prompt = "Assess <project> & preserve existing data.\n  Do not publish.\n";
    const markdown = "# Owner guide\n\n## Start\n\n**Read** `AGENTS.md` and [rules](../AGENTS.md).\n\n- First\n- Second\n\n1. Assess\n2. Confirm\n\n| Tool | Role |\n|---|---|\n| Codex | Agent |\n\n```text\n" + prompt + "```\n\n## Start\n\n<script>alert('unsafe')</script>\n";
    const { args, output } = await fixture(markdown);
    execFileSync(process.execPath, args);
    const html = await readFile(output, "utf8");
    expect(html).toContain('<h2 id="start">Start</h2>');
    expect(html).toContain('<h2 id="start-2">Start</h2>');
    expect(html).toContain('href="#start-2"');
    expect(html).toContain('<strong>Read</strong> <code>AGENTS.md</code>');
    expect(html).toContain('href="https://github.com/Norfolk-Group/norfolk-kit/blob/main/AGENTS.md"');
    expect(html).toContain("<ul><li>First</li><li>Second</li></ul>");
    expect(html).toContain("<ol><li>Assess</li><li>Confirm</li></ol>");
    expect(html).toContain('<th scope="col">Tool</th>');
    expect(html).toContain('id="prompt-1" tabindex="0">Assess &lt;project&gt; &amp; preserve existing data.\n  Do not publish.\n</code>');
    expect(html).toContain('&lt;script&gt;alert(&#39;unsafe&#39;)&lt;/script&gt;');
    expect(html).not.toContain("<script>alert");
    expect(html).toContain('data-copy="prompt-1"');
    expect(html).toContain("range.selectNodeContents(code)");
    expect(html).toContain("@media print");
    expect(html).toContain("data:font/woff2;base64,");
    expect(html).toContain("default-src 'none'; script-src 'sha256-");
    expect(html).not.toMatch(/<(?:script|link|img)[^>]+(?:src|href)=["']https?:/);
    expect(html).toContain(createHash("sha256").update(markdown).digest("hex"));
  });

  it.each(["heading-first", "code-first"])("keeps shell, heading and prompt IDs unique in %s order", async (order) => {
    const heading = "## Prompt 1\n\n";
    const code = "```text\nCopy this exact prompt.\n```\n\n";
    const markdown = "# Guide\n\n" + (order === "heading-first" ? heading + code : code + heading) + "## Main content\n\n## Prompt 1-2\n\n## Main content\n";
    const { args, output } = await fixture(markdown);
    execFileSync(process.execPath, args);
    const html = await readFile(output, "utf8");
    const ids = [...html.matchAll(/\bid="([^"]+)"/g)].map((match) => match[1]);
    expect(new Set(ids).size).toBe(ids.length);
    expect(html).toContain('<main id="main-content">');
    expect(html).toContain('<h2 id="main-content-2">Main content</h2>');
    expect(html).toContain('<h2 id="main-content-3">Main content</h2>');
    const copyTargets = [...html.matchAll(/data-copy="([^"]+)"/g)].map((match) => match[1]);
    expect(copyTargets).toHaveLength(1);
    expect(html).toContain(`<code id="${copyTargets[0]}" tabindex="0">Copy this exact prompt.\n</code>`);
    const navTargets = [...html.matchAll(/href="#([^"]+)"/g)].map((match) => match[1]);
    for (const target of navTargets) expect(ids.filter((id) => id === target)).toHaveLength(1);
  });

  it("rejects a hardlink output alias without modifying source", async () => {
    const markdown = "# Guide\n\nDo not overwrite the source.\n";
    const { source, output, args } = await fixture(markdown);
    await link(source, output);
    const result = spawnSync(process.execPath, args, { encoding: "utf8" });
    expect(result.status).toBe(1);
    expect(result.stderr).toContain("Source and output must be different files");
    expect(await readFile(source, "utf8")).toBe(markdown);
    expect(await readFile(output, "utf8")).toBe(markdown);
  });

  it.skipIf(process.platform !== "win32")("rejects a Windows case-only output alias without modifying source", async () => {
    const markdown = "# Guide\n\nKeep these bytes.\n";
    const { source } = await fixture(markdown);
    const output = path.join(path.dirname(source), "GUIDE.md");
    const result = spawnSync(process.execPath, [cli, "--source", source, "--output", output], { encoding: "utf8" });
    expect(result.status).toBe(1);
    expect(result.stderr).toContain("Source and output must be different files");
    expect(await readFile(source, "utf8")).toBe(markdown);
  });

  it.skipIf(process.platform === "win32")("rejects a symlink output alias without modifying source", async () => {
    const markdown = "# Guide\n\nKeep these bytes.\n";
    const { source, output, args } = await fixture(markdown);
    await symlink(source, output);
    const result = spawnSync(process.execPath, args, { encoding: "utf8" });
    expect(result.status).toBe(1);
    expect(result.stderr).toContain("Source and output must be different files");
    expect(await readFile(source, "utf8")).toBe(markdown);
  });

  it("is deterministic across LF/CRLF and --check detects source and output drift without overwriting", async () => {
    const { source, output, args } = await fixture("# Guide\n\n## Start\n\nRead me.\n");
    execFileSync(process.execPath, args);
    const initial = await readFile(output, "utf8");
    execFileSync(process.execPath, [...args, "--check"]);
    await writeFile(source, "# Guide\r\n\r\n## Start\r\n\r\nRead me.\r\n");
    execFileSync(process.execPath, [...args, "--check"]);
    execFileSync(process.execPath, args);
    expect(await readFile(output, "utf8")).toBe(initial);
    await writeFile(source, "# Guide\n\nChanged.\n");
    expect(spawnSync(process.execPath, [...args, "--check"]).status).toBe(1);
    expect(await readFile(output, "utf8")).toBe(initial);
    execFileSync(process.execPath, args);
    await writeFile(output, "corrupt");
    expect(spawnSync(process.execPath, [...args, "--check"]).status).toBe(1);
    expect(await readFile(output, "utf8")).toBe("corrupt");
  });

  it.each(["javascript:alert(1)", "data:text/html,bad", "//evil.example", "file:///secret", "../../../outside.md", "https://user:password@example.com"])("rejects unsafe or unsupported link %s", async (target) => {
    const { args, output } = await fixture(`# Guide\n\n[Unsafe](${target})\n`);
    const result = spawnSync(process.execPath, args, { encoding: "utf8" });
    expect(result.status).toBe(1);
    expect(result.stderr).toContain("Unsupported link");
    await expect(readFile(output)).rejects.toMatchObject({ code: "ENOENT" });
  });

  it("fails on missing or empty sources, unterminated code, malformed tables, and missing checked output", async () => {
    const { args, source, output } = await fixture("# Guide\n");
    expect(spawnSync(process.execPath, [...args, "--check"]).status).toBe(1);
    for (const invalid of ["", "# Guide\n\n```text\nUnclosed", "# Guide\n\n| A | B |\n|---|---|\n| One |\n"]) {
      await writeFile(source, invalid);
      expect(spawnSync(process.execPath, args).status).toBe(1);
      await expect(readFile(output)).rejects.toMatchObject({ code: "ENOENT" });
    }
    await rm(source);
    expect(spawnSync(process.execPath, args).status).toBe(1);
  });

  it("is import-safe and rejects unknown command flags", () => {
    const imported = spawnSync(process.execPath, ["--input-type=module", "-e", "import('./tools/owner-guide/build.mjs')"], { encoding: "utf8" });
    expect(imported.status).toBe(0);
    expect(imported.stdout).toBe("");
    expect(spawnSync(process.execPath, [cli, "--unknown"]).status).toBe(1);
  });
});
