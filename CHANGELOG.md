# Change Log

All notable changes to the "node-test-runner" extension will be documented in this file.

Check [Keep a Changelog](http://keepachangelog.com/) for recommendations on how to structure this file.

## [1.1.0] - 2025-11-15

### Changed
- **Major refactoring**: Improved code organization and maintainability
  - Reorganized project structure with clear separation of concerns
  - Split monolithic files into focused, single-responsibility modules
  - Moved command handlers from `extension.js` to dedicated `handlers/` directory
  - Consolidated utility functions into well-organized `utils/` directory

### Added
- **Comprehensive unit tests** for all utility modules
  - Added test coverage for `node-test-parser`, `argument-resolver`, and `terminal-manager`
  - Implemented VS Code API mocking system for testing (`test/setup.js`, `test/vscode-mock.js`, `test/vscode-loader.js`)
  - All tests passing with proper mocking infrastructure

### Technical Improvements
- Adopted consistent class-based module pattern across all utilities
- Implemented kebab-case naming convention for files (ESLint `unicorn/filename-case` compliant)
- Used named exports to avoid anonymous default exports (ESLint `import-x/no-anonymous-default-export` compliant)
- Reduced code duplication by consolidating related functions
- Improved module dependencies and eliminated circular references

### Files Structure
```
src/
├── extension.js                    # Main entry point
├── handlers/
│   ├── run-command-handler.js     # Test execution command handler
│   └── stop-command-handler.js    # Watch stop command handler
└── utils/
    ├── argument-resolver.js        # Command argument resolution and URI handling
    ├── node-test-parser.js         # Test code parsing
    └── terminal-manager.js         # Terminal management and test execution
```

## [1.0.1] - Initial release

- Initial release