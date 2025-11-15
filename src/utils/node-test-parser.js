const TEST_LINE_REGEX = /^\s*(?:test|it|describe)(?:\.(?:skip|only))?\s*\(\s*(['"`])((?:\\.|(?!\1).)+)\1/;
const SPECIAL_CHARS_REGEX = /[.*+?^${}()|[\]\\]/g;
const ESCAPED_REPLACEMENT = String.raw`\$&`;

/**
 * Node.js test parser
 */
class NodeTestParser {
	findTestNameInLine(lineText) {
		if (!lineText) {
			return undefined;
		}

		const match = lineText.match(TEST_LINE_REGEX);
		if (!match) {
			return undefined;
		}

		return match[2];
	}

	findTestsInDocument(documentText) {
		if (typeof documentText !== 'string') {
			return [];
		}

		const lines = documentText.split(/\r?\n/);
		const tests = [];
		for (const [index, lineText] of lines.entries()) {
			const testName = this.findTestNameInLine(lineText);
			if (testName) {
				tests.push({line: index, name: testName});
			}
		}

		return tests;
	}

	escapeForRegex(text) {
		return text.replaceAll(SPECIAL_CHARS_REGEX, ESCAPED_REPLACEMENT);
	}

	buildExactTestPattern(testName) {
		return `^${this.escapeForRegex(testName)}$`;
	}
}

const nodeTestParser = new NodeTestParser();
export default nodeTestParser;
