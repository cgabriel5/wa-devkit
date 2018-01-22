/**
 * Lint a HTML file.
 *
 * Flags
 *
 * -f, --file
 *     <string>  The HTML file to lint.
 *
 * Usage
 *
 * $ gulp linthtml --file ./index.html
 *     Lint ./index.html
 *
 */
gulp.task("linthtml", function(done) {
	// run yargs
	var _args = yargs.option("file", {
		alias: "f",
		type: "string",
		demandOption: true
	}).argv;
	// get the command line arguments from yargs
	var file = _args.f || _args.file || "";

	function reporter(filepath, issues) {
		if (issues.length) {
			filepath = path.relative($paths.cwd, filepath);
			issues.forEach(function(issue) {
				// make sure the first letter is always capitalized
				var first_letter = issue.msg[0];
				issue.msg = first_letter.toUpperCase() + issue.msg.slice(1);
				print.gulp(
					chalk.magenta(filepath),
					chalk.white(`line ${issue.line} char ${issue.column}`),
					chalk.blue(`(${issue.code})`),
					chalk.yellow(`${issue.msg}`)
				);
			});

			process.exitCode = 1;
		}
	}

	pump(
		[
			gulp.src(file, {
				cwd: $paths.basedir
			}),
			$.debug({ loader: false }),
			$.htmllint({ rules: $configs.htmllint }, reporter)
		],
		done
	);
});