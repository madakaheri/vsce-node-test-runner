import * as vscode from 'vscode';
import {buildExactTestPattern} from './node-test-parser.js';

const terminalByWorkspace = new Map();

/**
 * Convert various URI-like values to a vscode.Uri instance
 */
export function normalizeUri(value) {
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
 * Get a unique key for a workspace folder
 */
export function getWorkspaceKey(workspaceFolder) {
	return workspaceFolder ? workspaceFolder.uri.toString() : 'root';
}

/**
 * Quote a string for shell execution
 */
export function shellQuote(text) {
	return JSON.stringify(text);
}

/**
 * Get or create a terminal for the workspace
 */
export function getOrCreateTerminal(workspaceFolder) {
	const key = getWorkspaceKey(workspaceFolder);
	let terminal = terminalByWorkspace.get(key);
	if (!terminal) {
		const name = workspaceFolder ? `Node Test Runner (${workspaceFolder.name})` : 'Node Test Runner';
		const options = {name};
		if (workspaceFolder) {
			options.cwd = workspaceFolder.uri.fsPath;
		}

		terminal = vscode.window.createTerminal(options);
		terminalByWorkspace.set(key, terminal);
	}

	return terminal;
}

/**
 * Run a Node.js test in a terminal
 */
export async function runNodeTest(fileUri, testName, options = {}) {
	const uri = normalizeUri(fileUri);
	const workspaceFolder = vscode.workspace.getWorkspaceFolder(uri);
	const terminal = getOrCreateTerminal(workspaceFolder);
	const args = ['node', '--test'];
	if (options.watch) {
		args.push('--watch');
	}

	if (testName) {
		const pattern = buildExactTestPattern(testName);
		args.push('--test-name-pattern', shellQuote(pattern));
	}

	args.push(shellQuote(uri.fsPath));
	const command = args.join(' ');
	terminal.sendText(command, true);
	terminal.show(true);
}

/**
 * Stop a watch process for a file
 */
export async function stopNodeWatch(fileUri) {
	const uri = normalizeUri(fileUri);
	const workspaceFolder = vscode.workspace.getWorkspaceFolder(uri);
	const key = getWorkspaceKey(workspaceFolder);
	const terminal = terminalByWorkspace.get(key);
	if (!terminal) {
		return false;
	}

	terminalByWorkspace.delete(key);
	terminal.dispose();
	return true;
}

/**
 * Clean up terminals when a terminal is closed
 */
export function createTerminalCloseListener() {
	return vscode.window.onDidCloseTerminal(terminal => {
		for (const [key, value] of terminalByWorkspace.entries()) {
			if (value === terminal) {
				terminalByWorkspace.delete(key);
				break;
			}
		}
	});
}

/**
 * Dispose all terminals
 */
export function disposeAllTerminals() {
	for (const terminal of terminalByWorkspace.values()) {
		try {
			terminal.dispose();
		} catch {}
	}

	terminalByWorkspace.clear();
}
