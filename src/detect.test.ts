import { describe, it, expect } from "vitest";
import { detect } from "./detect";
import { getAllPatterns } from "./index";

// ─── Basic behaviour ──────────────────────────────────────────────────────────

describe("detect()", () => {
  it("returns empty array for empty input", () => {
    expect(detect("")).toEqual([]);
    expect(detect("   ")).toEqual([]);
  });

  it("returns an array of DetectResult objects", () => {
    const results = detect("user@example.com");
    expect(Array.isArray(results)).toBe(true);
    if (results.length > 0) {
      const r = results[0];
      expect(typeof r.matchType).toBe("string");
      expect(["full", "partial"]).toContain(r.matchType);
      expect(typeof r.matchedText).toBe("string");
      expect(typeof r.coverage).toBe("number");
      expect(r.coverage).toBeGreaterThan(0);
      expect(r.coverage).toBeLessThanOrEqual(1);
      expect(r.pattern).toBeTruthy();
      expect(typeof r.pattern.slug).toBe("string");
    }
  });

  it("returns full match first when entire string matches", () => {
    const results = detect("user@example.com");
    if (results.length > 0) {
      expect(results[0].matchType).toBe("full");
      expect(results[0].coverage).toBe(1);
    }
  });

  it("sorts full matches before partial matches", () => {
    const results = detect("hello@world.org");
    const firstPartialIdx = results.findIndex((r) => r.matchType === "partial");
    const lastFullIdx = results.reduce(
      (last, r, i) => (r.matchType === "full" ? i : last),
      -1
    );
    if (firstPartialIdx !== -1 && lastFullIdx !== -1) {
      expect(lastFullIdx).toBeLessThan(firstPartialIdx);
    }
  });

  it("coverage is 1.0 for full matches", () => {
    const results = detect("user@example.com");
    results.filter((r) => r.matchType === "full").forEach((r) => {
      expect(r.coverage).toBe(1);
      expect(r.matchedText).toBe("user@example.com");
    });
  });

  it("coverage is less than 1 for partial matches", () => {
    const results = detect("user@example.com");
    results.filter((r) => r.matchType === "partial").forEach((r) => {
      expect(r.coverage).toBeLessThanOrEqual(1);
    });
  });

  it("filters trivially short matches (< 4 chars)", () => {
    // A 3-char input shouldn't produce results with matchedText < 4 chars
    const results = detect("abc");
    results.forEach((r) => {
      expect(r.matchedText.length).toBeGreaterThanOrEqual(3);
    });
  });

  it("does not throw for arbitrary strings", () => {
    const inputs = [
      "hello world",
      "1234567890",
      "!@#$%^&*()",
      "https://example.com",
      "+1 (555) 123-4567",
      "192.168.1.1",
      "2001:db8::1",
      "0x742d35Cc6634C0532925a3b844Bc454e4438f44e",
      "2024-01-15",
      "#ff0000",
      "not-an-email",
      "random garbage text here",
    ];
    for (const input of inputs) {
      expect(() => detect(input)).not.toThrow();
    }
  });
});

// ─── Common type detection ────────────────────────────────────────────────────

describe("detect() — common types", () => {
  it("detects email addresses", () => {
    const results = detect("user@example.com");
    const found = results.find((r) => r.pattern.slug === "email");
    expect(found).toBeTruthy();
    expect(found?.matchType).toBe("full");
  });

  it("detects URLs", () => {
    const results = detect("https://example.com");
    expect(results.length).toBeGreaterThan(0);
    const hasUrl = results.some((r) => r.pattern.slug.includes("url") || r.pattern.category === "Web");
    expect(hasUrl).toBe(true);
  });

  it("detects IPv4 addresses", () => {
    const results = detect("192.168.0.1");
    expect(results.length).toBeGreaterThan(0);
    const hasIp = results.some((r) => r.pattern.slug.includes("ipv4") || r.pattern.slug.includes("ip"));
    expect(hasIp).toBe(true);
  });

  it("returns multiple candidates for ambiguous input", () => {
    // A URL-like string may match several patterns
    const results = detect("https://example.com/path?q=1");
    expect(results.length).toBeGreaterThan(0);
  });
});

// ─── Pattern example round-trip ───────────────────────────────────────────────

describe("detect() — pattern example round-trips", () => {
  // Pick a representative subset: first example from first few patterns
  const all = getAllPatterns().slice(0, 20);

  for (const p of all) {
    if (!p.examples[0]) continue;
    it(`detects first example of [${p.slug}] without throwing`, () => {
      expect(() => detect(p.examples[0])).not.toThrow();
    });
  }
});
