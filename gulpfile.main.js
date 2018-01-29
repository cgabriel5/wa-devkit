// -----------------------------------------------------------------------------
// requires.js -- ./gulp/main/source/requires.js
// -----------------------------------------------------------------------------

/*jshint bitwise: false*/
/*jshint browser: false*/
/*jshint esversion: 6 */
/*jshint node: true*/
/*jshint -W014 */
/*jshint -W018 */

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
		uglify: function() {
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
var cmd = require("node-cmd");
var mkdirp = require("mkdirp");
var fe = require("file-exists");
var json = require("json-file");
var jsonc = require("comment-json");
var de = require("directory-exists");
var get = require("object-path-get");
var sequence = require("run-sequence");
var browser_sync = require("browser-sync");
var bs_autoclose = require("browser-sync-close-hook");

// project utils
var utils = require("./gulp/assets/utils/utils.js");
var print = utils.print;
var notify = utils.notify;
var gulp = utils.gulp;
var uri = utils.uri;
var browser = utils.browser;
var bangify = utils.bangify;
var globall = utils.globall;
var extension = utils.ext;
var expand_paths = utils.expand_paths;
var opts_sort = utils.opts_sort;
var escape = utils.escape;
var unique = utils.unique;

// -----------------------------------------------------------------------------
// paths.js -- ./gulp/main/source/paths.js
// -----------------------------------------------------------------------------

// get and fill in path placeholders
var $paths = expand_paths(
	Object.assign(
		jsonc.parse(
			fs.readFileSync(`./configs/paths.cm.json`).toString(),
			null,
			true
		),
		{
			// add in the following paths
			dirname: __dirname,
			cwd: process.cwd(),
			// store the project folder name
			rootdir: path.basename(process.cwd()),
			filepath: __filename,
			// get the filepath file name
			filename: path.basename(__filename)
		}
	)
);

// -----------------------------------------------------------------------------
// preconfig.js -- ./gulp/main/source/preconfig.js
// -----------------------------------------------------------------------------

// dynamic configuration files (load via json-file to modify later)
var $internal = json.read($paths.config_internal);

// object will contain the all the config settings
var $configs = {};

// settings config file must exist to populate the configs object
if (fe.sync($paths.config_settings)) {
	// static configuration files (just need to read file)
	var $settings = jsonc.parse(
		fs.readFileSync($paths.config_settings).toString()
	);

	// get individual plugin settings and store in an object
	for (var $config in $paths) {
		// path must match the following pattern to be a config path
		if (
			$paths.hasOwnProperty($config) &&
			/^config_\$[a-z_.]+$/i.test($config)
		) {
			// remove any file name sub-extensions. for example,
			// for "csslint.cm" turn to "csslint"
			var config_name = $paths[$config].split(".")[0];
			// get the config settings and add to the settings object
			$configs[config_name] = $settings[$paths[$config]];
		}
	}
} else {
	// run yargs
	var _args = yargs.argv;
	// get the command line arguments from yargs

	// only continue when the reconfig flag is set. this will let the
	// settings task to run.

	if (!_args.reconfig || !-~_args._.indexOf("settings")) {
		// config settings file does not exist so give a message and
		// exit the node process.
		print.gulp(
			chalk.yellow("warning"),
			chalk.magenta($paths.config_settings),
			'is missing. Run "$ gulp settings --rebuild" to create the file.'
		);

		process.exit();
	}
}

// -----------------------------------------------------------------------------
// configs.js -- ./gulp/main/source/configs.js
// -----------------------------------------------------------------------------

// get all needed configuration values

// bundles
var bundle_html = get($configs, "bundles.html", "");
var bundle_css = get($configs, "bundles.css", "");
var bundle_js = get($configs, "bundles.js", "");
// var bundle_img = get($configs, "bundles.img", "");
var bundle_gulp = get($configs, "bundles.gulp", "");
var bundle_dist = get($configs, "bundles.dist", "");
var bundle_lib = get($configs, "bundles.lib", "");

// app config information

// app directory information
var INDEX = get($configs, "app.index", "");
var APPDIR = path.join(get($configs, "app.base", ""), $paths.rootdir);

// app line ending information
var EOL = get($configs, "app.eol", "");
var EOL_ENDING = get(EOL, "ending", "");
// var EOL_STYLE = EOL.style;

// use https or not?
var HTTPS = get($configs, "app.https", false);

// app JSON indentation
var JINDENT = get($configs, "app.indent_char", "\t");

// plugin configs
var PRETTIER = get($configs, "prettier", {});
var JSBEAUTIFY = get($configs, "jsbeautify", {});
var AUTOPREFIXER = get($configs, "autoprefixer", {});
var PERFECTIONIST = get($configs, "perfectionist", {});

// internal information
var APPTYPE = $internal.get("apptype");

// get the current Gulp file name
var GULPFILE = path.basename($paths.filename);

// -----------------------------------------------------------------------------
// vars.js -- ./gulp/main/source/vars.js
// -----------------------------------------------------------------------------

// create browsersync server
var bs = browser_sync.create(get($configs, "browsersync.server_name", ""));

// get current branch name
var branch_name;

// remove options
var opts_remove = {
	read: false,
	cwd: $paths.basedir
};

// -----------------------------------------------------------------------------
// injection.js -- ./gulp/main/source/injection.js
// -----------------------------------------------------------------------------

// HTML injection variable object
var html_injection = {
	css_bundle_app:
		$paths.css_bundles + get(bundle_css, "source.names.main", ""),
	css_bundle_vendor:
		$paths.css_bundles + get(bundle_css, "vendor.names.main", ""),
	js_bundle_app: $paths.js_bundles + get(bundle_js, "source.names.main", ""),
	js_bundle_vendor:
		$paths.js_bundles + get(bundle_js, "vendor.names.main", "")
};

// -----------------------------------------------------------------------------
// functions.js -- ./gulp/main/source/functions.js
// -----------------------------------------------------------------------------

/**
 * Opens the provided file in the user's browser.
 *
 * @param {string} filepath - The path of the file to open.
 * @param {number} port - The port to open on.
 * @param {function} callback - The Gulp task callback to run.
 * @return {undefined} - Nothing.
 */
function open_file_in_browser(filepath, port, callback) {
	pump(
		[
			gulp.src(filepath, {
				cwd: $paths.basedir,
				dot: true
			}),
			$.open({
				app: browser,
				uri: uri({
					appdir: APPDIR,
					filepath: filepath,
					port: port,
					https: HTTPS
				})
			}),
			$.debug({ loader: false })
		],
		function() {
			notify("File opened!");
			callback();
		}
	);
}

/**
 * Print that an active Gulp instance exists.
 *
 * @return {undefined} - Nothing.
 */
function gulp_check_warn() {
	print.gulp(
		chalk.red(
			"Task cannot be performed while Gulp is running. Close Gulp then try again."
		)
	);
}

function get_editor(options) {
	// Default options
	options = options || {};

	// Use the provided editor or get the environment variables
	var editor = options.editor || process.env.EDITOR || process.env.VISUAL;

	// Default to the tried and true editors when nothing is found.
	if (!editor) editor = /^win/.test(process.platform) ? "notepad" : "vim";

	// Lowercase everything
	editor = editor.toLowerCase();

	// If nothing is found check the check the Git config??

	// If an editor is found in an environment variable it will
	// simply be a command followed by a flag(s). For example,
	// this it could be something like this: "subl -w -n". "subl"
	// being the editor command and "-w -n" the flags to use.

	// Get any flags.
	var flags = [];
	if (options.flags) {
		// Add the provided flags to the flags array.
		flags = flags.concat(options.flags);
	}

	// Now get any flags found in the editor string
	var parts = editor.split(/\s+/);
	// Flags exist.
	if (parts.length > 1) {
		// Reset the editor variable and remove the editor from the
		// parts array.
		editor = parts.shift();
		// Add all the flags to the flags array.
		flags = flags.concat(parts);
	} // Else there only exists an editor in the string

	// Add other needed flags to make this work...
	// Code lifted and modified from here:
	// [https://github.com/sindresorhus/open-editor]

	// Get the file parts
	var file = options.file;
	var name = file.name;
	var line = file.line || 1;
	var column = file.column || 1;

	// Visual Studio Code needs a flag to open file at line number/column.
	if (-~["code"].indexOf(editor)) {
		flags.push("--goto");
	}

	// Add needed flags depending on the editor being used.
	if (-~["atom", "code"].indexOf(editor) || /^subl/.test(editor)) {
		// Open in a new window and wait for the file to close.
		flags.push("--new-window", "--wait", `${name}:${line}:${column}`);
	} else if (editor === "gedit") {
		// gedit --new-window --wait ./configs/bundles.json +135:1
		flags.push("--new-window", "--wait", name, `+${line}:${column}`);
	} else if (-~["webstorm", "intellij"].indexOf(editor)) {
		flags.push(`${name}:${line}`);
	} else if (editor === "textmate") {
		flags.push("--line", `${line}:${column}`, name);
	} else if (-~["vim", "neovim"].indexOf(editor)) {
		flags.push(`+call cursor(${line}, ${column})`, name);
	} else {
		// Default to pushing the file only
		flags.push(name);
	}

	// Return the editor command with the flags to apply.
	return {
		command: editor,
		flags: flags
	};
}

// -----------------------------------------------------------------------------
// init.js -- ./gulp/main/source/tasks/init.js
// -----------------------------------------------------------------------------

/**
 * When gulp is closed, either on error, crash, or intentionally, do
 *     a quick cleanup.
 */
var cleanup = require("node-cleanup");
cleanup(function(exit_code, signal) {
	var alphabetize = require("alphabetize-object-keys");

	// check for current Gulp process
	var pid = $internal.get("pid");

	// only perform this cleanup when the Gulp instance is closed.
	// when any other task is run the cleanup should not be done.
	// [https://goo.gl/rJNKNZ]

	if (pid && signal) {
		// Gulp instance exists so cleanup
		// clear gulp internal configuration keys
		$internal.set("pid", null);
		$internal.set("ports", null);
		$internal.data = alphabetize($internal.data);
		$internal.writeSync(null, JINDENT);
		// cleanup vars, process
		branch_name = undefined;
		if (bs) {
			bs.exit();
		}
		if (process) {
			process.exit();
			if (signal) {
				process.kill(pid, signal);
			}
		}
		cleanup.uninstall(); // don't call cleanup handler again
		return false;
	}
});

/**
 * Update the status of gulp to active.
 *
 * Notes
 *
 * • This will write the current gulp
 *     process id to the internal gulp configuration file. this is done
 *     to prevent another Gulp instance from being opened.
 *
 * @internal - Used with the default task.
 */
gulp.task("init:save-pid", function(done) {
	$internal.set("pid", process.pid); // set the status
	$internal.write(
		function() {
			// save changes to file
			done();
		},
		null,
		JINDENT
	);
});

/**
 * Watch for git branch changes.
 *
 * Notes
 *
 * • Branch name checks are done to check
 *     whether the branch was changed after the gulp command was used.
 *     This is done as when switching branches files and file structure
 *     might be different. this can cause some problems with the watch
 *     tasks and could perform gulp tasks when not necessarily wanted.
 *     To resume gulp simply restart with the gulp command.
 *
 * @internal - Used with the default task.
 */
gulp.task("init:watch-git-branch", function(done) {
	var git = require("git-state");

	git.isGit($paths.dirname, function(exists) {
		// if no .git exists simply ignore and return done
		if (!exists) {
			return done();
		}
		git.check($paths.dirname, function(err, result) {
			if (err) {
				throw err;
			}
			// record branch name
			branch_name = result.branch;
			// set the gulp watcher as .git exists
			gulp.watch(
				[$paths.githead],
				{
					cwd: $paths.basedir,
					dot: true
				},
				function() {
					var brn_current = git.checkSync($paths.dirname).branch;
					if (branch_name) {
						print.gulp(
							chalk.yellow("(pid:" + process.pid + ")"),
							"Gulp monitoring",
							chalk.green(branch_name),
							"branch."
						);
					}
					if (brn_current !== branch_name) {
						// message + exit
						print.gulp(
							"Gulp stopped due to branch switch. (",
							chalk.green(branch_name),
							"=>",
							chalk.yellow(brn_current),
							")"
						);
						print.gulp(
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

/**
 * Build app files.
 *
 * @internal - Used with the default task.
 */
gulp.task("init:build", function(done) {
	// cache task
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
 * Runs Gulp.
 *
 * Notes
 *
 * • This is the default task that will builds project files, watches
 *   files, run browser-sync, etc.
 * • Only one instance can be run at a time.
 *
 * Flags
 *
 * -s, --stop
 *     [boolean] Flag indicating to stop Gulp.
 *
 * Usage
 *
 * $ gulp
 *     Run Gulp.
 *
 * $ gulp --stop
 *     Stops active Gulp process, if running.
 */
gulp.task("default", function(done) {
	var find_free_port = require("find-free-port");

	var args = yargs.argv; // get cli parameters

	if (args.s || args.stop) {
		// end the running Gulp process

		// get pid, if any
		var pid = $internal.get("pid");
		if (pid) {
			// kill the open process
			print.gulp(chalk.green("Gulp process stopped."));
			process.kill(pid);
		} else {
			// no open process exists
			print.gulp("No Gulp process exists.");
		}

		return done();
	} else {
		// start up Gulp like normal

		return find_free_port(
			$configs.findfreeport.range.start,
			$configs.findfreeport.range.end,
			$configs.findfreeport.ip,
			$configs.findfreeport.count,
			function(err, p1, p2) {
				// get pid, if any
				var pid = $internal.get("pid");
				// if there is a pid present it means a Gulp instance has
				// already started. therefore, prevent another from starting.
				if (pid) {
					print.gulp(
						chalk.yellow(
							"A Gulp instance is already running",
							chalk.yellow("(pid:" + pid + ")") + ".",
							"Stop that instance before starting a new one."
						)
					);
					return done();
				}

				// store the ports
				$internal.set("ports", {
					local: p1,
					ui: p2
				});

				// save ports
				$internal.write(
					function() {
						// store ports on the browser-sync object itself
						bs.__ports = [p1, p2]; // [app, ui]
						// after getting the free ports, finally run the
						// build task
						return sequence(
							"init:save-pid",
							"init:watch-git-branch",
							"init:build",
							"watch",
							function() {
								done();
							}
						);
					},
					null,
					JINDENT
				);
			}
		);
	}
});

// -----------------------------------------------------------------------------
// dist.js -- ./gulp/main/source/tasks/dist.js
// -----------------------------------------------------------------------------

/**
 * Remove old dist/ folder.
 *
 * @internal - Used to prepare the dist task.
 */
gulp.task("dist:clean", function(done) {
	pump(
		[gulp.src($paths.dist_home, opts_remove), $.debug.clean(), $.clean()],
		done
	);
});

/**
 * Copy new file/folders.
 *
 * @internal - Used to prepare the dist task.
 */
gulp.task("dist:favicon", function(done) {
	pump(
		[
			gulp.src(bundle_dist.source.files.favicon, {
				dot: true,
				cwd: $paths.basedir,
				// https://github.com/gulpjs/gulp/issues/151#issuecomment-41508551
				base: $paths.dot
			}),
			$.debug(),
			gulp.dest($paths.dist_home),
			$.debug.edit()
		],
		done
	);
});

/**
 * Build the distribution CSS files/folders.
 *
 * @internal - Used to prepare the dist task.
 */
gulp.task("dist:css", function(done) {
	pump(
		[
			gulp.src(bundle_dist.source.files.css, {
				dot: true,
				cwd: $paths.basedir,
				base: $paths.dot
			}),
			$.debug(),
			$.gulpif(extension.iscss, $.clean_css()),
			gulp.dest($paths.dist_home),
			$.debug.edit()
		],
		done
	);
});

/**
 * Run images through imagemin to optimize them.
 *
 * @internal - Used to prepare the dist task.
 */
gulp.task("dist:img", function(done) {
	// need to copy hidden files/folders?
	// [https://github.com/klaascuvelier/gulp-copy/issues/5]
	pump(
		[
			gulp.src(bundle_dist.source.files.img, {
				dot: true,
				cwd: $paths.basedir,
				base: $paths.dot
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
			gulp.dest($paths.dist_home),
			$.debug.edit()
		],
		done
	);
});

/**
 * Build the distribution JS files/folders.
 *
 * @internal - Used to prepare the dist task.
 */
gulp.task("dist:js", function(done) {
	pump(
		[
			gulp.src(bundle_dist.source.files.js, {
				dot: true,
				cwd: $paths.basedir,
				base: $paths.dot
			}),
			$.debug(),
			$.gulpif(extension.isjs, $.uglify()),
			gulp.dest($paths.dist_home),
			$.debug.edit()
		],
		done
	);
});

/**
 * Copy over the root files to the distribution folder.
 *
 * @internal - Used to prepare the dist task.
 */
gulp.task("dist:root", function(done) {
	pump(
		[
			gulp.src(bundle_dist.source.files.root, {
				dot: true,
				cwd: $paths.basedir,
				base: $paths.dot
			}),
			$.debug(),
			$.gulpif(extension.ishtml, $.minify_html()),
			gulp.dest($paths.dist_home),
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
 * $ gulp dist
 *     Create dist/ folder.
 */
gulp.task("dist", function(done) {
	// cache task
	var task = this;

	if (APPTYPE !== "webapp") {
		print.gulp("This helper task is only available for webapp projects.");
		return done();
	}
	// get the gulp build tasks
	var tasks = bundle_dist.tasks;
	// add callback to the sequence
	tasks.push(function() {
		var message = "Distribution folder complete.";
		notify(message);
		print.gulp(message);
		done();
	});
	// apply the tasks and callback to sequence
	return sequence.apply(task, tasks);
});

// -----------------------------------------------------------------------------
// lib.js -- ./gulp/main/source/tasks/lib.js
// -----------------------------------------------------------------------------

/**
 * Remove old lib/ folder.
 *
 * @internal - Used to prepare the lib task.
 */
gulp.task("lib:clean", function(done) {
	pump(
		[gulp.src($paths.lib_home, opts_remove), $.debug.clean(), $.clean()],
		done
	);
});

/**
 * Build the library JS files/folders.
 *
 * @internal - Used to prepare the lib task.
 */
gulp.task("lib:js", function(done) {
	pump(
		[
			gulp.src(bundle_js.source.files, {
				nocase: true,
				cwd: $paths.js_source
			}),
			// filter out all but test files (^test*/i)
			$.filter([$paths.files_all, $paths.not_tests]),
			$.debug(),
			$.concat(bundle_js.source.names.libs.main),
			$.prettier(PRETTIER),
			gulp.dest($paths.lib_home),
			$.debug.edit(),
			$.uglify(),
			$.rename(bundle_js.source.names.libs.min),
			gulp.dest($paths.lib_home),
			$.debug.edit()
		],
		done
	);
});

/**
 * Build the lib/ folder. (only for library projects).

 * Usage
 *
 * $ gulp lib
 *     Create lib/ folder.
 */
gulp.task("lib", function(done) {
	// cache task
	var task = this;

	if (APPTYPE !== "library") {
		print.gulp("This helper task is only available for library projects.");
		return done();
	}
	// get the gulp build tasks
	var tasks = bundle_lib.tasks;
	// add callback to the sequence
	tasks.push(function() {
		var message = "Library folder complete.";
		notify(message);
		print.gulp(message);
		done();
	});
	// apply the tasks and callback to sequence
	return sequence.apply(task, tasks);
});

// -----------------------------------------------------------------------------
// watch.js -- ./gulp/main/source/tasks/watch.js
// -----------------------------------------------------------------------------

/**
 * Watch for files changes.
 */
gulp.task("watch", function(done) {
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
				https: HTTPS
			}), // "markdown/preview/README.html"
			port: bs.__ports[0],
			ui: {
				port: bs.__ports[1]
			},
			notify: false,
			open: true
		},
		function() {
			// gulp watcher paths
			var watch_paths = bundle_gulp.watch;

			// Watch for any changes to HTML files.
			$.watcher.create("watcher:html", watch_paths.html, ["html"]);

			// Watch for any changes to CSS Source files.
			$.watcher.create("watcher:css:app", watch_paths.css.app, [
				"css:app"
			]);

			// Watch for any changes to CSS Lib files.
			$.watcher.create("watcher:css:vendor", watch_paths.css.vendor, [
				"css:vendor"
			]);

			// watch for any changes to JS Source files
			$.watcher.create("watcher:js:app", watch_paths.js.app, ["js:app"]);

			// watch for any changes to JS Lib files
			$.watcher.create("watcher:js:vendor", watch_paths.js.vendor, [
				"js:vendor"
			]);

			// watch for any changes to IMG files
			$.watcher.create("watcher:img", watch_paths.img, ["img"]);

			// watch for any changes to config files
			$.watcher.create("watcher:settings", watch_paths.config, [
				"settings"
			]);

			// Is the following watcher needed?

			// // Watch for any changes to README.md.
			// gulp.watch([$paths.readme], {
			//     cwd: $paths.basedir
			// }, function() {
			//     return sequence("tohtml", function() {
			//         bs.reload();
			//     });
			// });

			done();
		}
	);
});

// -----------------------------------------------------------------------------
// html.js -- ./gulp/main/source/tasks/html.js
// -----------------------------------------------------------------------------

/**
 * Init HTML files + minify.
 */
gulp.task("html", function(done) {
	// Pause the watcher to prevent infinite loops.
	$.watcher.pause("watcher:html");

	pump(
		[
			gulp.src(bundle_html.source.files, {
				cwd: $paths.html_source
			}),
			$.debug(),
			$.concat(bundle_html.source.names.main),
			$.injection.pre({ replacements: html_injection }),
			$.beautify(JSBEAUTIFY),
			$.injection.post({ replacements: html_injection }),
			gulp.dest($paths.basedir),
			$.debug.edit(),
			bs.stream()
		],
		function() {
			// Un-pause and re-start the watcher.
			$.watcher.start("watcher:html");

			done();
		}
	);
});

// -----------------------------------------------------------------------------
// css.js -- ./gulp/main/source/tasks/css.js
// -----------------------------------------------------------------------------

/**
 * Build app.css + autoprefix + minify.
 *
 * @internal - Ran via the "css" task.
 */
gulp.task("css:app", function(done) {
	// Pause the watcher to prevent infinite loops.
	$.watcher.pause("watcher:css:app");

	var unprefix = require("postcss-unprefix");
	var autoprefixer = require("autoprefixer");
	var perfectionist = require("perfectionist");
	var shorthand = require("postcss-merge-longhand");

	pump(
		[
			gulp.src(bundle_css.source.files, {
				cwd: $paths.css_source
			}),
			$.debug(),
			$.concat(bundle_css.source.names.main),
			$.postcss([
				unprefix(),
				shorthand(),
				autoprefixer(AUTOPREFIXER),
				perfectionist(PERFECTIONIST)
			]),
			gulp.dest($paths.css_bundles),
			$.debug.edit(),
			bs.stream()
		],
		function() {
			// Un-pause and re-start the watcher.
			$.watcher.start("watcher:css:app");

			done();
		}
	);
});

/**
 * Build vendor bundle + minify + beautify.
 *
 * @internal - Ran via the "css" task.
 */
gulp.task("css:vendor", function(done) {
	// Pause the watcher to prevent infinite loops.
	$.watcher.pause("watcher:css:vendor");

	var unprefix = require("postcss-unprefix");
	var autoprefixer = require("autoprefixer");
	var perfectionist = require("perfectionist");
	var shorthand = require("postcss-merge-longhand");

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
				autoprefixer(AUTOPREFIXER),
				perfectionist(PERFECTIONIST)
			]),
			gulp.dest($paths.css_bundles),
			$.debug.edit(),
			bs.stream()
		],
		function() {
			// Un-pause and re-start the watcher.
			$.watcher.start("watcher:css:vendor");

			done();
		}
	);
});

/**
 * Build app.css & css vendor files + autoprefix + minify.
 */
gulp.task("css", function(done) {
	// Runs the css:* tasks.
	return sequence("css:app", "css:vendor", function() {
		done();
	});
});

// -----------------------------------------------------------------------------
// js.js -- ./gulp/main/source/tasks/js.js
// -----------------------------------------------------------------------------

/**
 * Build app.js + minify + beautify.
 *
 * @internal - Ran via the "js" task.
 */
gulp.task("js:app", function(done) {
	// Pause the watcher to prevent infinite loops.
	$.watcher.pause("watcher:js:app");

	pump(
		[
			gulp.src(bundle_js.source.files, {
				cwd: $paths.js_source
			}),
			$.debug(),
			$.concat(bundle_js.source.names.main),
			$.prettier(PRETTIER),
			gulp.dest($paths.js_bundles),
			$.debug.edit(),
			bs.stream()
		],
		function() {
			// Un-pause and re-start the watcher.
			$.watcher.start("watcher:js:app");

			done();
		}
	);
});

/**
 * Build vendor bundle + minify + beautify.
 *
 * @internal - Ran via the "js" task.
 */
gulp.task("js:vendor", function(done) {
	// NOTE: absolute vendor library file paths should be used.
	// The paths should be supplied in ./configs/bundles.json
	// within the js.vendor.files array.

	// Pause the watcher to prevent infinite loops.
	$.watcher.pause("watcher:js:vendor");

	pump(
		[
			gulp.src(bundle_js.vendor.files),
			$.debug(),
			$.concat(bundle_js.vendor.names.main),
			$.prettier(PRETTIER),
			gulp.dest($paths.js_bundles),
			$.debug.edit(),
			bs.stream()
		],
		function() {
			// Un-pause and re-start the watcher.
			$.watcher.start("watcher:js:vendor");

			done();
		}
	);
});

/**
 * Build app.js & js vendor files + autoprefix + minify.
 */
gulp.task("js", function(done) {
	// Runs the js:* tasks.
	return sequence("js:app", "js:vendor", function() {
		done();
	});
});

// -----------------------------------------------------------------------------
// img.js -- ./gulp/main/source/tasks/img.js
// -----------------------------------------------------------------------------

/**
 * Just trigger a browser-sync stream.
 */
gulp.task("img", function(done) {
	// Pause the watcher to prevent infinite loops.
	$.watcher.pause("watcher:img");

	// need to copy hidden files/folders?
	// [https://github.com/klaascuvelier/gulp-copy/issues/5]
	pump([gulp.src($paths.img_source), $.debug(), bs.stream()], function() {
		// Un-pause and re-start the watcher.
		$.watcher.start("watcher:img");

		done();
	});
});

// -----------------------------------------------------------------------------
// modernizr.js -- ./gulp/main/source/helpers/modernizr.js
// -----------------------------------------------------------------------------

/**
 * Build Modernizr file.
 *
 * Usage
 *
 * $ gulp modernizr
 *     Build modernizr.js. (uses ./modernizr.config.json)
 */
gulp.task("modernizr", function(done) {
	var modernizr = require("modernizr");

	modernizr.build($configs.modernizr, function(build) {
		var file_location =
			$paths.vendor_modernizr + $paths.modernizr_file_name;
		// create missing folders
		mkdirp($paths.vendor_modernizr, function(err) {
			if (err) {
				throw err;
			}
			// save the file to vendor
			fs.writeFile(file_location, build + EOL_ENDING, function() {
				// the following gulp code is really only needed to log the
				// file.
				pump(
					[
						gulp.src(file_location, {
							cwd: $paths.basedir
						}),
						$.debug.edit()
					],
					done
				);
			});
		});
	});
});

// -----------------------------------------------------------------------------
// tohtml.js -- ./gulp/main/source/helpers/tohtml.js
// -----------------------------------------------------------------------------

/**
 * Variable is declared outside of tasks to be able to use it in
 *     multiple tasks. The variable is populated in the tohtml:prepcss
 *     task and used in the tohtml task.
 */
var __markdown_styles;

/**
 * Get the CSS markdown + prismjs styles.
 *
 * @internal - Used to prepare the tohtml task.
 */
gulp.task("tohtml:prepcss", function(done) {
	// run gulp process
	pump(
		[
			gulp.src(
				[$paths.markdown_styles_github, $paths.markdown_styles_prismjs],
				{
					cwd: $paths.markdown_assets
				}
			),
			$.debug(),
			$.concat($paths.markdown_concat_name),
			$.modify({
				fileModifier: function(file, contents) {
					// store the contents in variable
					__markdown_styles = contents;
					return contents;
				}
			}),
			$.debug.edit()
		],
		done
	);
});

/**
 * Converts Markdown (.md) file to .html.
 *
 * Notes
 *
 * • Files will get placed in ./markdown/previews/
 *
 * Flags
 *
 * -f, --file
 *     [string] Path of file to convert. Defaults to ./README.md
 *
 * -o, --open
 *     [boolean] Flag indicating whether to open the converted file
 *     in the browser.
 *
 * Usage
 *
 * $ gulp tohtml --file ./README.md
 *     Convert README.md to README.html.
 *
 * $ gulp tohtml --file ./README.md --open
 *     Convert README.md to README.html and open file in browser.
 */
gulp.task("tohtml", ["tohtml:prepcss"], function(done) {
	var prism = require("prismjs");
	// extend the default prismjs languages.
	require("prism-languages");

	// run yargs
	var _args = yargs
		.option("file", {
			alias: "f",
			default: "./README.md",
			type: "string"
		})
		.option("open", {
			alias: "o",
			type: "boolean"
		}).argv;
	// get the command line arguments from yargs
	var filename = _args.f || _args.file;
	var open = _args.o || _args.open;

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
			gulp.src(filename),
			$.debug(),
			$.marked(),
			$.modify({
				fileModifier: function(file, contents) {
					// path offsets
					var fpath = "../../favicon/";
					// get file name
					var filename = path.basename(file.path);

					// return filled in template
					return `
<!doctype html>
<html lang="en">
<head>
    <title>${filename}</title>
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
	<style>${__markdown_styles}</style>
</head>
    <body class="markdown-body">${contents}</body>
</html>`;
				}
			}),
			$.beautify(JSBEAUTIFY),
			gulp.dest($paths.markdown_preview),
			// open the file when the open flag is provided
			$.gulpif(
				open,
				$.modify({
					fileModifier: function(file, contents) {
						// get the converted HTML file name
						var filename_rel = path.relative($paths.cwd, file.path);
						// run the open command as a shell command to not
						// re-write the open code here as well.
						cmd.get(
							`gulp --gulpfile ${GULPFILE} open --file ${filename_rel}`,
							function(err, data) {
								if (err) {
									throw err;
								}
							}
						);

						return contents;
					}
				})
			),
			$.debug.edit(),
			bs.stream()
		],
		done
	);
});

// -----------------------------------------------------------------------------
// open.js -- ./gulp/main/source/helpers/open.js
// -----------------------------------------------------------------------------

/**
 * Opens provided file in browser.
 *
 * Notes
 *
 * • New tabs should be opened via the terminal using `open`. Doing
 *   so will ensure the generated tab will auto-close when Gulp is
 *   closed. Opening tabs by typing/copy-pasting the project URL
 *   into the browser address bar will not auto-close the tab(s)
 *   due to security issues as noted here:
 *   [https://stackoverflow.com/q/19761241].
 *
 * Flags
 *
 * -f, --file
 *     <file> The path of the file to open.
 *
 * -p, --port
 *     [number] The port to open in. (Defaults to browser-sync port if
 *     available or no port at all.)
 *
 * -d, --directory
 *     [string] The directory path to open in a file manager.
 *
 * -e, --editor
 *     [string] The file path to open in the user's text editor to edit.
 *
 * --wait
 *     [boolean] To be Used with the -e/--editor flag. If provided the
 *     editor will wait to close and will only close manually (i.e.
 *     close the editor or exit the terminal task).
 *
 * --line
 *     [number] To be used with -e/--editor flag. Open the file at the
 *     provided line.
 *
 * --column
 *     [number] To be used with -e/--editor flag. Open the file at the
 *     provided column.
 *
 * --use
 *     [string] To be used with -e/--editor flag. Manually set the editor
 *     to use. Will default to the user's default editor via ($EDITOR/$VISUAL)
 *     environment variables.
 *
 * Usage
 *
 * $ gulp open --file index.html --port 3000
 *     Open index.html in port 3000.
 *
 * $ gulp open --file index.html
 *     Open index.html in browser-sync port is available or no port.
 *
 * $ gulp open --editor ./index.html --wait --line 12 --column 20 --use atom
 *     Open "./index.html" using the text editor Atom if available. Set
 *     the line to 12 and column 20. Use the --wait flag to close the process
 *     after the editor is close or the process is killed via the terminal.
 *
 * $ gulp open --directory .
 *     Open the root directory in a file manager.
 *
 * $ gulp open --directory ./docs
 *     Open the docs directory in a file manager.
 *
 * $ gulp open --directory docs/subextensions.md
 *     When a file is provided along with the directory, only the directory
 *     section of the path will be used to try and open in a file manager.
 */
gulp.task("open", function(done) {
	// cache task
	var task = this;

	// run yargs
	var _args = yargs
		.option("directory", {
			alias: "d",
			type: "string"
		})
		.option("editor", {
			alias: "e",
			type: "string"
		}).argv;

	// get the command line arguments from yargs
	// Open the root when nothing provided.
	var directory = _args.d || _args.directory;
	var editor = _args.e || _args.editor;

	// If the directory flag is provided open the directory in a file
	// manager.
	if (directory) {
		// Parse the directory.
		var parts = path.parse(directory);
		if (!parts.ext) {
			// No file was passed in.
			// Reset the directory
			directory = parts.dir + "/" + parts.base + "/";
		} else {
			// If a file is passed only get the dir part.
			directory = parts.dir + "/";
		}

		// Make the path absolute and relative to the main project root.
		directory = path.join("./", directory);

		// Check that the directory exists
		if (!de.sync(directory)) {
			print.gulp(
				chalk.yellow("The directory:"),
				chalk.magenta(directory),
				chalk.yellow("does not exist.")
			);
			return done();
		}

		// Else the directory exists so open the file manager.
		require("opener")(directory, function() {
			done();
		});
	} else if (editor) {
		var spawn = require("child_process").spawn;

		// Check that the file exists.
		if (!fe.sync(editor)) {
			print.gulp(
				chalk.yellow("The file:"),
				chalk.magenta(directory),
				chalk.yellow("does not exist.")
			);
			return done();
		}

		// run yargs
		var _args = yargs
			.option("wait", {
				type: "boolean"
			})
			.option("line", {
				type: "number"
			})
			.option("column", {
				type: "number"
			})
			.option("use", {
				type: "string"
			}).argv;

		// Get the command line arguments from yargs
		var wait = _args.wait;
		var line = _args.line;
		var column = _args.column;
		var use_editor = _args.use;

		// Get the user's editor and any flags needed to open the
		// file via the terminal.
		var editor = get_editor({
			file: {
				name: editor,
				line: line,
				column: 0
			},
			editor: use_editor
		});

		// Create the child process to open the editor
		var child_process = spawn(editor.command, editor.flags, {
			stdio: "inherit",
			detached: true
		});

		// If an error occurs throw it
		child_process.on("error", function(err) {
			if (err) {
				throw err;
			}
		});

		// If the wait flag is provided make the process hold until the
		// user closes the file or the terminal process is ended manually.
		if (wait) {
			// Once the file is closed continue with the task...
			child_process.on("exit", function(code, sig) {
				done();
			});
		} else {
			// Close the process immediately.
			child_process.unref();
			return done();
		}
	} else {
		// Else open the file in a browser. What this task was originally
		// set out to do.

		// run yargs
		var _args = yargs
			.option("file", {
				alias: "f",
				demandOption: true,
				type: "string"
			})
			.option("port", {
				alias: "p",
				type: "number"
			}).argv;

		// get the command line arguments from yargs
		var file = _args.f || _args.file;
		// check for explicitly provided port...if none is provided
		// check the internally fetched free ports and get the local port
		var port =
			_args.p ||
			_args.port ||
			(
				$internal.get("ports") || {
					local: null
				}
			).local;

		// run the open function
		return open_file_in_browser(file, port, done, task);
	}
});

// -----------------------------------------------------------------------------
// instance.js -- ./gulp/main/source/helpers/instance.js
// -----------------------------------------------------------------------------

/**
 * Print whether there is an active Gulp instance.
 *
 * Usage
 *
 * $ gulp status
 *     Print Gulp status.
 */
gulp.task("status", function(done) {
	var pid = $internal.get("pid");
	print.gulp(
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
 * $ gulp ports
 *     Print uses ports.
 */
gulp.task("ports", function(done) {
	// get the ports
	var ports = $internal.get("ports");
	// if file is empty
	if (!ports) {
		print.gulp(chalk.yellow("No ports are in use."));
		return done();
	}
	// ports exist...
	print.gulp(
		chalk.green("(local, ui)"),
		chalk.magenta("(" + ports.local + ", " + ports.ui + ")")
	);
	done();
});

// -----------------------------------------------------------------------------
// pretty.js -- ./gulp/main/source/helpers/pretty.js
// -----------------------------------------------------------------------------

/**
 * Variable is declared outside of tasks to be able to use it in
 *     multiple tasks. The variable is populated in the pretty:gitfiles
 *     task and used in the pretty task.
 */
var __modified_git_files;

/**
 * Gets the modified files via Git.
 *
 * Flags
 *
 * --quick
 *     [boolean] Only prettify the git modified files.
 *
 * --staged
 *     [boolean] Used with the --quick flag it only prettifies the staged
 *     files.
 *
 * @internal - Used to prepare the pretty task.
 */
gulp.task("pretty:gitfiles", function(done) {
	// get the changed files according to git if the quick/staged flags

	// run yargs
	var _args = yargs
		.option("quick", {
			type: "boolean"
		})
		.option("staged", {
			type: "boolean"
		}).argv;

	// get the command line arguments from yargs
	var quick = _args.quick;
	var staged = _args.staged;

	// the flags must be present to get the modified files...else
	// skip to the main pretty task
	if (!(quick || staged)) return done();

	// reset the variable when the staged flag is provided
	staged = staged ? "--cached" : "";

	// diff filter [https://stackoverflow.com/a/6879568]
	// example plugin [https://github.com/azz/pretty-quick]

	// the command to run
	var command = `git diff --name-only --diff-filter="ACMRTUB" ${staged}`;

	// get the list of modified files
	cmd.get(command, function(err, data, stderr) {
		// clean the data
		data = data.trim();

		// set the variable. if the data is empty there are no
		// files to prettify so return an empty array.
		__modified_git_files = data ? data.split("\n") : [];

		return done();
	});
});

/**
 * Beautify all HTML, JS, CSS, and JSON project files.
 *
 * Notes
 *
 * • By default files in the following directories or containing the
 *   following sub-extensions are ignored: ./node_modules/, ./git/,
 *   vendor/, .ig., and .min. files.
 * • Special characters in globs provided via the CLI (--pattern) might
 *   need to be escaped if getting an error.
 *
 * Flags
 *
 * -t, --type
 *     [string] The file extensions types to clean.
 *
 * -p, --pattern
 *     [array] Use a glob to find files to prettify.
 *
 * -i, --ignore
 *     [array] Use a glob to ignore files.
 *
 * --test
 *     [boolean] A test run that only shows the used globs before
 *     prettifying. Does not prettify at all.
 *
 * -e, --empty
 *     [boolean] Empty default globs array. Careful as this can prettify
 *     all project files. By default the node_modules/ is ignored, for
 *     example. Be sure to exclude files that don't need to be prettified
 *     by adding the necessary globs with the --pattern option.
 *
 * -l, --line-ending
 *     [string] If provided, the file ending will get changed to provided
 *     character(s). Line endings default to LF ("\n").
 *
 * Usage
 *
 * $ gulp pretty
 *     Prettify all HTML, CSS, JS, JSON files.
 *
 * $ gulp pretty --type "js, json"
 *     Only prettify JS and JSON files.
 *
 * $ gulp pretty --pattern "some/folder/*.js"
 *     Prettify default files and all JS files.
 *
 * $ gulp pretty --ignore "*.js"
 *     Prettify default files and ignore JS files.
 *
 * $ gulp pretty --test
 *     Halts prettifying to show the globs to be used for prettifying.
 *
 * $ gulp pretty --empty --pattern "some/folder/*.js"
 *     Flag indicating to remove default globs.
 *
 * $ gulp pretty --line-ending "\n"
 *     Make files have "\n" line-ending.
 *
 * $ gulp pretty --quick
 *     Only prettify the git modified files.
 *
 * $ gulp pretty --staged
 *     Performs a --quick prettification on Git staged files.
 */
gulp.task("pretty", ["pretty:gitfiles"], function(done) {
	var unprefix = require("postcss-unprefix");
	var autoprefixer = require("autoprefixer");
	var perfectionist = require("perfectionist");
	var shorthand = require("postcss-merge-longhand");

	// **This might no longer be needed
	// // this task can only run when gulp is not running as gulps watchers
	// // can run too many times as many files are potentially being beautified
	// if ($internal.get("pid")) {
	// 	// Gulp instance exists so cleanup
	// 	gulp_check_warn();
	// 	return done();
	// }

	// run yargs
	var _args = yargs
		.option("type", {
			alias: "t",
			type: "string"
		})
		.option("pattern", {
			alias: "p",
			type: "array"
		})
		.option("ignore", {
			alias: "i",
			type: "array"
		})
		.option("test", {
			type: "boolean"
		})
		.option("empty", {
			alias: "e",
			type: "boolean"
		})
		.option("line-ending", {
			alias: "l",
			type: "string"
		}).argv;

	// get the command line arguments from yargs
	var type = _args.t || _args.type;
	var patterns = _args.p || _args.pattern;
	var ignores = _args.i || _args.ignore;
	var test = _args.test;
	var empty = _args.e || _args.empty;
	var ending = _args.l || _args["line-ending"] || EOL_ENDING;

	// default files to clean:
	// HTML, CSS, JS, and JSON files. exclude files containing
	// a ".min." as this is the convention used for minified files.
	// the node_modules/, .git/, and all vendor/ files are also excluded.
	var files = [
		$paths.files_common,
		$paths.not_min,
		bangify(globall($paths.node_modules_name)),
		bangify(globall($paths.git)),
		$paths.not_vendor,
		$paths.not_ignore
	];

	// empty the files array?
	if (empty) {
		files.length = 0;
	}

	// merge the changed files to the patterns array...this means that
	// the --quick/--staged flags are set.
	if (__modified_git_files) {
		// Important: when the __modified_git_files variable is an empty
		// array this means that there are no Git modified/staged files.
		// So simply remove all the globs from the files array to prevent
		// anything from being prettified.
		if (!__modified_git_files.length) {
			files.length = 0;
		}

		// add the changed files to the patterns array
		patterns = (patterns || []).concat(__modified_git_files);
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
		if (-~type.indexOf(",")) {
			type = "{" + type + "}";
		}
		// finally, reset the files array
		files[0] = `**/*.${type}`;
	}

	// add user provided glob patterns
	if (patterns) {
		// only do changes when the type flag is not provided
		// therefore, in other words, respect the type flag.
		if (!type) {
			files.shift();
		}

		// add the globs
		patterns.forEach(function(glob) {
			files.push(glob);
		});
	}

	// add user provided exclude/negative glob patterns. this is
	// useful when needing to exclude certain files/directories.
	if (ignores) {
		// add the globs
		ignores.forEach(function(glob) {
			files.push(bangify(glob));
		});
	}

	// show the used glob patterns when the flag is provided
	if (test) {
		// log the globs
		files.forEach(function(glob) {
			print.gulp(chalk.blue(glob));
		});

		return done();
	}

	pump(
		[
			gulp.src(files, {
				dot: true,
				base: $paths.dot
			}),
			// Filter out all non common files. This is more so a preventive
			// measure as when using the --quick flag any modified files will
			// get passed in. This makes sure to remove all image, markdown
			// files for example.
			$.filter([$paths.files_common]),
			$.sort(opts_sort),
			$.gulpif(extension.ishtml, $.beautify(JSBEAUTIFY)),
			$.gulpif(
				function(file) {
					// file must be a JSON file and cannot contain the
					// comment (.cm.) sub-extension to be sortable as
					// comments are not allowed in JSON files.
					return extension(file, ["json"]) &&
						!-~file.path.indexOf(".cm.")
						? true
						: false;
				},
				$.json_sort({
					space: JINDENT
				})
			),
			$.gulpif(function(file) {
				// exclude HTML and CSS files
				return extension(file, ["html", "css"]) ? false : true;
			}, $.prettier(PRETTIER)),
			$.gulpif(
				extension.iscss,
				$.postcss([
					unprefix(),
					shorthand(),
					autoprefixer(AUTOPREFIXER),
					perfectionist(PERFECTIONIST)
				])
			),
			$.eol(ending),
			$.debug.edit(),
			gulp.dest($paths.basedir)
		],
		done
	);
});

// -----------------------------------------------------------------------------
// module.js -- ./gulp/main/source/helpers/module.js
// -----------------------------------------------------------------------------

/**
 * Beautify all HTML, JS, CSS, and JSON project files.
 *
 * Flags
 *
 * --filename
 *     <string> The file name of the new module file.
 *
 * --remove
 *     [string] The file name of the module to remove.
 *
 * --modname
 *     [string] The name of the module within the app. Defaults to the
 *     filename without the extension.
 *
 * --description
 *     [string] Optional description of the module.
 *
 * --mode
 *     [string] The mode the module should load via. (interactive/complete)
 *
 * --same
 *     [boolean] Flag indicating whether to use the same filename for the
 *     modname.
 *
 * Usage
 *
 * $ gulp module --filename "my_module" --same --mode "complete"
 *     Make a module "new_module.js". The extension will be added it not
 *     provided. The same file name will be used for the modname. It will
 *     also load when the document readyState hits complete.
 *
 * $ gulp module --filename "test" --same --description "My cool module."
 *     Make a module "test.js" with a description of "My cool module."
 *
 * $ gulp module --filename "my_cool_module"
 *     Simplest way to make a module. This will make a module with the name
 *     "my_cool_module.js". Have the name of "my_cool_module", load on
 *     "complete", and have an empty description.
 *
 * $ gulp module --filename "my_cool_module" --modname "coolModule"
 *     This will make a module with the name "my_cool_module.js". Have the
 *     name of "coolModule", load on "complete", and have an empty
 *     description.
 *
 * $ gulp module --remove "my_cool_module.js"
 *     This will remove the module "my_cool_module.js".
 */
gulp.task("module", function(done) {
	var linenumber = require("linenumber");

	// run yargs
	var _args = yargs.option("remove", {
		type: "string"
	}).argv;

	// get the command line arguments from yargs
	var remove = _args.remove;

	// Get the config file.
	var config_file = $paths.config_home + $paths.config_$bundles + ".json";

	// Remove the module when the remove flag is provided.
	if (remove) {
		// Check for a file extension.
		var ext = extension({ path: remove });

		// If no extension make sure to add the extension
		if (!ext) {
			remove += ".js";
		}

		// Path to the config file.
		var file = path.join($paths.js_source_modules, remove);

		// Before anything is done make sure to check that the name
		// is not already taken by another file. We don't want to
		// overwrite an existing file.
		if (!fe.sync(file)) {
			print.gulp(
				chalk.magenta(remove),
				chalk.yellow("does not exist. Task was aborted.")
			);
			return done();
		}

		pump(
			[gulp.src(file, opts_remove), $.debug.clean(), $.clean()],
			function() {
				// Get the line number where the config array exists.
				// Looking for the js.source.files.
				var line = (linenumber(
					config_file,
					/\s"js":\s+\{\n\s+"source":\s+\{\n\s+"files":\s+\[/gim
				) || [{ line: 0 }])[0].line;

				cmd.get(
					`gulp --gulpfile ${GULPFILE} open -e ${config_file} --line ${line} --wait`,
					function(err, data) {
						if (err) {
							throw err;
						}

						// Update the js:app bundle.
						return sequence("js:app", function() {
							done();
						});
					}
				);
			}
		);
	} else {
		// run yargs
		var _args = yargs
			.option("filename", {
				type: "string",
				demandOption: true
			})
			.option("modname", {
				type: "string"
			})
			.option("description", {
				default: "",
				type: "string"
			})
			.option("mode", {
				choices: ["interactive", "complete"],
				default: "complete",
				type: "string",
				demandOption: true
			})
			.option("same", {
				type: "boolean"
			}).argv;

		// get the command line arguments from yargs
		var filename = _args.filename;
		var modname = _args.modname;
		var description = _args.description;
		var mode = _args.mode;
		var same = _args.same;
		var ending = _args["line-ending"] || EOL_ENDING;

		// Get the basename from the filename.
		var ext = path.extname(filename);

		// When no extension is found reset it and the file name
		if (!ext) {
			ext = ".js";
			filename = filename + ext;
		}

		// If the same flag is provided this means to use the same filename
		// for the name flag as well. Also, if no name is provided use the
		// filename without the extension as the name.
		if (same || !modname) {
			// Get the filename without the extension.
			modname = path.basename(filename, ext);
		}

		// The content template string for a module.
		var content = `app.module(
	"${modname}",
	function(modules, name) {
		// App logic...
	},
	"${mode}",
	"${description}"
);`;

		// Path to the config file.
		var file = path.join($paths.js_source_modules, filename);

		// Before anything is done make sure to check that the name
		// is not already taken by another file. We don't want to
		// overwrite an existing file.
		if (fe.sync(file)) {
			print.gulp(
				chalk.magenta(modname),
				chalk.yellow("exists. Use another file name. Task was aborted.")
			);
			return done();
		}

		pump(
			[
				// Create the file via gulp-file and use is at the Gulp.src.
				$.file(file, content, {
					src: true
				}),
				$.debug.edit(),
				gulp.dest($paths.basedir)
			],
			function() {
				// Get the line number where the config array exists.
				// Looking for the js.source.files.
				var line = (linenumber(
					config_file,
					/\s"js":\s+\{\n\s+"source":\s+\{\n\s+"files":\s+\[/gim
				) || [{ line: 0 }])[0].line;

				cmd.get(
					`gulp --gulpfile ${GULPFILE} open -e ${config_file} --line ${line} --wait`,
					function(err, data) {
						if (err) {
							throw err;
						}

						// Update the js:app bundle.
						return sequence("js:app", function() {
							done();
						});
					}
				);
			}
		);
	}
});

// -----------------------------------------------------------------------------
// eol.js -- ./gulp/main/source/helpers/eol.js
// -----------------------------------------------------------------------------

/**
 * Correct file line endings.
 *
 * Flags
 *
 * -l, --line-ending
 *     [string] The type of line ending to use. Defauls to "\n".
 *
 * Usage
 *
 * $ gulp eol
 *     Check file line endings.
 *
 * $ gulp eol --line-ending "\n"
 *     Enforce "\n" line endings.
 */
gulp.task("eol", function(done) {
	// run yargs
	var _args = yargs.option("line-ending", {
		alias: "l",
		type: "string"
	}).argv;
	// get the command line arguments from yargs
	var ending = _args.l || _args["line-ending"] || EOL_ENDING;

	// check:
	// HTML, CSS, JS, JSON, TXT, TEXT, and MD files.
	// exclude files containing a ".min." as this is the convention used
	// for minified files. the node_modules/, .git/, img/ files are also
	// excluded.
	var files = [
		$paths.files_code,
		$paths.not_min,
		bangify($paths.img_source),
		bangify(globall($paths.node_modules_name)),
		bangify(globall($paths.git))
	];

	// get needed files
	pump(
		[
			gulp.src(files, {
				dot: true,
				base: $paths.dot
			}),
			$.sort(opts_sort),
			$.eol(ending),
			$.debug.edit(),
			gulp.dest($paths.basedir)
		],
		done
	);
});

// -----------------------------------------------------------------------------
// stats.js -- ./gulp/main/source/helpers/stats.js
// -----------------------------------------------------------------------------

/**
 * Prints table containing project file type breakdown.
 *
 * Notes
 *
 * • Depending on the project size, this task might take a while to run.
 *
 * Usage
 *
 * $ gulp stats
 *     Print a table containing project files type information.
 */
gulp.task("stats", function(done) {
	var Table = require("cli-table2");

	// get all files excluding the following: node_modules/, .git/, and img/.
	var files = [
		$paths.files_code,
		bangify($paths.img_source),
		bangify(globall($paths.node_modules_name)),
		bangify(globall($paths.git))
	];

	var file_count = 0;
	var extensions = {};

	// get needed files
	pump(
		[
			gulp.src(files, {
				dot: true,
				read: false
			}),
			$.fn(function(file) {
				// get the extension type
				var ext = path
					.extname(file.path)
					.toLowerCase()
					.slice(1);

				// exclude any extension-less files
				if (!ext) {
					return;
				}

				var ext_count = extensions[ext];

				file_count++;

				if (ext_count === undefined) {
					// does not exist, so start extension count
					extensions[ext] = 1;
				} else {
					// already exists just increment the value
					extensions[ext] = ++ext_count;
				}
			})
		],
		function() {
			// instantiate
			var table = new Table({
				head: ["Extensions", `Count (${file_count})`, "% Of Project"],
				style: { head: ["green"] }
			});

			// add data to table
			for (var ext in extensions) {
				if (extensions.hasOwnProperty(ext)) {
					var count = +extensions[ext];
					table.push([
						extension.toUpperCase(),
						count,
						Math.round(count / file_count * 100)
					]);
				}
			}

			table.sort(function(a, b) {
				return b[2] - a[2];
			});

			print(table.toString());

			done();
		}
	);
});

// -----------------------------------------------------------------------------
// files.js -- ./gulp/main/source/helpers/files.js
// -----------------------------------------------------------------------------

/**
 * List project files.
 *
 * Flags
 *
 * -t, --type
 *     [string] The optional extensions of files to list.
 *
 * -s, --stypes
 *     [string] The optional sub-extensions of files to list.
 *
 * -w, --whereis
 *     [string] Substring to search for. Uses fuzzy search by
 *     and default. (Ignores ./node_modules/ and .git/).
 *
 * -n, --nofuzzy
 *     [string] Flag indicating to turn off fuzzy search. Will
 *     use a simple indexOf() search instead.
 *
 * -h, --highlight
 *     [string] Highlight the --whereis term in the file path.
 *
 * Usage
 *
 * $ gulp files
 *     Shows all files excluding files in ./node_modules/ &
 *     .git/.
 *
 * $ gulp files --type "js html"
 *     Only list HTML and JS files.
 *
 * $ gulp files --type "js" --whereis "jquery"
 *     Print JS files containing "jquery" in path.
 *
 * $ gulp files --whereis "fastclick.js"
 *     Prints files containing fastclick.js in path.
 *
 * $ gulp files --stype "ig" --nofuzzy --highlight
 *     Turn off fuzzy search, find all files containing
 *     the "ig" sub-extension, and highlight string matches.
 *
 * $ gulp files --stype "min" --type "js"
 *     Find all files of type JS and containing the sub-extension
 *     "min".
 *
 * $ gulp files --subs
 *     List all used file sub-extensions.
 */
gulp.task("files", function(done) {
	var fuzzy = require("fuzzy");

	// run yargs
	var _args = yargs
		.option("type", {
			alias: "t",
			type: "string"
		})
		.option("stype", {
			alias: "s",
			type: "string"
		})
		.option("whereis", {
			alias: "w",
			type: "string"
		})
		.option("nofuzzy", {
			alias: "n",
			type: "boolean"
		})
		.option("highlight", {
			alias: "H",
			type: "boolean"
		})
		.option("subs", {
			type: "boolean"
		}).argv;

	// get the command line arguments from yargs
	var types = _args.t || _args.type;
	var stypes = _args.s || _args.stype;
	var whereis = _args.w || _args.whereis;
	var no_fuzzy = _args.n || _args.nofuzzy;
	var highlight = _args.H || _args.highlight;
	var sub_extensions = _args.subs;

	var clean_types = function(text) {
		// collapse multiple spaces + remove left/right padding
		text = text.replace(/\s+/g, " ").replace(/^\s+|\s+$/g, "");
		// turn to an array
		text = text.split(/\s+/);

		return text;
	};

	// if types provided clean them
	if (types) {
		types = clean_types(types);
	}

	// if sub types provided clean them
	if (stypes) {
		stypes = clean_types(stypes);
	}

	// where files will be contained
	var files = [];

	// get all project files
	dir.files($paths.dirname, function(err, paths) {
		if (err) {
			throw err;
		}

		// skip files from these locations: .git/, node_modules/
		loop1: for (var i = 0, l = paths.length; i < l; i++) {
			// only get the relative path (relative to the root dir
			// of the project). the absolute path is not needed.
			var filepath = path.relative($paths.cwd, paths[i]);

			// globs to ignore
			var ignores = [$paths.node_modules_name, $paths.git];
			// ignore files containing the above globs
			for (var j = 0, ll = ignores.length; j < ll; j++) {
				var ignore = ignores[j];
				if (-~filepath.indexOf(ignore)) {
					continue loop1;
				}
			}
			// add to files array
			files.push(filepath);
		}

		// filter the files based on their file extensions
		// when the type argument is provided
		if (types) {
			files = files.filter(function(filepath) {
				return ext({ path: filepath }, types);
			});
		}

		// filter the files based on their sub extensions
		// when the type argument is provided
		if (stypes) {
			files = files.filter(function(filepath) {
				var subs_extensions = extension.subs({ path: filepath });

				// check if path contains any of the passed in subs
				for (var i = 0, l = stypes.length; i < l; i++) {
					var sub = stypes[i];
					if (-~subs_extensions.indexOf(sub)) {
						return true;
					}
				}

				// else nothing matched so filter path out
				return false;
			});
		}

		// list the used sub-extensions
		if (sub_extensions) {
			// store used sub-extensions
			var subs_ = [];

			// loop over each path to find the sub-extensions
			files.forEach(function(path_) {
				// get the paths sub-extensions
				var subs = extension.subs({ path: path_ });

				// loop over the found sub-extensions and print them
				if (subs.length) {
					subs.forEach(function(sub) {
						// if the sub does not exist store it and print
						if (!-~subs_.indexOf(sub)) {
							print.gulp(chalk.blue(sub));
							subs_.push(sub);
						}
					});
				}
			});

			return done();
		}

		// this lookup object is only used for highlight purposes and will
		// only be populate when the whereis flag is provided. it is
		// a work around the fuzzy module. it will store the relative
		// file path with its file path containing the highlight wrappers
		// so it can be accessed in the debug modifier function.
		// basically: { relative_file_path: file_path_with_wrappers}
		var lookup = whereis ? {} : false;

		// if whereis parameter is provided run a search on files
		if (whereis) {
			// filtered files containing the whereis substring/term
			// will get added into this array.
			var results = [];

			// highlight wrappers: these will later be replaced and the
			// wrapped text highlight and bolded.
			var highlight_pre = "$<";
			var highlight_post = ">";

			// run a non fuzzy search. when fuzzy search is turned off
			// we default back to an indexOf() search.
			if (no_fuzzy) {
				files.forEach(function(file) {
					if (-~file.indexOf(whereis)) {
						// add the file path to the array
						results.push(file);

						// add the path to object
						lookup[file] = file.replace(
							new RegExp(escape(whereis), "gi"),
							function(match) {
								return highlight_pre + match + highlight_post;
							}
						);
					}
				});
			} else {
				// run a fuzzy search on the file paths
				var fuzzy_results = fuzzy.filter(whereis, files, {
					pre: highlight_pre,
					post: highlight_post
				});

				// turn into an array
				fuzzy_results.forEach(function(result) {
					// cache the original file path
					var og_filepath = result.original;

					// add the file path to the array
					results.push(og_filepath);

					// add the path containing the highlighting wrappers
					// to the object.
					lookup[og_filepath] = result.string;
				});
			}

			// reset var to the newly filtered files
			files = results;
		}

		// if the highlight flag is not provided simply run the debug
		// with default options...else use the modifier option to
		// highlight the path. this was not done through gulpif because
		// gulpif was not playing nice with the debug plugin as the cli
		// loader was messing up.
		var options =
			highlight && whereis
				? {
						// the modifier function will be used to highlight
						// the search term in the file path.
						modifier: function(data) {
							// remove placeholders and apply highlight
							var string = lookup[data.paths.relative].replace(
								/\$<(.*?)\>/g,
								function(match) {
									return chalk.bold.yellow(
										match.replace(/^\$<|\>$/g, "")
									);
								}
							);

							// update the data object
							data.file_path = string;
							data.output = `=> ${string} ${data.size} ${
								data.action
							}`;

							// return the updated data object
							return data;
						}
					}
				: {};

		// log files
		pump([gulp.src(files), $.sort(opts_sort), $.debug(options)], done);
	});
});

// -----------------------------------------------------------------------------
// dependency.js -- ./gulp/main/source/helpers/dependency.js
// -----------------------------------------------------------------------------

/**
 * Add/remove front-end dependencies.
 *
 * Notes
 *
 * • Dependencies are grabbed from ./node_modules/<name> and moved
 *   to its corresponding ./<type>/vendor/ folder.
 * • name, type, and action options are grouped. This means when one
 *   is used they must all be provided.
 *
 * Flags
 *
 * -n, --name
 *     <string>  The module name.
 *
 * -t, --type
 *     <string>  Dependency type (js/css).
 *
 * -a, --action
 *     <string>  Action to take (add/remove).
 *
 * -l, --list
 *     <boolean> Print all CSS/JS dependencies.
 *
 * Usage
 *
 * $ gulp dependency --name fastclick --type js --action add
 *     Copy fastclick to JS vendor directory.
 *
 * $ gulp dependency --name fastclick --type js --action remove
 *     Remove fastclick from JS vendor directory.
 *
 * $ gulp dependency --name font-awesome --type css --action add
 *     Add font-awesome to CSS vendor directory.
 *
 * $ gulp dependency --list
 *     Show all CSS/JS dependencies.
 */
gulp.task("dependency", function(done) {
	// run yargs
	var _args = yargs
		.option("name", {
			alias: "n",
			type: "string"
		})
		.option("type", {
			alias: "t",
			choices: ["js", "css"],
			type: "string"
		})
		.option("action", {
			alias: "a",
			choices: ["add", "remove"],
			type: "string"
		})
		.group(
			["name", "type", "action"],
			"Options: Vendor dependency information (all required when any is provided)"
		)
		// name, type, and action must all be provided when one is provided
		.implies({
			name: "type",
			type: "action",
			action: "name"
		})
		.option("list", {
			alias: "l",
			type: "boolean"
		}).argv;
	// get the command line arguments from yargs
	var name = _args.n || _args.name;
	var type = _args.t || _args.type;
	var action = _args.a || _args.action;
	var list = _args.l || _args.list;

	// get needed paths
	var dest = type === "js" ? $paths.js_vendor : $paths.css_vendor;
	var delete_path = dest + name;
	var module_path = $paths.node_modules + name;

	// print used vendor dependencies if flag provided
	if (list) {
		// get the vendor dependencies
		var css_dependencies = bundle_css.vendor.files;
		var js_dependencies = bundle_js.vendor.files;

		// printer function
		var printer = function(dependency) {
			// get the name of the folder.
			var name = dependency.match(/^(css|js)\/vendor\/(.*)\/.*$/);
			// when folder name is not present leave the name empty.
			name = name ? `(${name[2]})` : "";

			print.gulp(" ".repeat(10), chalk.magenta(dependency), name);
		};

		// get the config path for the bundles file
		var bundles_path =
			$paths.config_home + $paths.config_$bundles + ".json";
		var header = `${bundles_path} > $.vendor.files[...]`;

		// print the dependencies
		print.gulp(chalk.green(header.replace("$", "css")));
		css_dependencies.forEach(printer);
		print.gulp(chalk.green(header.replace("$", "js")));
		js_dependencies.forEach(printer);

		return done();
	}

	// check that the module exists
	if (action === "add" && !de.sync(module_path)) {
		print.gulp(
			"The module",
			chalk.magenta(`${module_path}`),
			"does not exist."
		);
		print.gulp(
			`First install by running "$ yarn add ${name} --dev". Then try adding the dependency again.`
		);
		return done();
	} else if (action === "remove" && !de.sync(delete_path)) {
		print.gulp(
			"The module",
			chalk.magenta(`${delete_path}`),
			"does not exist. Removal aborted."
		);
		return done();
	}
	// delete the old module folder
	del([delete_path]).then(function() {
		var message =
			`Dependency (${name}) ` +
			(action === "add" ? "added" : "removed" + ".");
		if (action === "add") {
			// copy module to location
			pump(
				[
					gulp.src(name + $paths.delimiter + $paths.files_all, {
						dot: true,
						cwd: $paths.node_modules,
						base: $paths.dot
					}),
					$.rename(function(path) {
						// [https://stackoverflow.com/a/36347297]
						// remove the node_modules/ parent folder
						var regexp = new RegExp("^" + $paths.node_modules_name);
						path.dirname = path.dirname.replace(regexp, "");
					}),
					gulp.dest(dest),
					$.debug.edit()
				],
				function() {
					print.gulp(message);
					done();
				}
			);
		} else {
			// remove
			print.gulp(message);
			done();
		}
	});
});

// -----------------------------------------------------------------------------
// make.js -- ./gulp/main/source/helpers/make.js
// -----------------------------------------------------------------------------

/**
 * Build gulpfile from source files.
 *
 * Usage
 *
 * $ gulp make
 *     Re-build gulpfile.
 */
gulp.task("make", function(done) {
	// get concat file names to use
	var names = bundle_gulp.source.names;
	var name_default = names.default;
	var name_main = names.main;
	pump(
		[
			gulp.src(bundle_gulp.source.files, {
				cwd: $paths.gulp_source
			}),
			$.debug(),
			$.foreach(function(stream, file) {
				// the max length of characters for decoration line
				var max_length = 80;
				var decor = "// " + "-".repeat(max_length - 3);

				var filename = path.basename(file.path);
				var filename_rel = path.relative($paths.cwd, file.path);

				var line_info = `${decor}\n// ${filename} -- ./${filename_rel}\n${decor}\n\n`;

				return stream.pipe($.insert.prepend(line_info));
			}),
			// if gulpfile.js exists use that name,
			// else fallback to gulpfile.main.js
			$.gulpif(
				fe.sync($paths.basedir + name_default),
				$.concat(name_default),
				$.concat(name_main)
			),
			$.prettier(PRETTIER),
			gulp.dest($paths.basedir),
			$.debug.edit()
		],
		done
	);
});

// -----------------------------------------------------------------------------
// lintjs.js -- ./gulp/main/source/helpers/lintjs.js
// -----------------------------------------------------------------------------

/**
 * Lint a JS file.
 *
 * Flags
 *
 * -f, --file
 *     <string>  The JS file to lint.
 *
 * Usage
 *
 * $ gulp lintjs --file ./gulpfile.js
 *     Lint gulpfile.js
 *
 */
gulp.task("lintjs", function(done) {
	// run yargs
	var _args = yargs.option("file", {
		alias: "f",
		type: "string",
		demandOption: true
	}).argv;
	// get the command line arguments from yargs
	var file = _args.f || _args.file || "";

	// don't search for a config file as a config object will be
	// supplied instead.
	$.jshint.lookup = false;

	pump(
		[
			gulp.src(file, {
				cwd: $paths.basedir
			}),
			$.debug(),
			$.jshint($configs.jshint),
			$.jshint.reporter("jshint-stylish")
		],
		done
	);
});

// -----------------------------------------------------------------------------
// lintcss.js -- ./gulp/main/source/helpers/lintcss.js
// -----------------------------------------------------------------------------

/**
 * Lint a CSS file.
 *
 * Flags
 *
 * -f, --file
 *     <string>  The CSS file to lint.
 *
 * Usage
 *
 * $ gulp lintcss --file ./css/bundles/vendor.css
 *     Lint ./css/bundles/vendor.css
 *
 */
gulp.task("lintcss", function(done) {
	// run yargs
	var _args = yargs.option("file", {
		alias: "f",
		type: "string",
		demandOption: true
	}).argv;
	// get the command line arguments from yargs
	var file = _args.f || _args.file || "";

	// get the stylish logger
	var stylish = require("csslint-stylish");

	pump(
		[
			gulp.src(file, {
				cwd: $paths.basedir
			}),
			$.debug(),
			$.csslint($configs.csslint),
			$.csslint.formatter(stylish)
		],
		done
	);
});

// -----------------------------------------------------------------------------
// linthtml.js -- ./gulp/main/source/helpers/linthtml.js
// -----------------------------------------------------------------------------

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

// -----------------------------------------------------------------------------
// settings.js -- ./gulp/main/source/helpers/settings.js
// -----------------------------------------------------------------------------

/**
 * Build ./configs/.__settings.json
 *
 * Flags
 *
 * --rebuild
 *     [boolean] Flag is used to rebuild the combined config file
 *     when it was deleted for example. The gulpfile needs this
 *     file and this will force its re-build when it gets deleted
 *     for whatever reason.
 *
 * Usage
 *
 * $ gulp settings # Re-build the settings file.
 *
 * $ gulp settings --rebuild # Force settings file re-build when
 *     the file gets deleted for whatever reason.
 */
gulp.task("settings", function(done) {
	// Pause the watcher to prevent infinite loops.
	$.watcher.pause("watcher:settings");

	pump(
		[
			gulp.src($paths.config_settings_json_files, {
				cwd: $paths.basedir
			}),
			$.debug(),
			$.strip_jsonc(), // remove any json comments
			$.jsoncombine($paths.config_settings_name, function(data) {
				return new Buffer(JSON.stringify(data, null, JINDENT));
			}),
			gulp.dest($paths.config_home),
			$.debug.edit()
		],
		function() {
			// Un-pause and re-start the watcher.
			$.watcher.start("watcher:settings");

			done();
		}
	);
});

// -----------------------------------------------------------------------------
// indent.js -- ./gulp/main/source/helpers/indent.js
// -----------------------------------------------------------------------------

/**
 * Indent all JS files with tabs or spaces.
 *
 * Notes
 *
 * • This task is currently experimental.
 * • Ignores ./node_modules/, ./git/ and vendor/ files.
 *
 * Flags
 *
 * --style
 *     [string] Indent using spaces or tabs. Defaults to tabs.
 *
 * --size
 *     [string] The amount of spaces to use. Defaults to 4.
 *
 * Usage
 *
 * $ gulp indent --style tabs
 *     Turn all 4 starting spaces into tabs.
 *
 * $ gulp indent --style spaces --size 2
 *     Expand all line starting tabs into 2 spaces.
 */
gulp.task("indent", function(done) {
	// run yargs
	var _args = yargs
		.option("style", {
			type: "string"
		})
		.option("size", {
			type: "number"
		}).argv;

	// get the command line arguments from yargs
	var style = _args.style || "tabs";
	var size = _args.size || 4; // spaces to use

	// print the indentation information
	print.gulp("Using:", chalk.green(style), "Size:", chalk.green(size));

	pump(
		[
			gulp.src(
				[
					$paths.files_all.replace(/\*$/, "js"), // only JS FILES
					bangify(globall($paths.node_modules_name)),
					bangify(globall($paths.git)),
					$paths.not_vendor
				],
				{
					base: $paths.base_dot
				}
			),
			$.gulpif(
				// convert tabs to spaces
				style === "tabs",
				$.replace(/^( )+/gm, function(match) {
					// split on the amount size provided
					// [https://stackoverflow.com/a/6259543]
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

// -----------------------------------------------------------------------------
// help.js -- ./gulp/main/source/helpers/help.js
// -----------------------------------------------------------------------------

/**
 * Provides Gulp task documentation (this documentation).
 *
 * Notes
 *
 * • Help documentation will always show even when verbose flag
 *   is not provided.
 *
 * Flags
 *
 * --verbose
 *     [boolean] Shows all documentation.
 *
 * --internal
 *     [boolean] Shows all internal (yellow) tasks.
 *
 * --filter
 *     [string] Names of tasks to show documentation for.
 *
 * Usage
 *
 * $ gulp help
 *     Show a list of tasks and their short descriptions.
 *
 * $ gulp help --verbose
 *     Show full documentation (flags, usage, notes...).
 *
 * $ gulp help --filter "open default dependency"
 *     Show documentation for specific tasks.
 *
 * $ gulp help --internal
 *     Show documentation for internally used tasks.
 */
gulp.task("help", function(done) {
	// run yargs
	var _args = yargs
		.option("verbose", {
			type: "boolean"
		})
		.option("filter", {
			type: "string"
		})
		.option("internal", {
			type: "boolean"
		}).argv;
	var verbose = _args.v || _args.verbose;
	var filter = _args.f || _args.filter;
	var internal = _args.i || _args.internal;

	// get concat file names to use
	var names = bundle_gulp.source.names;
	var name_default = names.default;
	var name_main = names.main;

	// if gulpfile.js exists use that name, else fallback to gulpfile.main.js
	var gulpfile = fe.sync($paths.basedir + name_default)
		? name_default
		: name_main;

	// store file content in a variable
	var content = "";

	pump(
		[
			gulp.src(gulpfile, {
				cwd: $paths.basedir
			}),
			$.fn(function(file) {
				// get the file content
				content = file.contents.toString();
			})
		],
		function() {
			var blocks = [];
			var lengths = [];
			var names = [];
			var string = content;
			var docblock_pattern = /^\/\*\*[\s\S]*?\*\/$/m;
			var task_name_pattern = /^gulp.task\(('|")([a-z:\-_]+)\1/;
			var match = string.match(docblock_pattern);

			// loop over gulpfile content string and file all the docblocks
			while (match) {
				var comment = match[0];
				// get the match index
				var index = match.index;
				// get the match length
				var length = comment.length;
				// reset the string to exclude the match
				string = string.substring(index + length, string.length).trim();

				// now look for the task name
				// the name needs to be at the front of the string
				// to pertain to the current docblock comment. therefore,
				// it must have an index of 0.
				var task_name_match = string.match(task_name_pattern);

				// if no task name match continue and skip, or...
				// task name has to be at the front of the string
				if (!task_name_match || task_name_match.index !== 0) {
					// reset the match pattern
					match = string.match(docblock_pattern);
					continue;
				}

				// check whether the task is internal
				var is_internal = Boolean(-~comment.indexOf("@internal"));

				// exclude internal tasks when the internal flag is not set
				if (is_internal && !internal) {
					// reset the match pattern
					match = string.match(docblock_pattern);
					continue;
				}

				// get the task name
				var task_name = task_name_match[2];

				// filter if flag present, also grab the length of the tasks
				if (filter) {
					if (-~filter.indexOf(task_name) || task_name === "help") {
						// store the task name length
						lengths.push(task_name.length);
					} else {
						// reset the match pattern
						match = string.match(docblock_pattern);
						continue;
					}
				} else {
					// when no flag present just add all to the array
					lengths.push(task_name.length);
				}

				// add the comment and task name to array
				// [ task name , task docblock comment , is task internal? ]
				blocks.push([task_name, comment, is_internal]);
				// reset the match pattern
				match = string.match(docblock_pattern);
			}

			// get the task max length
			var max_length = Math.max.apply(null, lengths);

			var newline = "\n";
			var headers = ["Flags", "Usage", "Notes"];

			// [https://stackoverflow.com/a/9175783]
			// sort alphabetically fallback to a length
			var cmp = function(a, b) {
				if (a > b) {
					return +1;
				}
				if (a < b) {
					return -1;
				}
				return 0;
			};

			var replacer = function(match) {
				return chalk.bold(match);
			};

			var remove_comment_syntax = function(string) {
				return string
					.replace(/(^\/\*\*)|( \*\/$)|( \* ?)/gm, "")
					.trim();
			};

			print.ln();
			print(chalk.bold("Tasks"));
			print.ln();

			var tasks = {};

			// loop over every match get needed data
			blocks.forEach(function(block) {
				// get task name
				var name = block[0];
				var internal = block[2];
				// reset the block var to the actual comment block
				block = block[1];

				// skip if no name is found
				if (!name) {
					return;
				}

				// reset name
				block = block.replace(
					new RegExp("task: " + name + "$", "m"),
					""
				);

				// remove doc comment syntax
				block = remove_comment_syntax(block);

				// *************************************************
				// For the time being this method of scraping for the
				// description is fine but it must be made better in a
				// future iteration. This way limits the description to
				// a single line and sometimes that is not enough to
				// describe its function.
				// *************************************************

				// Functions with only a description and nothing else,
				// will not have any new lines in its description.
				// Therefore, the simply use its entire documentation
				// as its description.
				var newline_index = block.indexOf(`${newline}${newline}`);
				if (newline_index === -1) {
					newline_index = block.length;
				}

				// get the description
				var desc = block.substring(0, newline_index);

				tasks[name] = {
					text: block,
					desc: desc,
					internal: internal
				};
				if (name !== "help") {
					names.push(name);
				}
			});

			// sort the array names
			names.sort(function(a, b) {
				return cmp(a, b) || cmp(a.length, b.length);
			});

			// add the help task to the front of the array
			names.unshift("help");

			// loop over to print this time
			names.forEach(function(name) {
				// get the block
				var task = tasks[name];
				var block = task.text;
				var desc = task.desc;
				var internal = task.internal;

				// task name color will change based on whether it's
				// an internal task.
				var color = !internal ? "bold" : "yellow";

				// loop over lines
				if (verbose || name === "help") {
					// bold the tasks
					block = block.replace(/\s\-\-?[a-z-]+/g, replacer);

					// print the task name
					print("   " + chalk[color](name));

					var lines = block.split(newline);
					lines.forEach(function(line) {
						if (-~headers.indexOf(line.trim())) {
							line = " ".repeat(6) + (line + ":");
						} else {
							line = "\t" + line;
						}
						print(line);
					});

					// bottom padding
					print.ln();
				} else {
					// only show the name and its description
					print(
						"   " +
							chalk[color](name) +
							" ".repeat(max_length - name.length + 3) +
							desc
					);
				}
			});

			if (!verbose) {
				// bottom padding
				print.ln();
			}

			done();
		}
	);
});

// -----------------------------------------------------------------------------
// favicon.js -- ./gulp/main/source/helpers/favicon.js
// -----------------------------------------------------------------------------

/**
 * Generate the favicon icons.
 *
 * Notes
 *
 * • This task takes a few seconds to complete. You should run it at
 *     least once to create the icons. Then, you should run it whenever
 *     RealFaviconGenerator updates its package
 *     (see the check-for-favicon-update task below).
 *
 * @internal - Used to prepare the favicon task.
 */
gulp.task("favicon:generate", function(done) {
	$.real_favicon.generateFavicon(
		{
			masterPicture: $paths.favicon_master_pic,
			dest: $paths.favicon_dest,
			iconsPath: $paths.favicon_dest,
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
			markupFile: $paths.config_favicondata
		},
		function() {
			done();
		}
	);
});

/**
 * Update manifest.json.
 *
 * @internal - Used to prepare the favicon task.
 */
gulp.task("favicon:edit-manifest", function(done) {
	var manifest = json.read($paths.favicon_root_manifest);
	manifest.set("name", "wa-devkit");
	manifest.set("short_name", "WADK");
	manifest.write(
		function() {
			done();
		},
		null,
		JINDENT
	);
});

/**
 * Copy favicon.ico and apple-touch-icon.png to the root.
 *
 * @internal - Used to prepare the favicon task.
 */
gulp.task("favicon:root", function(done) {
	pump(
		[
			gulp.src([
				$paths.favicon_root_ico,
				$paths.favicon_root_png,
				$paths.favicon_root_config,
				$paths.favicon_root_manifest
			]),
			$.debug(),
			gulp.dest($paths.basedir),
			$.debug.edit(),
			bs.stream()
		],
		done
	);
});

/**
 * Copy delete unneeded files.
 *
 * @internal - Used to prepare the favicon task.
 */
gulp.task("favicon:delete", function(done) {
	pump(
		[
			gulp.src([
				$paths.favicon_root_config,
				$paths.favicon_root_manifest
			]),
			$.debug.clean(),
			$.clean()
		],
		done
	);
});

/**
 * Inject new favicon HTML.
 *
 * @internal - Used to prepare the favicon task.
 */
gulp.task("favicon:html", function(done) {
	pump(
		[
			gulp.src($paths.favicon_html),
			$.real_favicon.injectFaviconMarkups(
				JSON.parse(fs.readFileSync($paths.config_favicondata)).favicon
					.html_code
			),
			gulp.dest($paths.favicon_html_dest),
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
 * $ gulp favicon
 *     Re-build favicons.
 */
gulp.task("favicon", function(done) {
	// cache task
	var task = this;

	// this task can only run when gulp is not running as gulps watchers
	// can run too many times as many files are potentially being beautified
	if ($internal.get("pid")) {
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
		"html",
		"tohtml",
		"pretty"
	];
	tasks.push(function() {
		print.gulp("Favicons generated.");
		done();
	});
	return sequence.apply(task, tasks);
});

/**
 * Check for RealFaviconGenerator updates.
 *
 * Notes
 *
 * • Think: Apple has just released a new Touch icon along with the
 *     latest version of iOS. Run this task from time to time. Ideally,
 *     make it part of your continuous integration system. Check for
 *     RealFaviconGenerator updates.
 */
gulp.task("favicon-updates", function(done) {
	var currentVersion = JSON.parse(fs.readFileSync($paths.config_favicondata))
		.version;
	$.real_favicon.checkForUpdates(currentVersion, function(err) {
		if (err) {
			throw err;
		} else {
			return done();
		}
	});
});
