/**
 * Mock implementation of VS Code API for testing
 */

class MockUri {
	constructor(scheme, path) {
		this.scheme = scheme;
		this.path = path;
		this.fsPath = path;
	}

	toString() {
		return `${this.scheme}://${this.path}`;
	}

	static file(path) {
		return new MockUri('file', path);
	}

	static isUri(thing) {
		return thing instanceof MockUri;
	}
}

class MockRange {
	constructor(startLine, startChar, endLine, endChar) {
		this.start = {line: startLine, character: startChar};
		this.end = {line: endLine, character: endChar};
	}
}

class MockCodeLens {
	constructor(range, command) {
		this.range = range;
		this.command = command;
	}
}

const mockWindow = {
	activeTextEditor: undefined,
	createTerminal(options) {
		return {
			name: options.name,
			sendText() {},
			show() {},
			dispose() {},
		};
	},
	showErrorMessage() {},
	showInformationMessage() {},
	onDidCloseTerminal(_callback) {
		return {
			dispose() {},
		};
	},
};

const mockWorkspace = {
	getWorkspaceFolder() {
		return undefined;
	},
};

export const Uri = MockUri;
export const Range = MockRange;
export const CodeLens = MockCodeLens;
export const window = mockWindow;
export const workspace = mockWorkspace;
