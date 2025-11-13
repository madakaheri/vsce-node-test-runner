# Node Test Runner – Quickstart

This repository contains a VS Code extension that adds inline “Run / --watch / Stop” controls for Node.js tests (using the built-in `node:test` runner). Use this document as a concise guide for developing, debugging, and shipping the extension.

## Project Structure

- `package.json` – Extension manifest (commands, activation events, scripts, and metadata).
- `src/extension.js` – Main entry point registering CodeLens providers and commands.
- `src/node-test-parser.js` – Utility that detects `test()`, `it()`, and `describe()` declarations.
- `src/node-test-parser.test.js` – Node.js test suite covering the parser logic.
- `docs/images/` – Screenshots for README usage docs.
- `README.md` – User-facing documentation.

## Running and Debugging

1. Run `npm install` once to fetch dependencies.
2. Press `F5` (or `Run > Start Debugging`) to launch the Extension Development Host with this extension loaded.
3. Open a file that uses `node:test`, place the cursor on a `test()`/`it()`/`describe()`, and confirm the `Run | --watch | Stop` CodeLens appears.
4. Use the VS Code debug console to view any logging emitted from `src/extension.js`.

Hot reload tips:
- After editing the extension, use the “Restart” button in the debug toolbar or press `Ctrl/Cmd + R` within the dev host window.
- Set breakpoints in `src/extension.js` to step through command execution.

## Running Tests

The project relies on plain `node --test`.

```bash
npm test
```

The script runs `xo` (lint) followed by the Node test suite. Add new test files alongside `src/node-test-parser.test.js` and ensure they are named `*.test.js` to be picked up automatically.

## Publishing Checklist

1. Update screenshots and README if UX changes.
2. Run `npm version <patch|minor|major>` to bump the version.
3. Package and publish using `vsce package` / `vsce publish` or the GitHub workflow of your choice.
4. Fill out marketplace metadata (description, categories, icon) to match the new capabilities.

## Helpful Links

- [VS Code Extension API](https://code.visualstudio.com/api)
- [Testing VS Code Extensions](https://code.visualstudio.com/api/working-with-extensions/testing-extension)
- [Publishing Extensions](https://code.visualstudio.com/api/working-with-extensions/publishing-extension)
