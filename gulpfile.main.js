// @start requires.js ---------------------------------------------------------|

"use strict";

var fs = require("fs");
var path = require("path");

var eol = require("gulp-eol");
var open = require("gulp-open");
var gulpif = require("gulp-if");
var fail = require("gulp-fail");
var sort = require("gulp-sort");
var debug = require("gulp-debug");
var clean = require("gulp-clean");
var cache = require("gulp-cache");
var order = require("gulp-order");
var insert = require("gulp-insert");
var concat = require("gulp-concat");
var rename = require("gulp-rename");
var filter = require("gulp-filter");
var foreach = require("gulp-foreach");
var replace = require("gulp-replace");
var purify = require("gulp-purifycss");
var imagemin = require("gulp-imagemin");
var shorthand = require("gulp-shorthand");
var clean_css = require("gulp-clean-css");
var json_sort = require("gulp-json-sort")
    .default;
var minify_html = require("gulp-minify-html");
var autoprefixer = require("gulp-autoprefixer");
var real_favicon = require("gulp-real-favicon");
var alphabetize = require("alphabetize-object-keys");

// @non_es_uglify
// By default the non es-uglify is used as the default uglifier.
// Remove this comment block, following two require lines, and
// uncomment the @uglify_es comment block to use uglify-es instead.
var uglify = require("gulp-uglify");
var beautify = require("gulp-jsbeautifier");

// @uglify_es
// var composer = require("gulp-uglify/composer");
// var uglify = composer(require("uglify-es"), console);
// var beautify = require("gulp-jsbeautifier");

var del = require("del");
var pump = require("pump");
var glob = require("glob");
var fuzzy = require("fuzzy");
var yargs = require("yargs");
var chalk = require("chalk");
var dir = require("node-dir");
var mkdirp = require("mkdirp");
var git = require("git-state");
var fe = require("file-exists");
var json = require("json-file");
var modernizr = require("modernizr");
var de = require("directory-exists");
var mds = require("markdown-styles");
var cleanup = require("node-cleanup");
var sequence = require("run-sequence");
var browser_sync = require("browser-sync");
var find_free_port = require("find-free-port");
var bs_autoclose = require("browser-sync-close-hook");

// @end   requires.js ---------------------------------------------------------|

// @start paths.js ------------------------------------------------------------|

// paths::BASES
var __PATHS_BASE_DOT = ".";
var __PATHS_DEL = "/";
var __PATHS_BASE = "./";
var __PATHS_DIRNAME = __dirname;
var __PATHS_CWD = process.cwd();
var __PATHS_HOMEDIR = ""; // "assets/";

// paths:DISTRIBUTION (only for apptype=webapp)
var __PATHS_DIST_HOME = "dist/";

// paths: library (only for apptype=library)
var __PATHS_LIB_HOME = "lib/";

// paths:HTML
var __PATHS_HTML_SOURCE = `${__PATHS_HOMEDIR}html/source/`;
var __PATHS_HTML_REGEXP_SOURCE = `${__PATHS_HOMEDIR}html/source/regexp/`;

// paths:CSS
var __PATHS_CSS_SOURCE = `${__PATHS_HOMEDIR}css/source/`;
var __PATHS_CSS_VENDOR = `${__PATHS_HOMEDIR}css/vendor/`;
var __PATHS_NOT_CSS_VENDOR = `!${__PATHS_HOMEDIR}css/vendor/**/*.*`;
var __PATHS_CSS_BUNDLES = `${__PATHS_HOMEDIR}css/bundles/`;
var __PATHS_USERS_CSS_FILE = "styles.css";

// paths::PURIFY_CSS
var __PATHS_PURE_FILE = `${__PATHS_HOMEDIR}css/pure.css`;
var __PATHS_PURE_FILE_NAME = "pure.css";
var __PATHS_PURIFY_JS_SOURCE_FILES = `${__PATHS_HOMEDIR}js/bundles/*.js`;
var __PATHS_PURE_SOURCE = "source/";
var __PATHS_PURE_CSS = `${__PATHS_HOMEDIR}css/`;

// paths:JS
var __PATHS_JS_SOURCE = `${__PATHS_HOMEDIR}js/source/`;
var __PATHS_JS_VENDOR = `${__PATHS_HOMEDIR}js/vendor/`;
var __PATHS_NOT_JS_VENDOR = `!${__PATHS_HOMEDIR}js/vendor/**/*.*`;
var __PATHS_JS_BUNDLES = `${__PATHS_HOMEDIR}js/bundles/`;

// paths:IMG
var __PATHS_IMG_SOURCE = `${__PATHS_HOMEDIR}img/**/*`;

// paths:GULP
var __PATHS_GULP_HOME = `${__PATHS_HOMEDIR}gulp/`;
var __PATHS_GULP_SOURCE = `${__PATHS_HOMEDIR}gulp/source/`;
var __PATHS_GULPDIR = `./${__PATHS_HOMEDIR}gulp/`;
var __PATHS_GULP_UTILS = `./${__PATHS_HOMEDIR}gulp/assets/utils/utils.js`;
var __PATHS_GULP_FILE_NAME = "gulpfile.js";

// paths:MARKDOWN
var __PATHS_MARKDOWN_PREVIEW = `${__PATHS_HOMEDIR}markdown/preview/`;
var __PATHS_MARKDOWN_SOURCE = `${__PATHS_HOMEDIR}markdown/source/`;

// paths:CONFIG_FILES
var __PATHS_CONFIG_USER = `./${__PATHS_HOMEDIR}gulp/assets/config/user.json`;
var __PATHS_CONFIG_INTERNAL = `./${__PATHS_HOMEDIR}gulp/assets/config/.hidden-internal.json`;
var __PATHS_CONFIG_MODERNIZR = `./${__PATHS_HOMEDIR}modernizr.config.json`;

// paths:FAVICONS
// file where the favicon markups are stored
var __PATHS_FAVICON_DATA_FILE = `./${__PATHS_HOMEDIR}gulp/assets/favicon/favicondata.json`;
var __PATHS_FAVICON_DEST = `${__PATHS_HOMEDIR}favicon/`;
var __PATHS_FAVICON_MASTER_PIC = `./${__PATHS_HOMEDIR}img/logo/leaf-900.png`;
var __PATHS_FAVICON_ROOT_ICO = `./${__PATHS_HOMEDIR}favicon/favicon.ico`;
var __PATHS_FAVICON_ROOT_PNG = `./${__PATHS_HOMEDIR}favicon/apple-touch-icon.png`;
var __PATHS_FAVICON_ROOT_CONFIG = `./${__PATHS_HOMEDIR}favicon/browserconfig.xml`;
var __PATHS_FAVICON_ROOT_MANIFEST = `./${__PATHS_HOMEDIR}favicon/manifest.json`;
var __PATHS_FAVICON_HTML = `./${__PATHS_HOMEDIR}html/source/head/favicon.html`;
var __PATHS_FAVICON_HTML_DEST = `./${__PATHS_HOMEDIR}html/source/head/`;

// paths:OTHER
var __PATHS_GIT = ".git/";
var __PATHS_GITHEAD = ".git/HEAD";
var __PATHS_README = "README.md";
var __PATHS_README_HTML = "README.html";
var __PATHS_ALLFILES = "**/*.*";
var __PATHS_FILES_BEAUTIFY = "**/*.{html,css,js,json}";
var __PATHS_FILES_BEAUTIFY_EXCLUDE_MIN = "!**/*.min.*";
var __PATHS_FILES_MIN = "**/*.min.*";
var __PATHS_FILES_TEST = "!test*";
var __PATHS_NOT_VENDOR = `!${__PATHS_HOMEDIR}*/vendor/**`;
var __PATHS_NODE_MODULES_NAME = "node_modules/";
var __PATHS_NODE_MODULES = "./node_modules/";
var __PATHS_VENDOR_MODERNIZR = `./${__PATHS_HOMEDIR}js/vendor/modernizr/`;
var __PATHS_MODERNIZR_FILE = "modernizr.js";

// @end   paths.js ------------------------------------------------------------|

// @start vars.js -------------------------------------------------------------|

// configuration information
var config_user = require(__PATHS_CONFIG_USER);
// internal Gulp configuration file
var config_internal = json.read(__PATHS_CONFIG_INTERNAL);
// modernizr configuration file
var config_modernizr = json.read(__PATHS_CONFIG_MODERNIZR);

// plugin options
var opts = config_user.options;
var opts_plugins = opts.plugins;
var opts_bt = opts_plugins.beautify;
var opts_ap = opts_plugins.autoprefixer;
var opts_bs = opts_plugins.browsersync;
var opts_ffp = opts_plugins.find_free_port;
var json_format = opts_plugins.json_format;
var json_spaces = json_format.indent_size;

// config regexp
var regexp = config_user.regexp;
var regexp_html = config_user.regexp.html;
var regexp_css = config_user.regexp.css;

// paths/bundles
var paths = config_user.paths;
var bundles = config_user.bundles;
var bundle_html = bundles.html;
var bundle_css = bundles.css;
var bundle_js = bundles.js;
var bundle_img = bundles.img;
var bundle_gulp = bundles.gulp;
var bundle_dist = bundles.dist;
var bundle_lib = bundles.lib;

// project utils
var utils = require(__PATHS_GULP_UTILS);
var color = utils.color;
var log = utils.log;
var time = utils.time;
var notify = utils.notify;
var gulp = utils.gulp;
var uri = utils.uri;
var browser = utils.browser;

var APPTYPE = config_internal.get("apptype");
var INDEX = config_user.paths.index;
var BASE = config_user.paths.base;
var ROOTDIR = path.basename(path.resolve(__PATHS_DIRNAME)) + "/";
var APPDIR = BASE + ROOTDIR;

// create browsersync server
var bs = browser_sync.create(opts_bs.server_name);

var branch_name;
// remove options
var opts = {
    read: false,
    cwd: __PATHS_BASE
};

var html_injection_vars = {
    "css_app_bundle": __PATHS_CSS_BUNDLES + bundle_css.source.name,
    "css_libs_bundle": __PATHS_CSS_BUNDLES + bundle_css.vendor.name,
    "js_app_bundle": __PATHS_JS_BUNDLES + bundle_js.source.name,
    "js_libs_bundle": __PATHS_JS_BUNDLES + bundle_js.vendor.name
};

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

// @end   vars.js -------------------------------------------------------------|

// @start functions.js --------------------------------------------------------|

/**
 * @description [Opens the provided file in the user's browser.]
 * @param  {String}   filepath  [The path of the file to open.]
 * @param  {Number}   port     	[The port to open on.]
 * @param  {Function} callback  [The Gulp task callback to run.]
 * @param  {Object} task  		[The Gulp task.]
 * @return {Undefined}          [Nothing is returned.]
 */
function open_file_in_browser(filepath, port, callback, task) {
    pump([gulp.src(filepath, {
            cwd: __PATHS_BASE,
            dot: true
        }),
        open({
            app: browser,
            uri: uri({
                "appdir": APPDIR,
                "filepath": filepath,
                "port": port,
                "https": config_user.https
            })
        }),
		debug(task.__wadevkit.debug)
    ], function() {
        notify("File opened!");
        callback();
    });
}

/**
 * @description [Returns a function that handles HTML $:pre/post{file-content/$variable}
 *               injection.]
 * @param {Object} [Replacements object.]
 * @return {Function} [Replacement function.]
 */
function html_replace_fn(replacements) {
    return function(match) {
        var injection_name = match.replace(/\$\:(pre|post)\{|\}$/g, "");
        // check whether doing a file or variable injection
        if (injection_name.charAt(0) !== "$") { // file content-injection
            injection_name = __PATHS_HTML_REGEXP_SOURCE + match.replace(/\$\:(pre|post)\{|\}$/g, "");
            var extentions = ".{text,txt}";
            var filename = glob.sync(injection_name + extentions)[0];
            // if glob does not return a match then the file does not exists.
            // therefore, just return undefined.
            if (!filename) return undefined;
            // check that file exists before opening/reading...
            // return undefined when file does not exist...else return its contents
            return (!fe.sync(filename)) ? undefined : fs.readFileSync(filename)
                .toString()
                .trim();
        } else { //variable injection
            injection_name = injection_name.replace(/^\$/, "");
            // lookup its replacement
            return replacements[injection_name] || undefined;
        }
    };
}

/**
 * @description [Print that an active Gulp instance exists.]
 * @return {Undefined} 			[Nothing is returned.]
 */
function gulp_check_warn() {
    log(chalk.red("Task cannot be performed while Gulp is running. Close Gulp then try again."));
}

/**
 * @description [Render output from tasks.]
 * @param {TaskList} tasks 			[The Gulp tasks.]
 * @param {Boolean}  verbose=false  [Flag indicating whether to show hide tasks with the verbose flag.]
 * @returns {String} [The text to print.]
 * @source [https://github.com/megahertz/gulp-task-doc/blob/master/lib/printer.js]
 */
function print_tasks(tasks, verbose, filter) {

    tasks = tasks.filterHidden(verbose)
        .sort();

    // determine the header
    var header = (filter ? "Filtered" : "Tasks");
    var results = ["", chalk.underline.bold(header), ""];
    var help_doc = ["", chalk.underline.bold("Help")];

    var field_task_len = tasks.getLongestNameLength();

    tasks.forEach(function(task) {

        // help task will always be placed before all other tasks
        // to always have its documentation present.
        var is_help_task = (task.name === "help");
        // determine the correct array to reference
        var array_ref = (is_help_task ? help_doc : results);

        var comment = task.comment || {};
        var lines = comment.lines || [];

        array_ref.push(format_column(task.name, field_task_len) + (lines[0] || ""));
        // only print verbose documentation when flag is provided
        if (verbose || is_help_task) {
            for (var i = 1; i < lines.length; i++) {
                array_ref.push(format_column("", field_task_len) + "  " + lines[i]);
                if (verbose && i === lines.length - 1) array_ref.push("\n");
            }
        }
    });

    if (!verbose) results.push("\n");

    return help_doc.concat(results)
        .join("\n");
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
    return new Array(offset_left + 1)
        .join(" ") + chalk.magenta(text) + new Array(Math.max(width - text.length, 0) + 1)
        .join(" ") + new Array(offset_right + 1)
        .join(" ");
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

// @end   functions.js --------------------------------------------------------|

// @start init.js -------------------------------------------------------------|

// when gulp is closed, either on error, crash, or intentionally, do a quick cleanup
cleanup(function(exit_code, signal) {
    // check for current Gulp process
    var pid = config_internal.get("pid");
    if (pid) { // Gulp instance exists so cleanup
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
    config_internal.write(function() { // save changes to file
        done();
    }, null, json_spaces);
});

// watch for git branch changes:
// branch name checks are done to check whether the branch was changed after
// the gulp command was used. this is done as when switching branches files
// and file structure might be different. this can cause some problems with
// the watch tasks and could perform gulp tasks when not necessarily wanted.
// to resume gulp simply restart with the gulp command.
// @internal
gulp.task("init:watch-git-branch", function(done) {
    git.isGit(__PATHS_DIRNAME, function(exists) {
        // if no .git exists simply ignore and return done
        if (!exists) return done();
        git.check(__PATHS_DIRNAME, function(err, result) {
            if (err) throw err;
            // record branch name
            branch_name = result.branch;
            // set the gulp watcher as .git exists
            gulp.watch([__PATHS_GITHEAD], {
                cwd: __PATHS_BASE,
                dot: true
            }, function() {
                var brn_current = git.checkSync(__PATHS_DIRNAME)
                    .branch;
                if (branch_name) log(chalk.yellow("(pid:" + process.pid + ")"), "Gulp monitoring", chalk.green(branch_name), "branch.");
                if (brn_current !== branch_name) {
                    // message + exit
                    log("Gulp stopped due to branch switch. (", chalk.green(branch_name), "=>", chalk.yellow(brn_current), ")");
                    log("Restart Gulp to monitor", chalk.yellow(brn_current), "branch.");
                    process.exit();
                }
            });
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
    var args = yargs.argv; // get cli parameters
    if (args.s || args.stop) { // end the running Gulp process
        // get pid, if any
        var pid = config_internal.get("pid");
        if (pid) { // kill the open process
            log(chalk.green("Gulp process stopped."));
            process.kill(pid);
        } else { // no open process exists
            log("No Gulp process exists.");
        }
        return done();
    } else { // start up Gulp like normal
        return find_free_port(opts_ffp.port_range.start, opts_ffp.port_range.end, opts_ffp.ip, opts_ffp.port_count, function(err, p1, p2) {
            // get pid, if any
            var pid = config_internal.get("pid");
            // if there is a pid present it means a Gulp instance has already started.
            // therefore, prevent another from starting.
            if (pid) {
                log(chalk.yellow("A Gulp instance is already running", chalk.yellow("(pid:" + pid + ")") + ".", "Stop that instance before starting a new one."));
                return done();
            }
            // store the ports
            config_internal.set("ports", {
                "local": p1,
                "ui": p2
            });
            // save ports
            config_internal.write(function() {
                // store ports on the browser-sync object itself
                bs.__ports__ = [p1, p2]; // [app, ui]
                // after getting the free ports, finally run the build task
                return sequence("init:save-pid", "init:watch-git-branch", "init:build", "watch:main", function() {
                    done();
                });
            }, null, json_spaces);
        });
    }
});

// @end   init.js -------------------------------------------------------------|

// @start task-dist.js --------------------------------------------------------|

// remove old dist / folder
// @internal
gulp.task("dist:clean", function(done) {
    var task = this;
    pump([gulp.src(__PATHS_DIST_HOME, opts),
        clean(),
        debug(task.__wadevkit.debug)
    ], done);
});

// copy new file/folders
// @internal
gulp.task("dist:favicon", function(done) {
    var task = this;
    pump([gulp.src(bundle_dist.source.files.favicon, {
            dot: true,
            cwd: __PATHS_BASE,
            // https://github.com/gulpjs/gulp/issues/151#issuecomment-41508551
            base: __PATHS_BASE_DOT
        }),
    	debug(task.__wadevkit.debug),
    	gulp.dest(__PATHS_DIST_HOME)
    ], done);
});

// @internal
gulp.task("dist:css", function(done) {
    var task = this;
    var is_css = function(file) {
        return (path.extname(file.path)
            .toLowerCase() === ".css");
    };
    pump([gulp.src(bundle_dist.source.files.css, {
            dot: true,
            cwd: __PATHS_BASE,
            base: __PATHS_BASE_DOT
        }),
		gulpif(is_css, clean_css()),
		debug(task.__wadevkit.debug),
    	gulp.dest(__PATHS_DIST_HOME)
    ], done);
});

// @internal
gulp.task("dist:img", function(done) {
    var task = this;
    // need to copy hidden files/folders?
    // [https://github.com/klaascuvelier/gulp-copy/issues/5]
    pump([gulp.src(bundle_dist.source.files.img, {
            dot: true,
            cwd: __PATHS_BASE,
            base: __PATHS_BASE_DOT
        }),
		cache(imagemin([
            imagemin.gifsicle({
                interlaced: true
            }),
            imagemin.jpegtran({
                progressive: true
            }),
            imagemin.optipng({
                optimizationLevel: 5
            }),
            imagemin.svgo({
                plugins: [{
                    removeViewBox: true
                }]
            })
        ])),
    	gulp.dest(__PATHS_DIST_HOME),
		debug(task.__wadevkit.debug)
    ], done);
});

// @internal
gulp.task("dist:js", function(done) {
    var task = this;
    var is_js = function(file) {
        return (path.extname(file.path)
            .toLowerCase() === ".js");
    };
    pump([gulp.src(bundle_dist.source.files.js, {
            dot: true,
            cwd: __PATHS_BASE,
            base: __PATHS_BASE_DOT
        }),
    	gulpif(is_js, uglify()),
    	gulp.dest(__PATHS_DIST_HOME),
		debug(task.__wadevkit.debug)
    ], done);
});

// @internal
gulp.task("dist:root", function(done) {
    var task = this;
    var is_html = function(file) {
        return (path.extname(file.path)
            .toLowerCase() === ".html");
    };
    pump([gulp.src(bundle_dist.source.files.root, {
            dot: true,
            cwd: __PATHS_BASE,
            base: __PATHS_BASE_DOT
        }),
    	gulpif(is_html, minify_html()),
    	gulp.dest(__PATHS_DIST_HOME),
    	debug(task.__wadevkit.debug)
    ], done);
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

// @end   task-dist.js --------------------------------------------------------|

// @start task-lib.js ---------------------------------------------------------|

// remove old lib/ folder
// @internal
gulp.task("lib:clean", function(done) {
    var task = this;
    pump([gulp.src(__PATHS_LIB_HOME, opts),
        clean(),
        debug(task.__wadevkit.debug)
    ], done);
});

// @internal
gulp.task("lib:js", function(done) {
    var task = this;
    pump([gulp.src(bundle_js.source.files, {
            nocase: true,
            cwd: __PATHS_JS_SOURCE
        }),
    	// filter out all but test files (^test*/i)
		filter([__PATHS_ALLFILES, __PATHS_FILES_TEST]),
		debug(),
        concat(bundle_js.vendor.name),
        beautify(opts_bt),
        gulp.dest(__PATHS_LIB_HOME),
        debug(task.__wadevkit.debug),
        uglify(),
        rename(bundle_js.vendor.minified_name),
		gulp.dest(__PATHS_LIB_HOME),
        debug(task.__wadevkit.debug)
    ], done);
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

// @end   task-lib.js ---------------------------------------------------------|

// @start tasks-watch.js ------------------------------------------------------|

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
    bs.init({

        browser: browser,
        proxy: uri({
            "appdir": APPDIR,
            "filepath": INDEX,
            "https": config_user.https
        }), // "markdown/preview/README.html"
        port: bs.__ports__[0],
        ui: {
            port: bs.__ports__[1]
        },
        notify: false,
        open: true

    }, function() {

        // the gulp watchers

        // watch for any changes to HTML files
        gulp.watch(bundles.gulp.watch.html, {
            cwd: __PATHS_HTML_SOURCE
        }, function() {
            return sequence("html:main");
        });

        // watch for any changes to CSS Source files
        gulp.watch(bundles.gulp.watch.css.source, {
            cwd: __PATHS_CSS_SOURCE
        }, function() {
            return sequence("css:app");
        });

        // watch for any changes to CSS Lib files
        gulp.watch(bundles.gulp.watch.css.vendor, {
            cwd: __PATHS_CSS_VENDOR
        }, function() {
            return sequence("css:libs");
        });

        // watch for any changes to JS Source files
        gulp.watch(bundles.gulp.watch.js.source, {
            cwd: __PATHS_JS_SOURCE
        }, function() {
            return sequence("js:app");
        });

        // watch for any changes to JS Lib files
        gulp.watch(bundles.gulp.watch.js.vendor, {
            cwd: __PATHS_JS_VENDOR
        }, function() {
            return sequence("js:libs");
        });

        // watch for any changes to IMG files
        gulp.watch(bundles.gulp.watch.img, {
            cwd: __PATHS_IMG_SOURCE
        }, function() {
            return sequence("img:main");
        });

        // watch for any changes to README.md
        gulp.watch([__PATHS_README], {
            cwd: __PATHS_BASE
        }, function() {
            return sequence("readme:main", function() {
                bs.reload();
            });
        });

        done();

    });
});

// @end   tasks-watch.js ------------------------------------------------------|

// @start tasks-html.js -------------------------------------------------------|

// init HTML files + minify
// @internal
gulp.task("html:main", function(done) {
    var task = this;
    // RegExp used for $:pre/post{filename/$var} HTML file-content/$variable injection
    var r_pre = regexp_html.pre;
    var r_post = regexp_html.post;
    pump([gulp.src(bundles.html.source.files, {
            cwd: __PATHS_HTML_SOURCE
        }),
    	debug(),
		concat(bundles.html.source.name),
		replace(new RegExp(r_pre.p, r_pre.f), html_replace_fn(html_injection_vars)),
		beautify(opts_bt),
		replace(new RegExp(r_post.p, r_post.f), html_replace_fn(html_injection_vars)),
		gulp.dest(__PATHS_BASE),
		debug(task.__wadevkit.debug),
		bs.stream()
    ], done);
});

// @end   tasks-html.js -------------------------------------------------------|

// @start tasks-css.js --------------------------------------------------------|

// preform custom regexp replacements
// @internal
gulp.task("css:preapp", function(done) {
    var task = this;
    // RegExp used for custom CSS code modifications
    var pf = regexp_css.prefixes;
    var lz = regexp_css.lead_zeros;
    var ez = regexp_css.empty_zero;
    var lh = regexp_css.lowercase_hex;
    pump([gulp.src(__PATHS_USERS_CSS_FILE, {
            cwd: __PATHS_CSS_SOURCE
        }),
    	debug(),
        // [https://www.mikestreety.co.uk/blog/find-and-remove-vendor-prefixes-in-your-css-using-regex]
        replace(new RegExp(pf.p, pf.f), pf.r),
        replace(new RegExp(lz.p, lz.f), lz.r),
        replace(new RegExp(ez.p, ez.f), ez.r),
        replace(new RegExp(lh.p, lh.f), function(match) {
            return match.toLowerCase();
        }),
        gulp.dest(__PATHS_CSS_SOURCE),
		debug(task.__wadevkit.debug),
        bs.stream()
    ], done);
});

// build app.css + autoprefix + minify
// @internal
gulp.task("css:app", ["css:preapp"], function(done) {
    var task = this;
    pump([gulp.src(bundle_css.source.files, {
            cwd: __PATHS_CSS_SOURCE
        }),
    	debug(),
        concat(bundle_css.source.name),
        autoprefixer(opts_ap),
        shorthand(),
        beautify(opts_bt),
        gulp.dest(__PATHS_CSS_BUNDLES),
    	debug(task.__wadevkit.debug),
        bs.stream()
    ], done);
});

// build libs.css + minify + beautify
// @internal
gulp.task("css:libs", function(done) {
    var task = this;

    // NOTE: absolute vendor library file paths should be used.
    // The paths should be supplied in gulp/assets/config/user.json
    // within the bundles.css.vendor.files array.

    pump([gulp.src(bundle_css.vendor.files),
    	debug(),
        concat(bundle_css.vendor.name),
        autoprefixer(opts_ap),
        shorthand(),
        beautify(opts_bt),
		gulp.dest(__PATHS_CSS_BUNDLES),
    	debug(task.__wadevkit.debug),
        bs.stream()
    ], done);
});

// @end   tasks-css.js --------------------------------------------------------|

// @start tasks-js.js ---------------------------------------------------------|

// build app.js + minify + beautify
// @internal
gulp.task("js:app", function(done) {
    var task = this;
    pump([gulp.src(bundle_js.source.files, {
            cwd: __PATHS_JS_SOURCE
        }),
    	debug(),
        concat(bundle_js.source.name),
        beautify(opts_bt),
        gulp.dest(__PATHS_JS_BUNDLES),
    	debug(task.__wadevkit.debug),
        bs.stream()
    ], done);
});

// build libs.js + minify + beautify
// @internal
gulp.task("js:libs", function(done) {
    var task = this;

    // NOTE: absolute vendor library file paths should be used.
    // The paths should be supplied in gulp/assets/config/user.json
    // within the bundles.js.vendor.files array.

    pump([gulp.src(bundle_js.vendor.files),
    	debug(),
        concat(bundle_js.vendor.name),
        beautify(opts_bt),
        gulp.dest(__PATHS_JS_BUNDLES),
    	debug(task.__wadevkit.debug),
        bs.stream()
    ], done);
});

// @end   tasks-js.js ---------------------------------------------------------|

// @start tasks-images.js -----------------------------------------------------|

// just trigger a browser-sync stream
// @internal
gulp.task("img:main", function(done) {
    var task = this;
    // need to copy hidden files/folders?
    // [https://github.com/klaascuvelier/gulp-copy/issues/5]
    pump([gulp.src(__PATHS_IMG_SOURCE),
		debug(),
        bs.stream()
    ], done);
});

// @end   tasks-images.js -----------------------------------------------------|

// @start tasks-markdown.js ---------------------------------------------------|

// markdown to html (with github style/layout)
// @internal
gulp.task("readme:main", function(done) {
    var task = this;
    mds.render(mds.resolveArgs({
        input: path.join(__PATHS_CWD, __PATHS_README),
        output: path.join(__PATHS_CWD, __PATHS_MARKDOWN_PREVIEW),
        layout: path.join(__PATHS_CWD, __PATHS_MARKDOWN_SOURCE)
    }), function() {
        // cleanup README.html
        pump([gulp.src(__PATHS_README_HTML, {
                cwd: __PATHS_MARKDOWN_PREVIEW
            }),
            beautify(opts_bt),
            gulp.dest(__PATHS_MARKDOWN_PREVIEW),
			debug(task.__wadevkit.debug),
            bs.stream()
        ], done);
    });
});

// @end   tasks-markdown.js ---------------------------------------------------|

// @start helpers.js ----------------------------------------------------------|

/**
 * Build Modernizr file.
 *
 * Usage
 *
 * $ gulp modernizr # Build modernizr.js. Make changes to ./modernizr.config.json
 */
gulp.task("modernizr", function(done) {
    modernizr.build(config_modernizr.data, function(build) {
        var file_location = __PATHS_VENDOR_MODERNIZR + __PATHS_MODERNIZR_FILE;
        // create missing folders
        mkdirp(__PATHS_VENDOR_MODERNIZR, function(err) {
            if (err) throw err;
            // save the file to vendor
            fs.writeFile(file_location, build, function() {
                log(`Modernizr build complete. Placed in ${file_location}`);
                done();
            });
        });
    });
});

/**
 * Purge potentially unused CSS style definitions.
 *
 * Options
 *
 * (no options)  ---------  Creates pure.css which contains only used styles.
 * -r, --remove  [boolean]  Deletes pure.css and removes unused CSS.
 * -D, --delete  [boolean]  Deletes pure.css.
 *
 * Usage
 *
 * $ gulp purify # Creates pure.css which contains only used styles.
 * $ gulp purify --remove # Deletes pure.css and removes unused CSS.
 * $ gulp purify --delete # Deletes pure.css.
 */
gulp.task("purify", function(done) {
    var task = this;
    // run yargs
    var _args = yargs.usage("Usage: $0 --remove [boolean]")
        .option("remove", {
            alias: "r",
            default: false,
            describe: "Removes pure.css.",
            type: "boolean"
        })
        .option("delete", {
            alias: "D",
            default: false,
            describe: "Removes pure.css and removed unused CSS.",
            type: "boolean"
        })
        .argv;
    // get the command line arguments from yargs
    var remove = _args.r || _args.remove;
    var delete_file = _args.D || _args.delete;
    // remove pure.css
    if (remove || delete_file) del([__PATHS_PURE_FILE]);
    // don't run gulp just delete the file.
    if (delete_file) return done();
    pump([gulp.src(__PATHS_USERS_CSS_FILE, {
            cwd: __PATHS_CSS_SOURCE
        }),
    	debug(),
        purify([__PATHS_PURIFY_JS_SOURCE_FILES, INDEX], {
            info: true,
            rejected: true
        }),
        gulpif(!remove, rename(__PATHS_PURE_FILE_NAME)),
        beautify(opts_bt),
        gulp.dest(__PATHS_PURE_CSS + (remove ? __PATHS_PURE_SOURCE : "")),
        debug(task.__wadevkit.debug)
    ], done);
});

/**
 * Converts MarkDown (.md) file to its HTML counterpart (with GitHub style/layout).
 *
 * Options
 *
 * -i, --input   <string>  Path of file to convert (Markdown => HTML).
 * -o, --output  <string>  Path where converted HTML file should be placed.
 * -n, --name    <string>  New name of converted file.
 *
 * Usage
 *
 * $ gulp tohtml --input README.md --output /markdown/preview --name Converted.html.
 * # Convert README.md to Converted.html and place in /markdown/preview.
 */
gulp.task("tohtml", function(done) {
    var task = this;
    // run yargs
    var _args = yargs.usage("Usage: $0 --input [string] --output [string] --name [string]")
        .option("input", {
            alias: "i",
            demandOption: true,
            describe: "Path of file to convert (Markdown => HTML).",
            type: "string"
        })
        .option("output", {
            alias: "o",
            demandOption: true,
            describe: "Path where converted HTML file should be placed.",
            type: "string"
        })
        .option("name", {
            alias: "n",
            demandOption: false,
            describe: "New name of converted file.",
            type: "string"
        })
        .argv;
    // get provided parameters
    var input = _args.i || _args.input;
    var output = _args.o || _args.output;
    var new_name = _args.n || _args.name;
    // file has to exist
    fe(input, function(err, exists) {
        if (!exists) {
            log("File does not exist.");
            return done();
        }
        // continue...file exists
        // check for an .md file
        var input_ext = path.extname(input);
        // file must be an .md file
        if (input_ext.toLowerCase() !== ".md") {
            log("Input file must be an .md file.");
            return done();
        }
        // get the input file name
        var input_filename = path.basename(input, input_ext);
        // get the new file name, default to input_filename when nothing is given
        new_name = (!new_name) ? undefined : path.basename(new_name, path.extname(new_name));
        // render Markdown to HTML
        mds.render(mds.resolveArgs({
            input: path.join(__PATHS_CWD, input),
            output: path.join(__PATHS_CWD, output),
            layout: path.join(__PATHS_CWD, __PATHS_MARKDOWN_SOURCE)
        }), function() {
            var new_file_path = output + "/" + input_filename + ".html";
            // cleanup README.html
            pump([gulp.src(new_file_path, {
                    cwd: __PATHS_BASE
                }),
                beautify(opts_bt),
                // if a new name was provided, rename the file
                gulpif(new_name !== undefined, rename(new_name + ".html")),
                gulp.dest(output),
                debug(task.__wadevkit.debug)
            ], function() {
                // if a new name was provided delete the file with the old input file
                if (new_name) del([new_file_path]);
                done();
            });
        });
    });
});

/**
 * Opens provided file in browser.
 *
 * Options
 *
 * -f, --file  <file>    The path of the file to open.
 * -p, --port  [number]  The port to open in. (Defaults to browser-sync port)
 *
 * Usage
 *
 * $ gulp open --file index.html --port 3000 # Open index.html in port 3000.
 */
gulp.task("open", function(done) {
    var task = this;
    // run yargs
    var _args = yargs.usage("Usage: $0 --file [string] --port [number]")
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
        })
        .argv;
    // get the command line arguments from yargs
    var file = _args.f || _args.file;
    var port = _args.p || _args.port;
    // if port is provided use that
    if (port) {
        open_file_in_browser(file, port, done, task);
    } else { // else get the used port, if any
        // get the ports
        var ports = config_internal.get("ports");
        // no ports...
        if (!ports) {
            log("No ports are in use.");
            return done();
        }
        // open file in the browser
        open_file_in_browser(file, ports.local, done, task);
    }
});

/**
 * Print whether there is an active Gulp instance.
 *
 * Usage
 *
 * $ gulp status # Print Gulp status.
 */
gulp.task("status", function(done) {
    log("Gulp is", ((config_internal.get("pid")) ? "running. " + chalk.yellow(("(pid:" + process.pid + ")")) : "not running."));
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
    log(chalk.green("(local)"), ports.local);
    log(chalk.green("(ui)"), ports.ui);
    done();
});

/**
 * Beautify all HTML, JS, CSS, and JSON project files. Excludes ./node_modules/.
 *
 * Usage
 *
 * $ gulp pretty # Prettify files.
 */
gulp.task("pretty", function(done) {
    var task = this;
    // this task can only run when gulp is not running as gulps watchers
    // can run too many times as many files are potentially being beautified
    if (config_internal.get("pid")) { // Gulp instance exists so cleanup
        gulp_check_warn();
        return done();
    }
    var condition = function(file) {
        return (path.extname(file.path)
            .toLowerCase() === ".json");
    };
    // get needed files
    pump([gulp.src([__PATHS_FILES_BEAUTIFY, __PATHS_FILES_BEAUTIFY_EXCLUDE_MIN, bangify(globall(__PATHS_NODE_MODULES_NAME)), bangify(globall(__PATHS_GIT)), __PATHS_NOT_VENDOR], {
            dot: true,
            cwd: __PATHS_BASE
        }),
		sort(opts_sort),
		beautify(opts_bt),
		gulpif(condition, json_sort({
            "space": json_spaces
        })),
		eol(),
		debug(task.__wadevkit.debug),
		gulp.dest(__PATHS_BASE)
    ], done);
});

/**
 * List project files.
 *
 * Options
 *
 * -t, --types    [string]  The optional extensions of files to list.
 * -m, --min      [string]  Flag indicating whether to show .min. files.
 * -w, --whereis  [string]  File name of file to look for. (Uses fuzzy search, Excludes ./node_modules/)
 *
 * Usage
 *
 * $ gulp files # Default will show all files excluding ./node_modules/ and .git/ folders and files.
 * $ gulp files --type "js html" # Only list HTML and JS files.
 * $ gulp files --type "js" --whereis "jquery" # List JS files with jquery in the file basename.
 * $ gulp files --whereis "fastclick.js" # Lists files containing fastclick.js in its basename.
 */
gulp.task("files", function(done) {
    // run yargs
    var _args = yargs.usage("Usage: $0 --type [string]")
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
        .argv;

    // get the command line arguments from yargs
    var types = (_args.t || _args.type);
    var min = (_args.m || _args.min);
    var whereis = (_args.w || _args.whereis);
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
            var ignores = [__PATHS_NODE_MODULES_NAME, __PATHS_GIT];
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
                return (-~types.indexOf(path.extname(filepath)
                    .toLowerCase()
                    .slice(1)));
            });
        }

        // filter the files based on their whether its a minified (.min.) file
        if (min) {
            files = files.filter(function(filepath) {
                return (-~path.basename(filepath)
                    .indexOf(".min."));
            });
        }

        // if whereis parameter is provided run a fuzzy search on files
        if (whereis) {
            var fuzzy_results = fuzzy.filter(whereis, files, {});
            // turn into an array
            var results = [];
            fuzzy_results.forEach(function(result) {
                results.push(result.string);
            });
            // reset var
            files = results;
        }

        // log files
        pump([gulp.src(files),
			sort(opts_sort),
			debug()
	    ], done);

    });
});

/**
 * Add/remove front-end dependencies from ./node_modules/ to its JS/CSS library folder.
 *
 * Options
 *
 * -n, --name    <string>  The module name.
 * -t, --type    <string>  Dependency type (js/css).
 * -a, --action  <string>  Action to take (add/remove).
 *
 * Usage
 *
 * $ gulp dependency -n fastclick -t js -a add # Copy fastclick to JS libs directory.
 * $ gulp dependency -n fastclick -t js -a remove # Remove fastclick from JS libs directory.
 * $ gulp dependency -n font-awesome -t css -a add # Add font-awesome to CSS libs directory.
 */
gulp.task("dependency", function(done) {
    var task = this;
    // run yargs
    var _args = yargs.usage("Usage: $0 --name [string] --type [string]")
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
        })
        .argv;
    // get the command line arguments from yargs
    var name = _args.n || _args.name;
    var type = _args.t || _args.type;
    var action = _args.a || _args.action;
    // get needed paths
    var dest = (type === "js") ? __PATHS_JS_VENDOR : __PATHS_CSS_VENDOR;
    var delete_path = dest + name;
    var module_path = __PATHS_NODE_MODULES + name;
    // check that the module exists
    if (action === "add" && !de.sync(module_path)) {
        log("The module", chalk.magenta(`${module_path}`), "does not exist.");
        log(`First install by running "$ yarn add ${name} --dev". Then try adding the dependency again.`);
        return done();
    } else if (action === "remove" && !de.sync(delete_path)) {
        log("The module", chalk.magenta(`${delete_path}`), "does not exist. Removal aborted.");
        return done();
    }
    // delete the old module folder
    del([delete_path])
        .then(function(paths) {
            var message = `Dependency (${name}) ` + (action === "add" ? "added" : "removed" + ".");
            if (action === "add") {
                // copy module to location
                pump([gulp.src(name + __PATHS_DEL + __PATHS_ALLFILES, {
                        dot: true,
                        cwd: __PATHS_NODE_MODULES,
                        base: __PATHS_BASE_DOT
                    }),
                    rename(function(path) {
                        // [https://stackoverflow.com/a/36347297]
                        // remove the node_modules/ parent folder
                        var regexp = new RegExp("^" + __PATHS_NODE_MODULES_NAME);
                        path.dirname = path.dirname.replace(regexp, "");
                    }),
					gulp.dest(dest),
					debug(task.__wadevkit.debug)
	    	], function() {
                    log(message);
                    done();
                });
            } else { // remove
                log(message);
                done();
            }
        });
});

// // Clear internal configuration keys.
// gulp.task("clear", function(done) {
//     // run yargs
//     var _args = yargs.usage("Usage: $0 --names [string]")
//         .option("names", {
//             alias: "n",
//             demandOption: true,
//             describe: "Name(s) of files to clear.",
//             type: "string"
//         })
//         .coerce("names", function(value) {
//             return value.replace("gulpstatus", "gulppid")
//                 .split(" ");
//         })
//         .example("$0 --names=\"gulpstatus gulpports\"", "Clear pid and ports keys.")
//         .example("$0 --names=\"gulpstatus\"", "Clear pid key.")
//         .example("$0 --names gulpports", "Clear ports key.")
//         .argv;
//     // get provided parameters
//     var names = _args.n || _args.names;
//     // loop over provided arguments array
//     for (var i = 0, l = names.length; i < l; i++) {
//         var key = names[i].replace("gulp", "");
//         // using the flag "w+" will create the file if it does not exists. if
//         // it does exists it will truncate the current file. in effect clearing
//         // if out. which is what is needed.
//         config_internal.set(key, null);
//         // reset name if needed
//         if (key === "pid") key = "status";
//         log(key, "cleared.");
//     }
//     config_internal.write(function() {
//         done();
//     }, null, json_format);
// });

// @end   helpers.js ----------------------------------------------------------|

// @start make.js -------------------------------------------------------------|

/**
 * Build gulpfile from source files. Useful after making changes to source files.
 *
 * Usage
 *
 * $ gulp make # Re-build gulpfile
 */
gulp.task("make", function(done) {
    var task = this;
    var setup_name = bundle_gulp.source.name_setup;
    var name = bundle_gulp.source.name;
    pump([gulp.src(bundle_gulp.source.files, {
            cwd: __PATHS_GULP_SOURCE
        }),
		debug(),
		foreach(function(stream, file) {
            var filename = path.basename(file.path);
            var filename_length = filename.length;
            var decor = "-".repeat(79 - 11 - filename_length) + "|";
            var top = `// @start ${filename} ${decor}\n\n`;
            var bottom = `\n// @end   ${filename} ${decor}\n`;
            var empty = "// file is empty..."; // file does not contain code
            // empty check
            var is_empty = file.contents.toString()
                .trim() === "";
            return stream.pipe(gulpif(is_empty, insert.prepend(empty)))
                .pipe(insert.prepend(top))
                .pipe(insert.append(bottom));
        }),
		// if gulpfile.js exists use that name, else fallback to gulpfile.main.js
		gulpif((fe.sync(__PATHS_BASE + name)), concat(name), concat(setup_name)),
		beautify(opts_bt),
		gulp.dest(__PATHS_BASE),
		debug(task.__wadevkit.debug)
	], done);
});

// @end   make.js -------------------------------------------------------------|

// @start help.js -------------------------------------------------------------|

/**
 * Provides Gulp task documentation (this documentation).
 *
 * Options
 *
 * (no options) List tasks and their descriptions.
 * -v, --verbose  [boolean]  Flag indicating whether to show all documentation.
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
    var _args = yargs.usage("Usage: $0 --name [string]")
        .option("name", {
            alias: "n",
            default: false,
            describe: "Name of task to show documentation for.",
            type: "string"
        })
        .argv;
    var task_name = (_args.n || _args.name);
    // contain printer in a variable rather than an anonymous function
    // to attach the provided task_name for later use. this is a bit hacky
    // but its a workaround to provide the name.
    var printer = function(tasks, verbose) { // custom print function
        var task_name = this.task_name;
        if (task_name) { // custom sort
            // split into an array
            var names = task_name.trim()
                .split(/\s+/);
            // add the help task to always show it
            names.push("help");
            // set verbose to true to show all documentation
            verbose = true;
            // turn all but the provided task name to internal
            // this will essentially "hide" them from being printed
            tasks.tasks.forEach(function(item) {
                // if (item.name !== task_name) {
                if (!-~names.indexOf(item.name)) {
                    item.comment.tags = [{
                        "name": "internal",
                        "value": true
				}];
                }
            });
        }
        tasks = tasks.filterHidden(verbose)
            .sort();
        // filter will change the documentation header in the print_tasks function
        var filter = (task_name ? true : false)
        return print_tasks(tasks, verbose, filter);
    };
    // attach the task name to the printer function
    printer.task_name = task_name;
    // re-assign the printer as the "this" to have access to the task name
    // within the function (printer) itself
    printer = printer.bind(printer);
    gulp.help({
        "print": printer
    })(task);
});

// @end   help.js -------------------------------------------------------------|

// @start favicon.js ----------------------------------------------------------|

// Generate the icons. This task takes a few seconds to complete.
// You should run it at least once to create the icons. Then,
// you should run it whenever RealFaviconGenerator updates its
// package (see the check-for-favicon-update task below).
// @internal
gulp.task("favicon:generate", function(done) {
    real_favicon.generateFavicon({
        masterPicture: __PATHS_FAVICON_MASTER_PIC,
        dest: __PATHS_FAVICON_DEST,
        iconsPath: __PATHS_FAVICON_DEST,
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
        markupFile: __PATHS_FAVICON_DATA_FILE
    }, function() {
        done();
    });
});

// update manifest.json
// @internal
gulp.task("favicon:edit-manifest", function(done) {
    var manifest = json.read(__PATHS_FAVICON_ROOT_MANIFEST);
    manifest.set("name", "wa-devkit");
    manifest.set("short_name", "WADK");
    manifest.write(function() {
        done();
    }, null, json_spaces);
});

// copy favicon.ico and apple-touch-icon.png to the root
// @internal
gulp.task("favicon:root", function(done) {
    var task = this;
    pump([gulp.src([__PATHS_FAVICON_ROOT_ICO, __PATHS_FAVICON_ROOT_PNG, __PATHS_FAVICON_ROOT_CONFIG, __PATHS_FAVICON_ROOT_MANIFEST]),
        gulp.dest(__PATHS_BASE),
    	debug(task.__wadevkit.debug),
        bs.stream()
    ], done);
});

// copy delete unneeded files
// @internal
gulp.task("favicon:delete", function(done) {
    var task = this;
    pump([gulp.src([__PATHS_FAVICON_ROOT_CONFIG, __PATHS_FAVICON_ROOT_MANIFEST]),
    	clean(),
    	debug(task.__wadevkit.debug)
    ], done);
});

// inject new favicon html
// @internal
gulp.task("favicon:html", function(done) {
    var task = this;
    pump([gulp.src(__PATHS_FAVICON_HTML),
        real_favicon.injectFaviconMarkups(JSON.parse(fs.readFileSync(__PATHS_FAVICON_DATA_FILE))
            .favicon.html_code),
        gulp.dest(__PATHS_FAVICON_HTML_DEST),
        debug(task.__wadevkit.debug),
        bs.stream()
    ], done);
});

/**
 * Re-build project favicons.
 *
 * Usage
 *
 * $ gulp favicon # Re-build favicons.
 */
gulp.task("favicon", function(done) {
    // this task can only run when gulp is not running as gulps watchers
    // can run too many times as many files are potentially being beautified
    if (config_internal.get("pid")) { // Gulp instance exists so cleanup
        gulp_check_warn();
        return done();
    }
    return sequence("favicon:generate", "favicon:edit-manifest", "favicon:root", "favicon:delete", "favicon:html", "html:main", "readme:main", "pretty", function(err) {
        log("Favicons generated.");
        done();
    });
});

// Check for updates on RealFaviconGenerator (think: Apple has just
// released a new Touch icon along with the latest version of iOS).
// Run this task from time to time. Ideally, make it part of your
// continuous integration system.
// Check for RealFaviconGenerator updates.
// @internal
gulp.task("favicon-updates", function(done) {
    var currentVersion = JSON.parse(fs.readFileSync(__PATHS_FAVICON_DATA_FILE))
        .version;
    real_favicon.checkForUpdates(currentVersion, function(err) {
        if (err) {
            throw err;
        }
    });
});

// @end   favicon.js ----------------------------------------------------------|
