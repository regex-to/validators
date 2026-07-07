import { describe, it, expect } from "vitest";
import { z } from "zod";
import { zodSchema, zodObjectSchema, getPatternWithSchema } from "./zod";
import { getAllPatterns, getPattern } from "./index";

// ─── zodSchema() ──────────────────────────────────────────────────────────────

describe("zodSchema()", () => {
  it("returns a ZodString schema", () => {
    const schema = zodSchema("email");
    expect(schema).toBeInstanceOf(z.ZodString);
  });

  it("throws for unknown slug", () => {
    expect(() => zodSchema("__unknown__")).toThrow();
  });

  it("parses valid examples without throwing", () => {
    const emailPattern = getPattern("email");
    if (!emailPattern) return;
    const schema = zodSchema("email");
    for (const ex of emailPattern.examples) {
      expect(() => schema.parse(ex)).not.toThrow();
    }
  });

  it("throws ZodError for invalid input", () => {
    const schema = zodSchema("email");
    expect(() => schema.parse("not-an-email")).toThrow(z.ZodError);
  });

  it("accepts a custom error message", () => {
    const schema = zodSchema("email", "Custom error");
    const result = schema.safeParse("bad");
    expect(result.success).toBe(false);
    if (!result.success) {
      const msg = result.error.issues[0]?.message ?? result.error.errors[0]?.message;
      expect(msg).toBe("Custom error");
    }
  });

  it("schema source for all patterns compiles without error", () => {
    const all = getAllPatterns();
    for (const p of all) {
      expect(() => zodSchema(p.slug), `${p.slug} schema`).not.toThrow();
    }
  });
});

// ─── zodObjectSchema() ────────────────────────────────────────────────────────

describe("zodObjectSchema()", () => {
  it("returns a ZodObject schema", () => {
    const schema = zodObjectSchema({ email: "email" });
    expect(schema).toBeInstanceOf(z.ZodObject);
  });

  it("validates a matching object", () => {
    const emailPattern = getPattern("email");
    if (!emailPattern) return;

    const schema = zodObjectSchema({ email: "email" });
    expect(() => schema.parse({ email: emailPattern.examples[0] })).not.toThrow();
  });

  it("rejects an object with an invalid field", () => {
    const schema = zodObjectSchema({ email: "email" });
    expect(() => schema.parse({ email: "not-an-email" })).toThrow(z.ZodError);
  });

  it("handles multiple fields", () => {
    const emailPattern = getPattern("email");
    if (!emailPattern) return;

    // Use email for both fields (simplest multi-field test)
    const schema = zodObjectSchema({ primary: "email", secondary: "email" });
    expect(() =>
      schema.parse({
        primary: emailPattern.examples[0],
        secondary: emailPattern.examples[0],
      })
    ).not.toThrow();
  });

  it("accepts custom messages per field", () => {
    const schema = zodObjectSchema(
      { email: "email" },
      { email: "Bad email address" }
    );
    const result = schema.safeParse({ email: "bad" });
    expect(result.success).toBe(false);
    if (!result.success) {
      const msg = result.error.issues[0]?.message ?? result.error.errors[0]?.message;
      expect(msg).toBe("Bad email address");
    }
  });
});

// ─── getPatternWithSchema() ───────────────────────────────────────────────────

describe("getPatternWithSchema()", () => {
  it("returns pattern and schema", () => {
    const emailPattern = getPattern("email");
    if (!emailPattern) return;

    const result = getPatternWithSchema("email");
    expect(result.pattern.slug).toBe("email");
    expect(result.schema).toBeInstanceOf(z.ZodString);
  });

  it("schema correctly validates the pattern examples", () => {
    const emailPattern = getPattern("email");
    if (!emailPattern) return;

    const { schema, pattern } = getPatternWithSchema("email");
    for (const ex of pattern.examples) {
      expect(() => schema.parse(ex), `example "${ex}"`).not.toThrow();
    }
  });
});

// ─── Type inference ───────────────────────────────────────────────────────────

describe("TypeScript type compatibility", () => {
  it("inferred type of zodObjectSchema is correct", () => {
    const emailPattern = getPattern("email");
    if (!emailPattern) return;

    const schema = zodObjectSchema({ email: "email" });
    type Inferred = z.infer<typeof schema>;

    const value: Inferred = { email: emailPattern.examples[0] };
    expect(typeof value.email).toBe("string");
  });
});
