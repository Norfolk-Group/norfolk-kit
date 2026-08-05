import { readFile } from "node:fs/promises";
import { resolve } from "node:path";
import { describe, expect, it } from "vitest";

describe("authentication journey artifact", () => {
  it("is self-contained and includes required recovery and parity concepts", async () => {
    const html = await readFile(resolve(import.meta.dirname, "../../docs/artifacts/authentication.html"), "utf8");
    expect(html).not.toMatch(/<script[^>]+src=/);
    for (const phrase of ["First-party authentication journey", "invitation valid/expired/revoked/used", "Session expiry", "screen-reader", "reduced-motion", "Identical authorization"]) expect(html).toContain(phrase);
  });
});
