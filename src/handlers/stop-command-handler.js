import * as vscode from 'vscode';
import {stopNodeWatch} from '../utils/terminal-manager.js';
import {resolveDocumentUri} from '../utils/resolve-document-uri.js';

/**
 * Handle the stop watch command
 */
export async function stopCommandHandler(args) {
	const uri = resolveDocumentUri(args);
	if (!uri) {
		vscode.window.showErrorMessage('Open a test file to stop the watch process.');
		return;
	}

	const stopped = await stopNodeWatch(uri);
	if (!stopped) {
		vscode.window.showInformationMessage('No active Node Test Runner watch process found.');
	}
}
