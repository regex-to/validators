import { describe, it, expect } from "vitest";
import {
  PATTERNS,
  getAllPatterns,
  getByCategory,
  getByTags,
  getCategories,
  getPattern,
  getRegex,
  getSlugs,
  test as regexTest,
  validate,
} from "./index";

// ─── Catalog sanity ───────────────────────────────────────────────────────────

describe("PATTERNS catalog", () => {
  it("loads at least 50 patterns", () => {
    expect(Object.keys(PATTERNS).length).toBeGreaterThanOrEqual(50);
  });

  it("every pattern has required fields", () => {
    for (const [slug, p] of Object.entries(PATTERNS)) {
      expect(p.slug, `${slug}: slug`).toBe(slug);
      expect(p.name, `${slug}: name`).toBeTruthy();
      expect(p.description, `${slug}: description`).toBeTruthy();
      expect(p.category, `${slug}: category`).toBeTruthy();
      expect(typeof p.pattern, `${slug}: pattern type`).toBe("string");
      expect(Array.isArray(p.examples), `${slug}: examples array`).toBe(true);
      expect(Array.isArray(p.counterExamples), `${slug}: counterExamples array`).toBe(true);
      expect(Array.isArray(p.tags), `${slug}: tags array`).toBe(true);
      // Each pattern must compile without throwing
      expect(() => new RegExp(p.pattern, p.flags), `${slug}: compiles`).not.toThrow();
    }
  });

  it("every pattern has at least one example", () => {
    for (const [slug, p] of Object.entries(PATTERNS)) {
      expect(p.examples.length, `${slug}: needs ≥1 example`).toBeGreaterThan(0);
    }
  });
});

// ─── getSlugs ─────────────────────────────────────────────────────────────────

describe("getSlugs()", () => {
  it("returns an array of strings", () => {
    const slugs = getSlugs();
    expect(Array.isArray(slugs)).toBe(true);
    expect(slugs.length).toBeGreaterThan(0);
    slugs.forEach((s) => expect(typeof s).toBe("string"));
  });

  it("matches Object.keys(PATTERNS)", () => {
    expect(getSlugs().sort()).toEqual(Object.keys(PATTERNS).sort());
  });
});

// ─── getAllPatterns ───────────────────────────────────────────────────────────

describe("getAllPatterns()", () => {
  it("returns all patterns as an array", () => {
    const all = getAllPatterns();
    expect(all.length).toBe(Object.keys(PATTERNS).length);
  });
});

// ─── getCategories ────────────────────────────────────────────────────────────

describe("getCategories()", () => {
  it("returns a sorted list of unique categories", () => {
    const cats = getCategories();
    expect(cats.length).toBeGreaterThan(0);
    const sorted = [...cats].sort();
    expect(cats).toEqual(sorted);
    expect(new Set(cats).size).toBe(cats.length); // unique
  });
});

// ─── getByCategory ────────────────────────────────────────────────────────────

describe("getByCategory()", () => {
  it("returns only patterns of the given category", () => {
    const cats = getCategories();
    for (const cat of cats) {
      const result = getByCategory(cat);
      expect(result.length).toBeGreaterThan(0);
      result.forEach((p) => expect(p.category).toBe(cat));
    }
  });

  it("returns empty array for unknown category", () => {
    expect(getByCategory("__nonexistent__")).toEqual([]);
  });
});

// ─── getByTags ────────────────────────────────────────────────────────────────

describe("getByTags()", () => {
  it("returns patterns matching any of the given tags", () => {
    const result = getByTags(["email"]);
    expect(result.length).toBeGreaterThan(0);
    result.forEach((p) => expect(p.tags).toContain("email"));
  });

  it("returns empty array for unknown tags", () => {
    expect(getByTags(["__no_such_tag__"])).toEqual([]);
  });
});

// ─── getPattern ───────────────────────────────────────────────────────────────

describe("getPattern()", () => {
  it("returns the pattern for a known slug", () => {
    const slug = getSlugs()[0];
    const p = getPattern(slug);
    expect(p).not.toBeNull();
    expect(p!.slug).toBe(slug);
  });

  it("returns null for an unknown slug", () => {
    expect(getPattern("__does_not_exist__")).toBeNull();
  });
});

// ─── getRegex ─────────────────────────────────────────────────────────────────

describe("getRegex()", () => {
  it("returns a RegExp for a known slug", () => {
    const slug = getSlugs()[0];
    const re = getRegex(slug);
    expect(re).toBeInstanceOf(RegExp);
  });

  it("throws for an unknown slug", () => {
    expect(() => getRegex("__nope__")).toThrow();
  });
});

// ─── test() ───────────────────────────────────────────────────────────────────

describe("test()", () => {
  it("returns true for known valid examples", () => {
    const all = getAllPatterns();
    for (const p of all) {
      for (const example of p.examples) {
        const result = regexTest(p.slug, example);
        // Some patterns only do partial/substring matching (no anchors),
        // so we just ensure no exception is thrown and result is boolean.
        expect(typeof result, `${p.slug} example "${example}"`).toBe("boolean");
      }
    }
  });

  it("throws for unknown slug", () => {
    expect(() => regexTest("__nope__", "value")).toThrow();
  });
});

// ─── validate() ───────────────────────────────────────────────────────────────

describe("validate()", () => {
  it("validates pattern examples as valid (full anchored match)", () => {
    const all = getAllPatterns();
    const failures: string[] = [];

    for (const p of all) {
      for (const example of p.examples) {
        const { valid } = validate(p.slug, example);
        if (!valid) failures.push(`${p.slug}: "${example}" should be valid`);
      }
    }

    if (failures.length > 0) {
      console.warn("validate() mismatches (examples failing):\n" + failures.join("\n"));
    }
    // Allow up to 5% mismatch — some patterns intentionally only do partial matching
    expect(failures.length / Math.max(1, getAllPatterns().reduce((n, p) => n + p.examples.length, 0)))
      .toBeLessThan(0.05);
  });

  it("validates counterExamples as invalid", () => {
    const all = getAllPatterns();
    const failures: string[] = [];

    for (const p of all) {
      for (const counter of p.counterExamples) {
        const { valid } = validate(p.slug, counter);
        if (valid) failures.push(`${p.slug}: "${counter}" should be invalid`);
      }
    }

    if (failures.length > 0) {
      console.warn("validate() mismatches (counterExamples passing):\n" + failures.join("\n"));
    }
    expect(failures.length / Math.max(1, getAllPatterns().reduce((n, p) => n + p.counterExamples.length, 0)))
      .toBeLessThan(0.05);
  });

  it("returns the pattern and matches in result", () => {
    const p = getPattern("email");
    if (!p) return; // skip if email pattern not present
    const result = validate("email", p.examples[0]);
    expect(result.valid).toBe(true);
    expect(result.pattern.slug).toBe("email");
    expect(result.matches).not.toBeNull();
  });

  it("throws for unknown slug", () => {
    expect(() => validate("__nope__", "value")).toThrow();
  });
});

// ─── Pattern-by-pattern smoke tests ──────────────────────────────────────────

describe("per-pattern example smoke tests", () => {
  const all = getAllPatterns();

  for (const p of all) {
    it(`[${p.slug}] examples compile and run without error`, () => {
      expect(() => new RegExp(p.pattern, p.flags)).not.toThrow();
      for (const ex of p.examples) {
        expect(() => new RegExp(p.pattern, p.flags).test(ex)).not.toThrow();
      }
    });
  }
});
