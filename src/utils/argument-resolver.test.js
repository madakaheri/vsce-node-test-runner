import {test, describe} from 'node:test';
import assert from 'node:assert/strict';

describe('ArgumentResolver', () => {
	describe('normalizeUri', () => {
		test('converts string path to Uri', async () => {
			const {default: argumentResolver} = await import('./argument-resolver.js');

			const result = argumentResolver.normalizeUri('/test/path.js');
			assert.ok(result);
			assert.strictEqual(result.scheme, 'file');
			assert.strictEqual(result.path, '/test/path.js');
		});

		test('converts object with path property to Uri', async () => {
			const {default: argumentResolver} = await import('./argument-resolver.js');

			const result = argumentResolver.normalizeUri({path: '/test/file.js'});
			assert.ok(result);
			assert.strictEqual(result.path, '/test/file.js');
		});

		test('throws error for invalid value', async () => {
			const {default: argumentResolver} = await import('./argument-resolver.js');

			assert.throws(
				() => argumentResolver.normalizeUri(null),
				{message: 'Cannot convert value to Uri'},
			);
		});
	});

	describe('resolveDocumentUri', () => {
		test('returns normalized URI from args.fileUri if provided', async () => {
			const {default: argumentResolver} = await import('./argument-resolver.js');

			const result = argumentResolver.resolveDocumentUri({fileUri: '/test.js'});
			assert.ok(result);
			assert.strictEqual(result.scheme, 'file');
			assert.strictEqual(result.path, '/test.js');
		});

		test('returns undefined if no args.fileUri and no active editor', async () => {
			const {default: argumentResolver} = await import('./argument-resolver.js');

			const result = argumentResolver.resolveDocumentUri({});
			assert.strictEqual(result, undefined);
		});
	});

	describe('resolveRunTarget', () => {
		test('returns normalized target from args if both fileUri and testName provided', async () => {
			const {default: argumentResolver} = await import('./argument-resolver.js');

			const result = argumentResolver.resolveRunTarget({
				fileUri: '/test.js',
				testName: 'my test',
			});

			assert.ok(result);
			assert.ok(result.fileUri);
			assert.strictEqual(result.fileUri.scheme, 'file');
			assert.strictEqual(result.fileUri.path, '/test.js');
			assert.strictEqual(result.testName, 'my test');
		});

		test('returns undefined if no active editor and incomplete args', async () => {
			const {default: argumentResolver} = await import('./argument-resolver.js');

			const result = argumentResolver.resolveRunTarget({});
			assert.strictEqual(result, undefined);
		});
	});
});
