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
	// run yargs
	var _args = yargs.option("file", {
		alias: "f",
		type: "string",
		demandOption: true
	}).argv;
	// get the command line arguments from yargs
	var file = _args.f || _args.file || "";

	// don't search for a config file as a config object will be
	// supplied instead.
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