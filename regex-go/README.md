# validators-go

[![Go Reference](https://pkg.go.dev/badge/github.com/regex-to/validators-go.svg)](https://pkg.go.dev/github.com/regex-to/validators-go)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)

A zero-dependency collection of battle-tested, ready-to-use validation functions for Go, backed by the [regex.to](https://regex.to) pattern registry.

## Installation

```bash
go get github.com/regex-to/validators-go
```

## Basic Usage

```go
package main

import (
	"fmt"
	"github.com/regex-to/validators-go"
)

func main() {
	// 1. Strict Validation (Full Match)
	valid, err := validators.Validate("email", "contact@regex.to")
	fmt.Println(valid) // true

	// 2. Loose Testing (Substring Match)
	matched, err := validators.Test("email", "Please contact us at contact@regex.to")
	fmt.Println(matched) // true

	// 3. Auto-Detection
	results, err := validators.Detect("192.168.0.1")
	fmt.Println(results[0].Pattern.Slug) // "ipv4"
}
```

## Documentation

For a full list of supported patterns (slugs) and detailed documentation, please visit the [official regex.to documentation](https://regex.to/docs).

## License

MIT
