import { expect, test } from "@playwright/test";

test.beforeEach(async ({ page }) => {
  await page.emulateMedia({ reducedMotion: "reduce" });
  await page.route(/^https?:\/\/(?!127\.0\.0\.1|localhost)/u, (route) => route.abort("blockedbyclient"));
});

test("renders the reference capability and explicit review outcomes", async ({ page }) => {
  const externalRequests: string[] = [];
  page.on("request", (request) => {
    const url = new URL(request.url());
    if (!new Set(["127.0.0.1", "localhost"]).has(url.hostname)) externalRequests.push(request.url());
  });

  await page.goto("/");

  await expect(page.getByRole("heading", { name: "Norfolk Kit Reference" })).toBeVisible();
  await expect(page.getByText("Product OS is ready")).toBeVisible();
  for (const outcome of ["Approve", "Reject", "Defer"]) {
    await page.getByRole("button", { name: outcome }).click();
    await expect(page.getByTestId("review-outcome")).toHaveText(outcome.toLowerCase());
  }
  expect(externalRequests).toEqual([]);
});
