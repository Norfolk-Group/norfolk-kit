import type { Request } from "express";
import { afterEach, describe, expect, it } from "vitest";
import { createHttpContext } from "@/server/context";

describe("reference HTTP identity boundary", () => {
  const originalNodeEnvironment = process.env.NODE_ENV;

  afterEach(() => {
    if (originalNodeEnvironment === undefined) delete process.env.NODE_ENV;
    else process.env.NODE_ENV = originalNodeEnvironment;
  });

  it("refuses synthetic identity headers in production", () => {
    process.env.NODE_ENV = "production";
    const request = {
      header(name: string) {
        return new Map([
          ["x-actor-id", "unverified-caller"],
          ["x-actor-type", "human"],
          ["x-permissions", "reference:read"],
        ]).get(name);
      },
    } as unknown as Request;

    expect(() => createHttpContext(request)).toThrowError(expect.objectContaining({
      code: "VERIFIED_IDENTITY_REQUIRED",
    }));
  });
});
