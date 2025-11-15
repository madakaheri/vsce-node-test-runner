import {test, describe} from 'node:test';
import assert from 'node:assert/strict';

describe('TerminalManager', () => {
	describe('getWorkspaceKey', () => {
		test('returns workspace URI string if workspaceFolder provided', async () => {
			const {default: terminalManager} = await import('./terminal-manager.js');

			const workspaceFolder = {
				uri: {toString: () => 'file:///workspace'},
				name: 'test-workspace',
			};

			const key = terminalManager.getWorkspaceKey(workspaceFolder);
			assert.strictEqual(key, 'file:///workspace');
		});

		test('returns "root" if no workspaceFolder provided', async () => {
			const {default: terminalManager} = await import('./terminal-manager.js');

			const key = terminalManager.getWorkspaceKey(undefined);
			assert.strictEqual(key, 'root');
		});
	});

	describe('shellQuote', () => {
		test('quotes simple strings', async () => {
			const {default: terminalManager} = await import('./terminal-manager.js');

			const result = terminalManager.shellQuote('test');
			assert.strictEqual(result, '"test"');
		});

		test('escapes special characters', async () => {
			const {default: terminalManager} = await import('./terminal-manager.js');

			const result = terminalManager.shellQuote('test with "quotes"');
			assert.strictEqual(result, String.raw`"test with \"quotes\""`);
		});

		test('handles paths with spaces', async () => {
			const {default: terminalManager} = await import('./terminal-manager.js');

			const result = terminalManager.shellQuote('/path/to/my test.js');
			assert.strictEqual(result, '"/path/to/my test.js"');
		});
	});
});
