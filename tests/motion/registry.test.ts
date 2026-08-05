import { describe, expect, it, vi } from "vitest";
import { ANIMATION_REGISTRY, DEFAULT_ANIMATION_ID, resolveAnimation } from "../../src/lib/animation-registry";

describe("portable animation registry", () => {
  it("maps every portable animation id to a real component", () => {
    expect(ANIMATION_REGISTRY.size).toBeGreaterThanOrEqual(10);
    for (const [id, component] of ANIMATION_REGISTRY) {
      expect(id).toMatch(/^[a-z0-9-]+$/);
      expect(typeof component).toBe("function");
    }
  });

  it("uses a named portable default and is prototype-pollution safe", () => {
    vi.spyOn(console, "warn").mockImplementation(() => undefined);
    expect(ANIMATION_REGISTRY.has(DEFAULT_ANIMATION_ID)).toBe(true);
    expect(resolveAnimation("constructor")).toBe(ANIMATION_REGISTRY.get(DEFAULT_ANIMATION_ID));
  });
});
