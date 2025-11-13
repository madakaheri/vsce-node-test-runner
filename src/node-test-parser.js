const TEST_LINE_REGEX = /^\s*(?:test|it|describe)(?:\.(?:skip|only))?\s*\(\s*(['"`])((?:\\.|(?!\1).)+)\1/;
const SPECIAL_CHARS_REGEX = /[.*+?^${}()|[\]\\]/g;
const ESCAPED_REPLACEMENT = String.raw`\$&`;

function findTestNameInLine(lineText) {
	if (!lineText) {
		return undefined;
	}

	const match = lineText.match(TEST_LINE_REGEX);
	if (!match) {
		return undefined;
	}

	return match[2];
}

function findTestsInDocument(documentText) {
	if (typeof documentText !== 'string') {
		return [];
	}

	const lines = documentText.split(/\r?\n/);
	const tests = [];
	for (const [index, lineText] of lines.entries()) {
		const testName = findTestNameInLine(lineText);
		if (testName) {
			tests.push({line: index, name: testName});
		}
	}

	return tests;
}

function escapeForRegex(text) {
	return text.replaceAll(SPECIAL_CHARS_REGEX, ESCAPED_REPLACEMENT);
}

function buildExactTestPattern(testName) {
	return `^${escapeForRegex(testName)}$`;
}

export {findTestNameInLine, findTestsInDocument, buildExactTestPattern};
