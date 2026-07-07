# 📦 @regexto/validators

> Curated, production-ready, and battle-tested regex patterns with native TypeScript support, Zod integration, and multi-language compilation.

**All patterns are open-source, fully tested, and visualized live on [regex.to](https://regex.to).**

[![npm version](https://img.shields.io/npm/v/@regexto/validators?color=brightgreen)](https://www.npmjs.com/package/@regexto/validators)
[![license](https://img.shields.io/npm/l/@regexto/validators)](https://github.com/regex-to/validators/blob/main/LICENSE)
[![Tested & Visualized Live](https://img.shields.io/badge/Tested%20%26%20Visualized-Live%20on%20regex.to-blueviolet)](https://regex.to)

---

## Why `@regexto/validators`?

- 🔍 **Tested and Visualized Live:** Every single pattern in this library can be searched, tested, and visualized interactively at [regex.to](https://regex.to).
- 🚀 **Zero Dependencies:** Pure JavaScript/TypeScript validator package. Lightweight and lightning-fast.
- 🛠️ **Zod v4 Ready:** Built-in integration for type-safe form schema validation out of the box.
- 📁 **JSON Single Source of Truth:** Patterns are declared declaratively in standard JSON files.

---

## Installation

```bash
npm install @regexto/validators

# Optional: if you use Zod validation
npm install zod
```

---

## Quick Start

### 1. Basic Validation (JavaScript / TypeScript)

```typescript
import { test, validate, getRegex } from '@regexto/validators';

// 1. Quick boolean test
test('email', 'user@example.com');   // → true
test('email', 'invalid-email');      // → false

// 2. Full validation with capture group outputs
const result = validate('ipv4', '192.168.1.1');
console.log(result.valid); // → true

// 3. Extract the raw RegExp instance
const emailRegex = getRegex('email'); // → RegExp instance
```

### 2. Type-Safe Zod Schema Integration

```typescript
import { z } from 'zod';
import { zodSchema, zodObjectSchema } from '@regexto/validators/zod';

// Create a single-field validator schema
const emailValidator = zodSchema('email');
emailValidator.parse('contact@regex.to'); // ✓ Valid

// Easily construct object validation shapes
const registrationSchema = zodObjectSchema({
  email: 'email',
  website: 'url',
  zipCode: 'us-zip',
});

type RegistrationData = z.infer<typeof registrationSchema>;
```

### 3. Smart Type Auto-Detection

Pass an unknown string, and the validator will identify matching formats:

```typescript
import { detect } from '@regexto/validators';

const matches = detect('0x742d35Cc6634C0532925a3b844Bc454e4438f44e');
// → [{ pattern: { slug: 'ethereum-address', ... }, matchType: 'full', coverage: 1 }]
```

---

## Available Patterns

Here is a curated subset of the 79+ patterns supported. View all of them and test them live at [regex.to/patterns](https://regex.to/patterns):

| Slug | Name | Category | Live Sandbox |
|------|------|----------|--------------|
| `email` | Email Address | Internet | [Test Live ↗](https://regex.to/email) |
| `url` | URL (HTTP/HTTPS) | Internet | [Test Live ↗](https://regex.to/url) |
| `ipv4` | IPv4 Address | Network | [Test Live ↗](https://regex.to/ipv4) |
| `ipv6` | IPv6 Address | Network | [Test Live ↗](https://regex.to/ipv6) |
| `hex-color` | Hex Color | Design | [Test Live ↗](https://regex.to/hex-color) |
| `semver` | Semantic Version | Dev | [Test Live ↗](https://regex.to/semver) |
| `uuid` | UUID | Dev | [Test Live ↗](https://regex.to/uuid) |
| `credit-card` | Credit Card Number | Finance | [Test Live ↗](https://regex.to/credit-card) |
| `iban` | IBAN | Finance | [Test Live ↗](https://regex.to/iban) |
| `pl-nip` | Polish NIP (Tax ID) | Finance | [Test Live ↗](https://regex.to/pl-nip) |
| `pl-pesel` | Polish PESEL | Identity | [Test Live ↗](https://regex.to/pl-pesel) |
| `us-zip` | US ZIP Code | Address | [Test Live ↗](https://regex.to/us-zip) |
| `uk-postcode` | UK Postcode | Address | [Test Live ↗](https://regex.to/uk-postcode) |

---

## Contributing

Adding new patterns is fully automated. Simply create a JSON file inside the `patterns/` directory of the repository and open a Pull Request:

```json
{
  "slug": "my-custom-pattern",
  "name": "My Custom Pattern",
  "description": "Validates custom formats",
  "category": "Web",
  "pattern": "your[regex]+",
  "flags": "i",
  "examples": ["validexample"],
  "counterExamples": ["invalidexample"],
  "tags": ["custom"]
}
```

The newly added pattern will be parsed automatically at build-time by both the NPM package and the [regex.to](https://regex.to) dynamic website.

---

## License

Released under the [MIT License](https://github.com/regex-to/validators/blob/main/LICENSE). Developed and maintained by the [regex.to](https://regex.to) team.
