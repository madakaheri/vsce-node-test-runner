import * as vscode from 'vscode';
import {findTestNameInLine} from './node-test-parser.js';
import {normalizeUri} from './terminal-manager.js';

/**
 * Resolve the run target (file URI and test name) from command arguments or active editor
 */
export function resolveRunTarget(args) {
	if (args?.fileUri && args?.testName) {
		return {
			fileUri: normalizeUri(args.fileUri),
			testName: args.testName,
		};
	}

	const editor = vscode.window.activeTextEditor;
	if (!editor) {
		return undefined;
	}

	const {document, selection} = editor;
	const {line: activeLine} = selection.active;

	for (let line = activeLine; line >= 0; line--) {
		const testName = findTestNameInLine(document.lineAt(line).text);
		if (testName) {
			return {fileUri: document.uri, testName};
		}
	}

	return undefined;
}
