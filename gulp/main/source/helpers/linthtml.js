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
	// Run yargs.
	var __flags = yargs.option("file", {
		alias: "f",
		type: "string",
		demandOption: true
	}).argv;
	// Get the command line arguments from yargs.
	var file = __flags.f || __flags.file || "";

	function reporter(filepath, issues) {
		if (issues.length) {
			filepath = path.relative($paths.cwd, filepath);
			issues.forEach(function(issue) {
				// Make sure the first letter is always capitalized.
				var first_letter = issue.msg[0];
				issue.msg = first_letter.toUpperCase() + issue.msg.slice(1);

				// Try to print in the style of other linters.
				print.ln();
				print(chalk.underline(filepath));
				print(
					" ",
					chalk.white(`line ${issue.line} char ${issue.column}`),
					chalk.blue(`(${issue.code})`),
					chalk.yellow(`${issue.msg}.`)
				);
				print.ln();
			});

			print(`    ${chalk.yellow("⚠")}  ${issues.length} warning(s)`);
			print.ln();

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
