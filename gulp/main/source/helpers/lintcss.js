/**
 * Lint a CSS file.
 *
 * Flags
 *
 * -f, --file
 *     <string>  The CSS file to lint.
 *
 * Usage
 *
 * $ gulp lintcss --file ./css/bundles/vendor.css
 *     Lint ./css/bundles/vendor.css
 *
 */
gulp.task("lintcss", function(done) {
	// Run yargs.
	var __flags = yargs.option("file", {
		alias: "f",
		type: "string",
		demandOption: true
	}).argv;
	// Get the command line arguments from yargs.
	var file = __flags.f || __flags.file || "";

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
