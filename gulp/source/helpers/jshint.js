/**
 * task: jshint
 * Add/remove front-end dependencies.
 *
 *
 * Notes
 *
 * • Dependencies are grabbed from ./node_modules/<name> and moved
 *   to its corresponding ./<type>/vendor/ folder.
 *
 * Flags
 *
 * -f, --file
 *     <string>  The JS file to lint.
 *
 * Usage
 *
 * $ gulp jshint --file ./gulpfile.main.js
 *     Lint gulpfile.main.js
 *
 */
gulp.task("jshint", function(done) {
	// run yargs
	var _args = yargs.option("file", {
		alias: "f",
		type: "string",
		demandOption: true
	}).argv;
	// get the command line arguments from yargs
	var file = _args.f || _args.file || "";

	pump(
		[
			gulp.src(file, {
				cwd: $paths.base
			}),
			$.debug(),
			$.jshint($paths.config_jshint),
			$.jshint.reporter("jshint-stylish")
		],
		done
	);
});
