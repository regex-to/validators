# Regexto Validators for Rust

A collection of battle-tested, zero-dependency regular expressions from [regex.to](https://regex.to), packaged for Rust using the `fancy-regex` crate (which supports lookarounds, unlike the standard `regex` crate).

## Installation

Add the dependency to your `Cargo.toml`:

```toml
[dependencies]
regexto-validators = { git = "https://github.com/regex-to/validators-rust" }
```

## Usage

```rust
use regexto_validators::{validate, test, detect};

fn main() {
    // validate checks for a full string match
    let is_valid = validate("email", "test@example.com").unwrap();
    println!("Is valid email? {}", is_valid); // true

    // test checks for a partial substring match
    let contains_email = test("email", "contact me at test@example.com").unwrap();
    println!("Contains email? {}", contains_email); // true

    // detect finds all matching patterns in a string
    let results = detect("My email is hello@world.com and phone is +1234567890").unwrap();
    for res in results {
        println!("Detected: {} ({}) - {}", res.pattern.name, res.match_type, res.matched_text);
    }
}
```

## Documentation

For a full list of supported patterns, visit [regex.to](https://regex.to).

## License

MIT
