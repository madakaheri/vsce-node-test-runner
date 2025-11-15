import * as vscode from 'vscode';
import nodeTestParser from './node-test-parser.js';

/**
 * Argument resolver for command handlers
 */
class ArgumentResolver {
	/**
	 * Convert various URI-like values to a vscode.Uri instance
	 */
	normalizeUri(value) {
		if (vscode.Uri.isUri(value)) {
			return value;
		}

		if (typeof value === 'string') {
			return vscode.Uri.file(value);
		}

		if (value?.path) {
			return vscode.Uri.file(value.path);
		}

		throw new Error('Cannot convert value to Uri');
	}

	/**
	 * Resolve the document URI from command arguments or active editor
	 */
	resolveDocumentUri(arguments_) {
		if (arguments_?.fileUri) {
			return this.normalizeUri(arguments_.fileUri);
		}

		const editor = vscode.window.activeTextEditor;
		return editor ? editor.document.uri : undefined;
	}

	/**
	 * Resolve the run target (file URI and test name) from command arguments or active editor
	 */
	resolveRunTarget(arguments_) {
		if (arguments_?.fileUri && arguments_?.testName) {
			return {
				fileUri: this.normalizeUri(arguments_.fileUri),
				testName: arguments_.testName,
			};
		}

		const editor = vscode.window.activeTextEditor;
		if (!editor) {
			return undefined;
		}

		const {document, selection} = editor;
		const {line: activeLine} = selection.active;

		for (let line = activeLine; line >= 0; line--) {
			const testName = nodeTestParser.findTestNameInLine(document.lineAt(line).text);
			if (testName) {
				return {fileUri: document.uri, testName};
			}
		}

		return undefined;
	}
}

const argumentResolver = new ArgumentResolver();
export default argumentResolver;
