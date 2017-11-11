//#! requires.js -- ./gulp/source/requires.js

"use strict";

// node modules
var fs = require("fs");
var path = require("path");

// lazy load gulp plugins
var $ = require("gulp-load-plugins")({
	rename: {
		"gulp-if": "gulpif",
		"gulp-markdown": "marked",
		"gulp-purifycss": "purify",
		"gulp-clean-css": "clean_css",
		"gulp-json-sort": "json_sort",
		"gulp-jsbeautifier": "beautify",
		"gulp-minify-html": "minify_html",
		"gulp-prettier-plugin": "prettier",
		"gulp-inject-content": "injection",
		"gulp-real-favicon": "real_favicon",
		"gulp-strip-json-comments": "strip_jsonc"
	},
	postRequireTransforms: {
		json_sort: function(plugin) {
			return plugin.default;
		},
		uglify: function(plugin) {
			// [https://stackoverflow.com/a/45554108]
			// By default es-uglify is used to uglify JS.
			var uglifyjs = require("uglify-es");
			var composer = require("gulp-uglify/composer");
			return composer(uglifyjs, console);
		}
	}
});

// universal modules
var del = require("del");
var pump = require("pump");
var yargs = require("yargs");
var chalk = require("chalk");
var dir = require("node-dir");
var mkdirp = require("mkdirp");
var fe = require("file-exists");
var json = require("json-file");
var jsonc = require("comment-json");
var de = require("directory-exists");
var sequence = require("run-sequence");
var browser_sync = require("browser-sync");
var bs_autoclose = require("browser-sync-close-hook");

//#! paths.js -- ./gulp/source/paths.js

//  get the paths
var __paths__ = jsonc.parse(
	fs.readFileSync(`./configs/paths.cm.json`).toString(),
	null,
	true
);

// path placeholders substitutes. these paths will also get added to the
// paths object after substitution down below.
var __paths_subs__ = {
	// paths::BASES
	del: "/",
	base: "./",
	base_dot: ".",
	dirname: __dirname,
	cwd: process.cwd(),
	homedir: "" // "assets/"
};

// recursively replace all the placeholders
for (var key in __paths__) {
	if (__paths__.hasOwnProperty(key)) {
		var __path = __paths__[key];
		// find all the placeholders
		while (/\$\{.*?\}/g.test(__path)) {
			__path = __path.replace(/\$\{.*?\}/g, function(match) {
				var replacement =
					__paths_subs__[match.replace(/^\$\{|\}$/g, "")];
				return replacement !== undefined ? replacement : undefined;
			});
		}
		// reset the substituted string back in the __paths__ object
		__paths__[key] = __path;
	}
}

// add the subs to the paths object
for (var key in __paths_subs__) {
	if (__paths_subs__.hasOwnProperty(key)) {
		__paths__[key] = __paths_subs__[key];
	}
}

//#! vars.js -- ./gulp/source/vars.js

// dynamic configuration files (load via json-file to modify later)
var config_internal = json.read(__paths__.config_internal);

// static configuration files (just need to read file)
var config_settings = jsonc.parse(
	fs.readFileSync(__paths__.config_settings).toString()
);

// get each individually files settings from the consolidated settings file
var config_bundles = config_settings[__paths__.config_bundles];
var config_jsbeautify = config_settings[__paths__.config_jsbeautify];
var config_prettier = config_settings[__paths__.config_prettier];
var config_perfectionist = config_settings[__paths__.config_perfectionist];
var config_modernizr = config_settings[__paths__.config_modernizr];
var config_app = config_settings[__paths__.config_app];

// plugin options
var opts_ap = config_settings[__paths__.config_autoprefixer];
var opts_bs = config_settings[__paths__.config_browsersync];
var opts_ffp = config_settings[__paths__.config_findfreeport];
var json_format = config_settings[__paths__.config_json_format];
var json_spaces = json_format.indent_size;

// bundles
var bundle_html = config_bundles.html;
var bundle_css = config_bundles.css;
var bundle_js = config_bundles.js;
var bundle_img = config_bundles.img;
var bundle_gulp = config_bundles.gulp;
var bundle_dist = config_bundles.dist;
var bundle_lib = config_bundles.lib;

// app directory information
var INDEX = config_app.index;
var BASE = config_app.base;
var ROOTDIR = path.basename(path.resolve(__paths__.dirname)) + "/";
var APPDIR = BASE + ROOTDIR;

// internal information
var APPTYPE = config_internal.get("apptype");

// project utils
var utils = require(__paths__.gulp_utils);
var color = utils.color;
var log = utils.log;
var time = utils.time;
var notify = utils.notify;
var gulp = utils.gulp;
var uri = utils.uri;
var browser = utils.browser;

// create browsersync server
var bs = browser_sync.create(opts_bs.server_name);

// get current branch name
var branch_name;

// remove options
var opts_remove = {
	read: false,
	cwd: __paths__.base
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

//#! injection.js -- ./gulp/source/injection.js

// HTML injection variable object
var html_injection = {
	css_bundle_app: __paths__.css_bundles + bundle_css.source.names.main,
	css_bundle_vendor: __paths__.css_bundles + bundle_css.vendor.names.main,
	js_bundle_app: __paths__.js_bundles + bundle_js.source.names.main,
	js_bundle_vendor: __paths__.js_bundles + bundle_js.vendor.names.main
};

//#! functions.js -- ./gulp/source/functions.js

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
				cwd: __paths__.base,
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

//#! init.js -- ./gulp/source/tasks/init.js

// when gulp is closed, either on error, crash, or intentionally, do a quick cleanup
require("node-cleanup")(function(exit_code, signal) {
	var alphabetize = require("alphabetize-object-keys");

	// check for current Gulp process
	var pid = config_internal.get("pid");

	// only perform this cleanup when the Gulp instance is closed.
	// when any other task is run the cleanup should not be done.
	// [https://www.gnu.org/software/libc/manual/html_node/Termination-Signals.html]

	if (pid && signal) {
		// Gulp instance exists so cleanup
		// clear gulp internal configuration keys
		config_internal.set("pid", null);
		config_internal.set("ports", null);
		config_internal.data = alphabetize(config_internal.data);
		config_internal.writeSync(null, json_spaces);
		// cleanup vars, process
		branch_name = undefined;
		if (bs) bs.exit();
		if (process) {
			process.exit();
			if (signal) process.kill(pid, signal);
		}
		cleanup.uninstall(); // don't call cleanup handler again
		return false;
	}
});

// update the status of gulp to active. this will write the current gulp
// process id to the internal gulp configuration file. this is done to
// prevent another Gulp instance from being opened.
// @internal
gulp.task("init:save-pid", function(done) {
	config_internal.set("pid", process.pid); // set the status
	config_internal.write(
		function() {
			// save changes to file
			done();
		},
		null,
		json_spaces
	);
});

// watch for git branch changes:
// branch name checks are done to check whether the branch was changed after
// the gulp command was used. this is done as when switching branches files
// and file structure might be different. this can cause some problems with
// the watch tasks and could perform gulp tasks when not necessarily wanted.
// to resume gulp simply restart with the gulp command.
// @internal
gulp.task("init:watch-git-branch", function(done) {
	var git = require("git-state");

	git.isGit(__paths__.dirname, function(exists) {
		// if no .git exists simply ignore and return done
		if (!exists) return done();
		git.check(__paths__.dirname, function(err, result) {
			if (err) throw err;
			// record branch name
			branch_name = result.branch;
			// set the gulp watcher as .git exists
			gulp.watch(
				[__paths__.githead],
				{
					cwd: __paths__.base,
					dot: true
				},
				function() {
					var brn_current = git.checkSync(__paths__.dirname).branch;
					if (branch_name)
						log(
							chalk.yellow("(pid:" + process.pid + ")"),
							"Gulp monitoring",
							chalk.green(branch_name),
							"branch."
						);
					if (brn_current !== branch_name) {
						// message + exit
						log(
							"Gulp stopped due to branch switch. (",
							chalk.green(branch_name),
							"=>",
							chalk.yellow(brn_current),
							")"
						);
						log(
							"Restart Gulp to monitor",
							chalk.yellow(brn_current),
							"branch."
						);
						process.exit();
					}
				}
			);
			done();
		});
	});
});

// build app files
// @internal
gulp.task("init:build", function(done) {
	var task = this;
	// get the gulp build tasks
	var tasks = bundle_gulp.tasks;
	// add callback to the sequence
	tasks.push(function() {
		notify("Build complete");
		done();
	});
	// apply the tasks and callback to sequence
	return sequence.apply(task, tasks);
});

/**
 * Runs Gulp. (builds project files, watches files, & runs browser-sync)
 *
 * Options
 *
 * -s, --stop  [boolean]  Flag indicating to stop Gulp.
 *
 * Usage
 *
 * $ gulp # Run Gulp.
 * $ gulp --stop # Stops active Gulp process, if running.
 */
gulp.task("default", function(done) {
	var find_free_port = require("find-free-port");

	var args = yargs.argv; // get cli parameters

	if (args.s || args.stop) {
		// end the running Gulp process

		// get pid, if any
		var pid = config_internal.get("pid");
		if (pid) {
			// kill the open process
			log(chalk.green("Gulp process stopped."));
			process.kill(pid);
		} else {
			// no open process exists
			log("No Gulp process exists.");
		}

		return done();
	} else {
		// start up Gulp like normal

		return find_free_port(
			opts_ffp.range.start,
			opts_ffp.range.end,
			opts_ffp.ip,
			opts_ffp.count,
			function(err, p1, p2) {
				// get pid, if any
				var pid = config_internal.get("pid");
				// if there is a pid present it means a Gulp instance has already started.
				// therefore, prevent another from starting.
				if (pid) {
					log(
						chalk.yellow(
							"A Gulp instance is already running",
							chalk.yellow("(pid:" + pid + ")") + ".",
							"Stop that instance before starting a new one."
						)
					);
					return done();
				}

				// store the ports
				config_internal.set("ports", {
					local: p1,
					ui: p2
				});

				// save ports
				config_internal.write(
					function() {
						// store ports on the browser-sync object itself
						bs.__ports__ = [p1, p2]; // [app, ui]
						// after getting the free ports, finally run the build task
						return sequence(
							"init:save-pid",
							"init:watch-git-branch",
							"init:build",
							"watch:main",
							function() {
								done();
							}
						);
					},
					null,
					json_spaces
				);
			}
		);
	}
});

//#! dist.js -- ./gulp/source/tasks/dist.js

// remove old dist / folder
// @internal
gulp.task("dist:clean", function(done) {
	var task = this;
	pump(
		[
			gulp.src(__paths__.dist_home, opts_remove),
			$.debug.clean(),
			$.clean()
		],
		done
	);
});

// copy new file/folders
// @internal
gulp.task("dist:favicon", function(done) {
	var task = this;
	pump(
		[
			gulp.src(bundle_dist.source.files.favicon, {
				dot: true,
				cwd: __paths__.base,
				// https://github.com/gulpjs/gulp/issues/151#issuecomment-41508551
				base: __paths__.base_dot
			}),
			$.debug(),
			gulp.dest(__paths__.dist_home),
			$.debug.edit()
		],
		done
	);
});

// @internal
gulp.task("dist:css", function(done) {
	var task = this;
	pump(
		[
			gulp.src(bundle_dist.source.files.css, {
				dot: true,
				cwd: __paths__.base,
				base: __paths__.base_dot
			}),
			$.debug(),
			$.gulpif(ext.iscss, $.clean_css()),
			gulp.dest(__paths__.dist_home),
			$.debug.edit()
		],
		done
	);
});

// @internal
gulp.task("dist:img", function(done) {
	var task = this;
	// need to copy hidden files/folders?
	// [https://github.com/klaascuvelier/gulp-copy/issues/5]
	pump(
		[
			gulp.src(bundle_dist.source.files.img, {
				dot: true,
				cwd: __paths__.base,
				base: __paths__.base_dot
			}),
			$.cache(
				$.imagemin([
					$.imagemin.gifsicle({
						interlaced: true
					}),
					$.imagemin.jpegtran({
						progressive: true
					}),
					$.imagemin.optipng({
						optimizationLevel: 5
					}),
					$.imagemin.svgo({
						plugins: [
							{
								removeViewBox: true
							}
						]
					})
				])
			),
			gulp.dest(__paths__.dist_home),
			$.debug.edit()
		],
		done
	);
});

// @internal
gulp.task("dist:js", function(done) {
	var task = this;
	pump(
		[
			gulp.src(bundle_dist.source.files.js, {
				dot: true,
				cwd: __paths__.base,
				base: __paths__.base_dot
			}),
			$.debug(),
			$.gulpif(ext.isjs, $.uglify()),
			gulp.dest(__paths__.dist_home),
			$.debug.edit()
		],
		done
	);
});

// @internal
gulp.task("dist:root", function(done) {
	var task = this;
	pump(
		[
			gulp.src(bundle_dist.source.files.root, {
				dot: true,
				cwd: __paths__.base,
				base: __paths__.base_dot
			}),
			$.debug(),
			$.gulpif(ext.ishtml, $.minify_html()),
			gulp.dest(__paths__.dist_home),
			$.debug.edit()
		],
		done
	);
});

/**
 * Build the dist/ folder. (only for webapp projects).
 *
 * Usage
 *
 * $ gulp dist # Create dist/ folder.
 */
gulp.task("dist", function(done) {
	var task = this;
	if (APPTYPE !== "webapp") {
		log("This helper task is only available for webapp projects.");
		return done();
	}
	// get the gulp build tasks
	var tasks = bundle_dist.tasks;
	// add callback to the sequence
	tasks.push(function() {
		notify("Distribution folder complete.");
		log("Distribution folder complete.");
		done();
	});
	// apply the tasks and callback to sequence
	return sequence.apply(task, tasks);
});

//#! lib.js -- ./gulp/source/tasks/lib.js

// remove old lib/ folder
// @internal
gulp.task("lib:clean", function(done) {
	var task = this;
	pump(
		[gulp.src(__paths__.lib_home, opts_remove), $.debug.clean(), $.clean()],
		done
	);
});

// @internal
gulp.task("lib:js", function(done) {
	var task = this;
	pump(
		[
			gulp.src(bundle_js.source.files, {
				nocase: true,
				cwd: __paths__.js_source
			}),
			// filter out all but test files (^test*/i)
			$.filter([__paths__.allfiles, __paths__.files_test]),
			$.debug(),
			$.concat(bundle_js.source.names.libs.main),
			$.prettier(config_prettier),
			gulp.dest(__paths__.lib_home),
			$.debug.edit(),
			$.uglify(),
			$.rename(bundle_js.source.names.libs.min),
			gulp.dest(__paths__.lib_home),
			$.debug.edit()
		],
		done
	);
});

/**
 * Build the lib/ folder. (only for library projects).
 *
 * Usage
 *
 * $ gulp lib # Create lib/ folder.
 */
gulp.task("lib", function(done) {
	var task = this;
	if (APPTYPE !== "library") {
		log("This helper task is only available for library projects.");
		return done();
	}
	// get the gulp build tasks
	var tasks = bundle_lib.tasks;
	// add callback to the sequence
	tasks.push(function() {
		notify("Library folder complete.");
		log("Library folder complete.");
		done();
	});
	// apply the tasks and callback to sequence
	return sequence.apply(task, tasks);
});

//#! watch.js -- ./gulp/source/tasks/watch.js

// watch for files changes
// @internal
gulp.task("watch:main", function(done) {
	// add auto tab closing capability to browser-sync. this will
	// auto close the used bs tabs when gulp closes.
	bs.use({
		plugin() {},
		hooks: {
			"client:js": bs_autoclose
		}
	});

	// start browser-sync
	bs.init(
		{
			browser: browser,
			proxy: uri({
				appdir: APPDIR,
				filepath: INDEX,
				https: config_gulp_plugins.open.https
			}), // "markdown/preview/README.html"
			port: bs.__ports__[0],
			ui: {
				port: bs.__ports__[1]
			},
			notify: false,
			open: true
		},
		function() {
			// gulp watcher paths
			var watch_paths = bundle_gulp.watch;

			// watch for any changes to HTML files
			gulp.watch(
				watch_paths.html,
				{
					cwd: __paths__.html_source
				},
				function() {
					return sequence("html:main");
				}
			);

			// watch for any changes to CSS Source files
			gulp.watch(
				watch_paths.css.source,
				{
					cwd: __paths__.css_source
				},
				function() {
					return sequence("css:app");
				}
			);

			// watch for any changes to CSS Lib files
			gulp.watch(
				watch_paths.css.vendor,
				{
					cwd: __paths__.css_vendor
				},
				function() {
					return sequence("css:vendor");
				}
			);

			// watch for any changes to JS Source files
			gulp.watch(
				watch_paths.js.source,
				{
					cwd: __paths__.js_source
				},
				function() {
					return sequence("js:app");
				}
			);

			// watch for any changes to JS Lib files
			gulp.watch(
				watch_paths.js.vendor,
				{
					cwd: __paths__.js_vendor
				},
				function() {
					return sequence("js:vendor");
				}
			);

			// watch for any changes to IMG files
			gulp.watch(
				watch_paths.img,
				{
					cwd: __paths__.img_source
				},
				function() {
					return sequence("img:main");
				}
			);

			// watch for any changes to config files
			gulp.watch(
				__paths__.config_settings_json_files,
				{
					cwd: __paths__.base
				},
				function() {
					return sequence("settings");
				}
			);

			// is the following watcher needed?

			// // watch for any changes to README.md
			// gulp.watch([__paths__.readme], {
			//     cwd: __paths__.base
			// }, function() {
			//     return sequence("tohtml", function() {
			//         bs.reload();
			//     });
			// });

			done();
		}
	);
});

//#! html.js -- ./gulp/source/tasks/html.js

// init HTML files + minify
// @internal
gulp.task("html:main", function(done) {
	var task = this;
	pump(
		[
			gulp.src(bundle_html.source.files, {
				cwd: __paths__.html_source
			}),
			$.debug(),
			$.concat(bundle_html.source.names.main),
			$.injection.pre(html_injection),
			$.prettier(config_prettier),
			$.injection.post(html_injection),
			gulp.dest(__paths__.base),
			$.debug.edit(),
			bs.stream()
		],
		done
	);
});

//#! css.js -- ./gulp/source/tasks/css.js

// build app.css + autoprefix + minify
// @internal
gulp.task("css:app", function(done) {
	var unprefix = require("postcss-unprefix");
	var autoprefixer = require("autoprefixer");
	var perfectionist = require("perfectionist");
	var shorthand = require("postcss-merge-longhand");

	var task = this;

	pump(
		[
			gulp.src(bundle_css.source.files, {
				cwd: __paths__.css_source
			}),
			$.debug(),
			$.concat(bundle_css.source.names.main),
			$.postcss([
				unprefix(),
				shorthand(),
				autoprefixer(opts_ap),
				perfectionist(config_perfectionist)
			]),
			gulp.dest(__paths__.css_bundles),
			$.debug.edit(),
			bs.stream()
		],
		done
	);
});

// build vendor bundle + minify + beautify
// @internal
gulp.task("css:vendor", function(done) {
	var unprefix = require("postcss-unprefix");
	var autoprefixer = require("autoprefixer");
	var perfectionist = require("perfectionist");
	var shorthand = require("postcss-merge-longhand");

	var task = this;

	// NOTE: absolute vendor library file paths should be used.
	// The paths should be supplied in ./configs/bundles.json
	// within the css.vendor.files array.

	pump(
		[
			gulp.src(bundle_css.vendor.files),
			$.debug(),
			$.concat(bundle_css.vendor.names.main),
			$.postcss([
				unprefix(),
				shorthand(),
				autoprefixer(opts_ap),
				perfectionist(config_perfectionist)
			]),
			gulp.dest(__paths__.css_bundles),
			$.debug.edit(),
			bs.stream()
		],
		done
	);
});

//#! js.js -- ./gulp/source/tasks/js.js

// build app.js + minify + beautify
// @internal
gulp.task("js:app", function(done) {
	var task = this;
	pump(
		[
			gulp.src(bundle_js.source.files, {
				cwd: __paths__.js_source
			}),
			$.debug(),
			$.concat(bundle_js.source.names.main),
			$.prettier(config_prettier),
			gulp.dest(__paths__.js_bundles),
			$.debug.edit(),
			bs.stream()
		],
		done
	);
});

// build vendor bundle + minify + beautify
// @internal
gulp.task("js:vendor", function(done) {
	var task = this;

	// NOTE: absolute vendor library file paths should be used.
	// The paths should be supplied in ./configs/bundles.json
	// within the js.vendor.files array.

	pump(
		[
			gulp.src(bundle_js.vendor.files),
			$.debug(),
			$.concat(bundle_js.vendor.names.main),
			$.prettier(config_prettier),
			gulp.dest(__paths__.js_bundles),
			$.debug.edit(),
			bs.stream()
		],
		done
	);
});

//#! img.js -- ./gulp/source/tasks/img.js

// just trigger a browser-sync stream
// @internal
gulp.task("img:main", function(done) {
	var task = this;
	// need to copy hidden files/folders?
	// [https://github.com/klaascuvelier/gulp-copy/issues/5]
	pump([gulp.src(__paths__.img_source), $.debug(), bs.stream()], done);
});

//#! modernizr.js -- ./gulp/source/helpers/modernizr.js

/**
 * Build Modernizr file.
 *
 * Usage
 *
 * $ gulp modernizr # Build modernizr.js. Make changes to ./modernizr.config.json
 */
gulp.task("modernizr", function(done) {
	var modernizr = require("modernizr");

	modernizr.build(config_modernizr, function(build) {
		var file_location =
			__paths__.vendor_modernizr + __paths__.modernizr_file;
		// create missing folders
		mkdirp(__paths__.vendor_modernizr, function(err) {
			if (err) throw err;
			// save the file to vendor
			fs.writeFile(file_location, build, function() {
				var message = chalk.blue("Modernizr build complete. Placed in");
				var location = chalk.green(file_location);
				log(`${message} ${location}`);
				done();
			});
		});
	});
});

//#! tohtml.js -- ./gulp/source/helpers/tohtml.js

var __markdown_styles__;
// get the CSS markdown + prismjs styles
// @internal
gulp.task("tohtml:prepcss", function(done) {
	var task = this;

	// run gulp process
	pump(
		[
			gulp.src(
				[
					__paths__.markdown_styles_github,
					__paths__.markdown_styles_prismjs
				],
				{
					cwd: __paths__.markdown_assets
				}
			),
			$.debug(),
			$.concat(__paths__.markdown_concat_name),
			$.modify({
				fileModifier: function(file, contents) {
					// store the contents in variable
					__markdown_styles__ = contents;
					return contents;
				}
			}),
			$.debug.edit()
		],
		done
	);
});

/**
 * Converts MarkDown (.md) file to its HTML counterpart (with GitHub style/layout).
 *
 * Options
 *
 * -f, --file   [string]  Path of file to convert. Defaults to ./README.md
 *
 * Notes
 *
 * • Files will get placed in ./markdown/previews/
 *
 * Usage
 *
 * $ gulp tohtml --file ./README.md # Convert README.md to README.html.
 */
gulp.task("tohtml", ["tohtml:prepcss"], function(done) {
	var prism = require("prismjs");
	var prism_langs = require("prism-languages");

	var task = this;

	// run yargs
	var _args = yargs.option("file", {
		alias: "f",
		default: "./README.md",
		describe: "The file to convert.",
		type: "string"
	}).argv;
	// get the command line arguments from yargs
	var file_name = _args.f || _args.file;

	// get file markdown file contents
	// convert contents into HTML via marked
	// inject HTML fragment into HTML markdown template
	// save file in markdown/previews/

	// [https://github.com/krasimir/techy/issues/30]
	// make marked use prism for syntax highlighting
	$.marked.marked.setOptions({
		highlight: function(code, language) {
			// default to markup when language is undefined
			return prism.highlight(code, prism.languages[language || "markup"]);
		}
	});

	// run gulp process
	pump(
		[
			gulp.src(file_name),
			$.debug(),
			$.marked(),
			$.modify({
				fileModifier: function(file, contents) {
					// path offsets
					var fpath = "../../favicon/";
					// get file name
					var file_name = path.basename(file.path);

					// return filled in template
					return `
<!doctype html>
<html lang="en">
<head>
    <title>${file_name}</title>
    <meta charset="utf-8">
    <meta name="description" content="Markdown to HTML preview.">
    <meta http-equiv="x-ua-compatible" content="ie=edge">
    <meta name="viewport" content="width=device-width, initial-scale=1, shrink-to-fit=no">
    <link rel="apple-touch-icon" sizes="180x180" href="${fpath}/apple-touch-icon.png">
    <link rel="icon" type="image/png" sizes="32x32" href="${fpath}/favicon-32x32.png">
    <link rel="icon" type="image/png" sizes="16x16" href="${fpath}/favicon-16x16.png">
    <link rel="manifest" href="${fpath}/manifest.json">
    <link rel="mask-icon" href="${fpath}/safari-pinned-tab.svg" color="#699935">
    <link rel="shortcut icon" href="${fpath}/favicon.ico">
    <meta name="msapplication-TileColor" content="#00a300">
    <meta name="msapplication-TileImage" content="${fpath}/mstile-144x144.png">
    <meta name="msapplication-config" content="${fpath}/browserconfig.xml">
    <meta name="theme-color" content="#f6f5dd">
    <!-- https://github.com/sindresorhus/github-markdown-css -->
	<style>${__markdown_styles__}</style>
</head>
    <body class="markdown-body">${contents}</body>
</html>`;
				}
			}),
			$.beautify(config_jsbeautify),
			gulp.dest(__paths__.markdown_preview),
			$.debug.edit(),
			bs.stream()
		],
		done
	);
});

//#! open.js -- ./gulp/source/helpers/open.js

/**
 * Opens provided file in browser.
 *
 * Options
 *
 * -f, --file  <file>    The path of the file to open.
 * -p, --port  [number]  The port to open in. (Defaults to browser-sync port if available or no port)
 *
 * Notes
 *
 * • New tabs should be opened via the terminal using `open`. Doing so will
 * ensure the generated tab will auto-close when Gulp is closed/existed. Opening
 * tabs by typing/copy-pasting the project URL into the browser address bar will
 * not auto-close the tab(s) due to security issues as noted here:
 * [https://stackoverflow.com/q/19761241].
 *
 * Usage
 *
 * $ gulp open --file index.html --port 3000 # Open index.html in port 3000.
 * $ gulp open -f index.html # Open index.html in browser-sync port is available or no port.
 */
gulp.task("open", function(done) {
	var task = this;

	// run yargs
	var _args = yargs
		.option("file", {
			alias: "f",
			demandOption: true,
			describe: "The file to open.",
			type: "string"
		})
		.option("port", {
			alias: "p",
			demandOption: false,
			describe: "The port to open browser in.",
			type: "number"
		}).argv;

	// get the command line arguments from yargs
	var file = _args.f || _args.file;
	// check for explicitly provided port...if none is provided
	// check the internally fetched free ports and get the local port
	var port =
		_args.p ||
		_args.port ||
		(config_internal.get("ports") || {
			local: null
		}).local;

	// run the open function
	return open_file_in_browser(file, port, done, task);
});

//#! instance.js -- ./gulp/source/helpers/instance.js

/**
 * Print whether there is an active Gulp instance.
 *
 * Usage
 *
 * $ gulp status # Print Gulp status.
 */
gulp.task("status", function(done) {
	var pid = config_internal.get("pid");
	log(
		pid
			? "Gulp is running. " + chalk.green(`(pid: ${pid})`)
			: chalk.yellow("Gulp is not running.")
	);
	done();
});

/**
 * Print the currently used ports for browser-sync.
 *
 * Usage
 *
 * $ gulp ports # Print uses ports.
 */
gulp.task("ports", function(done) {
	// get the ports
	var ports = config_internal.get("ports");
	// if file is empty
	if (!ports) {
		log(chalk.yellow("No ports are in use."));
		return done();
	}
	// ports exist...
	log(
		chalk.green("(local, ui)"),
		chalk.magenta("(" + ports.local + ", " + ports.ui + ")")
	);
	done();
});

//#! pretty.js -- ./gulp/source/helpers/pretty.js

/**
 * Beautify all HTML, JS, CSS, and JSON project files.
 *
 * Options
 *
 * -t, --type     [string]   The optional extension types to clean.
 * -g, --glob     [array]    Use glob to find files to prettify.
 * -s, --show     [boolean]  Show the used globs before prettifying.
 * -e, --empty    [boolean]  Empty default globs array. Careful as this can prettify
 *                           all project files. By default the node_modules/ is ignored,
 *                           for example. Be sure to exclude files that don't need to be
 *                           prettified.
 *
 * Notes
 *
 * • By default files in the following directories or containing the following
 *          sub-extensions are ignored: ./node_modules/, ./git/, vendor/, .ig.,
 *          and .min. files.
 * • Special characters in globs provided via the CLI (--glob) might need to be
 *          escaped if getting an error.
 *
 * Usage
 *
 * $ gulp pretty # Prettify all HTML, CSS, JS, JSON files.
 * $ gulp pretty --type "js, json" # Only prettify JS and JSON files.
 * $ gulp pretty --glob "**\/*.js" # Prettify default files and all JS files.
 * $ gulp pretty --show # Halts prettifying to show the globs to be used for prettifying.
 * $ gulp pretty --empty --glob "**\/*.js" # Flag indicating to remove default globs.
 */
gulp.task("pretty", function(done) {
	var unprefix = require("postcss-unprefix");
	var autoprefixer = require("autoprefixer");
	var perfectionist = require("perfectionist");
	var shorthand = require("postcss-merge-longhand");

	var task = this;
	// this task can only run when gulp is not running as gulps watchers
	// can run too many times as many files are potentially being beautified
	if (config_internal.get("pid")) {
		// Gulp instance exists so cleanup
		gulp_check_warn();
		return done();
	}

	// run yargs
	var _args = yargs
		.option("type", {
			alias: "t",
			demandOption: false,
			describe: "The file type extensions to clean.",
			type: "string"
		})
		.option("glob", {
			alias: "g",
			demandOption: false,
			describe: "Use glob to find files to prettify.",
			type: "array"
		})
		.option("show", {
			alias: "s",
			demandOption: false,
			describe: "Show the used globs before prettifying.",
			type: "boolean"
		})
		.option("empty", {
			alias: "e",
			demandOption: false,
			describe: "Empty default globs array.",
			type: "boolean"
		}).argv;
	// get the command line arguments from yargs
	var type = _args.t || _args.type;
	var globs = _args.g || _args.glob;
	var show = _args.s || _args.show;
	var empty = _args.e || _args.empty;

	// default files to clean:
	// HTML, CSS, JS, and JSON files. exclude files containing
	// a ".min." as this is the convention used for minified files.
	// the node_modules/, .git/, and all vendor/ files are also excluded.
	var files = [
		__paths__.files_beautify,
		__paths__.files_beautify_exclude_min,
		bangify(globall(__paths__.node_modules_name)),
		bangify(globall(__paths__.git)),
		__paths__.not_vendor,
		__paths__.not_ignore
	];

	// empty the files array?
	if (empty) {
		files.length = 0;
	}

	// reset the files array when extension types are provided
	if (type) {
		// remove all spaces from provided types string
		type = type.replace(/\s+?/g, "");

		// ...when using globs and there is only 1 file
		// type in .{js} for example, it will not work.
		// if only 1 file type is provided the {} must
		// not be present. they only seem to work when
		// multiple options are used like .{js,css,html}.
		// this is normalized below.
		if (-~type.indexOf(",")) type = "{" + type + "}";
		// finally, reset the files array
		files[0] = `**/*.${type}`;
	}

	if (globs) {
		// only do changes when the type flag is not provided
		// therefore, in other words, respect the type flag.
		if (!type) {
			files.shift();
		}

		// add the globs
		globs.forEach(function(glob) {
			files.push(glob);
		});
	}

	if (show) {
		log(chalk.green("Using globs:"));
		var prefix = " ".repeat(10);
		files.forEach(function(glob) {
			log(prefix, chalk.blue(glob));
		});
		return done();
	}

	// get needed files
	pump(
		[
			gulp.src(files, {
				dot: true,
				base: __paths__.base_dot
			}),
			$.sort(opts_sort),
			$.gulpif(ext.ishtml, $.beautify(config_jsbeautify)),
			$.gulpif(
				function(file) {
					// file must be a JSON file and cannot contain the comment (.cm.) sub-extension
					// to be sortable as comments are not allowed in JSON files.
					return ext(file, ["json"]) && !-~file.path.indexOf(".cm.")
						? true
						: false;
				},
				$.json_sort({
					space: json_spaces
				})
			),
			$.gulpif(function(file) {
				// exclude HTML and CSS files
				return ext(file, ["html", "css"]) ? false : true;
			}, $.prettier(config_prettier)),
			$.gulpif(
				ext.iscss,
				$.postcss([
					unprefix(),
					shorthand(),
					autoprefixer(opts_ap),
					perfectionist(config_perfectionist)
				])
			),
			$.eol(),
			$.debug.edit(),
			gulp.dest(__paths__.base)
		],
		done
	);
});

//#! files.js -- ./gulp/source/helpers/files.js

/**
 * List project files.
 *
 * Options
 *
 * -t, --type     [string]  The optional extensions of files to list.
 * -m, --min      [string]  Flag indicating whether to show .min. files.
 * -w, --whereis  [string]  File to look for. (Uses fuzzy search, Ignores ./node_modules/)
 *
 * Usage
 *
 * $ gulp files # Default shows all files excluding files in ./node_modules/ & .git/.
 * $ gulp files --type "js html" # Only list HTML and JS files.
 * $ gulp files --type "js" --whereis "jquery" # List JS files with jquery in basename.
 * $ gulp files --whereis "fastclick.js" # Lists files containing fastclick.js in basename.
 * $ gulp files -w ".ig." -e # Turn off fuzzy search & find all files containing ".ig." (ignored).
 */
gulp.task("files", function(done) {
	var fuzzy = require("fuzzy");

	// run yargs
	var _args = yargs
		.option("type", {
			alias: "t",
			demandOption: false,
			type: "string"
		})
		.option("min", {
			alias: "m",
			demandOption: false,
			type: "boolean"
		})
		.option("whereis", {
			alias: "w",
			demandOption: false,
			type: "string"
		})
		.option("exact", {
			alias: "e",
			demandOption: false,
			type: "boolean"
		}).argv;

	// get the command line arguments from yargs
	var types = _args.t || _args.type;
	var min = _args.m || _args.min;
	var whereis = _args.w || _args.whereis;
	var no_fuzzy = _args.e || _args.exact;
	// turn to an array when present
	if (types) types = types.split(/\s+/);

	// where files will be contained
	var files = [];

	// get all project files
	dir.files(__dirname, function(err, paths) {
		if (err) throw err;

		loop1: for (var i = 0, l = paths.length; i < l; i++) {
			var filepath = paths[i];

			// skip .git/, node_modules/
			var ignores = [__paths__.node_modules_name, __paths__.git];
			for (var j = 0, ll = ignores.length; j < ll; j++) {
				var ignore = ignores[j];
				if (-~filepath.indexOf(ignore)) continue loop1;
			}
			// add to files array
			files.push(filepath);
		}

		// filter the files based on their file extensions
		// when the type argument is provided
		if (types) {
			files = files.filter(function(filepath) {
				return -~types.indexOf(
					path
						.extname(filepath)
						.toLowerCase()
						.slice(1)
				);
			});
		}

		// filter the files based on their whether its a minified (.min.) file
		if (min) {
			files = files.filter(function(filepath) {
				return -~path.basename(filepath).indexOf(".min.");
			});
		}

		// if whereis parameter is provided run a search on files
		if (whereis) {
			// contain filtered files
			var results = [];

			// run a non fuzzy search
			if (no_fuzzy) {
				// loop over files
				var results = [];
				files.forEach(function(file) {
					if (-~file.indexOf(whereis)) results.push(file);
				});
			} else {
				// default to a fuzzy search
				var fuzzy_results = fuzzy.filter(whereis, files, {});
				// turn into an array
				fuzzy_results.forEach(function(result) {
					results.push(result.string);
				});
			}
			// reset var
			files = results;
		}

		// log files
		pump([gulp.src(files), $.sort(opts_sort), $.debug()], done);
	});
});

//#! dependency.js -- ./gulp/source/helpers/dependency.js

/**
 * Add/remove front-end dependencies from ./node_modules/ to its JS/CSS vendor folder.
 *
 * Options
 *
 * -n, --name    <string>  The module name.
 * -t, --type    <string>  Dependency type (js/css).
 * -a, --action  <string>  Action to take (add/remove).
 *
 * Usage
 *
 * $ gulp dependency -n fastclick -t js -a add # Copy fastclick to JS vendor directory.
 * $ gulp dependency -n fastclick -t js -a remove # Remove fastclick from JS vendor directory.
 * $ gulp dependency -n font-awesome -t css -a add # Add font-awesome to CSS vendor directory.
 */
gulp.task("dependency", function(done) {
	var task = this;
	// run yargs
	var _args = yargs
		.option("name", {
			alias: "n",
			demandOption: true,
			describe: "The module name.",
			type: "string"
		})
		.option("type", {
			alias: "t",
			demandOption: true,
			describe: "js or css dependency?",
			choices: ["js", "css"],
			type: "string"
		})
		.option("action", {
			alias: "a",
			demandOption: true,
			describe: "Add or remove dependency?",
			choices: ["add", "remove"],
			type: "string"
		}).argv;
	// get the command line arguments from yargs
	var name = _args.n || _args.name;
	var type = _args.t || _args.type;
	var action = _args.a || _args.action;
	// get needed paths
	var dest = type === "js" ? __paths__.js_vendor : __paths__.css_vendor;
	var delete_path = dest + name;
	var module_path = __paths__.node_modules + name;
	// check that the module exists
	if (action === "add" && !de.sync(module_path)) {
		log("The module", chalk.magenta(`${module_path}`), "does not exist.");
		log(
			`First install by running "$ yarn add ${name} --dev". Then try adding the dependency again.`
		);
		return done();
	} else if (action === "remove" && !de.sync(delete_path)) {
		log(
			"The module",
			chalk.magenta(`${delete_path}`),
			"does not exist. Removal aborted."
		);
		return done();
	}
	// delete the old module folder
	del([delete_path]).then(function(paths) {
		var message =
			`Dependency (${name}) ` +
			(action === "add" ? "added" : "removed" + ".");
		if (action === "add") {
			// copy module to location
			pump(
				[
					gulp.src(name + __paths__.del + __paths__.allfiles, {
						dot: true,
						cwd: __paths__.node_modules,
						base: __paths__.base_dot
					}),
					$.rename(function(path) {
						// [https://stackoverflow.com/a/36347297]
						// remove the node_modules/ parent folder
						var regexp = new RegExp(
							"^" + __paths__.node_modules_name
						);
						path.dirname = path.dirname.replace(regexp, "");
					}),
					gulp.dest(dest),
					$.debug.edit()
				],
				function() {
					log(message);
					done();
				}
			);
		} else {
			// remove
			log(message);
			done();
		}
	});
});

//#! make.js -- ./gulp/source/helpers/make.js

/**
 * Build gulpfile from source files. Useful after making changes to source files.
 *
 * Usage
 *
 * $ gulp make # Re-build gulpfile
 */
gulp.task("make", function(done) {
	var task = this;
	// get concat file names to use
	var names = bundle_gulp.source.names;
	var setup_name = names.setup;
	var main_name = names.main;
	pump(
		[
			gulp.src(bundle_gulp.source.files, {
				cwd: __paths__.gulp_source
			}),
			$.debug(),
			$.foreach(function(stream, file) {
				var filename = path.basename(file.path);
				var filename_rel = path.relative(process.cwd(), file.path);
				return stream.pipe(
					$.insert.prepend(
						`//#! ${filename} -- ./${filename_rel}\n\n`
					)
				);
			}),
			// if gulpfile.js exists use that name, else fallback to gulpfile.main.js
			$.gulpif(
				fe.sync(__paths__.base + main_name),
				$.concat(main_name),
				$.concat(setup_name)
			),
			$.prettier(config_prettier),
			gulp.dest(__paths__.base),
			$.debug.edit()
		],
		done
	);
});

//#! settings.js -- ./gulp/source/helpers/settings.js

/**
 * Re-build ./configs/._settings.json.
 *
 * Usage
 *
 * $ gulp settings # Re-build ._settings.json.
 */
gulp.task("settings", function(done) {
	var task = this;

	pump(
		[
			gulp.src(__paths__.config_settings_json_files, {
				cwd: __paths__.base
			}),
			$.debug(),
			$.strip_jsonc(), // remove any json comments
			$.jsoncombine(__paths__.config_settings_name, function(data, meta) {
				return new Buffer(JSON.stringify(data, null, json_spaces));
			}),
			gulp.dest(__paths__.config_home),
			$.debug.edit()
		],
		done
	);
});

//#! indent.js -- ./gulp/source/helpers/indent.js

/**
 * Indent all JS files with tabs or spaces.
 *
 * Options
 *
 * --style    [string]  Indent using spaces or tabs. Defaults to tabs.
 * --size     [string]  The amount of spaces to use. Defaults to 4.
 *
 * Notes
 *
 * • @experimental: This task is currently experimental.
 * • Ignores ./node_modules/, ./git/ and vendor/ files.
 *
 * Usage
 *
 * $ gulp indent --style tabs # Turn all 4 starting spaces into tabs.
 * $ gulp indent --style spaces # Expand all line starting tabs into 4 spaces.
 */
gulp.task("indent", function(done) {
	// run yargs
	var _args = yargs
		.option("style", {
			demandOption: false,
			type: "string"
		})
		.option("size", {
			demandOption: false,
			type: "number"
		}).argv;

	// get the command line arguments from yargs
	var style = _args.style || "tabs";
	var size = _args.size || 4; // spaces to use

	// print the indentation information
	log("Using:", chalk.green(style), "Size:", chalk.green(size));

	pump(
		[
			gulp.src(
				[
					__paths__.allfiles.replace(/\*$/, "js"), // only JS FILES
					bangify(globall(__paths__.node_modules_name)),
					bangify(globall(__paths__.git)),
					__paths__.not_vendor
				],
				{
					base: __paths__.base_dot
				}
			),
			$.gulpif(
				// convert tabs to spaces
				style === "tabs",
				$.replace(/^( )+/gm, function(match) {
					// split on the amount size provided [https://stackoverflow.com/a/6259543]
					var chunks = match.match(new RegExp(`.\{1,${size}\}`, "g"));

					// modify the chunks
					chunks = chunks.map(function(chunk) {
						return !(chunk.length % size) ? "\t" : chunk;
					});

					// join and return new indentation
					return chunks.join("");
				})
			),
			$.gulpif(
				// convert spaces to tabs
				style === "spaces",
				$.replace(/^([\t ])+/gm, function(match) {
					// replace all tabs with spaces
					match = match.replace(/\t/g, " ".repeat(size));
					return match;
				})
			),
			gulp.dest("./"),
			$.debug.edit()
		],
		done
	);
});

//#! help.js -- ./gulp/source/helpers/help.js

/**
 * Provides Gulp task documentation (this documentation).
 *
 * Options
 *
 * (no options) List tasks and their descriptions.
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

//#! favicon.js -- ./gulp/source/helpers/favicon.js

// Generate the icons. This task takes a few seconds to complete.
// You should run it at least once to create the icons. Then,
// you should run it whenever RealFaviconGenerator updates its
// package (see the check-for-favicon-update task below).
// @internal
gulp.task("favicon:generate", function(done) {
	$.real_favicon.generateFavicon(
		{
			masterPicture: __paths__.favicon_master_pic,
			dest: __paths__.favicon_dest,
			iconsPath: __paths__.favicon_dest,
			design: {
				ios: {
					pictureAspect: "backgroundAndMargin",
					backgroundColor: "#f6f5dd",
					margin: "53%",
					assets: {
						ios6AndPriorIcons: true,
						ios7AndLaterIcons: true,
						precomposedIcons: true,
						declareOnlyDefaultIcon: true
					}
				},
				desktopBrowser: {},
				windows: {
					pictureAspect: "whiteSilhouette",
					backgroundColor: "#00a300",
					onConflict: "override",
					assets: {
						windows80Ie10Tile: true,
						windows10Ie11EdgeTiles: {
							small: true,
							medium: true,
							big: true,
							rectangle: true
						}
					}
				},
				androidChrome: {
					pictureAspect: "backgroundAndMargin",
					margin: "42%",
					backgroundColor: "#f6f5dd",
					themeColor: "#f6f5dd",
					manifest: {
						display: "standalone",
						orientation: "notSet",
						onConflict: "override",
						declared: true
					},
					assets: {
						legacyIcon: false,
						lowResolutionIcons: false
					}
				},
				safariPinnedTab: {
					pictureAspect: "silhouette",
					themeColor: "#699935"
				}
			},
			settings: {
				scalingAlgorithm: "Mitchell",
				errorOnImageTooSmall: false
			},
			markupFile: __paths__.config_favicondata
		},
		function() {
			done();
		}
	);
});

// update manifest.json
// @internal
gulp.task("favicon:edit-manifest", function(done) {
	var manifest = json.read(__paths__.favicon_root_manifest);
	manifest.set("name", "wa-devkit");
	manifest.set("short_name", "WADK");
	manifest.write(
		function() {
			done();
		},
		null,
		json_spaces
	);
});

// copy favicon.ico and apple-touch-icon.png to the root
// @internal
gulp.task("favicon:root", function(done) {
	var task = this;
	pump(
		[
			gulp.src([
				__paths__.favicon_root_ico,
				__paths__.favicon_root_png,
				__paths__.favicon_root_config,
				__paths__.favicon_root_manifest
			]),
			$.debug(),
			gulp.dest(__paths__.base),
			$.debug.edit(),
			bs.stream()
		],
		done
	);
});

// copy delete unneeded files
// @internal
gulp.task("favicon:delete", function(done) {
	var task = this;
	pump(
		[
			gulp.src([
				__paths__.favicon_root_config,
				__paths__.favicon_root_manifest
			]),
			$.debug.clean(),
			$.clean()
		],
		done
	);
});

// inject new favicon html
// @internal
gulp.task("favicon:html", function(done) {
	var task = this;
	pump(
		[
			gulp.src(__paths__.favicon_html),
			$.real_favicon.injectFaviconMarkups(
				JSON.parse(fs.readFileSync(__paths__.config_favicondata))
					.favicon.html_code
			),
			gulp.dest(__paths__.favicon_html_dest),
			$.debug.edit(),
			bs.stream()
		],
		done
	);
});

/**
 * Re-build project favicons.
 *
 * Usage
 *
 * $ gulp favicon # Re-build favicons.
 */
gulp.task("favicon", function(done) {
	var task = this;
	// this task can only run when gulp is not running as gulps watchers
	// can run too many times as many files are potentially being beautified
	if (config_internal.get("pid")) {
		// Gulp instance exists so cleanup
		gulp_check_warn();
		return done();
	}
	var tasks = [
		"favicon:generate",
		"favicon:edit-manifest",
		"favicon:root",
		"favicon:delete",
		"favicon:html",
		"html:main",
		"tohtml",
		"pretty"
	];
	tasks.push(function(err) {
		log("Favicons generated.");
		done();
	});
	return sequence.apply(task, tasks);
});

// Check for updates on RealFaviconGenerator (think: Apple has just
// released a new Touch icon along with the latest version of iOS).
// Run this task from time to time. Ideally, make it part of your
// continuous integration system.
// Check for RealFaviconGenerator updates.
// @internal
gulp.task("favicon-updates", function(done) {
	var currentVersion = JSON.parse(
		fs.readFileSync(__paths__.config_favicondata)
	).version;
	$.real_favicon.checkForUpdates(currentVersion, function(err) {
		if (err) {
			throw err;
		}
	});
});
