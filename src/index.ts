// ─────────────────────────────────────────────────────────────────────────────
// @regexto/validators — Core pattern definitions and utilities
// Patterns are loaded from the /patterns directory (JSON source of truth).
// ─────────────────────────────────────────────────────────────────────────────

import fs from "fs";
import path from "path";

export type PatternFlavor = "javascript" | "golang" | "php" | "python";

export interface PatternData {
  /** Unique slug used in URLs, e.g. "email", "pl-nip" */
  slug: string;
  /** Human-readable name */
  name: string;
  /** Short description */
  description: string;
  /** Category for catalog grouping */
  category: string;
  /** The raw regex source (no delimiters) */
  pattern: string;
  /** Regex flags, e.g. "gi" */
  flags: string;
  /** Example strings that should match */
  examples: string[];
  /** Example strings that should NOT match */
  counterExamples: string[];
  /** Named capture groups (if any) */
  groups?: Record<string, string>;
  /** ISO 639-1 locale codes this pattern is designed for */
  locales?: string[];
  /** Tags for search */
  tags: string[];
  /** Use-case descriptions */
  useCases?: string[];
  /** SEO page title override */
  seoTitle?: string;
  /** SEO meta description override */
  seoDescription?: string;
}

/** @deprecated Use PatternData instead */
export type RegexPattern = PatternData;

// ─── Load patterns from /patterns directory ───────────────────────────────────

function loadPatterns(): Record<string, PatternData> {
  // tsup --shims injects __dirname for ESM builds
  const dir = path.join(__dirname, "..", "patterns");
  const result: Record<string, PatternData> = {};

  try {
    const files = fs.readdirSync(dir).filter((f: string) => f.endsWith(".json"));
    for (const file of files) {
      const raw = fs.readFileSync(path.join(dir, file), "utf-8");
      const p = JSON.parse(raw) as PatternData;
      result[p.slug] = p;
    }
  } catch {
    // Graceful fallback if /patterns directory is missing (e.g. in test sandboxes)
  }

  return result;
}

/**
 * All available regex patterns, keyed by slug.
 * Loaded at module initialisation from the /patterns JSON files.
 */
export const PATTERNS: Readonly<Record<string, PatternData>> = loadPatterns();

// ─── Core utilities ───────────────────────────────────────────────────────────

/**
 * Returns a compiled RegExp for the given pattern slug.
 * Throws if the slug is not found.
 */
export function getRegex(slug: string): RegExp {
  const p = PATTERNS[slug];
  if (!p) throw new Error(`Pattern "${slug}" not found in @regexto/validators`);
  return new RegExp(p.pattern, p.flags);
}

/**
 * Tests a value against a named pattern.
 */
export function test(slug: string, value: string): boolean {
  return getRegex(slug).test(value);
}

/**
 * Validates a value and returns a typed result.
 */
export function validate(
  slug: string,
  value: string
): { valid: boolean; pattern: PatternData; matches: RegExpMatchArray | null } {
  const p = PATTERNS[slug];
  if (!p) throw new Error(`Pattern "${slug}" not found`);
  const regex = new RegExp(`^(?:${p.pattern})$`, p.flags);
  const matches = value.match(regex);
  return { valid: matches !== null, pattern: p, matches };
}

/**
 * Returns all patterns as an array, optionally filtered.
 */
export function getAllPatterns(): PatternData[] {
  return Object.values(PATTERNS);
}

/**
 * Returns all patterns belonging to a category.
 */
export function getByCategory(category: string): PatternData[] {
  return Object.values(PATTERNS).filter((p) => p.category === category);
}

/**
 * Returns all patterns matching one or more tags.
 */
export function getByTags(tags: string[]): PatternData[] {
  return Object.values(PATTERNS).filter((p) =>
    tags.some((t) => p.tags.includes(t))
  );
}

/**
 * Returns a single pattern by slug, or null if not found.
 */
export function getPattern(slug: string): PatternData | null {
  return PATTERNS[slug] ?? null;
}

/**
 * Returns all available category names (sorted).
 */
export function getCategories(): string[] {
  return [...new Set(Object.values(PATTERNS).map((p) => p.category))].sort();
}

/**
 * Returns all pattern slugs.
 */
export function getSlugs(): string[] {
  return Object.keys(PATTERNS);
}

export default PATTERNS;

export { detect } from "./detect";
export type { DetectResult, MatchType } from "./detect";
