# regexto-validators

[![PyPI version](https://badge.fury.io/py/regexto-validators.svg)](https://badge.fury.io/py/regexto-validators)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)

A zero-dependency collection of battle-tested, ready-to-use validation functions for Python, backed by the [regex.to](https://regex.to) pattern registry.

## Installation

```bash
pip install regexto-validators
```

## Basic Usage

```python
from regexto_validators import validate, test, detect

# 1. Strict Validation (Full Match)
print(validate("email", "contact@regex.to")) # True

# 2. Loose Testing (Substring Match)
print(test("email", "Please contact us at contact@regex.to")) # True

# 3. Auto-Detection
results = detect("192.168.0.1")
print(results[0]["pattern"]["slug"]) # "ipv4"
```

## Documentation

For a full list of supported patterns (slugs) and detailed documentation, please visit the [official regex.to documentation](https://regex.to/docs).

## License

MIT
