/**
 * Lint a HTML file.
 *
 * -F, --file <string>
 *     The HTML file to lint.
 *
 * $ gulp linthtml --file ./index.html
 *     Lint ./index.html.
 */
gulp.task("linthtml", function(done) {
	var table = require("text-table");
	var strip_ansi = require("strip-ansi");

	// Run yargs.
	var __flags = yargs.option("file", {
		alias: "F",
		type: "string"
		// demandOption: true
	}).argv;

	// Get flag values.
	var file = __flags.F || __flags.file;

	// When no file is provided print an error.
	if (!file) {
		print.gulp.error("Provide a file to lint.");
		return done();
	}

	/**
	 * Custom htmllint plugin reporter. The function tries to mimic
	 *     other popular linter reporter outputs.
	 *
	 * @param  {string} filepath - The file path of linted file.
	 * @param  {array} issues - Array containing issues in objects.
	 * @return {undefined} - Nothing.
	 */
	function reporter(filepath, issues) {
		// Make the file path relative.
		filepath = path.relative($paths.cwd, filepath);

		print.ln();
		print(chalk.underline(filepath));

		// Print issues.
		if (issues.length) {
			var __issues = [];

			// Loop over all issues and print them.
			issues.forEach(function(issue) {
				// Make sure the first letter is always capitalized.
				var first_letter = issue.msg[0];
				issue.msg = first_letter.toUpperCase() + issue.msg.slice(1);

				// Try to print in the style of other linters.
				__issues.push([
					"",
					chalk.gray(`line ${issue.line}`),
					chalk.gray(`char ${issue.column}`),
					chalk.blue(`(${issue.code})`),
					chalk.yellow(`${issue.msg}.`)
				]);
			});

			print(
				table(__issues, {
					// Remove ansi color to get the string length.
					stringLength: function(string) {
						return strip_ansi(string).length;
					}
				})
			);

			print.ln();

			// Make the warning plural if needed.
			var warning = "warning";
			if (issues.length !== 1) warning += "s";

			print(`  ${chalk.yellow("⚠")}  ${issues.length} ${warning}`);
			print.ln();
		} else {
			// No issues found.
			print.ln();
			print(`  ${chalk.yellow("⚠")}  0 warnings`);
			print.ln();
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
