use fancy_regex::Regex;
use include_dir::{include_dir, Dir};
use lazy_static::lazy_static;
use serde::{Deserialize, Serialize};
use std::collections::HashMap;
use std::sync::RwLock;

static PATTERNS_DIR: Dir = include_dir!("$CARGO_MANIFEST_DIR/../patterns");

#[derive(Debug, Clone, Serialize, Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct PatternData {
    pub slug: String,
    pub name: String,
    pub description: String,
    pub category: String,
    pub pattern: String,
    pub flags: String,
    pub examples: Vec<String>,
    pub counter_examples: Vec<String>,
    pub locales: Option<Vec<String>>,
    pub tags: Vec<String>,
    pub use_cases: Option<Vec<String>>,
}

lazy_static! {
    static ref PATTERNS: RwLock<HashMap<String, PatternData>> = RwLock::new(HashMap::new());
    static ref COMPILED: RwLock<HashMap<String, Regex>> = RwLock::new(HashMap::new());
    static ref COMPILED_UNANCHORED: RwLock<HashMap<String, Regex>> = RwLock::new(HashMap::new());
}

fn load_pattern_data(slug: &str) -> Result<PatternData, String> {
    {
        let cache = PATTERNS.read().unwrap();
        if let Some(data) = cache.get(slug) {
            return Ok(data.clone());
        }
    }

    let file_path = format!("{}.json", slug);
    let file = PATTERNS_DIR
        .get_file(&file_path)
        .ok_or_else(|| format!("Pattern '{}' not found", slug))?;

    let content = file
        .contents_utf8()
        .ok_or_else(|| format!("Invalid UTF-8 in {}", file_path))?;

    let data: PatternData =
        serde_json::from_str(content).map_err(|e| format!("Failed to parse JSON: {}", e))?;

    let mut cache = PATTERNS.write().unwrap();
    cache.insert(slug.to_string(), data.clone());
    Ok(data)
}

fn get_compiled_regex(slug: &str, anchored: bool) -> Result<Regex, String> {
    let cache_lock = if anchored {
        COMPILED.read().unwrap()
    } else {
        COMPILED_UNANCHORED.read().unwrap()
    };

    if let Some(re) = cache_lock.get(slug) {
        return Ok(re.clone());
    }
    drop(cache_lock);

    let data = load_pattern_data(slug)?;

    let mut prefix = String::new();
    for c in data.flags.chars() {
        if c == 'i' || c == 'm' || c == 's' {
            prefix.push(c);
        }
    }

    let mut pattern_str = if anchored {
        format!("^(?:{})$", data.pattern)
    } else {
        data.pattern.clone()
    };

    if !prefix.is_empty() {
        pattern_str = format!("(?{}){}", prefix, pattern_str);
    }

    let re = Regex::new(&pattern_str)
        .map_err(|e| format!("Failed to compile regex for '{}': {}", slug, e))?;

    let mut cache_write = if anchored {
        COMPILED.write().unwrap()
    } else {
        COMPILED_UNANCHORED.write().unwrap()
    };

    cache_write.insert(slug.to_string(), re.clone());
    Ok(re)
}

/// Checks if the input string matches the regex for the given slug (full string match).
pub fn validate(slug: &str, input: &str) -> Result<bool, String> {
    let re = get_compiled_regex(slug, true)?;
    Ok(re.is_match(input).unwrap_or(false))
}

/// Checks if the input string matches the regex for the given slug (unanchored substring match).
pub fn test(slug: &str, input: &str) -> Result<bool, String> {
    let re = get_compiled_regex(slug, false)?;
    Ok(re.is_match(input).unwrap_or(false))
}

/// Returns all available pattern data.
pub fn get_all_patterns() -> Result<Vec<PatternData>, String> {
    let mut patterns = Vec::new();
    for entry in PATTERNS_DIR.files() {
        if let Some(name) = entry.path().file_stem() {
            if let Some(slug) = name.to_str() {
                if let Ok(data) = load_pattern_data(slug) {
                    patterns.push(data);
                }
            }
        }
    }
    Ok(patterns)
}

#[derive(Debug, Clone, Serialize)]
pub struct DetectResult {
    pub pattern: PatternData,
    pub match_type: String,
    pub matched_text: String,
    pub coverage: f64,
}

/// Tests the input against all patterns and returns a sorted list of matches.
pub fn detect(input: &str) -> Result<Vec<DetectResult>, String> {
    let trimmed = input.trim();
    if trimmed.is_empty() {
        return Ok(Vec::new());
    }

    let patterns = get_all_patterns()?;
    let mut results = Vec::new();

    for p in patterns {
        // 1. Full match
        if let Ok(full_re) = get_compiled_regex(&p.slug, true) {
            if full_re.is_match(trimmed).unwrap_or(false) {
                results.push(DetectResult {
                    pattern: p.clone(),
                    match_type: "full".to_string(),
                    matched_text: trimmed.to_string(),
                    coverage: 1.0,
                });
                continue;
            }
        }

        // 2. Partial match
        if let Ok(partial_re) = get_compiled_regex(&p.slug, false) {
            if let Ok(Some(mat)) = partial_re.find(trimmed) {
                let match_text = mat.as_str();
                let coverage = match_text.len() as f64 / trimmed.len() as f64;
                if match_text.len() >= 4 && coverage >= 0.2 {
                    results.push(DetectResult {
                        pattern: p,
                        match_type: "partial".to_string(),
                        matched_text: match_text.to_string(),
                        coverage,
                    });
                }
            }
        }
    }

    // Sort: full first, then coverage desc, then pattern length asc
    results.sort_by(|a, b| {
        let type_a = if a.match_type == "full" { 0 } else { 1 };
        let type_b = if b.match_type == "full" { 0 } else { 1 };

        type_a.cmp(&type_b)
            .then(b.coverage.partial_cmp(&a.coverage).unwrap_or(std::cmp::Ordering::Equal))
            .then(a.pattern.slug.len().cmp(&b.pattern.slug.len()))
    });

    Ok(results)
}

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn test_all_patterns() {
        let patterns = get_all_patterns().expect("Failed to get all patterns");
        assert!(!patterns.is_empty(), "No patterns found");

        for p in patterns {
            for example in p.examples {
                let valid = validate(&p.slug, &example).expect("Validation error");
                if !valid {
                    println!("WARNING: Expected example to be valid, but it failed: '{}'", example);
                }
            }

            for counter in p.counter_examples {
                let valid = validate(&p.slug, &counter).expect("Validation error");
                if valid {
                    println!("WARNING: Expected counter-example to be invalid, but it passed: '{}'", counter);
                }
            }
        }
    }
}
