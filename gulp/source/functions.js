/**
 * @description [Opens the provided file in the user's browser.]
 * @param  {String}   filepath  [The path of the file to open.]
 * @param  {Number}   port     	[The port to open on.]
 * @param  {Function} callback  [The Gulp task callback to run.]
 * @param  {Object} task  		[The Gulp task.]
 * @return {Undefined}          [Nothing is returned.]
 */
function open_file_in_browser(filepath, port, callback, task) {
	pump(
		[
			gulp.src(filepath, {
				cwd: __PATHS_BASE,
				dot: true
			}),
			$.open({
				app: browser,
				uri: uri({
					appdir: APPDIR,
					filepath: filepath,
					port: port,
					https: config_gulp_plugins.open.https
				})
			})
			// modify debug to take a flag to skip the use of the cli-spinner
			// $.debug()
		],
		function() {
			notify("File opened!");
			callback();
		}
	);
}

/**
 * @description [Print that an active Gulp instance exists.]
 * @return {Undefined} 			[Nothing is returned.]
 */
function gulp_check_warn() {
	log(
		chalk.red(
			"Task cannot be performed while Gulp is running. Close Gulp then try again."
		)
	);
}

/**
 * @description [Render output from tasks.]
 * @param {TaskList} tasks 			[The Gulp tasks.]
 * @param {Boolean}  verbose=false  [Flag indicating whether to show hide tasks with the verbose flag.]
 * @returns {String} [The text to print.]
 * @source [https://github.com/megahertz/gulp-task-doc/blob/master/lib/printer.js]
 */
function print_tasks(tasks, verbose, filter) {
	tasks = tasks.filterHidden(verbose).sort();

	// determine the header
	var header = filter ? "Filtered" : "Tasks";
	var results = ["", chalk.underline.bold(header), ""];
	var help_doc = ["", chalk.underline.bold("Help"), ""];

	var field_task_len = tasks.getLongestNameLength();

	tasks.forEach(function(task) {
		// help task will always be placed before all other tasks
		// to always have its documentation present.
		var is_help_task = task.name === "help";
		// determine the correct array to reference
		var array_ref = is_help_task ? help_doc : results;

		var comment = task.comment || {};
		var lines = comment.lines || [];

		array_ref.push(
			format_column(task.name, field_task_len) + (lines[0] || "")
		);
		// only print verbose documentation when flag is provided
		if (verbose || is_help_task) {
			for (var i = 1; i < lines.length; i++) {
				array_ref.push(
					format_column("", field_task_len) + "  " + lines[i]
				);
				if (verbose && i === lines.length - 1) array_ref.push("\n");
			}
		}
	});

	if (!verbose) results.push("\n");

	return help_doc.concat(results).join("\n");
}

/**
 * @description [Return a text surrounded by space.]
 * @param {String} text
 * @param {Number} width	   [Width Column width without offsets.]
 * @param {Number} offset_left  [Space count before text.]
 * @param {Number} offset_right [Space count after text.]
 * @returns {String} [The formated text.]
 * @source [https://github.com/megahertz/gulp-task-doc/blob/master/lib/printer.js]
 */
function format_column(text, width, offset_left, offset_right) {
	offset_left = undefined !== offset_left ? offset_left : 3;
	offset_right = undefined !== offset_right ? offset_right : 3;
	return (
		new Array(offset_left + 1).join(" ") +
		chalk.magenta(text) +
		new Array(Math.max(width - text.length, 0) + 1).join(" ") +
		new Array(offset_right + 1).join(" ")
	);
}

/**
 * @description [Add a bang to the start of the string.]
 * @param  {String} string [The string to add the bang to.]
 * @return {String}        [The new string with bang added.]
 */
function bangify(string) {
	return "!" + (string || "");
}

/**
 * @description [Appends the ** pattern to string.]
 * @param  {String} string [The string to add pattern to.]
 * @return {String}        [The new string with added pattern.]
 */
function globall(string) {
	return (string || "") + "**";
}

/**
 * @description [Returns the provided file's extension or checks it against the provided extension type.]
 * @param  {Object} file [The Gulp file object.]
 * @param  {Array} types [The optional extension type(s) to check against.]
 * @return {String|Boolean}      [The file's extension or boolean indicating compare result.]
 */
function ext(file, types) {
	// when no file exists return an empty string
	if (!file) return "";

	// get the file extname
	var extname = path
		.extname(file.path)
		.toLowerCase()
		.replace(/^\./, "");

	// simply return the extname when no type is
	// provided to check against.
	if (!types) return extname;

	// else when a type is provided check against it
	return Boolean(-~types.indexOf(extname));
}

// check for the usual file types
ext.ishtml = function(file) {
	return ext(file, ["html"]);
};
ext.iscss = function(file) {
	return ext(file, ["css"]);
};
ext.isjs = function(file) {
	return ext(file, ["js"]);
};
ext.isjson = function(file) {
	return ext(file, ["json"]);
};
