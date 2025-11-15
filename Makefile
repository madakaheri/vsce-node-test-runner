pack:
	vsce package

publish:
	vsce publish

fix:
	npx xo --fix src/**/*.js