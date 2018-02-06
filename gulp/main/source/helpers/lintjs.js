/**
 * Lint a JS file.
 *
 * --file <string>
 *     The JS file to lint.
 *
 * $ gulp lintjs --file ./gulpfile.js
 *     Lint ./gulpfile.js.
 */
gulp.task("lintjs", function(done) {
	// Run yargs.
	var __flags = yargs.option("file", {
		type: "string"
		// demandOption: true
	}).argv;

	// Get flag values.
	var file = __flags.file;

	// When no file is provided print an error.
	if (!file) {
		print.gulp.error("Provide a file to lint.");
		return done();
	}

	// Don't search for a config file. A config object will be supplied.
	$.jshint.lookup = false;

	pump(
		[
			gulp.src(file, {
				cwd: $paths.basedir
			}),
			$.debug(),
			$.jshint($configs.jshint),
			$.jshint.reporter("jshint-stylish")
		],
		done
	);
});
