import {register} from 'node:module';
import {pathToFileURL} from 'node:url';
import path from 'node:path';
import process from 'node:process';

const mockPath = path.resolve(process.cwd(), 'test/vscode-loader.js');

register(pathToFileURL(mockPath).href, {
	parentURL: import.meta.url,
});
