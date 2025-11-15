import * as vscode from 'vscode';
import nodeTestParser from './node-test-parser.js';
import argumentResolver from './argument-resolver.js';

const terminalByWorkspace = new Map();

/**
 * Terminal manager for running Node.js tests
 */
class TerminalManager {
	/**
	 * Get a unique key for a workspace folder
	 */
	getWorkspaceKey(workspaceFolder) {
		return workspaceFolder ? workspaceFolder.uri.toString() : 'root';
	}

	/**
	 * Quote a string for shell execution
	 */
	shellQuote(text) {
		return JSON.stringify(text);
	}

	/**
	 * Get or create a terminal for the workspace
	 */
	getOrCreateTerminal(workspaceFolder) {
		const key = this.getWorkspaceKey(workspaceFolder);
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
	async runNodeTest(fileUri, testName, options = {}) {
		const uri = argumentResolver.normalizeUri(fileUri);
		const workspaceFolder = vscode.workspace.getWorkspaceFolder(uri);
		const terminal = this.getOrCreateTerminal(workspaceFolder);
		const arguments_ = ['node', '--test'];
		if (options.watch) {
			arguments_.push('--watch');
		}

		if (testName) {
			const pattern = nodeTestParser.buildExactTestPattern(testName);
			arguments_.push('--test-name-pattern', this.shellQuote(pattern));
		}

		arguments_.push(this.shellQuote(uri.fsPath));
		const command = arguments_.join(' ');
		terminal.sendText(command, true);
		terminal.show(true);
	}

	/**
	 * Stop a watch process for a file
	 */
	async stopNodeWatch(fileUri) {
		const uri = argumentResolver.normalizeUri(fileUri);
		const workspaceFolder = vscode.workspace.getWorkspaceFolder(uri);
		const key = this.getWorkspaceKey(workspaceFolder);
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
	createTerminalCloseListener() {
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
	disposeAllTerminals() {
		for (const terminal of terminalByWorkspace.values()) {
			try {
				terminal.dispose();
			} catch {}
		}

		terminalByWorkspace.clear();
	}
}

const terminalManager = new TerminalManager();
export default terminalManager;
