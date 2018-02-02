/**
 * Lint a JS file.
 *
 * Flags
 *
 * -f, --file
 *     <string>  The JS file to lint.
 *
 * Usage
 *
 * $ gulp lintjs --file ./gulpfile.js
 *     Lint gulpfile.js
 *
 */
gulp.task("lintjs", function(done) {
	// Run yargs.
	var __flags = yargs.option("file", {
		alias: "f",
		type: "string",
		demandOption: true
	}).argv;
	// Get the command line arguments from yargs.
	var file = __flags.f || __flags.file || "";

	// Don't search for a config file as a config object will be supplied
	// instead.
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
