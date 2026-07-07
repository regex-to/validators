# @regexto/validators

A curated collection of battle-tested regex patterns with TypeScript types, Zod v4 integration, and multi-language code generation.

**Patterns live in `/patterns/*.json`** — the single source of truth used by both this package and the [regex.to](https://regex.to) website.

[![npm version](https://img.shields.io/npm/v/@regexto/validators)](https://www.npmjs.com/package/@regexto/validators)
[![license](https://img.shields.io/npm/l/@regexto/validators)](https://github.com/regex-to/validators/blob/main/LICENSE)

## Installation

```bash
npm install @regexto/validators
# with Zod v4 integration:
npm install @regexto/validators zod
```

## Usage

```typescript
import { test, validate, getRegex, getAllPatterns } from '@regexto/validators';

// Quick boolean test (partial match — use validate() for full-string validation)
test('email', 'user@example.com');   // → true
test('email', 'invalid');            // → false

// Full-string validation with anchors
const { valid } = validate('ipv4', '192.168.1.1');  // → { valid: true, ... }
const { valid: no } = validate('ipv4', '999.0.0.0'); // → { valid: false, ... }

// Get the compiled RegExp
const re = getRegex('email');        // → /[a-zA-Z0-9...]+@.../i

// All patterns as an array
const all = getAllPatterns();        // → PatternData[]
```

### Zod v4 Integration

```typescript
import { zodSchema, zodObjectSchema } from '@regexto/validators/zod';
import { z } from 'zod';

// Single-field schema
const emailSchema = zodSchema('email');
emailSchema.parse('user@example.com');   // ✓
emailSchema.parse('invalid');            // ✗ ZodError

// Object schema from a field map
const contactSchema = zodObjectSchema({
  email: 'email',
  website: 'url',
});
type ContactForm = z.infer<typeof contactSchema>;
```

### detect() — Auto-detect string type

```typescript
import { detect } from '@regexto/validators';

detect('user@example.com');
// → [{ pattern: { slug: 'email', ... }, matchType: 'full', coverage: 1 }]

detect('+14155552671');
// → [{ pattern: { slug: 'phone-e164', ... }, matchType: 'full', coverage: 1 }]

detect('0x742d35Cc6634C0532925a3b844Bc454e4438f44e');
// → [{ pattern: { slug: 'eth-address', ... }, matchType: 'full', coverage: 1 }]
```

## Available Patterns

| Slug | Name | Category |
|------|------|----------|
| `email` | Email Address | Internet |
| `url` | URL (HTTP/HTTPS) | Internet |
| `ipv4` | IPv4 Address | Network |
| `ipv6` | IPv6 Address | Network |
| `hex-color` | Hex Color | Design |
| `rgb-color` | RGB Color | Design |
| `iso-date` | ISO 8601 Date | Date & Time |
| `semver` | Semantic Version | Dev |
| `slug` | URL Slug | Web |
| `uuid` | UUID | Dev |
| `credit-card` | Credit Card Number | Finance |
| `iban` | IBAN | Finance |
| `jwt` | JSON Web Token | Security |
| `sha256` | SHA-256 Hash | Crypto |
| `ethereum-address` | Ethereum Address | Crypto |
| `bitcoin-address` | Bitcoin Address | Crypto |
| `pl-nip` | Polish NIP (Tax ID) | Finance |
| `pl-pesel` | Polish PESEL | Identity |
| `pl-regon` | Polish REGON | Finance |
| `us-ssn` | US Social Security Number | Identity |
| `us-zip` | US ZIP Code | Address |
| `uk-postcode` | UK Postcode | Address |
| … | 79 patterns total | [Browse all](https://regex.to/patterns) |

## API

| Function | Description |
|----------|-------------|
| `test(slug, value)` | Quick boolean — partial match (substring) |
| `validate(slug, value)` | Full-string match with anchors, returns result object |
| `getRegex(slug)` | Returns the compiled `RegExp` |
| `detect(input)` | Auto-detect type of an unknown string |
| `getAllPatterns()` | Returns all patterns as `PatternData[]` |
| `getPattern(slug)` | Returns a single `PatternData` or `null` |
| `getByCategory(category)` | Filter by category |
| `getByTags(tags[])` | Filter by tags |
| `getSlugs()` | All available slugs |
| `getCategories()` | All available category names |
| `zodSchema(slug)` | Zod string schema *(zod import)* |
| `zodObjectSchema(fieldMap)` | Zod object schema *(zod import)* |

## Adding a Pattern

Create a JSON file in `patterns/` and open a Pull Request:

```json
{
  "slug": "my-pattern",
  "name": "My Pattern",
  "description": "What it validates",
  "category": "Internet",
  "pattern": "your[regex]+",
  "flags": "i",
  "examples": ["valid"],
  "counterExamples": ["invalid"],
  "tags": ["tag1"],
  "useCases": ["Use case description"]
}
```

The JSON file is automatically picked up by both the npm package and the regex.to website at build time — no code changes needed.

See the full [contribution guide](https://regex.to/docs#contributing).

## License

MIT © [regex.to](https://regex.to)
