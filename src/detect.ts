// ─────────────────────────────────────────────────────────────────────────────
// detect() — Auto-detect what type of data a string is
//
// Runs every available pattern against the input and returns matches
// sorted by confidence (full-string match > partial match > coverage).
// ─────────────────────────────────────────────────────────────────────────────

import { PATTERNS, type PatternData } from "./index";

export type MatchType = "full" | "partial";

export interface DetectResult {
  /** The matching pattern */
  pattern: PatternData;
  /** "full" = entire string matches; "partial" = substring matches */
  matchType: MatchType;
  /** The substring that was matched (equals input for full matches) */
  matchedText: string;
  /** Ratio of matchedText.length / input.length (1.0 for full matches) */
  coverage: number;
}

/**
 * Detects the type(s) of an unknown string by testing it against all
 * available patterns. Returns results sorted by confidence — full matches
 * first, then by coverage ratio.
 *
 * @example
 * detect("user@example.com")
 * // → [{ pattern: { slug: "email", ... }, matchType: "full", coverage: 1 }]
 *
 * @example
 * detect("+14155552671")
 * // → [{ slug: "phone-e164", matchType: "full" }, { slug: "phone-us", matchType: "partial" }, ...]
 */
export function detect(input: string): DetectResult[] {
  if (!input || !input.trim()) return [];

  const all = Object.values(PATTERNS);
  const results: DetectResult[] = [];

  for (const p of all) {
    try {
      // Strip g (auto-added) and m (we want full-string anchors) for detection.
      const baseFlags = p.flags.replace(/[gm]/g, "");

      // ── Full-string match ──────────────────────────────────────────────────
      try {
        const fullRe = new RegExp(`^(?:${p.pattern})$`, baseFlags);
        if (fullRe.test(input)) {
          results.push({ pattern: p, matchType: "full", matchedText: input, coverage: 1 });
          continue;
        }
      } catch { /* pattern can't be anchored, fall through to partial */ }

      // ── Partial match ──────────────────────────────────────────────────────
      try {
        const partialRe = new RegExp(p.pattern, baseFlags);
        const m = partialRe.exec(input);
        // Ignore trivially short matches (< 4 chars or < 20% of input)
        if (m?.[0] && m[0].length >= 4 && m[0].length / input.length >= 0.2) {
          results.push({
            pattern: p,
            matchType: "partial",
            matchedText: m[0],
            coverage: m[0].length / input.length,
          });
        }
      } catch { /* skip */ }
    } catch { /* skip */ }
  }

  // Sort: full matches first, then by coverage desc
  return results.sort((a, b) => {
    if (a.matchType !== b.matchType) return a.matchType === "full" ? -1 : 1;
    if (Math.abs(b.coverage - a.coverage) > 0.05) return b.coverage - a.coverage;
    // Within same tier, prefer longer/more specific patterns
    return b.pattern.pattern.length - a.pattern.pattern.length;
  });
}
