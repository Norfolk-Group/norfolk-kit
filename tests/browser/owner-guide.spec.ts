import { readFile } from "node:fs/promises";
import path from "node:path";
import { pathToFileURL } from "node:url";
import { expect, test } from "@playwright/test";

async function sourcePrompts() {
  const source = await readFile("docs/OWNERS-GUIDE.md", "utf8");
  // The LF before the closing fence is structural. Keep all other whitespace
  // so indentation or missing/extra blank lines cannot pass unnoticed.
  return Array.from(source.replace(/\r\n?/g, "\n").matchAll(/^```text\n([\s\S]*?)\n```(?=\n|$)/gm), (match) => match[1]);
}

test("owner guide works offline with navigation and exact copy fallback", async ({ page, context }) => {
  const networkRequests: string[] = [];
  const errors: string[] = [];
  page.on("request", (request) => {
    if (/^https?:/.test(request.url())) networkRequests.push(request.url());
  });
  page.on("pageerror", (error) => errors.push(error.message));
  await context.setOffline(true);
  await page.addInitScript(() => {
    Object.defineProperty(navigator, "clipboard", { value: undefined, configurable: true });
  });
  await page.goto(pathToFileURL(path.resolve("docs/artifacts/owner-guide.html")).href);
  await page.evaluate(() => document.fonts.ready);
  await expect(page.getByRole("heading", { level: 1 })).toHaveText("Norfolk AI Product OS & Starter Kit");
  const missingTargets = await page.locator('a[href^="#"]').evaluateAll((links) => links
    .map((link) => link.getAttribute("href")?.slice(1) ?? "")
    .filter((id) => !document.getElementById(id)));
  expect(missingTargets).toEqual([]);
  expect(await page.evaluate(() => new Set(Array.from(document.querySelectorAll("[id]"), (node) => node.id)).size))
    .toBe(await page.locator("[id]").count());
  const prompts = await sourcePrompts();
  expect(prompts.length).toBe(6);
  const buttons = page.getByRole("button", { name: "Copy prompt" });
  await expect(buttons).toHaveCount(prompts.length);
  for (let index = 0; index < prompts.length; index += 1) {
    // DOM/Clipboard retain the terminating LF; Chromium's rendered Selection
    // omits that one final newline. Assert both representations explicitly.
    expect(await page.locator(".prompt pre code").nth(index).textContent()).toBe(`${prompts[index]}\n`);
    await buttons.nth(index).click();
    await expect(page.locator(".prompt-actions [aria-live]").nth(index)).toHaveText("Selected. Press Ctrl+C (Windows) or Command+C (Mac).");
    expect(await page.evaluate(() => window.getSelection()?.toString())).toBe(prompts[index]);
  }
  expect(await page.evaluate(() => document.documentElement.scrollWidth <= window.innerWidth)).toBe(true);
  expect(networkRequests).toEqual([]);
  expect(errors).toEqual([]);
});

test("owner guide copies exact prompt text with native clipboard line endings", async ({ page, context }, testInfo) => {
  // A host clipboard is shared across browser projects. Exercise it once rather
  // than introduce races between viewport runs copying different prompts.
  test.skip(testInfo.project.name !== "desktop-chromium", "Clipboard API checked on desktop; fallback is checked at every viewport");
  await context.grantPermissions(["clipboard-read", "clipboard-write"]);
  await context.setOffline(true);
  await page.goto(pathToFileURL(path.resolve("docs/artifacts/owner-guide.html")).href);
  const prompts = await sourcePrompts();
  const buttons = page.getByRole("button", { name: "Copy prompt" });
  await expect(buttons).toHaveCount(prompts.length);
  for (let index = 0; index < prompts.length; index += 1) {
    await buttons.nth(index).click();
    await expect(page.locator(".prompt-actions [aria-live]").nth(index)).toHaveText("Copied.");
    // Windows' native clipboard translates LF to CRLF. Build that exact
    // expectation, without trimming or normalizing the returned clipboard text.
    const expected = `${prompts[index]}\n`.replace(/\n/g, process.platform === "win32" ? "\r\n" : "\n");
    expect(await page.evaluate(() => navigator.clipboard.readText())).toBe(expected);
  }
});
