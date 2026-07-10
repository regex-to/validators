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
                    $this->assertTrue(
                        Validator::validate($slug, $example),
                        "Example failed for '$slug': '$example'"
                    );
                }
            }

            // Validate counterExamples (should be false)
            if (!empty($data['counterExamples'])) {
                foreach ($data['counterExamples'] as $counter) {
                    $this->assertFalse(
                        Validator::validate($slug, $counter),
                        "Counter-example passed incorrectly for '$slug': '$counter'"
                    );
                }
            }
        }
    }
}
