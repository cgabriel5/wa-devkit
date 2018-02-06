/**
 * Lint a CSS file.
 *
 * --file <string>
 *     The CSS file to lint.
 *
 * $ gulp lintcss --file ./css/bundles/vendor.css
 *     Lint ./css/bundles/vendor.css.
 */
gulp.task("lintcss", function(done) {
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

	// Get the stylish logger.
	var stylish = require("csslint-stylish");

	pump(
		[
			gulp.src(file, {
				cwd: $paths.basedir
			}),
			$.debug(),
			$.csslint($configs.csslint),
			$.csslint.formatter(stylish)
		],
		done
	);
});
