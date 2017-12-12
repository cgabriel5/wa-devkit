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
	// run yargs
	var _args = yargs.option("line-ending", {
		alias: "l",
		demandOption: false,
		type: "string"
	}).argv;
	// get the command line arguments from yargs
	var ending = _args.l || _args["line-ending"] || EOL_ENDING;

	// check:
	// HTML, CSS, JS, JSON, TXT, TEXT, and MD files.
	// exclude files containing a ".min." as this is the convention used
	// for minified files. the node_modules/, .git/, img/ files are also
	// excluded.
	var files = [
		$paths.files_code,
		$paths.not_min,
		bangify($paths.img_source),
		bangify(globall($paths.node_modules_name)),
		bangify(globall($paths.git))
	];

	// get needed files
	pump(
		[
			gulp.src(files, {
				dot: true,
				base: $paths.base_dot
			}),
			$.sort(opts_sort),
			$.eol(ending),
			$.debug.edit(),
			gulp.dest($paths.base)
		],
		done
	);
});
