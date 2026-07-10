# regexto/validators

[![Latest Stable Version](https://poser.pugx.org/regexto/validators/v/stable)](https://packagist.org/packages/regexto/validators)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)

A zero-dependency collection of battle-tested, ready-to-use validation functions for PHP, backed by the [regex.to](https://regex.to) pattern registry.

## Installation

```bash
composer require regexto/validators
```

## Basic Usage

```php
<?php

require 'vendor/autoload.php';

use RegexTo\Validators\Validator;

// 1. Strict Validation (Full Match)
$isValid = Validator::validate('email', 'contact@regex.to'); // true

// 2. Loose Testing (Substring Match)
$isMatched = Validator::test('email', 'Please contact us at contact@regex.to'); // true

// 3. Auto-Detection
$results = Validator::detect('192.168.0.1');
echo $results[0]['pattern']['slug']; // "ipv4"
```

## Documentation

For a full list of supported patterns (slugs) and detailed documentation, please visit the [official regex.to documentation](https://regex.to/docs).

## License

MIT
