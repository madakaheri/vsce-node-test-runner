import {test, describe} from 'node:test';
import assert from 'node:assert/strict';
import {findTestNameInLine, findTestsInDocument, buildExactTestPattern} from './node-test-parser.js';

describe('nodeTestParser', () => {
	test('finds tests, its, and describes within document text', () => {
		const documentText = `
import {test, it, describe} from 'node:test';

test('adds numbers', () => {});
it("handles edge cases", () => {});
describe('group', () => {
	it('nested', () => {});
});
`.trim();

		const found = findTestsInDocument(documentText);
		assert.deepStrictEqual(found, [
			{line: 2, name: 'adds numbers'},
			{line: 3, name: 'handles edge cases'},
			{line: 4, name: 'group'},
			{line: 5, name: 'nested'},
		]);
	});

	test('extracts names from different node:test helpers', () => {
		assert.strictEqual(findTestNameInLine('   test("with spaces", () => {})'), 'with spaces');
		assert.strictEqual(findTestNameInLine('\tit.only(\'single quotes\', fn);'), 'single quotes');
		assert.strictEqual(findTestNameInLine('describe.skip(`templated`, fn);'), 'templated');
		assert.strictEqual(findTestNameInLine('console.log("no match")'), undefined);
	});

	test('builds an exact match pattern for node --test', () => {
		const pattern = buildExactTestPattern('handles (complex) cases?');
		assert.strictEqual(pattern, String.raw`^handles \(complex\) cases\?$`);
	});
});
