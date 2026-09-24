import { describe, expect, it } from "vitest";

import { createRateLimiter, getClientIp } from "./rate-limit";

describe("createRateLimiter", () => {
  it("blocks after max requests within the window and resets afterwards", () => {
    const check = createRateLimiter({ windowMs: 1000, max: 2 });
    expect(check("a", 0).allowed).toBe(true);
    expect(check("a", 100).allowed).toBe(true);
    expect(check("a", 200)).toEqual({ allowed: false, retryAfterMs: 800 });
    expect(check("b", 200).allowed).toBe(true);
    expect(check("a", 1000).allowed).toBe(true);
  });

  it("prunes expired keys when the store is full", () => {
    const check = createRateLimiter({ windowMs: 1000, max: 1, maxKeys: 2 });
    check("a", 0);
    check("b", 0);
    expect(check("c", 2000).allowed).toBe(true);
    expect(check("a", 2000).allowed).toBe(true);
  });
});

describe("getClientIp", () => {
  it("uses the first x-forwarded-for entry", () => {
    const headers = new Headers({ "x-forwarded-for": "1.2.3.4, 10.0.0.1" });
    expect(getClientIp(headers)).toBe("1.2.3.4");
  });

  it("falls back to x-real-ip then a constant", () => {
    expect(getClientIp(new Headers({ "x-real-ip": "5.6.7.8" }))).toBe("5.6.7.8");
    expect(getClientIp(new Headers())).toBe("unknown-ip");
  });
});
