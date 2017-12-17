//#! requires.js -- ./gulp/main/source/requires.js

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
var log = utils.log;
var notify = utils.notify;
var gulp = utils.gulp;
var uri = utils.uri;
var browser = utils.browser;
var bangify = utils.bangify;
var globall = utils.globall;
var ext = utils.ext;
var expand_paths = utils.expand_paths;
var opts_sort = utils.opts_sort;

//#! paths.js -- ./gulp/main/source/paths.js

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
			rootdir: path.basename(process.cwd())
		}
	)
);

//#! configs.js -- ./gulp/main/source/configs.js

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
	// config settings file does not exist so give a message and
	// exit the node process.
	log(
		chalk.yellow("warning"),
		chalk.magenta($paths.config_settings),
		'is missing. Run "$ gulp settings --reconfig" to create the file.'
	);

	// run yargs
	var _args = yargs.argv;
	// get the command line arguments from yargs

	// only continue when the reconfig flag is set. this will let the
	// settings to run.

	if (!_args.reconfig || !-~_args._.indexOf("settings")) {
		process.exit();
	}
}

//#! vars.js -- ./gulp/main/source/vars.js

// get JSON indentation size
var jindent = get($configs, "json_format.indent_size", "\t");

// bundles
var bundle_html = get($configs, "bundles.html", "");
var bundle_css = get($configs, "bundles.css", "");
var bundle_js = get($configs, "bundles.js", "");
// var bundle_img = get($configs, "bundles.img", "");
var bundle_gulp = get($configs, "bundles.gulp", "");
var bundle_dist = get($configs, "bundles.dist", "");
var bundle_lib = get($configs, "bundles.lib", "");

// app directory information
var INDEX = get($configs, "app.index", "");
var APPDIR = path.join(get($configs, "app.base", ""), $paths.rootdir);

// line ending information
var EOL = get($configs, "app.eol", "");
var EOL_ENDING = get(EOL, "ending", "");
// var EOL_STYLE = EOL.style;

// internal information
var APPTYPE = $internal.get("apptype");

// get the current Gulp file name
var GULPFILE = path.basename(__filename);

// create browsersync server
var bs = browser_sync.create(get($configs, "browsersync.server_name", ""));

// get current branch name
var branch_name;

// remove options
var opts_remove = {
	read: false,
	cwd: $paths.base
};

//#! injection.js -- ./gulp/main/source/injection.js

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

//#! functions.js -- ./gulp/main/source/functions.js

/**
 * Opens the provided file in the user's browser.
 *
 * @param {string} filepath - The path of the file to open.
 * @param {number} port - The port to open on.
 * @param {function} callback - The Gulp task callback to run.
 * @return {undefined} Nothing.
 */
function open_file_in_browser(filepath, port, callback) {
	pump(
		[
			gulp.src(filepath, {
				cwd: $paths.base,
				dot: true
			}),
			$.open({
				app: browser,
				uri: uri({
					appdir: APPDIR,
					filepath: filepath,
					port: port,
					https: $configs.open.https
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
 * @return {undefined} Nothing.
 */
function gulp_check_warn() {
	log(
		chalk.red(
			"Task cannot be performed while Gulp is running. Close Gulp then try again."
		)
	);
}

//#! init.js -- ./gulp/main/source/tasks/init.js

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
		$internal.writeSync(null, jindent);
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
 */
gulp.task("init:save-pid", function(done) {
	$internal.set("pid", process.pid); // set the status
	$internal.write(
		function() {
			// save changes to file
			done();
		},
		null,
		jindent
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
					cwd: $paths.base,
					dot: true
				},
				function() {
					var brn_current = git.checkSync($paths.dirname).branch;
					if (branch_name) {
						log(
							chalk.yellow("(pid:" + process.pid + ")"),
							"Gulp monitoring",
							chalk.green(branch_name),
							"branch."
						);
					}
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

/**
 * Build app files.
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
 * task: default
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
				$internal.set("ports", {
					local: p1,
					ui: p2
				});

				// save ports
				$internal.write(
					function() {
						// store ports on the browser-sync object itself
						bs._ports_ = [p1, p2]; // [app, ui]
						// after getting the free ports, finally run the
						// build task
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
					jindent
				);
			}
		);
	}
});

//#! dist.js -- ./gulp/main/source/tasks/dist.js

/**
 * Remove old dist/ folder.
 */
gulp.task("dist:clean", function(done) {
	pump(
		[gulp.src($paths.dist_home, opts_remove), $.debug.clean(), $.clean()],
		done
	);
});

/**
 * Copy new file/folders.
 */
gulp.task("dist:favicon", function(done) {
	pump(
		[
			gulp.src(bundle_dist.source.files.favicon, {
				dot: true,
				cwd: $paths.base,
				// https://github.com/gulpjs/gulp/issues/151#issuecomment-41508551
				base: $paths.base_dot
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
 */
gulp.task("dist:css", function(done) {
	pump(
		[
			gulp.src(bundle_dist.source.files.css, {
				dot: true,
				cwd: $paths.base,
				base: $paths.base_dot
			}),
			$.debug(),
			$.gulpif(ext.iscss, $.clean_css()),
			gulp.dest($paths.dist_home),
			$.debug.edit()
		],
		done
	);
});

/**
 * Run images through imagemin to optimize them.
 */
gulp.task("dist:img", function(done) {
	// need to copy hidden files/folders?
	// [https://github.com/klaascuvelier/gulp-copy/issues/5]
	pump(
		[
			gulp.src(bundle_dist.source.files.img, {
				dot: true,
				cwd: $paths.base,
				base: $paths.base_dot
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
 */
gulp.task("dist:js", function(done) {
	pump(
		[
			gulp.src(bundle_dist.source.files.js, {
				dot: true,
				cwd: $paths.base,
				base: $paths.base_dot
			}),
			$.debug(),
			$.gulpif(ext.isjs, $.uglify()),
			gulp.dest($paths.dist_home),
			$.debug.edit()
		],
		done
	);
});

/**
 * Copy over the root files to the distribution folder.
 */
gulp.task("dist:root", function(done) {
	pump(
		[
			gulp.src(bundle_dist.source.files.root, {
				dot: true,
				cwd: $paths.base,
				base: $paths.base_dot
			}),
			$.debug(),
			$.gulpif(ext.ishtml, $.minify_html()),
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

//#! lib.js -- ./gulp/main/source/tasks/lib.js

/**
 * Remove old lib/ folder.
 */
gulp.task("lib:clean", function(done) {
	pump(
		[gulp.src($paths.lib_home, opts_remove), $.debug.clean(), $.clean()],
		done
	);
});

/**
 * Build the library JS files/folders.
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
			$.prettier($configs.prettier),
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

//#! watch.js -- ./gulp/main/source/tasks/watch.js

/**
 * Watch for files changes.
 */
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
				https: $configs.open.https
			}), // "markdown/preview/README.html"
			port: bs._ports_[0],
			ui: {
				port: bs._ports_[1]
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
					cwd: $paths.html_source
				},
				function() {
					return sequence("html:main");
				}
			);

			// watch for any changes to CSS Source files
			gulp.watch(
				watch_paths.css.source,
				{
					cwd: $paths.css_source
				},
				function() {
					return sequence("css:app");
				}
			);

			// watch for any changes to CSS Lib files
			gulp.watch(
				watch_paths.css.vendor,
				{
					cwd: $paths.css_vendor
				},
				function() {
					return sequence("css:vendor");
				}
			);

			// watch for any changes to JS Source files
			gulp.watch(
				watch_paths.js.source,
				{
					cwd: $paths.js_source
				},
				function() {
					return sequence("js:app");
				}
			);

			// watch for any changes to JS Lib files
			gulp.watch(
				watch_paths.js.vendor,
				{
					cwd: $paths.js_vendor
				},
				function() {
					return sequence("js:vendor");
				}
			);

			// watch for any changes to IMG files
			gulp.watch(
				watch_paths.img,
				{
					cwd: $paths.img_source
				},
				function() {
					return sequence("img:main");
				}
			);

			// watch for any changes to config files
			gulp.watch(
				$paths.config_settings_json_files,
				{
					cwd: $paths.base
				},
				function() {
					return sequence("settings");
				}
			);

			// is the following watcher needed?

			// // watch for any changes to README.md
			// gulp.watch([$paths.readme], {
			//     cwd: $paths.base
			// }, function() {
			//     return sequence("tohtml", function() {
			//         bs.reload();
			//     });
			// });

			done();
		}
	);
});

//#! html.js -- ./gulp/main/source/tasks/html.js

/**
 * Init HTML files + minify.
 */
gulp.task("html:main", function(done) {
	pump(
		[
			gulp.src(bundle_html.source.files, {
				cwd: $paths.html_source
			}),
			$.debug(),
			$.concat(bundle_html.source.names.main),
			$.injection.pre(html_injection),
			$.beautify($configs.jsbeautify),
			$.injection.post(html_injection),
			gulp.dest($paths.base),
			$.debug.edit(),
			bs.stream()
		],
		done
	);
});

//#! css.js -- ./gulp/main/source/tasks/css.js

/**
 * Build app.css + autoprefix + minify.
 */
gulp.task("css:app", function(done) {
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
				autoprefixer($configs.autoprefixer),
				perfectionist($configs.perfectionist)
			]),
			gulp.dest($paths.css_bundles),
			$.debug.edit(),
			bs.stream()
		],
		done
	);
});

/**
 * Build vendor bundle + minify + beautify.
 */
gulp.task("css:vendor", function(done) {
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
				autoprefixer($configs.autoprefixer),
				perfectionist($configs.perfectionist)
			]),
			gulp.dest($paths.css_bundles),
			$.debug.edit(),
			bs.stream()
		],
		done
	);
});

//#! js.js -- ./gulp/main/source/tasks/js.js

/**
 * Build app.js + minify + beautify.
 */
gulp.task("js:app", function(done) {
	pump(
		[
			gulp.src(bundle_js.source.files, {
				cwd: $paths.js_source
			}),
			$.debug(),
			$.concat(bundle_js.source.names.main),
			$.prettier($configs.prettier),
			gulp.dest($paths.js_bundles),
			$.debug.edit(),
			bs.stream()
		],
		done
	);
});

/**
 * Build vendor bundle + minify + beautify.
 */
gulp.task("js:vendor", function(done) {
	// NOTE: absolute vendor library file paths should be used.
	// The paths should be supplied in ./configs/bundles.json
	// within the js.vendor.files array.

	pump(
		[
			gulp.src(bundle_js.vendor.files),
			$.debug(),
			$.concat(bundle_js.vendor.names.main),
			$.prettier($configs.prettier),
			gulp.dest($paths.js_bundles),
			$.debug.edit(),
			bs.stream()
		],
		done
	);
});

//#! img.js -- ./gulp/main/source/tasks/img.js

/**
 * Just trigger a browser-sync stream.
 */
gulp.task("img:main", function(done) {
	// need to copy hidden files/folders?
	// [https://github.com/klaascuvelier/gulp-copy/issues/5]
	pump([gulp.src($paths.img_source), $.debug(), bs.stream()], done);
});

//#! modernizr.js -- ./gulp/main/source/helpers/modernizr.js

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
				var message = chalk.blue("Modernizr build complete. Placed in");
				var location = chalk.green(file_location);
				log(`${message} ${location}`);
				done();
			});
		});
	});
});

//#! tohtml.js -- ./gulp/main/source/helpers/tohtml.js

/**
 * Variable is declared outside of tasks to use be able to use in
 *     multiple tasks. The variable is populated in the tohtml:prepcss
 *     task and used in the tohtml task.
 */
var _markdown_styles_;

/**
 * Get the CSS markdown + prismjs styles.
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
					_markdown_styles_ = contents;
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
	<style>${_markdown_styles_}</style>
</head>
    <body class="markdown-body">${contents}</body>
</html>`;
				}
			}),
			$.beautify($configs.jsbeautify),
			gulp.dest($paths.markdown_preview),
			// open the file when the open flag is provided
			$.gulpif(
				open,
				$.modify({
					fileModifier: function(file, contents) {
						// get the converted HTML file name
						var filename_rel = path.relative(
							process.cwd(),
							file.path
						);
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

//#! open.js -- ./gulp/main/source/helpers/open.js

/**
 * task: open
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
 * -p, --port
 *     [number] The port to open in. (Defaults to browser-sync port if
 *     available or no port at all.)
 *
 * Usage
 *
 * $ gulp open --file index.html --port 3000
 *     Open index.html in port 3000.
 * $ gulp open --file index.html
 *     Open index.html in browser-sync port is available or no port.
 */
gulp.task("open", function(done) {
	// cache task
	var task = this;

	// run yargs
	var _args = yargs
		.option("file", {
			alias: "f",
			demandOption: true,
			type: "string"
		})
		.option("port", {
			alias: "p",
			demandOption: false,
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
});

//#! instance.js -- ./gulp/main/source/helpers/instance.js

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
 * $ gulp ports
 *     Print uses ports.
 */
gulp.task("ports", function(done) {
	// get the ports
	var ports = $internal.get("ports");
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

//#! pretty.js -- ./gulp/main/source/helpers/pretty.js

/**
 * Beautify all HTML, JS, CSS, and JSON project files.
 *
 * Notes
 *
 * • By default files in the following directories or containing the
 *   following sub-extensions are ignored: ./node_modules/, ./git/,
 *   vendor/, .ig., and .min. files.
 * • Special characters in globs provided via the CLI (--glob) might
 *   need to be escaped if getting an error.
 *
 * Flags
 *
 * -t, --type
 *     [string] The file extensions types to clean.
 *
 * -g, --glob
 *     [array] Use a glob to find files to prettify.
 *
 * -s, --show
 *     [boolean] Show the used globs before prettifying.
 *
 * -e, --empty
 *     [boolean] Empty default globs array. Careful as this can prettify
 *     all project files. By default the node_modules/ is ignored, for
 *     example. Be sure to exclude files that don't need to be prettified
 *     by adding the necessary globs with the --glob option.
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
 * $ gulp pretty --glob "some/folder/*.js"
 *     Prettify default files and all JS files.
 *
 * $ gulp pretty --show
 *     Halts prettifying to show the globs to be used for prettifying.
 *
 * $ gulp pretty --empty --glob "some/folder/*.js"
 *     Flag indicating to remove default globs.
 *
 * $ gulp pretty --line-ending "\n"
 *     Make files have "\n" line-ending.
 */
gulp.task("pretty", function(done) {
	var unprefix = require("postcss-unprefix");
	var autoprefixer = require("autoprefixer");
	var perfectionist = require("perfectionist");
	var shorthand = require("postcss-merge-longhand");

	// this task can only run when gulp is not running as gulps watchers
	// can run too many times as many files are potentially being beautified
	if ($internal.get("pid")) {
		// Gulp instance exists so cleanup
		gulp_check_warn();
		return done();
	}

	// run yargs
	var _args = yargs
		.option("type", {
			alias: "t",
			demandOption: false,
			type: "string"
		})
		.option("glob", {
			alias: "g",
			demandOption: false,
			type: "array"
		})
		.option("show", {
			alias: "s",
			demandOption: false,
			type: "boolean"
		})
		.option("empty", {
			alias: "e",
			demandOption: false,
			type: "boolean"
		})
		.option("line-ending", {
			alias: "l",
			demandOption: false,
			type: "string"
		}).argv;
	// get the command line arguments from yargs
	var type = _args.t || _args.type;
	var globs = _args.g || _args.glob;
	var show = _args.s || _args.show;
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
				base: $paths.base_dot
			}),
			$.sort(opts_sort),
			$.gulpif(ext.ishtml, $.beautify($configs.jsbeautify)),
			$.gulpif(
				function(file) {
					// file must be a JSON file and cannot contain the
					// comment (.cm.) sub-extension to be sortable as
					// comments are not allowed in JSON files.
					return ext(file, ["json"]) && !-~file.path.indexOf(".cm.")
						? true
						: false;
				},
				$.json_sort({
					space: jindent
				})
			),
			$.gulpif(function(file) {
				// exclude HTML and CSS files
				return ext(file, ["html", "css"]) ? false : true;
			}, $.prettier($configs.prettier)),
			$.gulpif(
				ext.iscss,
				$.postcss([
					unprefix(),
					shorthand(),
					autoprefixer($configs.autoprefixer),
					perfectionist($configs.perfectionist)
				])
			),
			$.eol(ending),
			$.debug.edit(),
			gulp.dest($paths.base)
		],
		done
	);
});

//#! eol.js -- ./gulp/main/source/helpers/eol.js

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
		demandOption: false,
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
				base: $paths.base_dot
			}),
			$.sort(opts_sort),
			$.eol(ending),
			$.debug.edit(),
			gulp.dest($paths.base)
		],
		done
	);
});

//#! stats.js -- ./gulp/main/source/helpers/stats.js

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
						ext.toUpperCase(),
						count,
						Math.round(count / file_count * 100)
					]);
				}
			}

			table.sort(function(a, b) {
				return b[2] - a[2];
			});

			console.log(table.toString());

			done();
		}
	);
});

//#! files.js -- ./gulp/main/source/helpers/files.js

/**
 * List project files.
 *
 * Flags
 *
 * -t, --type
 *     [string] The optional extensions of files to list.
 *
 * -m, --min
 *     [string] Flag indicating whether to show .min. files.
 *
 * -w, --whereis
 *     [string] File to look for. Uses fuzzy search and
 *     Ignores ./node_modules/).
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
 *     Print JS files with "jquery" in basename.
 *
 * $ gulp files --whereis "fastclick.js"
 *     Prints files containing fastclick.js in basename.
 *
 * $ gulp files --whereis ".ig." --exact
 *     Turn off fuzzy search & find all files containing
 *     ".ig." (ignored).
 *
 * $ gulp files --min
 *     Print files containing ".min." in their name.
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
	if (types) {
		types = types.split(/\s+/);
	}

	// where files will be contained
	var files = [];

	// get all project files
	dir.files(__dirname, function(err, paths) {
		if (err) {
			throw err;
		}

		loop1: for (var i = 0, l = paths.length; i < l; i++) {
			var filepath = paths[i];

			// skip .git/, node_modules/
			var ignores = [$paths.node_modules_name, $paths.git];
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
				files.forEach(function(file) {
					if (-~file.indexOf(whereis)) {
						results.push(file);
					}
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

//#! dependency.js -- ./gulp/main/source/helpers/dependency.js

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

			log(" ".repeat(10), chalk.magenta(dependency), name);
		};

		// get the config path for the bundles file
		var bundles_path = $paths.config_home + $paths.config_bundles + ".json";
		var header = `${bundles_path} > $.vendor.files[...]`;

		// print the dependencies
		log(chalk.green(header.replace("$", "css")));
		css_dependencies.forEach(printer);
		log(chalk.green(header.replace("$", "js")));
		js_dependencies.forEach(printer);

		return done();
	}

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
	del([delete_path]).then(function() {
		var message =
			`Dependency (${name}) ` +
			(action === "add" ? "added" : "removed" + ".");
		if (action === "add") {
			// copy module to location
			pump(
				[
					gulp.src(name + $paths.del + $paths.files_all, {
						dot: true,
						cwd: $paths.node_modules,
						base: $paths.base_dot
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

//#! make.js -- ./gulp/main/source/helpers/make.js

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
				var filename = path.basename(file.path);
				var filename_rel = path.relative(process.cwd(), file.path);
				return stream.pipe(
					$.insert.prepend(
						`//#! ${filename} -- ./${filename_rel}\n\n`
					)
				);
			}),
			// if gulpfile.js exists use that name,
			// else fallback to gulpfile.main.js
			$.gulpif(
				fe.sync($paths.base + name_default),
				$.concat(name_default),
				$.concat(name_main)
			),
			$.prettier($configs.prettier),
			gulp.dest($paths.base),
			$.debug.edit()
		],
		done
	);
});

//#! jshint.js -- ./gulp/main/source/helpers/jshint.js

/**
 * Run jshint on a file.
 *
 * Flags
 *
 * -f, --file
 *     <string>  The JS file to lint.
 *
 * Usage
 *
 * $ gulp jshint --file ./gulpfile.js
 *     Lint gulpfile.js
 *
 */
gulp.task("jshint", function(done) {
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
				cwd: $paths.base
			}),
			$.debug(),
			$.jshint($configs.jshint),
			$.jshint.reporter("jshint-stylish")
		],
		done
	);
});

//#! csslint.js -- ./gulp/main/source/helpers/csslint.js

/**
 * Run csslint on a file.
 *
 * Flags
 *
 * -f, --file
 *     <string>  The CSS file to lint.
 *
 * Usage
 *
 * $ gulp csslint --file ./css/bundles/vendor.css
 *     Lint ./css/bundles/vendor.css
 *
 */
gulp.task("csslint", function(done) {
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
				cwd: $paths.base
			}),
			$.debug(),
			$.csslint($configs.csslint),
			$.csslint.formatter(stylish)
		],
		done
	);
});

//#! htmllint.js -- ./gulp/main/source/helpers/htmllint.js

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

//#! settings.js -- ./gulp/main/source/helpers/settings.js

/**
 * Build ./configs/._settings.json
 *
 * Flags
 *
 * --reconfig
 *     [boolean] Flag is used to rebuild the combined config file
 *     when it was deleted for example. The gulpfile needs this
 *     file and this will force its re-build when it gets deleted
 *     for whatever reason.
 *
 * Usage
 *
 * $ gulp settings # Re-build ._settings.json
 * $ gulp settings --reconfig # Force the re-build ._settings.json when
 *     the file gets deleted for whatever reason.
 */
gulp.task("settings", function(done) {
	pump(
		[
			gulp.src($paths.config_settings_json_files, {
				cwd: $paths.base
			}),
			$.debug(),
			$.strip_jsonc(), // remove any json comments
			$.jsoncombine($paths.config_settings_name, function(data) {
				return new Buffer(JSON.stringify(data, null, jindent));
			}),
			gulp.dest($paths.config_home),
			$.debug.edit()
		],
		done
	);
});

//#! indent.js -- ./gulp/main/source/helpers/indent.js

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

//#! help.js -- ./gulp/main/source/helpers/help.js

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
 * -i, --internal
 *     [boolean] Shows all internal (yellow) tasks.
 *
 * -f, --filter
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
			alias: "v",
			type: "boolean"
		})
		.option("filter", {
			alias: "f",
			type: "string"
		})
		.option("internal", {
			alias: "i",
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
	var gulpfile = fe.sync($paths.base + name_default)
		? name_default
		: name_main;

	// store file content in a variable
	var content = "";

	pump(
		[
			gulp.src(gulpfile, {
				cwd: $paths.base
			}),
			$.fn(function(file) {
				// get the file content
				content = file.contents.toString();
			})
		],
		function() {
			// loop over gulpfile content string and file all the docblocks
			var blocks = [];
			var string = content;
			var docblock_pattern = /^\/\*\*[\s\S]*?\*\/$/m;
			var task_name_pattern = /^gulp.task\(('|")([a-z:\-_]+)\1/;
			var match = string.match(docblock_pattern);
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

				// add the comment and task name to array
				// [ task name , task docblock comment ]
				blocks.push([task_name_match[2], comment]);
				// reset the match pattern
				match = string.match(docblock_pattern);
			}

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
				return chalk.cyan(match);
			};

			var remove_comment_syntax = function(string) {
				return string
					.replace(/(^\/\*\*)|( \*\/$)|( \* ?)/gm, "")
					.trim();
			};

			console.log(newline);
			console.log(chalk.bold("Tasks"));
			console.log(newline);

			var tasks = {};
			var names = [];
			var lengths = [];

			// loop over every match get needed data
			blocks.forEach(function(block) {
				// get task name
				var name = block[0];
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

				// get the description
				var desc = block.substring(0, block.indexOf("\n\n"));

				tasks[name] = {
					text: block,
					desc: desc
				};
				if (name !== "help") {
					names.push(name);
				}
				lengths.push(name.length);
			});

			// sort the array names
			names.sort(function(a, b) {
				return cmp(a, b) || cmp(a.length, b.length);
			});

			// get the task max length
			var max_length = Math.max.apply(null, lengths);

			// filter if flag present
			if (filter) {
				filter = filter.split(" ");
				names = names.filter(function(name) {
					return -~filter.indexOf(name);
				});
			}

			// add the help task to the front of the array
			names.unshift("help");

			// loop over to print this time
			names.forEach(function(name) {
				// get the block
				var task = tasks[name];
				var block = task.text;
				var desc = task.desc;

				var is_internal = -~name.indexOf(":");

				// task name color will change based on whether its
				// an internal task.
				var color = is_internal ? "yellow" : "cyan";

				// only print internal tasks when the internal flag
				// is provided.
				if (is_internal && !internal) {
					return;
				}

				// loop over lines
				if (verbose || name === "help") {
					// bold the tasks
					block = block.replace(/\s\-\-?[a-z-]+/g, replacer);

					// print the task name
					console.log("   " + chalk[color](name));

					var lines = block.split(newline);
					lines.forEach(function(line) {
						if (-~headers.indexOf(line.trim())) {
							line = " ".repeat(6) + (line + ":");
						} else {
							line = "\t" + line;
						}
						console.log(line);
					});

					// bottom padding
					console.log(newline);
				} else {
					// only show the name and its description
					console.log(
						"   " +
							chalk[color](name) +
							" ".repeat(max_length - name.length + 3) +
							desc
					);
				}
			});

			if (!verbose) {
				// bottom padding
				console.log(newline);
			}

			done();
		}
	);
});

//#! favicon.js -- ./gulp/main/source/helpers/favicon.js

/**
 * Generate the favicon icons.
 *
 * Notes
 *
 * • This task takes a few seconds to complete. You should run it at
 *     least once to create the icons. Then, you should run it whenever
 *     RealFaviconGenerator updates its package
 *     (see the check-for-favicon-update task below).
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
		jindent
	);
});

/**
 * Copy favicon.ico and apple-touch-icon.png to the root.
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
			gulp.dest($paths.base),
			$.debug.edit(),
			bs.stream()
		],
		done
	);
});

/**
 * Copy delete unneeded files.
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
		"html:main",
		"tohtml",
		"pretty"
	];
	tasks.push(function() {
		log("Favicons generated.");
		done();
	});
	return sequence.apply(task, tasks);
});

/**
 * Check for updates RealFaviconGenerator.
 *
 * Notes
 *
 * • Think: Apple has just released a new Touch icon along with the
 *     latest version of iOS. Run this task from time to time. Ideally,
 *     make it part of your continuous integration system. Check for
 *     RealFaviconGenerator updates.
 */
gulp.task("favicon:updates", function(done) {
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
