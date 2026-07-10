package validators

import (
	"fmt"
	"strings"
	"testing"
)

func TestAllPatterns(t *testing.T) {
	entries, err := patternsFS.ReadDir("patterns")
	if err != nil {
		t.Fatalf("failed to read patterns directory: %v", err)
	}

	if len(entries) == 0 {
		t.Fatalf("patterns directory is empty")
	}

	for _, entry := range entries {
		if entry.IsDir() || !strings.HasSuffix(entry.Name(), ".json") {
			continue
		}

		slug := strings.TrimSuffix(entry.Name(), ".json")

		t.Run(slug, func(t *testing.T) {
			data, err := GetPatternData(slug)
			if err != nil {
				t.Fatalf("failed to get pattern data: %v", err)
			}

			// Validate examples (should be true)
			for i, example := range data.Examples {
				t.Run(fmt.Sprintf("valid_%d", i), func(t *testing.T) {
					valid, err := Validate(slug, example)
					if err != nil {
						t.Fatalf("validation error: %v", err)
					}
					if !valid {
						t.Errorf("Expected example to be valid, but it failed: '%s'", example)
					}
				})
			}

			// Validate counterExamples (should be false)
			for i, counter := range data.CounterExamples {
				t.Run(fmt.Sprintf("invalid_%d", i), func(t *testing.T) {
					valid, err := Validate(slug, counter)
					if err != nil {
						t.Fatalf("validation error: %v", err)
					}
					if valid {
						t.Errorf("Expected counter-example to be invalid, but it passed: '%s'", counter)
					}
				})
			}
		})
	}
}
