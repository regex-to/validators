# 📦 validators-go (Go)

> Curated, production-ready, and battle-tested regex patterns for Go, backed by the [regex.to](https://regex.to) pattern registry.

**All patterns are open-source, fully tested, and visualized live on [regex.to](https://regex.to).**

[![npm](https://img.shields.io/npm/v/@regexto/validators?color=orange&label=NPM)](https://www.npmjs.com/package/@regexto/validators)
[![pypi](https://img.shields.io/pypi/v/regexto-validators?color=blue&label=PyPI)](https://pypi.org/project/regexto-validators/)
[![crates.io](https://img.shields.io/crates/v/regexto-validators?color=crimson&label=Crates.io)](https://crates.io/crates/regexto-validators)
[![packagist](https://img.shields.io/packagist/v/regexto/validators?color=purple&label=Packagist)](https://packagist.org/packages/regexto/validators)
[![pkg.go.dev](https://img.shields.io/badge/go-reference-00ADD8?logo=go&logoColor=white)](https://pkg.go.dev/github.com/regex-to/validators-go)
[![Tested & Visualized Live](https://img.shields.io/badge/regex.to-sandbox-blueviolet)](https://regex.to)

---

## Why `validators-go`?

- 🔍 **Tested and Visualized Live:** Every single pattern in this library can be searched, tested, and visualized interactively at [regex.to](https://regex.to).
- 🚀 **Zero Dependencies:** Pure Go validation. Lightweight and lightning-fast. Includes Go `embed` patterns.
- 📁 **JSON Single Source of Truth:** Patterns are declared declaratively in standard JSON files shared across multiple languages.
- 🛠️ **PCRE engine support:** Uses `dlclark/regexp2` under the hood to ensure full lookaround support which is missing in standard RE2 (Go's `regexp` package).

---

## Installation

```bash
go get github.com/regex-to/validators-go
```

---

## Quick Start

### 1. Basic Validation (Go)

```go
package main

import (
	"fmt"
	"github.com/regex-to/validators-go"
)

func main() {
	// 1. Quick boolean test (substring match)
	matched, _ := validators.Test("email", "Please contact us at contact@regex.to")
	fmt.Println(matched) // true

	// 2. Strict full-string validation
	valid, _ := validators.Validate("email", "contact@regex.to")
	fmt.Println(valid) // true
}
```

### 2. Smart Type Auto-Detection

Pass an unknown string, and the validator will identify matching formats:

```go
package main

import (
	"fmt"
	"github.com/regex-to/validators-go"
)

func main() {
	results, _ := validators.Detect("192.168.0.1")
	fmt.Println(results[0].Pattern.Slug) // "ipv4"
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
