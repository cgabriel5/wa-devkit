/**
 * Correct file line endings.
 *
 * Flags
 *
 * -l, --line-ending
 *     [string] The type of line ending to use. Defauls to "\n".
 *
 * Usage
 *
 * $ gulp eol
 *     Check file line endings.
 *
 * $ gulp eol --line-ending "\n"
 *     Enforce "\n" line endings.
 */
gulp.task("eol", function(done) {
	// Run yargs.
	var __flags = yargs.option("line-ending", {
		alias: "l",
		type: "string"
	}).argv;

	// Get the command line arguments from yargs.
	var ending = __flags.l || __flags["line-ending"] || EOL_ENDING;

	// Check: HTML, CSS, JS, JSON, TXT, TEXT, and MD files. They also
	// exclude files containing a ".min." as this is the convention used
	// for minified files. The node_modules/, .git/, and all vendor/
	// files are also excluded.
	var files = [
		$paths.files_code,
		$paths.not_min,
		bangify($paths.img_source),
		bangify(globall($paths.node_modules_name)),
		bangify(globall($paths.git))
	];

	// Get needed files.
	pump(
		[
			gulp.src(files, {
				dot: true,
				base: $paths.dot
			}),
			$.sort(opts_sort),
			$.eol(ending),
			$.debug.edit(),
			gulp.dest($paths.basedir)
		],
		done
	);
});
