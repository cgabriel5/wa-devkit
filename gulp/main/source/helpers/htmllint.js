/**
 * Run htmllint on a file.
 *
 * Flags
 *
 * -f, --file
 *     <string>  The HTML file to lint.
 *
 * Usage
 *
 * $ gulp hlint --file ./index.html
 *     Lint ./index.html
 *
 */
gulp.task("hlint", function(done) {
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
			filepath = path.relative(process.cwd(), filepath);
			issues.forEach(function(issue) {
				// make sure the first letter is always capitalized
				var first_letter = issue.msg[0];
				issue.msg = first_letter.toUpperCase() + issue.msg.slice(1);
				log(
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
				cwd: $paths.base
			}),
			$.debug({ loader: false }),
			$.htmllint({ rules: $configs.htmllint }, reporter)
		],
		done
	);
});
