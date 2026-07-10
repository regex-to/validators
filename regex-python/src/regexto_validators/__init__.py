import json
import os
import re
from typing import Dict, Any

_cache = {}
_data_cache = {}

# Patterns are bundled alongside this module in a `patterns` subdirectory during build
_PATTERNS_DIR = os.path.join(os.path.dirname(__file__), "patterns")

def get_pattern_data(slug: str) -> Dict[str, Any]:
    """Retrieve the parsed JSON data for a specific pattern slug."""
    if slug in _data_cache:
        return _data_cache[slug]

    filepath = os.path.join(_PATTERNS_DIR, f"{slug}.json")
    if not os.path.exists(filepath):
        raise FileNotFoundError(f"Pattern '{slug}' not found.")

    with open(filepath, "r", encoding="utf-8") as f:
        data = json.load(f)

    _data_cache[slug] = data
    return data

def get_regex(slug: str) -> re.Pattern:
    """Retrieve the compiled regex for a given slug."""
    if slug in _cache:
        return _cache[slug]

    data = get_pattern_data(slug)
    
    # Python re module supports inline flags like (?i)
    flags_prefix = ""
    for char in data.get("flags", ""):
        if char in "ims":
            flags_prefix += char
    
    pattern_str = data["pattern"]
    # Wrap in ^(?: ... )$ for exact full-string match
    pattern_str = f"^(?:{pattern_str})$"
    if flags_prefix:
        pattern_str = f"(?{flags_prefix})" + pattern_str

    compiled_re = re.compile(pattern_str)
    _cache[slug] = compiled_re
    return compiled_re

def get_regex_unanchored(slug: str) -> re.Pattern:
    """Retrieve the compiled unanchored regex for a given slug."""
    data = get_pattern_data(slug)
    flags_prefix = ""
    for char in data.get("flags", ""):
        if char in "ims":
            flags_prefix += char
    
    pattern_str = data["pattern"]
    if flags_prefix:
        pattern_str = f"(?{flags_prefix})" + pattern_str

    return re.compile(pattern_str)

def validate(slug: str, input_str: str) -> bool:
    """Check if the input string matches the regex for the given slug (full string match)."""
    compiled_re = get_regex(slug)
    return bool(compiled_re.match(input_str))

def test(slug: str, input_str: str) -> bool:
    """Check if the input string matches the regex for the given slug (unanchored substring match)."""
    compiled_re = get_regex_unanchored(slug)
    return bool(compiled_re.search(input_str))

def get_all_patterns() -> list:
    """Return all available patterns."""
    patterns = []
    for filename in os.listdir(_PATTERNS_DIR):
        if filename.endswith(".json"):
            slug = filename[:-5]
            patterns.append(get_pattern_data(slug))
    return patterns

def detect(input_str: str) -> list:
    """Detect the type(s) of an unknown string. Returns a sorted list of matches."""
    if not input_str or not input_str.strip():
        return []
    
    results = []
    for p in get_all_patterns():
        slug = p["slug"]
        
        # 1. Full match
        try:
            full_re = get_regex(slug)
            if full_re.match(input_str):
                results.append({
                    "pattern": p,
                    "matchType": "full",
                    "matchedText": input_str,
                    "coverage": 1.0
                })
                continue
        except Exception:
            pass
        
        # 2. Partial match
        try:
            partial_re = get_regex_unanchored(slug)
            m = partial_re.search(input_str)
            if m:
                matched_text = m.group(0)
                coverage = len(matched_text) / len(input_str)
                if len(matched_text) >= 4 and coverage >= 0.2:
                    results.append({
                        "pattern": p,
                        "matchType": "partial",
                        "matchedText": matched_text,
                        "coverage": coverage
                    })
        except Exception:
            pass

    # Sort: full matches first, then by coverage desc, then by pattern length desc
    def sort_key(res):
        tier = 0 if res["matchType"] == "full" else 1
        return (tier, -res["coverage"], -len(res["pattern"]["pattern"]))
        
    results.sort(key=sort_key)
    return results
