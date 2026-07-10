# 📦 regexto-validators (Python)

> Curated, production-ready, and battle-tested regex patterns for Python, backed by the [regex.to](https://regex.to) pattern registry.

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
- 🚀 **Zero Dependencies:** Pure Python validation. Lightweight and lightning-fast.
- 📁 **JSON Single Source of Truth:** Patterns are declared declaratively in standard JSON files shared across multiple languages.

---

## Installation

```bash
pip install regexto-validators
```

---

## Quick Start

### 1. Basic Validation (Python)

```python
from regexto_validators import validate, test

# 1. Quick boolean test (substring match)
test('email', 'contact me at user@example.com')   # → True
test('email', 'invalid-email')                      # → False

# 2. Strict full-string validation
is_valid = validate('ipv4', '192.168.1.1')          # → True
```

### 2. Smart Type Auto-Detection

Pass an unknown string, and the validator will identify matching formats:

```python
from regexto_validators import detect

matches = detect('0x742d35Cc6634C0532925a3b844Bc454e4438f44e')
# → [{'pattern': {'slug': 'ethereum-address', ...}, 'matchType': 'full', 'coverage': 1.0}]
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
