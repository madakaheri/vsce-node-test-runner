import * as vscode from 'vscode';
import {findTestsInDocument, findTestNameInLine, buildExactTestPattern} from './node-test-parser.js';

const RUN_COMMAND = 'node-test-runner.runTest';
const RUN_WATCH_COMMAND = 'node-test-runner.runTestWatch';
const RUN_ALL_COMMAND = 'node-test-runner.runFile';
const RUN_ALL_WATCH_COMMAND = 'node-test-runner.runFileWatch';
const RUN_STOP_COMMAND = 'node-test-runner.stopWatch';
const DOCUMENT_SELECTOR = [
	{language: 'javascript', scheme: 'file'},
	{language: 'typescript', scheme: 'file'},
	{language: 'javascriptreact', scheme: 'file'},
	{language: 'typescriptreact', scheme: 'file'},
];

const terminalByWorkspace = new Map();

class NodeTestCodeLensProvider {
	provideCodeLenses(document) {
		const tests = findTestsInDocument(document.getText());
		const lenses = [];
		if (tests.length > 0) {
			const headerRange = new vscode.Range(0, 0, 0, 0);
			const allTarget = {fileUri: document.uri};
			lenses.push(
				new vscode.CodeLens(headerRange, {
					title: 'Run All',
					tooltip: 'Run every test in this file',
					command: RUN_ALL_COMMAND,
					arguments: [allTarget],
				}),
				new vscode.CodeLens(headerRange, {
					title: '--watch',
					tooltip: 'Run every test in this file (watch mode)',
					command: RUN_ALL_WATCH_COMMAND,
					arguments: [allTarget],
				}),
				new vscode.CodeLens(headerRange, {
					title: 'Stop',
					tooltip: 'Stop the watch process for this workspace',
					command: RUN_STOP_COMMAND,
					arguments: [{fileUri: document.uri}],
				}),
			);
		}

		return [...lenses, ...tests.flatMap(({line, name}) => {
			const range = new vscode.Range(line, 0, line, 0);
			const target = {fileUri: document.uri, testName: name};
			return [
				new vscode.CodeLens(range, {
					title: 'Run',
					tooltip: 'Run this test with node --test',
					command: RUN_COMMAND,
					arguments: [target],
				}),
				new vscode.CodeLens(range, {
					title: '--watch',
					tooltip: 'Run this test in watch mode',
					command: RUN_WATCH_COMMAND,
					arguments: [target],
				}),
				new vscode.CodeLens(range, {
					title: 'Stop',
					tooltip: 'Stop the watch process for this workspace',
					command: RUN_STOP_COMMAND,
					arguments: [{fileUri: document.uri}],
				}),
			];
		})];
	}
}

function activate(context) {
	const codeLensProvider = new NodeTestCodeLensProvider();
	const closeListener = vscode.window.onDidCloseTerminal(terminal => {
		for (const [key, value] of terminalByWorkspace.entries()) {
			if (value === terminal) {
				terminalByWorkspace.delete(key);
				break;
			}
		}
	});

	context.subscriptions.push(
		vscode.languages.registerCodeLensProvider(DOCUMENT_SELECTOR, codeLensProvider),
		vscode.commands.registerCommand(RUN_COMMAND, args => runCommandHandler(args, {watch: false, scope: 'single'})),
		vscode.commands.registerCommand(RUN_WATCH_COMMAND, args => runCommandHandler(args, {watch: true, scope: 'single'})),
		vscode.commands.registerCommand(RUN_ALL_COMMAND, args => runCommandHandler(args, {watch: false, scope: 'file'})),
		vscode.commands.registerCommand(RUN_ALL_WATCH_COMMAND, args => runCommandHandler(args, {watch: true, scope: 'file'})),
		vscode.commands.registerCommand(RUN_STOP_COMMAND, args => stopCommandHandler(args)),
		closeListener,
	);
}

async function runCommandHandler(args, {watch, scope}) {
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

async function stopCommandHandler(args) {
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

function resolveRunTarget(args) {
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

function resolveDocumentUri(args) {
	if (args?.fileUri) {
		return normalizeUri(args.fileUri);
	}

	const editor = vscode.window.activeTextEditor;
	return editor ? editor.document.uri : undefined;
}

async function runNodeTest(fileUri, testName, options = {}) {
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

async function stopNodeWatch(fileUri) {
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

function getOrCreateTerminal(workspaceFolder) {
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

function normalizeUri(value) {
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

function getWorkspaceKey(workspaceFolder) {
	return workspaceFolder ? workspaceFolder.uri.toString() : 'root';
}

function shellQuote(text) {
	return JSON.stringify(text);
}

function deactivate() {
	for (const terminal of terminalByWorkspace.values()) {
		try {
			terminal.dispose();
		} catch {}
	}

	terminalByWorkspace.clear();
}

export {activate, deactivate};
