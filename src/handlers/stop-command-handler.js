import * as vscode from 'vscode';
import terminalManager from '../utils/terminal-manager.js';
import argumentResolver from '../utils/argument-resolver.js';

/**
 * Handle the stop watch command
 */
export async function stopCommandHandler(arguments_) {
	const uri = argumentResolver.resolveDocumentUri(arguments_);
	if (!uri) {
		vscode.window.showErrorMessage('Open a test file to stop the watch process.');
		return;
	}

	const stopped = await terminalManager.stopNodeWatch(uri);
	if (!stopped) {
		vscode.window.showInformationMessage('No active Node Test Runner watch process found.');
	}
}
