/**
 * node-cmd returns the output of the ran command. However, the returned
 *     string is only the bare string and has any previously applied
 *     highlighting removed. This function adds the removed highlighting.
 *
 * @param  {string} string - The string to highlight.
 * @return {string} - The highlighted string.
 */
function cli_highlight(string) {
	// Prepare the string.
	var output = string.trim().split("\n");

	// Remove unneeded lines.
	output = output.filter(function(line) {
		return !-~line.indexOf("] Using gulpfile");
	});

	// Turn back to string.
	output = output.join("\n");

	// Coloring starts here...

	// Color the gulp timestamps.
	output = output.replace(/\[([\d:]+)\]/g, "[" + chalk.gray("$1") + "]");

	// Color task names.
	output = output.replace(
		/(Finished|Starting) '(.+)'/g,
		"$1 '" + chalk.cyan("$2") + "'"
	);

	// Color task times.
	output = output.replace(/(after) (.+)/g, "$1 " + chalk.magenta("$2"));

	// Color file path lines.
	output = output.replace(
		/(─ )(\d+)(\s+=>\s+)([^\s]+)(\s)(\d+(.\d+)? \w+)/g,
		"$1" +
			chalk.green("$2") +
			"$3" +
			chalk.magenta("$4") +
			"$5" +
			chalk.blue("$6")
	);

	// Color final items count.
	output = output.replace(/(\d+ items?)/g, chalk.green("$1"));

	// Color symbols.
	output = output.replace(/(✎)/g, chalk.yellow("$1"));
	output = output.replace(/(🗑)/g, chalk.red("$1"));

	// Return the colored output.
	return output;
}
