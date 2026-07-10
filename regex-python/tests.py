import unittest
import glob
import os
import json
from regexto_validators import get_pattern_data, validate

class TestValidators(unittest.TestCase):
    def test_all_patterns(self):
        patterns_dir = os.path.join(os.path.dirname(__file__), "src", "regexto_validators", "patterns")
        files = glob.glob(os.path.join(patterns_dir, "*.json"))
        self.assertTrue(len(files) > 0, "Patterns directory should not be empty.")

        for filepath in files:
            slug = os.path.splitext(os.path.basename(filepath))[0]
            with self.subTest(slug=slug):
                data = get_pattern_data(slug)

                # Validate examples (should be True)
                for example in data.get("examples", []):
                    with self.subTest(example=example):
                        self.assertTrue(validate(slug, example), f"Example failed for '{slug}': '{example}'")

                # Validate counterExamples (should be False)
                for counter in data.get("counterExamples", []):
                    with self.subTest(counter=counter):
                        self.assertFalse(validate(slug, counter), f"Counter-example passed incorrectly for '{slug}': '{counter}'")

if __name__ == '__main__':
    unittest.main()
