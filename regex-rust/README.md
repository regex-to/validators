# 📦 regexto-validators (Rust)

> Curated, production-ready, and battle-tested regex patterns for Rust, backed by the [regex.to](https://regex.to) pattern registry.

**All patterns are open-source, fully tested, and visualized live on [regex.to](https://regex.to).**

[![npm](https://img.shields.io/npm/v/@regexto/validators?color=orange&label=NPM)](https://www.npmjs.com/package/@regexto/validators)
[![pypi](https://img.shields.io/pypi/v/regexto-validators?color=blue&label=PyPI)](https://pypi.org/project/regexto-validators/)
[![crates.io](https://img.shields.io/crates/v/regexto-validators?color=crimson&label=Crates.io)](https://crates.io/crates/regexto-validators)
[![packagist](https://img.shields.io/packagist/v/regexto/validators?color=purple&label=Packagist)](https://packagist.org/packages/regexto/validators)
[![pkg.go.dev](https://img.shields.io/badge/go-reference-00ADD8?logo=go&logoColor=white)](https://pkg.go.dev/github.com/regex-to/validators-go)
[![Tested & Visualized Live](https://img.shields.io/badge/regex.to-sandbox-blueviolet)](https://regex.to)

---

## Why `regexto-validators`?

- 🔍 **Tested and Visualized Live:** Every single pattern in this library can be searched, tested, and visualized interactively at [regex.to](https://regex.to).
- 🚀 **Zero Dependencies:** Pure Rust validation. Lightweight and lightning-fast. Includes compiled-in patterns via `include_dir!`.
- 📁 **JSON Single Source of Truth:** Patterns are declared declaratively in standard JSON files shared across multiple languages.
- 🛠️ **Lookaround support:** Uses `fancy-regex` under the hood to ensure full lookaround support which is missing in standard `regex` crate (based on RE2).

---

## Installation

Add the dependency to your `Cargo.toml`:

```toml
[dependencies]
regexto-validators = { git = "https://github.com/regex-to/regex-rust" }
```

---

## Quick Start

### 1. Basic Validation (Rust)

```rust
use regexto_validators::{validate, test};

fn main() {
    // 1. Quick boolean test (substring match)
    let contains_email = test("email", "contact me at test@example.com").unwrap();
    println!("Contains email? {}", contains_email); // true

    // 2. Strict full-string validation
    let is_valid = validate("email", "test@example.com").unwrap();
    println!("Is valid email? {}", is_valid); // true
}
```

### 2. Smart Type Auto-Detection

Pass an unknown string, and the validator will identify matching formats:

```rust
use regexto_validators::detect;

fn main() {
    let results = detect("My email is hello@world.com and phone is +1234567890").unwrap();
    for res in results {
        println!("Detected: {} ({}) - {}", res.pattern.name, res.match_type, res.matched_text);
    }
}
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

---

## License

MIT
