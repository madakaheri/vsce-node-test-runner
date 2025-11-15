import * as vscode from 'vscode';
import {runNodeTest} from '../utils/terminal-manager.js';
import {resolveDocumentUri} from '../utils/resolve-document-uri.js';
import {resolveRunTarget} from '../utils/resolve-run-target.js';

/**
 * Handle the run test command
 */
export async function runCommandHandler(args, {watch, scope}) {
	if (scope === 'file') {
		const fileUri = resolveDocumentUri(args);
		if (!fileUri) {
			vscode.window.showErrorMessage('Open a test file to run.');
			return;
		}

		await runNodeTest(fileUri, undefined, {watch});
		return;
	}

	const target = resolveRunTarget(args);
	if (!target) {
		vscode.window.showErrorMessage('Select a Node.js test definition to run.');
		return;
	}

	await runNodeTest(target.fileUri, target.testName, {watch});
}
