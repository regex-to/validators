# Contributing to `@regexto/validators`

First off, thank you for taking the time to contribute! We welcome contributions to improve the patterns, support new platforms, or optimize the library.

## How to Contribute

### 1. Proposing a New Pattern
1. Create a JSON definition under the `patterns/` folder in the root monorepo.
2. Ensure you provide:
   - `slug`: Unique slug for URL routing
   - `name`: Human-readable name
   - `description`: Detailed validator description
   - `pattern`: Clean regex without delimiters
   - `examples`: Match strings (must pass tests)
   - `counterExamples`: Non-match strings (must fail tests)
3. Run the tests in the package you are editing.

### 2. Submitting Pull Requests
- Keep your changes focused.
- Ensure the test suites for all languages pass successfully.
- Follow conventional commits for commit messages (e.g. `feat(pattern): add visa-card`, `fix(go): resolve edge-case in validator`).

## Development Setup

```bash
# Clone the repository
git clone https://github.com/regex-to/validators.git
cd validators/regex-npm

# Install dependencies
npm install

# Run tests
npm test
```
