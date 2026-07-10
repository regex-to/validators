package validators

import (
	"embed"
	"encoding/json"
	"fmt"
	"path"
	"strings"
	"sync"
	
	"github.com/dlclark/regexp2"
)

//go:embed patterns/*.json
var patternsFS embed.FS

// PatternData represents the structure of the JSON pattern files.
type PatternData struct {
	Slug            string   `json:"slug"`
	Name            string   `json:"name"`
	Description     string   `json:"description"`
	Category        string   `json:"category"`
	Pattern         string   `json:"pattern"`
	Flags           string   `json:"flags"`
	Examples        []string `json:"examples"`
	CounterExamples []string `json:"counterExamples"`
	Locales         []string `json:"locales,omitempty"`
	Tags            []string `json:"tags"`
	UseCases        []string `json:"useCases,omitempty"`
}

var (
	cache      = make(map[string]*regexp2.Regexp)
	dataCache  = make(map[string]PatternData)
	cacheMutex sync.RWMutex
)

// GetPatternData retrieves the parsed JSON data for a specific pattern slug.
func GetPatternData(slug string) (PatternData, error) {
	cacheMutex.RLock()
	if data, exists := dataCache[slug]; exists {
		cacheMutex.RUnlock()
		return data, nil
	}
	cacheMutex.RUnlock()

	filePath := path.Join("patterns", slug+".json")
	fileBytes, err := patternsFS.ReadFile(filePath)
	if err != nil {
		return PatternData{}, fmt.Errorf("pattern '%s' not found: %w", slug, err)
	}

	var data PatternData
	if err := json.Unmarshal(fileBytes, &data); err != nil {
		return PatternData{}, fmt.Errorf("failed to parse pattern '%s': %w", slug, err)
	}

	cacheMutex.Lock()
	dataCache[slug] = data
	cacheMutex.Unlock()

	return data, nil
}

// GetRegex returns the compiled *regexp2.Regexp for a given slug.
func GetRegex(slug string) (*regexp2.Regexp, error) {
	cacheMutex.RLock()
	if re, exists := cache[slug]; exists {
		cacheMutex.RUnlock()
		return re, nil
	}
	cacheMutex.RUnlock()

	data, err := GetPatternData(slug)
	if err != nil {
		return nil, err
	}

	// Go's regexp package is RE2 and does not natively support inline flags like /.../i via a separate argument,
	// but it does support (?i) within the pattern.
	// Since regex.to patterns specify flags in the JSON, we prepend them as inline flags if they are supported by RE2.
	// E.g. flag "i" becomes "(?i)".
	// Note: global flag 'g' is handled by methods like FindAllString vs FindString in Go natively.
	prefix := ""
	for _, char := range data.Flags {
		if char == 'i' || char == 'm' || char == 's' {
			prefix += string(char)
		}
	}

	patternStr := "^(?:" + data.Pattern + ")$"
	if prefix != "" {
		patternStr = "(?" + prefix + ")" + patternStr
	}

	re, err := regexp2.Compile(patternStr, 0)
	if err != nil {
		return nil, fmt.Errorf("failed to compile regex for '%s': %w", slug, err)
	}

	cacheMutex.Lock()
	cache[slug] = re
	cacheMutex.Unlock()

	return re, nil
}

var (
	unanchoredCache      = make(map[string]*regexp2.Regexp)
	unanchoredCacheMutex sync.RWMutex
)

// GetRegexUnanchored returns the compiled unanchored *regexp2.Regexp for a given slug.
func GetRegexUnanchored(slug string) (*regexp2.Regexp, error) {
	unanchoredCacheMutex.RLock()
	if re, exists := unanchoredCache[slug]; exists {
		unanchoredCacheMutex.RUnlock()
		return re, nil
	}
	unanchoredCacheMutex.RUnlock()

	data, err := GetPatternData(slug)
	if err != nil {
		return nil, err
	}

	prefix := ""
	for _, char := range data.Flags {
		if char == 'i' || char == 'm' || char == 's' {
			prefix += string(char)
		}
	}

	patternStr := data.Pattern
	if prefix != "" {
		patternStr = "(?" + prefix + ")" + patternStr
	}

	re, err := regexp2.Compile(patternStr, 0)
	if err != nil {
		return nil, fmt.Errorf("failed to compile unanchored regex for '%s': %w", slug, err)
	}

	unanchoredCacheMutex.Lock()
	unanchoredCache[slug] = re
	unanchoredCacheMutex.Unlock()

	return re, nil
}

// Validate checks if the input string matches the regex for the given slug (full string match).
func Validate(slug string, input string) (bool, error) {
	re, err := GetRegex(slug)
	if err != nil {
		return false, err
	}
	return re.MatchString(input)
}

// Test checks if the input string matches the regex for the given slug (unanchored substring match).
func Test(slug string, input string) (bool, error) {
	re, err := GetRegexUnanchored(slug)
	if err != nil {
		return false, err
	}
	return re.MatchString(input)
}

// GetAllPatterns returns all available patterns.
func GetAllPatterns() ([]PatternData, error) {
	entries, err := patternsFS.ReadDir("patterns")
	if err != nil {
		return nil, err
	}

	var patterns []PatternData
	for _, entry := range entries {
		if entry.IsDir() || len(entry.Name()) < 5 || entry.Name()[len(entry.Name())-5:] != ".json" {
			continue
		}
		slug := entry.Name()[:len(entry.Name())-5]
		data, err := GetPatternData(slug)
		if err != nil {
			continue // Skip invalid
		}
		patterns = append(patterns, data)
	}
	return patterns, nil
}

// DetectResult represents a match found by Detect.
type DetectResult struct {
	Pattern     PatternData
	MatchType   string // "full" or "partial"
	MatchedText string
	Coverage    float64
}

// Detect tests the input against all patterns and returns a sorted list of matches.
func Detect(input string) ([]DetectResult, error) {
	input = strings.TrimSpace(input)
	if input == "" {
		return []DetectResult{}, nil
	}

	patterns, err := GetAllPatterns()
	if err != nil {
		return nil, err
	}

	var results []DetectResult

	for _, p := range patterns {
		// 1. Full match
		fullRe, err := GetRegex(p.Slug)
		if err == nil {
			matched, _ := fullRe.MatchString(input)
			if matched {
				results = append(results, DetectResult{
					Pattern:     p,
					MatchType:   "full",
					MatchedText: input,
					Coverage:    1.0,
				})
				continue
			}
		}

		// 2. Partial match
		partialRe, err := GetRegexUnanchored(p.Slug)
		if err == nil {
			matchObj, _ := partialRe.FindStringMatch(input)
			if matchObj != nil {
				matchText := matchObj.String()
				coverage := float64(len(matchText)) / float64(len(input))
				if len(matchText) >= 4 && coverage >= 0.2 {
					results = append(results, DetectResult{
						Pattern:     p,
						MatchType:   "partial",
						MatchedText: matchText,
						Coverage:    coverage,
					})
				}
			}
		}
	}

	// Sort results
	importSort := true
	if importSort {
		// Bubble sort for simplicity since list is small, or use slice.SortFunc if >= 1.21.
		// Standard sort requires custom types in < 1.21. Let's write a simple sort loop.
		for i := 0; i < len(results); i++ {
			for j := i + 1; j < len(results); j++ {
				swap := false
				a, b := results[i], results[j]
				if a.MatchType != b.MatchType {
					if b.MatchType == "full" {
						swap = true
					}
				} else {
					diff := b.Coverage - a.Coverage
					if diff > 0.05 {
						swap = true
					} else if diff < -0.05 {
						swap = false
					} else {
						if len(b.Pattern.Pattern) > len(a.Pattern.Pattern) {
							swap = true
						}
					}
				}
				if swap {
					results[i], results[j] = results[j], results[i]
				}
			}
		}
	}

	return results, nil
}
