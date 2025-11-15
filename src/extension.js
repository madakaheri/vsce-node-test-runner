import * as vscode from 'vscode';
import nodeTestParser from './utils/node-test-parser.js';
import terminalManager from './utils/terminal-manager.js';
import {runCommandHandler} from './handlers/run-command-handler.js';
import {stopCommandHandler} from './handlers/stop-command-handler.js';

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

class NodeTestCodeLensProvider {
	provideCodeLenses(document) {
		const tests = nodeTestParser.findTestsInDocument(document.getText());
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
					tooltip: 'Stop the watch process',
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
					tooltip: 'Stop the watch process',
					command: RUN_STOP_COMMAND,
					arguments: [{fileUri: document.uri}],
				}),
			];
		})];
	}
}

function activate(context) {
	const codeLensProvider = new NodeTestCodeLensProvider();
	const closeListener = terminalManager.createTerminalCloseListener();

	context.subscriptions.push(
		vscode.languages.registerCodeLensProvider(DOCUMENT_SELECTOR, codeLensProvider),
		vscode.commands.registerCommand(RUN_COMMAND, arguments_ => runCommandHandler(arguments_, {watch: false, scope: 'single'})),
		vscode.commands.registerCommand(RUN_WATCH_COMMAND, arguments_ => runCommandHandler(arguments_, {watch: true, scope: 'single'})),
		vscode.commands.registerCommand(RUN_ALL_COMMAND, arguments_ => runCommandHandler(arguments_, {watch: false, scope: 'file'})),
		vscode.commands.registerCommand(RUN_ALL_WATCH_COMMAND, arguments_ => runCommandHandler(arguments_, {watch: true, scope: 'file'})),
		vscode.commands.registerCommand(RUN_STOP_COMMAND, arguments_ => stopCommandHandler(arguments_)),
		closeListener,
	);
}

function deactivate() {
	terminalManager.disposeAllTerminals();
}

export {activate, deactivate};
