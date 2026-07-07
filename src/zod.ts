// ─────────────────────────────────────────────────────────────────────────────
// @regex.to/validators — Zod v4 integration
// ─────────────────────────────────────────────────────────────────────────────

import { z } from "zod";
import { PATTERNS, type RegexPattern } from "./index.js";

// Zod v4 uses z.ZodString, same as v3 for .regex()
type ZodStringSchema = z.ZodString;

/**
 * Returns a Zod string schema with the regex validator applied.
 *
 * @example
 * import { zodSchema } from '@regex.to/validators/zod';
 * const emailSchema = zodSchema('email');
 * emailSchema.parse('user@example.com'); // ✓
 */
export function zodSchema(slug: string, message?: string): ZodStringSchema {
  const p = PATTERNS[slug];
  if (!p) throw new Error(`Pattern "${slug}" not found in @regex.to/validators`);
  const regex = new RegExp(`^(?:${p.pattern})$`, p.flags);
  return z.string().regex(regex, message ?? `Invalid ${p.name}`);
}

/**
 * Returns a full Zod object schema from a map of field → pattern slug.
 *
 * @example
 * const schema = zodObjectSchema({ email: 'email', website: 'url' });
 */
export function zodObjectSchema(
  fieldMap: Record<string, string>,
  messages?: Record<string, string>
): z.ZodObject<Record<string, ZodStringSchema>> {
  const shape: Record<string, ZodStringSchema> = {};
  for (const [field, slug] of Object.entries(fieldMap)) {
    shape[field] = zodSchema(slug, messages?.[field]);
  }
  return z.object(shape) as z.ZodObject<Record<string, ZodStringSchema>>;
}

/**
 * Returns the pattern definition along with its Zod schema.
 */
export function getPatternWithSchema(
  slug: string
): { pattern: RegexPattern; schema: ZodStringSchema } {
  return { pattern: PATTERNS[slug], schema: zodSchema(slug) };
}
