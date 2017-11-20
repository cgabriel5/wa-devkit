"use strict";

var os = require("os");
var path = require("path");

var path_offset = "../../../";
var modules_path = path_offset + "node_modules/";

var url = require(modules_path + "url-parse");
var gulp = require(modules_path + "gulp");
var notifier = require(modules_path + "node-notifier");
var format_date = require(modules_path + "dateformat");
var gutil = require(modules_path + "gulp-util");
var log = gutil.log;
var chalk = gutil.colors;

/**
 * Detects the default Google Chrome browser based on OS. Falls
 *     back to "firefox".
 *
 * @link [https://github.com/stevelacy/gulp-open]
 * @return {string} The browser name.
 */
var browser = function() {
	var platform = os.platform();
	// linux (else) darwin (else) windows (else) firefox
	return platform === "linux"
		? "google-chrome"
		: platform === "darwin"
			? "google chrome"
			: platform === "win32" ? "chrome" : "firefox";
};

/**
 * Creates a Gulp like time formated, colored string.
 *
 * @return {string} The time formated, colored, Gulp like string.
 */
var time = function() {
	// return the formated/colored time
	return "[" + chalk.gray(format_date(new Date(), "HH:MM:ss")) + "]";
};

/**
 * Creates an OS notifcation.
 *
 * @param {string} message - The notifcation message to display.
 * @param {boolean} error - Flag indicating what image to use.
 * @return {undefined} Nothing.
 */
var notify = function(message, error) {
	// determine what image to show
	var image = (!error ? "success" : "error") + "_256.png";
	// OS agnostic
	notifier.notify({
		title: "Gulp",
		message: message,
		icon: path.join(__dirname, "../img/node-notifier/" + image),
		sound: true
	});
};

/**
 * Modifies Gulp by adding a currentTask.name property. To access in a task.
 *
 * @param {object} gulp - Gulp itself.
 * @return {object} Modified Gulp.
 */
var current_task = function(gulp) {
	// Get the current task name inside task itself
	// [http://stackoverflow.com/a/27535245]
	gulp.Gulp.prototype.__runTask = gulp.Gulp.prototype._runTask;
	gulp.Gulp.prototype._runTask = function(task) {
		this.__wadevkit = {
			debug: {
				names: {
					full: task.name,
					short: task.name.replace(/^(helper|task)\-/, "")
				}
			}
		};
		this.__runTask(task);
	};
	return gulp;
};

/**
 * Builds the project "localhost" URL.
 *
 * @param {object} params - The parameters used to build the URL.
 * @return {string} The URL.
 */
var uri = function(params) {
	// get provided arguments
	var appdir = params.appdir;
	var filepath = params.filepath;
	var port = params.port;
	var https = params.https;

	// build url to open on
	var scheme = "http" + (https ? "s" : "") + "://";
	var parsed = new url(scheme + appdir);
	parsed.set("port", port);
	parsed.set("pathname", path.join(parsed.pathname, filepath));

	return parsed.href;
};

/**
 * Formats template with provided data object.
 *
 * @param {string} template - The template to use.
 * @param {object} data - The object containing the data to replace
 *     placeholders with.
 * @return {undefined} Nothing.
 */
var format = function(template, data) {
	return template.replace(/\{\{\#(.*?)\}\}/g, function(match) {
		match = match.replace(/^\{\{\#|\}\}$/g, "");
		return data[match] ? data[match] : match;
	});
};

/**
 * Add a bang to the start of the string.
 *
 * @param {string} string - The string to add the bang to.
 * @return {string} The new string with bang added.
 */
var bangify = function(string) {
	return "!" + (string || "");
};

/**
 * Appends the "**" pattern to string.
 *
 * @param {string} string - The string to add pattern to.
 * @return {string} The new string with added pattern.
 */
var globall = function(string) {
	return (string || "") + "**";
};

/**
 * Returns the provided file's extension or checks it against the provided
 *     extension type.
 *
 * @param {object} file - The Gulp file object.
 * @param {array} types - The optional extension type(s) to check against.
 * @return {string|boolean} - The file's extension or boolean indicating
 *     compare result.
 */
var ext = function(file, types) {
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
};

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

/**
 * Recursively fill-in the placeholders in each path contained
 *     in the provided paths object.
 *
 * @param {object} $paths - Object containing the paths.
 * @return {object} - The object with paths filled-in.
 */
var expand_paths = function($paths) {
	// path placeholders substitutes. these paths will also get added to the
	// paths object after substitution down below.
	var paths_subs_ = {
		// paths::BASES
		del: "/",
		base: "./",
		base_dot: ".",
		homedir: ""
	};

	var replacer = function(match) {
		var replacement = paths_subs_[match.replace(/^\$\{|\}$/g, "")];
		return replacement !== undefined ? replacement : undefined;
	};
	// recursively replace all the placeholders
	for (var key in $paths) {
		if ($paths.hasOwnProperty(key)) {
			var __path = $paths[key];

			// find all the placeholders
			while (/\$\{.*?\}/g.test(__path)) {
				__path = __path.replace(/\$\{.*?\}/g, replacer);
			}
			// reset the substituted string back in the $paths object
			$paths[key] = __path;
		}
	}

	// add the subs to the paths object
	for (var key in paths_subs_) {
		if (paths_subs_.hasOwnProperty(key)) {
			$paths[key] = paths_subs_[key];
		}
	}

	// filled-in paths
	return $paths;
};

// gulp-sort custom sort function
var opts_sort = {
	// sort based on dirname alphabetically
	comparator: function(file1, file2) {
		var dir1 = path.dirname(file1.path);
		var dir2 = path.dirname(file2.path);
		if (dir1 > dir2) return 1;
		if (dir1 < dir2) return -1;
		return 0;
	}
};

// export functions
exports.browser = browser();
exports.time = time;
exports.log = log;
exports.notify = notify;
exports.gulp = current_task(gulp);
exports.uri = uri;
exports.format = format;
exports.bangify = bangify;
exports.globall = globall;
exports.ext = ext;
exports.expand_paths = expand_paths;
exports.opts_sort = opts_sort;
