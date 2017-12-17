/**
 * node-cmd returns the output of the ran command. However, the returned
 *     string is only the bare string and has any previously applied
 *     highlighting removed. This function adds the removed highlighting.
 *
 * @param  {string} string - The string to highlight.
 * @return {string} The highlighted string.
 */
function cli_highlight(string) {
	// remove unneeded lines
	var output = string.trim().split("\n");
	output = output.filter(function(line) {
		return !-~line.indexOf("] Using gulpfile");
	});
	// turn back to string
	output = output.join("\n");

	// color the gulp timestamps
	output = output.replace(/\[([\d:]+)\]/g, "[" + chalk.gray("$1") + "]");

	// color task names
	output = output.replace(
		/(Finished|Starting) '(.+)'/g,
		"$1 '" + chalk.cyan("$2") + "'"
	);

	// color task times
	output = output.replace(/(after) (.+)/g, "$1 " + chalk.magenta("$2"));

	// color file path lines
	output = output.replace(
		/(─ )(\d+)(\s+=>\s+)([^\s]+)(\s)(\d+(.\d+)? \w+)/g,
		"$1" +
			chalk.green("$2") +
			"$3" +
			chalk.magenta("$4") +
			"$5" +
			chalk.blue("$6")
	);
	// color final items count

	output = output.replace(/(\d+ items?)/g, chalk.green("$1"));
	// color symbols
	output = output.replace(/(✎)/g, chalk.yellow("$1"));
	output = output.replace(/(🗑)/g, chalk.red("$1"));

	return output;
}
