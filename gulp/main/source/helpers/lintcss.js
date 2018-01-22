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
	// run yargs
	var _args = yargs.option("file", {
		alias: "f",
		type: "string",
		demandOption: true
	}).argv;
	// get the command line arguments from yargs
	var file = _args.f || _args.file || "";

	// get the stylish logger
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