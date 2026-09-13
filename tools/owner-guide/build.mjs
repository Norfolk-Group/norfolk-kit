import { createHash } from "node:crypto";
import { readFile, realpath, stat, writeFile } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";

const repositoryRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "../..");
const repositoryUrl = "https://github.com/Norfolk-Group/norfolk-kit/blob/main/";

function escapeHtml(value) {
  return value.replace(/[&<>"']/g, (character) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" })[character]);
}

function safeHref(target) {
  if (/[\s\\<>]/.test(target) || !target || target.startsWith("//")) throw new Error(`Unsupported link: ${target}`);
  if (target.startsWith("#")) return target;
  if (/^[a-z][a-z0-9+.-]*:/i.test(target)) {
    const url = new URL(target);
    if (url.protocol !== "https:" || url.username || url.password) throw new Error(`Unsupported link: ${target}`);
    return url.href;
  }
  if (target.startsWith("/")) throw new Error(`Unsupported link: ${target}`);
  const url = new URL(target, `${repositoryUrl}docs/OWNERS-GUIDE.md`);
  if (!url.href.startsWith(repositoryUrl)) throw new Error(`Unsupported link: ${target}`);
  return url.href;
}

/** A deliberately small Markdown subset: HTML is always literal text. */
function inline(text) {
  const token = /(`[^`\n]+`|\*\*[^*\n]+\*\*|\[[^\]\n]+\]\([^\s]+?\))/g;
  let output = "";
  let cursor = 0;
  for (const match of text.matchAll(token)) {
    output += escapeHtml(text.slice(cursor, match.index));
    const value = match[0];
    if (value.startsWith("`")) output += `<code>${escapeHtml(value.slice(1, -1))}</code>`;
    else if (value.startsWith("**")) output += `<strong>${inline(value.slice(2, -2))}</strong>`;
    else {
      const separator = value.indexOf("](");
      output += `<a href="${escapeHtml(safeHref(value.slice(separator + 2, -1)))}">${inline(value.slice(1, separator))}</a>`;
    }
    cursor = match.index + value.length;
  }
  return output + escapeHtml(text.slice(cursor));
}

function cells(line) {
  const result = [];
  let current = "";
  let code = false;
  const content = line.trim().replace(/^\|/, "").replace(/\|$/, "");
  for (let index = 0; index < content.length; index += 1) {
    const character = content[index];
    if (character === "\\" && content[index + 1] === "|") {
      current += "|";
      index += 1;
    } else if (character === "`") {
      code = !code;
      current += character;
    } else if (character === "|" && !code) {
      result.push(current.trim());
      current = "";
    } else current += character;
  }
  result.push(current.trim());
  return result;
}

function parseMarkdown(markdown) {
  const lines = markdown.split("\n");
  const blocks = [];
  const headings = [];
  // Shell IDs and every generated Markdown element share one namespace.
  const usedIds = new Set(["main-content"]);
  const allocateId = (baseId) => {
    let id = baseId;
    let suffix = 1;
    while (usedIds.has(id)) id = `${baseId}-${++suffix}`;
    usedIds.add(id);
    return id;
  };
  let promptNumber = 0;
  let index = 0;
  const isBlock = (line) => /^(#{1,6} |```|~~~|\s*[-*+] |\s*\d+\. |\|)|^\s*---+\s*$/.test(line);
  while (index < lines.length) {
    const line = lines[index];
    if (!line.trim()) { index += 1; continue; }
    const fence = line.match(/^(`{3,}|~{3,})([a-zA-Z0-9_-]*)\s*$/);
    if (fence) {
      index += 1;
      const code = [];
      while (index < lines.length && lines[index] !== fence[1]) code.push(lines[index++]);
      if (index === lines.length) throw new Error("Unterminated code fence in owner guide");
      index += 1;
      const id = allocateId(`prompt-${++promptNumber}`);
      blocks.push(`<div class="prompt"><div class="prompt-actions"><button type="button" data-copy="${id}">Copy prompt</button><span aria-live="polite"></span></div><pre><code id="${id}" tabindex="0">${escapeHtml(code.join("\n") + (code.length ? "\n" : ""))}</code></pre></div>`);
      continue;
    }
    const heading = line.match(/^(#{1,6}) (.+)$/);
    if (heading) {
      const level = heading[1].length;
      const title = heading[2].replace(/[`*]/g, "");
      const baseId = title.toLowerCase().replace(/[^\p{L}\p{N}]+/gu, "-").replace(/^-|-$/g, "") || "section";
      const id = allocateId(baseId);
      headings.push({ level, title, id });
      blocks.push(`<h${level} id="${id}">${inline(heading[2])}</h${level}>`);
      index += 1;
      continue;
    }
    if (/^\s*---+\s*$/.test(line)) { blocks.push("<hr>"); index += 1; continue; }
    if (line.trim().startsWith("|")) {
      const header = cells(line);
      const separator = cells(lines[index + 1] ?? "");
      if (separator.length !== header.length || !separator.every((cell) => /^:?-{3,}:?$/.test(cell))) throw new Error("Malformed table header in owner guide");
      index += 2;
      const rows = [];
      while (index < lines.length && lines[index].trim().startsWith("|")) {
        const row = cells(lines[index++]);
        if (row.length !== header.length) throw new Error("Malformed table row in owner guide");
        rows.push(`<tr>${row.map((cell) => `<td>${inline(cell)}</td>`).join("")}</tr>`);
      }
      blocks.push(`<div class="table-wrap" tabindex="0" role="region" aria-label="Scrollable reference table"><table><thead><tr>${header.map((cell) => `<th scope="col">${inline(cell)}</th>`).join("")}</tr></thead><tbody>${rows.join("")}</tbody></table></div>`);
      continue;
    }
    const list = line.match(/^\s*([-*+]|\d+\.) (.+)$/);
    if (list) {
      const ordered = /\d/.test(list[1]);
      const tag = ordered ? "ol" : "ul";
      const items = [];
      while (index < lines.length) {
        const item = lines[index].match(/^\s*([-*+]|\d+\.) (.+)$/);
        if (!item || /\d/.test(item[1]) !== ordered) break;
        index += 1;
        const continuation = [item[2]];
        while (index < lines.length && /^\s{2,}\S/.test(lines[index]) && !isBlock(lines[index])) continuation.push(lines[index++].trim());
        items.push(`<li>${inline(continuation.join(" "))}</li>`);
      }
      blocks.push(`<${tag}>${items.join("")}</${tag}>`);
      continue;
    }
    const paragraph = [line];
    index += 1;
    while (index < lines.length && lines[index].trim() && !isBlock(lines[index])) paragraph.push(lines[index++]);
    blocks.push(`<p>${inline(paragraph.join(" "))}</p>`);
  }
  if (!headings.some((heading) => heading.level === 1)) throw new Error("Owner guide requires a level-one title");
  return { body: blocks.join("\n"), headings };
}

const stylesheet = `
:root{--background:#f6f4ed;--foreground:#172227;--surface:rgba(255,255,255,.55);--primary:#28756b;--muted:#ecebe5;--muted-foreground:#526064;--border:#d6d5cd;--ring:#84b8b1;--report-paper:#fff;--report-ink:#111}
*{box-sizing:border-box}html{scroll-padding-top:24px}body{margin:0;background:var(--background);color:var(--foreground);font:400 16px/1.6 Inter,Arial,sans-serif}a{color:var(--primary);text-underline-offset:3px;overflow-wrap:anywhere}a:focus-visible,button:focus-visible,[tabindex]:focus-visible{outline:3px solid var(--ring);outline-offset:4px}.skip{position:absolute;top:-100px;left:16px}.skip:focus{top:16px;background:var(--background);padding:12px;z-index:2}.layout{max-width:1200px;margin:auto;display:grid;grid-template-columns:240px minmax(0,1fr);gap:48px;padding:48px 32px}nav{align-self:start;position:sticky;top:24px;max-height:calc(100vh - 48px);overflow:auto}nav h2{font-size:1rem;margin-top:0}nav ul{padding:0;list-style:none}nav a{display:block;padding:10px 0;min-height:44px;text-decoration:none}main{min-width:0;max-width:80ch}h1,h2,h3,h4,h5,h6{font-weight:600;line-height:1.2;break-after:avoid}h1{font-size:2.5rem;letter-spacing:-.03em;margin:0 0 24px}h2{font-size:1.5rem;margin:48px 0 16px}h3{font-size:1.125rem;margin:32px 0 12px}p,ul,ol{margin:0 0 16px}li{margin-bottom:8px}strong{font-weight:600}hr{border:0;border-top:1px solid var(--border);margin:32px 0}code{font-family:ui-monospace,Consolas,monospace;font-size:.9em;overflow-wrap:anywhere}p code,li code,td code{background:var(--muted);padding:2px 4px;border-radius:4px}.table-wrap{overflow-x:auto;margin:24px 0;max-width:100%}table{width:100%;border-collapse:collapse;font-size:.9rem}th,td{text-align:left;vertical-align:top;padding:12px;border-bottom:1px solid var(--border);overflow-wrap:anywhere}th{font-weight:600;background:var(--muted)}.prompt{border:1px solid var(--border);border-radius:12px;margin:24px 0;background:var(--surface)}.prompt-actions{display:flex;align-items:center;gap:12px;padding:8px 16px;border-bottom:1px solid var(--border)}button{font:600 .875rem Inter,Arial,sans-serif;color:var(--primary);border:1px solid var(--border);border-radius:12px;background:var(--background);padding:8px 16px;min-height:44px;cursor:pointer}button:hover{background:var(--muted)}.prompt-actions span{font-size:.875rem;color:var(--muted-foreground)}pre{margin:0;padding:16px;white-space:pre-wrap;overflow-wrap:anywhere}pre code{white-space:pre-wrap}.stamp{font-size:.8rem;color:var(--muted-foreground);overflow-wrap:anywhere;border-top:1px solid var(--border);margin-top:48px;padding-top:16px}.offline-note{font-size:.875rem;color:var(--muted-foreground)}
@media(max-width:800px){.layout{display:block;padding:24px 16px}nav{position:static;max-height:none;margin-bottom:32px;border-bottom:1px solid var(--border)}nav ul{columns:2;column-gap:24px}nav li{break-inside:avoid}h1{font-size:2rem}th,td{padding:8px}table{min-width:560px}}
@page{size:A4;margin:18mm}
@media print{body{background:var(--report-paper);color:var(--report-ink);font-size:10pt;line-height:1.45}.layout{display:block;max-width:none;padding:0}nav,.skip,.prompt-actions,.offline-note{display:none}main{max-width:none}h1{font-size:24pt}h2{font-size:16pt;margin-top:24pt}h3{font-size:12pt}a{color:inherit;text-decoration:none}.table-wrap{overflow:visible}table{min-width:0;font-size:9pt;table-layout:fixed}thead{display:table-header-group}tr{break-inside:avoid}th,td{padding:6pt}pre{font-size:9pt;white-space:pre-wrap}.prompt{border-radius:0;background:transparent;break-inside:avoid}.stamp{font-size:8pt}p,li{orphans:3;widows:3}}
`;

const script = `
document.querySelectorAll('[data-copy]').forEach((button) => {
  button.addEventListener('click', async () => {
    const code = document.getElementById(button.dataset.copy);
    const status = button.parentElement.querySelector('[aria-live]');
    try {
      if (!navigator.clipboard || !navigator.clipboard.writeText) throw new Error('Clipboard unavailable');
      await navigator.clipboard.writeText(code.textContent);
      status.textContent = 'Copied.';
    } catch {
      const range = document.createRange();
      range.selectNodeContents(code);
      const selection = window.getSelection();
      selection.removeAllRanges();
      selection.addRange(range);
      code.focus();
      status.textContent = 'Selected. Press Ctrl+C (Windows) or Command+C (Mac).';
    }
  });
});
`;

export async function renderOwnerGuide(source) {
  const normalized = source.replace(/\r\n?/g, "\n");
  const { body, headings } = parseMarkdown(normalized);
  const digest = createHash("sha256").update(normalized).digest("hex");
  const fonts = await Promise.all([400, 600].map(async (weight) => {
    const file = path.join(repositoryRoot, "node_modules/@fontsource/inter/files", `inter-latin-${weight}-normal.woff2`);
    return `@font-face{font-family:Inter;font-style:normal;font-weight:${weight};font-display:swap;src:url(data:font/woff2;base64,${(await readFile(file)).toString("base64")}) format('woff2')}`;
  }));
  const nav = headings.filter((heading) => heading.level === 2).map((heading) => `<li><a href="#${heading.id}">${escapeHtml(heading.title)}</a></li>`).join("");
  const title = headings.find((heading) => heading.level === 1).title;
  const scriptDigest = createHash("sha256").update(script).digest("base64");
  return `<!doctype html>
<html lang="en"><head><meta charset="utf-8"><meta http-equiv="Content-Security-Policy" content="default-src 'none'; script-src 'sha256-${scriptDigest}'; style-src 'unsafe-inline'; font-src data:; base-uri 'none'; form-action 'none'"><meta name="viewport" content="width=device-width,initial-scale=1"><meta name="description" content="Norfolk AI Product OS and Starter Kit owner guide"><title>${escapeHtml(title)}</title><style>${fonts.join("\n")}${stylesheet}</style></head>
<body><a class="skip" href="#main-content">Skip to guide</a><div class="layout"><nav aria-label="Guide sections"><h2>In this guide</h2><ul>${nav}</ul><p class="offline-note">Works offline. Repository links need internet. Use your browser's Print → Save as PDF for a reading copy.</p></nav><main id="main-content">${body}
<footer class="stamp">Generated from docs/OWNERS-GUIDE.md by tools/owner-guide/build.mjs (renderer v1). Source SHA-256 (LF-normalized): <code>${digest}</code>. This reading copy is not a separate policy source. Rebuild with <code>pnpm docs:owner</code>; verify with <code>pnpm docs:owner:check</code>. No generation clock is included so unchanged sources produce identical bytes.</footer></main></div><script>${script}</script></body></html>
`;
}

async function assertDistinctFiles(source, output) {
  if (path.resolve(source) === path.resolve(output)) throw new Error("Source and output must be different files");
  const [sourceRealpath, sourceStat] = await Promise.all([realpath(source), stat(source, { bigint: true })]);
  const outputIdentity = await Promise.all([realpath(output), stat(output, { bigint: true })]).catch((error) => {
    if (error.code === "ENOENT") return null;
    throw error;
  });
  if (!outputIdentity) return;
  const [outputRealpath, outputStat] = outputIdentity;
  // realpath catches symbolic/case aliases; device/inode catches hardlinks.
  if (sourceRealpath === outputRealpath || (sourceStat.dev === outputStat.dev && sourceStat.ino === outputStat.ino)) {
    throw new Error("Source and output must be different files");
  }
}

export async function buildOwnerGuide({ source, output, check = false }) {
  await assertDistinctFiles(source, output);
  const generated = await renderOwnerGuide(await readFile(source, "utf8"));
  if (check) {
    const existing = await readFile(output, "utf8").catch((error) => {
      if (error.code === "ENOENT") throw new Error("Owner guide artifact is missing; run pnpm docs:owner");
      throw error;
    });
    if (existing !== generated) throw new Error("Owner guide artifact is stale; run pnpm docs:owner");
  } else {
    await assertDistinctFiles(source, output);
    await writeFile(output, generated, "utf8");
  }
  return createHash("sha256").update(generated).digest("hex");
}

async function runCli() {
  const options = { source: path.join(repositoryRoot, "docs/OWNERS-GUIDE.md"), output: path.join(repositoryRoot, "docs/artifacts/owner-guide.html"), check: false };
  const args = process.argv.slice(2);
  for (let index = 0; index < args.length; index += 1) {
    if (args[index] === "--check") options.check = true;
    else if (["--source", "--output"].includes(args[index]) && args[index + 1] && !args[index + 1].startsWith("--")) options[args[index].slice(2)] = path.resolve(args[++index]);
    else throw new Error(`Unknown or incomplete argument: ${args[index]}`);
  }
  const digest = await buildOwnerGuide(options);
  console.log(`Owner guide ${options.check ? "is current" : "written"}: ${digest}`);
}

if (process.argv[1] && path.resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  try { await runCli(); }
  catch (error) { console.error(error.message); process.exitCode = 1; }
}
