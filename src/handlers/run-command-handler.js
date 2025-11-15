import * as vscode from 'vscode';
import terminalManager from '../utils/terminal-manager.js';
import argumentResolver from '../utils/argument-resolver.js';

/**
 * Handle the run test command
 */
export async function runCommandHandler(arguments_, {watch, scope}) {
	if (scope === 'file') {
		const fileUri = argumentResolver.resolveDocumentUri(arguments_);
		if (!fileUri) {
			vscode.window.showErrorMessage('Open a test file to run.');
			return;
		}

		await terminalManager.runNodeTest(fileUri, undefined, {watch});
		return;
	}

	const target = argumentResolver.resolveRunTarget(arguments_);
	if (!target) {
		vscode.window.showErrorMessage('Select a Node.js test definition to run.');
		return;
	}

	await terminalManager.runNodeTest(target.fileUri, target.testName, {watch});
}
