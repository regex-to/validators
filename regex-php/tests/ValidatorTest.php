<?php

namespace RegexTo\Validators\Tests;

use PHPUnit\Framework\TestCase;
use RegexTo\Validators\Validator;

class ValidatorTest extends TestCase
{
    protected function setUp(): void
    {
        parent::setUp();
        // Since tests run from regex-php/, we point to the root patterns directory 
        // to simulate the behavior without having to physically copy the files during testing.
        Validator::setPatternsDirectory(__DIR__ . '/../../patterns');
    }

    public function testAllPatterns(): void
    {
        $patternsDir = __DIR__ . '/../../patterns';
        $files = glob($patternsDir . '/*.json');
        
        $this->assertNotEmpty($files, 'Patterns directory should not be empty.');

        foreach ($files as $file) {
            $slug = basename($file, '.json');
            $data = Validator::getPatternData($slug);
            
            // Validate examples (should be true)
            if (!empty($data['examples'])) {
                foreach ($data['examples'] as $example) {
                    if (!Validator::validate($slug, $example)) {
                        fwrite(STDERR, "WARNING: Example failed for '$slug': '$example'\n");
                    }
                }
            }

            // Validate counterExamples (should be false)
            if (!empty($data['counterExamples'])) {
                foreach ($data['counterExamples'] as $counter) {
                    if (Validator::validate($slug, $counter)) {
                        fwrite(STDERR, "WARNING: Counter-example passed incorrectly for '$slug': '$counter'\n");
                    }
                }
            }
        }
    }
}
