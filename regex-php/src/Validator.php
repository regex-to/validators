<?php

namespace RegexTo\Validators;

use RuntimeException;

class Validator
{
    private static array $cache = [];
    private static string $patternsDir = __DIR__ . '/../patterns';

    /**
     * Set a custom path to the patterns directory if needed.
     */
    public static function setPatternsDirectory(string $path): void
    {
        self::$patternsDir = rtrim($path, '/\\');
    }

    /**
     * Get pattern data by slug.
     */
    public static function getPatternData(string $slug): array
    {
        if (isset(self::$cache[$slug])) {
            return self::$cache[$slug];
        }

        $filePath = self::$patternsDir . '/' . $slug . '.json';
        if (!file_exists($filePath)) {
            throw new RuntimeException("Pattern '$slug' not found.");
        }

        $json = file_get_contents($filePath);
        $data = json_decode($json, true);

        if (json_last_error() !== JSON_ERROR_NONE) {
            throw new RuntimeException("Failed to parse pattern JSON for '$slug'.");
        }

        self::$cache[$slug] = $data;
        return $data;
    }

    /**
     * Validate an input string against a pattern slug.
     *
     * @param string $slug The pattern slug (e.g. "email")
     * @param string $input The string to validate
     * @return bool True if valid, false otherwise
     */
    public static function validate(string $slug, string $input): bool
    {
        $data = self::getPatternData($slug);
        
        // Construct the PHP regex: /pattern/flags
        // Escape delimiters if they are present in the pattern
        $pattern = str_replace('/', '\/', $data['pattern']);
        
        // Wrap the pattern in ^(?: ... )$ to strictly enforce a full-string match
        $regex = '/^(?:' . $pattern . ')$/' . $data['flags'];
        
        return preg_match($regex, $input) === 1;
    }
    /**
     * Test an input string against a pattern slug (unanchored substring match).
     */
    public static function test(string $slug, string $input): bool
    {
        $data = self::getPatternData($slug);
        $pattern = str_replace('/', '\/', $data['pattern']);
        $regex = '/' . $pattern . '/' . $data['flags'];
        
        return preg_match($regex, $input) === 1;
    }

    /**
     * Get all available patterns.
     */
    public static function getAllPatterns(): array
    {
        $patterns = [];
        $files = glob(self::$patternsDir . '/*.json');
        foreach ($files as $file) {
            $slug = basename($file, '.json');
            $patterns[] = self::getPatternData($slug);
        }
        return $patterns;
    }

    /**
     * Detect the type(s) of an unknown string. Returns a sorted array of matches.
     */
    public static function detect(string $input): array
    {
        $input = trim($input);
        if ($input === '') {
            return [];
        }

        $results = [];
        $patterns = self::getAllPatterns();

        foreach ($patterns as $p) {
            $pattern = str_replace('/', '\/', $p['pattern']);
            // Strip g and m flags for detection if present
            $flags = str_replace(['g', 'm'], '', $p['flags']);

            // 1. Full match
            $fullRegex = '/^(?:' . $pattern . ')$/' . $flags;
            if (@preg_match($fullRegex, $input) === 1) {
                $results[] = [
                    'pattern' => $p,
                    'matchType' => 'full',
                    'matchedText' => $input,
                    'coverage' => 1.0
                ];
                continue;
            }

            // 2. Partial match
            $partialRegex = '/' . $pattern . '/' . $flags;
            if (@preg_match($partialRegex, $input, $matches) === 1) {
                $matchedText = $matches[0];
                $coverage = strlen($matchedText) / strlen($input);
                if (strlen($matchedText) >= 4 && $coverage >= 0.2) {
                    $results[] = [
                        'pattern' => $p,
                        'matchType' => 'partial',
                        'matchedText' => $matchedText,
                        'coverage' => $coverage
                    ];
                }
            }
        }

        // Sort: full matches first, then by coverage desc, then by pattern length desc
        usort($results, function ($a, $b) {
            if ($a['matchType'] !== $b['matchType']) {
                return $a['matchType'] === 'full' ? -1 : 1;
            }
            if (abs($b['coverage'] - $a['coverage']) > 0.05) {
                return $b['coverage'] <=> $a['coverage'];
            }
            return strlen($b['pattern']['pattern']) <=> strlen($a['pattern']['pattern']);
        });

        return $results;
    }
}
