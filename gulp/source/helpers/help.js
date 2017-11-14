/**
 * Provides Gulp task documentation (this documentation).
 *
 * Options
 *
 * (no options)   --------   List tasks and their descriptions.
 * --verbose      [boolean]  Flag indicating whether to show all documentation.
 * -n, --name     [string]   Names of tasks to show documentation for.
 *
 * Usage
 *
 * $ gulp help # Show list of tasks and their descriptions.
 * $ gulp help --verbose # Show all documentation for all tasks.
 * $ gulp help --name "open default dependency" # Show documentation for specific tasks.
 */
gulp.task("help", function() {
	var task = this;
	// run yargs
	var _args = yargs.option("name", {
		alias: "n",
		default: false,
		describe: "Name of task to show documentation for.",
		type: "string"
	}).argv;
	var task_name = _args.n || _args.name;
	// contain printer in a variable rather than an anonymous function
	// to attach the provided task_name for later use. this is a bit hacky
	// but its a workaround to provide the name.
	var printer = function(tasks, verbose) {
		// custom print function
		var task_name = this.task_name;
		if (task_name) {
			// custom sort
			// split into an array
			var names = task_name.trim().split(/\s+/);
			// add the help task to always show it
			names.push("help");
			// set verbose to true to show all documentation
			verbose = true;
			// turn all but the provided task name to internal
			// this will essentially "hide" them from being printed
			tasks.tasks.forEach(function(item) {
				// if (item.name !== task_name) {
				if (!-~names.indexOf(item.name)) {
					item.comment.tags = [
						{
							name: "internal",
							value: true
						}
					];
				}
			});
		}
		tasks = tasks.filterHidden(verbose).sort();
		// filter will change the documentation header in the print_tasks function
		var filter = task_name ? true : false;
		return print_tasks(tasks, verbose, filter);
	};
	// attach the task name to the printer function
	printer.task_name = task_name;
	// re-assign the printer as the "this" to have access to the task name
	// within the function (printer) itself
	printer = printer.bind(printer);
	gulp.help({
		print: printer
	})(task);
});
