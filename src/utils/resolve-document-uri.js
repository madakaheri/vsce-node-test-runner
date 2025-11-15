import * as vscode from 'vscode';
import {normalizeUri} from './terminal-manager.js';

/**
 * Resolve the document URI from command arguments or active editor
 */
export function resolveDocumentUri(args) {
	if (args?.fileUri) {
		return normalizeUri(args.fileUri);
	}

	const editor = vscode.window.activeTextEditor;
	return editor ? editor.document.uri : undefined;
}
