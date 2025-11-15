import {pathToFileURL} from 'node:url';
import path from 'node:path';
import process from 'node:process';

export async function resolve(specifier, context, nextResolve) {
	// Intercept vscode module imports and redirect to our mock
	if (specifier === 'vscode') {
		const mockPath = path.resolve(process.cwd(), 'test/vscode-mock.js');
		return {
			url: pathToFileURL(mockPath).href,
			shortCircuit: true,
		};
	}

	// Let Node.js handle all other specifiers
	return nextResolve(specifier, context);
}
