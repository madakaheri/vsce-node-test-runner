# node test runner

This VS Code extension adds inline controls above Node.js test declarations so you can execute individual tests or entire files without leaving the editor.

## Features

### ```Run```

Shows above each test definition and executes only that test via `node --test`.

### ```--watch```

Runs the same command with `--watch`, rerunning on every save.

### ```Stop```

Disposes the dedicated terminal so the associated watch session ends immediately.


![Run Button](./docs/images/single.png)

You can also trigger every test in the file from the header CodeLens.

![File View](./docs/images/file.png)

## Usage

- The first line of every test file shows `Run All | --watch | Stop`. These commands run, watch, or stop all `test()` calls in the current file.
- Each `test()`, `it()`, and `describe()` line displays `Run | --watch | Stop`, letting you control a single test or suite in place.
- `Run` executes `node --test --test-name-pattern "^<test name>$" <file>`, so only the selected test runs.
- `--watch` runs `node --test --watch --test-name-pattern "^<test name>$" <file>` and reruns the same test whenever the file changes. The header `--watch` omits the pattern so the entire file is watched.
- `Stop` closes the workspace’s “Node Test Runner” terminal, ending any active watch session.
- The Command Palette exposes the same actions: `Node Test Runner: Run test`, `Run test (watch)`, `Run file`, `Run file (watch)`, and `Stop watch`.

## Contributing

Contributions are welcome! Follow these steps to set up the development environment and publish the extension.

### Development Setup

1. **Clone the repository**
   ```bash
   git clone https://github.com/madakaheri/vsce-node-test-runner.git
   cd vsce-node-test-runner
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Run tests**
   ```bash
   npm test
   ```
   This runs ESLint and all unit tests with VS Code API mocking.

4. **Debug in VS Code**
   - Press `F5` to launch the Extension Development Host
   - Open a JavaScript/TypeScript file with test code
   - CodeLens buttons should appear above test definitions

### Project Structure

```
src/
├── extension.js                    # Main entry point and activation
├── handlers/
│   ├── run-command-handler.js     # Test execution command handler
│   └── stop-command-handler.js    # Watch stop command handler
└── utils/
    ├── argument-resolver.js        # Command argument resolution and URI handling
    ├── node-test-parser.js         # Test code parsing
    └── terminal-manager.js         # Terminal management and test execution

test/
├── setup.js                        # Test setup with VS Code mocking
├── vscode-loader.js                # Custom module loader for mocking
└── vscode-mock.js                  # Mock VS Code API implementation
```

### Building and Publishing

1. **Install vsce (VS Code Extension Manager)**
   ```bash
   npm install -g @vscode/vsce
   ```

2. **Package the extension**
   ```bash
   vsce package
   ```
   This creates a `.vsix` file that can be installed locally or distributed.

3. **Publish to VS Code Marketplace**
   
   First, create a [Personal Access Token (PAT)](https://code.visualstudio.com/api/working-with-extensions/publishing-extension#get-a-personal-access-token) from Azure DevOps.

   ```bash
   # Login (only needed once)
   vsce login <publisher-name>
   
   # Publish new version
   vsce publish
   ```

   Or specify version bump:
   ```bash
   vsce publish patch   # 1.0.0 -> 1.0.1
   vsce publish minor   # 1.0.0 -> 1.1.0
   vsce publish major   # 1.0.0 -> 2.0.0
   ```

4. **Update version manually**
   ```bash
   npm version patch   # or minor, major
   ```

### Coding Guidelines

- Follow ESLint rules configured in the project
- Use kebab-case for file names
- One class per file in `utils/` directory
- Write unit tests for new utility functions
- Keep handlers focused on command execution logic
- Update CHANGELOG.md for notable changes

### Running Tests

The project uses Node.js built-in test runner with VS Code API mocking:

```bash
# Run all tests
npm test

# Run specific test file
node --import ./test/setup.js --test src/utils/node-test-parser.test.js

# Run with coverage (if needed)
npm run test:coverage
```

## License

[MIT](LICENSE)
