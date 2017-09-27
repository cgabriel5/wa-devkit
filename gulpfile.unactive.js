"use strict";
// -------------------------------------
var fs = require("fs");
var path = require("path");
// -------------------------------------
var eol = require("gulp-eol");
var open = require("gulp-open");
var gulpif = require("gulp-if");
var fail = require("gulp-fail");
var clean = require("gulp-clean");
var cache = require("gulp-cache");
var print = require("gulp-print");
var order = require("gulp-order");
var insert = require("gulp-insert");
var concat = require("gulp-concat");
var rename = require("gulp-rename");
var filter = require("gulp-filter");
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
// -------------------------------------
// // Non es-uglify
// Remove the following two lines and uncomment the
// following lines if uglify-es is needed.
var uglify = require("gulp-uglify");
var beautify = require("gulp-jsbeautifier");
// -------------------------------------
// // Uncomment for uglify-es
// var composer = require("gulp-uglify/composer");
// var uglify = composer(require("uglify-es"), console);
// var beautify = require("gulp-jsbeautifier");
// -------------------------------------
var del = require("del");
var pump = require("pump");
var glob = require("glob");
var args = require("yargs");
var git = require("git-state");
var fe = require("file-exists");
var json = require("json-file");
var mds = require("markdown-styles");
var cleanup = require("node-cleanup");
var sequence = require("run-sequence");
var browser_sync = require("browser-sync");
var find_free_port = require("find-free-port");
var bs_autoclose = require("browser-sync-close-hook");
// -------------------------------------
// paths::BASES
var __PATHS_BASE = "./";
var __PATHS_DIRNAME = __dirname;
var __PATHS_CWD = process.cwd();
var __PATHS_HOMEDIR = ""; // "assets/";
// paths:DISTRIBUTION
var __PATHS_DIST_HOME = "dist/";
var __PATHS_DIST_LIB = "dist/lib/";
var __PATHS_DIST_HTML = "dist/html/";
var __PATHS_DIST_CSS = "dist/css/";
var __PATHS_DIST_CSS_LIBS = "dist/css/libs/";
var __PATHS_DIST_CSS_LIBS_FILE_SOURCE = `${__PATHS_HOMEDIR}css/libs/**`;
var __PATHS_DIST_JS = "dist/js/";
var __PATHS_DIST_JS_LIBS = "dist/js/libs/";
var __PATHS_DIST_JS_LIBS_FILE_SOURCE = `${__PATHS_HOMEDIR}js/libs/**`;
var __PATHS_DIST_IMG = "dist/img/";
// paths: library (only for apptype=library)
var __PATHS_LIB_HOME = "lib/";
// paths:HTML
var __PATHS_HTML_SOURCE = `${__PATHS_HOMEDIR}html/source/`;
var __PATHS_HTML_REGEXP_SOURCE = `${__PATHS_HOMEDIR}html/source/regexp/`;
// paths:CSS
var __PATHS_CSS_SOURCE = `${__PATHS_HOMEDIR}css/source/`;
var __PATHS_CSS_THIRDPARTY = `${__PATHS_HOMEDIR}css/libs/`;
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
var __PATHS_JS_THIRDPARTY = `${__PATHS_HOMEDIR}js/libs/`;
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
var __PATHS_GITHEAD = ".git/HEAD";
var __PATHS_README = "README.md";
var __PATHS_README_HTML = "README.html";
var __PATHS_ALLFILES = "**/*.*";
var __PATHS_FILES_BEAUTIFY = "**/*.{html,css,js,json}";
var __PATHS_FILES_BEAUTIFY_EXCLUDE = "!**/*.min.*";
var __PATHS_FILES_MIN = "**/*.min.*";
var __PATHS_FILES_TEST = "!test*";
var __PATHS_NOT_NODE_MODULES = "!node_modules/**";
// -------------------------------------
// configuration information
var config_user = require(__PATHS_CONFIG_USER);
// internal Gulp configuration file
var config_internal = json.read(__PATHS_CONFIG_INTERNAL);
// -------------------------------------
// plugin options
var opts = config_user.options;
var opts_plugins = opts.plugins;
var opts_bt = opts_plugins.beautify;
var opts_ap = opts_plugins.autoprefixer;
var opts_bs = opts_plugins.browsersync;
var opts_ffp = opts_plugins.find_free_port;
var json_format = opts_plugins.json_format;
var json_spaces = json_format.indent_size;
// -------------------------------------
// config regexp
var regexp = config_user.regexp;
var regexp_html = config_user.regexp.html;
var regexp_css = config_user.regexp.css;
// -------------------------------------
// paths/bundles
var paths = config_user.paths;
var bundles = config_user.bundles;
var bundle_html = bundles.html;
var bundle_css = bundles.css;
var bundle_js = bundles.js;
var bundle_img = bundles.img;
var bundle_gulp = bundles.gulp;
// -------------------------------------
// project utils
var utils = require(__PATHS_GULP_UTILS);
var color = utils.color;
var log = utils.log;
var time = utils.time;
var notify = utils.notify;
var gulp = utils.gulp;
var uri = utils.uri;
var browser = utils.browser;
// -------------------------------------
var APPTYPE = config_user.apptype;
var INDEX = config_user.paths.index;
var BASE = config_user.paths.base;
var ROOTDIR = path.basename(path.resolve(__PATHS_DIRNAME)) + "/";
var APPDIR = BASE + ROOTDIR;
// -------------------------------------
var bs = browser_sync.create(opts_bs.server_name);
// -------------------------------------
var branch_name;
// remove options
var opts = {
    read: false,
    cwd: __PATHS_BASE
};
// -------------------------------------
var html_injection_vars = {
    "css_app_bundle": __PATHS_CSS_BUNDLES + bundle_css.source.name,
    "css_libs_bundle": __PATHS_CSS_BUNDLES + bundle_css.thirdparty.name,
    "js_app_bundle": __PATHS_JS_BUNDLES + bundle_js.source.name,
    "js_libs_bundle": __PATHS_JS_BUNDLES + bundle_js.thirdparty.name
};
// -------------------------------------
/**
 * @description [Opens the provided file in the user's browser.]
 * @param  {String}   filepath  [The path of the file to open.]
 * @param  {Number}   port     	[The port to open on.]
 * @param  {Function} callback  [The Gulp task callback to run.]
 * @return {Undefined}          [Nothing is returned.]
 */
function open_file_in_browser(filepath, port, callback) {
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
        })
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
    log(color("[warning]", "yellow"), "Task cannot be performed while Gulp is running. Close Gulp then try again.");
}
// -------------------------------------
//
// **************************************************************************
// *           The following tasks are the main application tasks.          *
// **************************************************************************
//
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
// update the status of gulp to active
gulp.task("task-start-gulp", function(done) {
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
gulp.task("task-git-branch", ["task-start-gulp"], function(done) {
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
                if (branch_name) {
                    log(color("(pid:" + process.pid + ")", "yellow"), "Gulp monitoring", color(branch_name, "green"), "branch.");
                }
                if (brn_current !== branch_name) {
                    // message + exit
                    log(color("[warning]", "yellow"), "Gulp stopped due to branch switch. (", color(branch_name, "green"), "=>", color(brn_current, "yellow"), ")");
                    log(color("[warning]", "yellow"), "Restart Gulp to monitor", color(brn_current, "yellow"), "branch.");
                    process.exit();
                }
            });
            done();
        });
    });
});
// remove the dist/ folder
gulp.task("task-clean-dist", ["task-git-branch"], function(done) {
    pump([gulp.src(__PATHS_DIST_HOME, opts),
        clean()
    ], done);
});
// build the dist/ folder
gulp.task("task-build", ["task-clean-dist"], function(done) {
    // get the gulp build tasks
    var tasks = bundle_gulp.tasks;
    // add callback to the sequence
    tasks.push(function() {
        notify("Build complete");
        done();
    });
    // apply the tasks and callback to sequence
    return sequence.apply(this, tasks);
});
// gulps default task is set to rum the build + watch + browser-sync
gulp.task("default", function(done) {
    // run yargs
    var _args = args.usage("Usage: $0 -s/--stop [boolean]")
        .option("stop", {
            alias: "s",
            demandOption: false,
            describe: "Exits running Gulp instance.",
            type: "boolean"
        })
        .example("$0 --stop", "Ends Gulp's process.")
        .argv;
    // get the command line arguments from yargs
    var stop = _args.s || _args.stop;
    if (stop) { // end the running Gulp process
        // get pid, if any
        var pid = config_internal.get("pid");
        if (pid) { // kill the open process
            log(color("[success]", "green"), "Gulp process stopped.");
            process.kill(pid);
        } else { // no open process exists
            log(color("[warning]", "yellow"), "No Gulp process exists.");
        }
        return done();
    } else { // start up Gulp like normal
        return find_free_port(opts_ffp.port_range.start, opts_ffp.port_range.end, opts_ffp.ip, opts_ffp.port_count, function(err, p1, p2) {
            // get pid, if any
            var pid = config_internal.get("pid");
            // if there is a pid present it means a Gulp instance has already started.
            // therefore, prevent another from starting.
            if (pid) {
                log(color("[warning]", "yellow"), "A Gulp instance is already running", color("(pid:" + pid + ")", "yellow") + ".", "Stop that instance before starting a new one.");
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
                // return sequence("helper-clean-files", "task-build", function() {
                return sequence("task-build", function() {
                    sequence("task-watch");
                    done();
                });
            }, null, json_spaces);
        });
    }
});
// -------------------------------------
// watch for files changes
gulp.task("task-watch", function(done) {
    // add auto tab closing capability to browser-sync. this will
    // auto close the used bs tabs when gulp closes.
    bs.use({
        plugin() {},
        hooks: {
            "client:js": bs_autoclose
        },
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
        //
        // watch for any changes to HTML files
        gulp.watch(bundles.gulp.watch.html, {
            cwd: __PATHS_HTML_SOURCE
        }, function() {
            return sequence("task-html");
        });
        // watch for any changes to CSS Source files
        gulp.watch(bundles.gulp.watch.css.source, {
            cwd: __PATHS_CSS_SOURCE
        }, function() {
            return sequence("task-cssapp");
        });
        // watch for any changes to CSS Lib files
        gulp.watch(bundles.gulp.watch.css.thirdparty, {
            cwd: __PATHS_CSS_THIRDPARTY
        }, function() {
            return sequence("task-csslibs", "task-csslibsfolder");
        });
        // watch for any changes to JS Source files
        gulp.watch(bundles.gulp.watch.js.source, {
            cwd: __PATHS_JS_SOURCE
        }, function() {
            return sequence("task-jsapp");
        });
        // watch for any changes to JS Lib files
        gulp.watch(bundles.gulp.watch.js.thirdparty, {
            cwd: __PATHS_JS_THIRDPARTY
        }, function() {
            return sequence("task-jslibsource", "task-jslibs", "task-jslibsfolder");
        });
        // watch for any changes to IMG files
        gulp.watch(bundles.gulp.watch.img, {
            cwd: __PATHS_IMG_SOURCE
        }, function() {
            return sequence("task-img");
        });
        // watch for any changes to README.md
        gulp.watch([__PATHS_README], {
            cwd: __PATHS_BASE
        }, function() {
            return sequence("task-readme", function() {
                bs.reload();
            });
        });
        done();
    });
});
// -------------------------------------
// init HTML files + minify
gulp.task("task-html", function(done) {
    // RegExp used for $:pre/post{filename/$var} HTML file-content/$variable injection
    var r_pre = regexp_html.pre;
    var r_post = regexp_html.post;
    pump([gulp.src(bundles.html.source.files, {
            cwd: __PATHS_HTML_SOURCE
        }),
        concat(bundles.html.source.name),
        replace(new RegExp(r_pre.p, r_pre.f), html_replace_fn(html_injection_vars)),
        beautify(opts_bt),
        replace(new RegExp(r_post.p, r_post.f), html_replace_fn(html_injection_vars)),
        gulp.dest(__PATHS_BASE),
        minify_html(),
        gulp.dest(__PATHS_DIST_HOME),
        bs.stream()
    ], done);
});
// -------------------------------------
// preform custom regexp replacements
gulp.task("task-precssapp-cleanup", function(done) {
    // RegExp used for custom CSS code modifications
    var pf = regexp_css.prefixes;
    var lz = regexp_css.lead_zeros;
    var ez = regexp_css.empty_zero;
    var lh = regexp_css.lowercase_hex;
    pump([gulp.src(__PATHS_USERS_CSS_FILE, {
            cwd: __PATHS_CSS_SOURCE
        }),
        // [https://www.mikestreety.co.uk/blog/find-and-remove-vendor-prefixes-in-your-css-using-regex]
        replace(new RegExp(pf.p, pf.f), pf.r),
        replace(new RegExp(lz.p, lz.f), lz.r),
        replace(new RegExp(ez.p, ez.f), ez.r),
        replace(new RegExp(lh.p, lh.f), function(match) {
            return match.toLowerCase();
        }),
        gulp.dest(__PATHS_CSS_SOURCE),
        bs.stream()
    ], done);
});
// build app.css + autoprefix + minify
gulp.task("task-cssapp", ["task-precssapp-cleanup"], function(done) {
    pump([gulp.src(bundle_css.source.files, {
            cwd: __PATHS_CSS_SOURCE
        }),
        concat(bundle_css.source.name),
        autoprefixer(opts_ap),
        shorthand(),
        beautify(opts_bt),
        gulp.dest(__PATHS_CSS_BUNDLES),
        clean_css(),
        gulp.dest(__PATHS_DIST_CSS),
        bs.stream()
    ], done);
});
// build libs.css + minify + beautify
gulp.task("task-csslibs", function(done) {
    pump([gulp.src(bundle_css.thirdparty.files, {
            cwd: __PATHS_CSS_THIRDPARTY
        }),
        concat(bundle_css.thirdparty.name),
        autoprefixer(opts_ap),
        shorthand(),
        beautify(opts_bt),
        gulp.dest(__PATHS_CSS_BUNDLES),
        clean_css(),
        gulp.dest(__PATHS_DIST_CSS),
        bs.stream()
    ], done);
});
// remove the dist/css/libs/ folder
gulp.task("task-clean-csslibs", function(done) {
    pump([gulp.src(__PATHS_DIST_CSS_LIBS, opts),
        clean()
    ], done);
});
// copy css libraries folder
gulp.task("task-csslibsfolder", ["task-clean-csslibs"], function(done) {
    pump([gulp.src(__PATHS_DIST_CSS_LIBS_FILE_SOURCE),
        gulp.dest(__PATHS_DIST_CSS_LIBS),
        bs.stream()
    ], done);
});
// -------------------------------------
// build app.js + minify + beautify
gulp.task("task-jsapp", function(done) {
    pump([gulp.src(bundle_js.source.files, {
            cwd: __PATHS_JS_SOURCE
        }),
        concat(bundle_js.source.name),
        beautify(opts_bt),
        gulp.dest(__PATHS_JS_BUNDLES),
        uglify(),
        gulp.dest(__PATHS_DIST_JS),
        bs.stream()
    ], done);
});
// build lib/lib.js + lib/lib.min.js
gulp.task("task-jslibsource", function(done) {
    // check if application is a library
    var is_library = (APPTYPE === "library");
    if (!is_library) return done(); // return on apps of type "webapp"
    // get the source files
    var files = bundle_js.source.files;
    files.push(__PATHS_FILES_TEST); // ignore test files
    pump([gulp.src(bundle_js.source.files, {
            cwd: __PATHS_JS_THIRDPARTY,
            nocase: true
        }),
        concat(bundle_js.thirdparty.name),
        beautify(opts_bt),
        // gulpif(is_library, rename("lib.js")), ==> bundle_js.thirdparty.name
        gulpif(is_library, gulp.dest(__PATHS_LIB_HOME)),
        gulpif(is_library, gulp.dest(__PATHS_DIST_LIB)), // <-- also add to dist/ directory
        uglify(),
        gulpif(is_library, rename(bundle_js.thirdparty.minified_name)),
        gulpif(is_library, gulp.dest(__PATHS_LIB_HOME)),
        gulpif(is_library, gulp.dest(__PATHS_DIST_LIB)), // <-- also add to dist/ directory
        bs.stream()
    ], done);
});
// build libs.js + minify + beautify
gulp.task("task-jslibs", function(done) {
    pump([gulp.src(bundle_js.thirdparty.files, {
            cwd: __PATHS_JS_THIRDPARTY
        }),
        concat(bundle_js.thirdparty.name),
        beautify(opts_bt),
        gulp.dest(__PATHS_JS_BUNDLES),
        uglify(),
        gulp.dest(__PATHS_DIST_JS_LIBS),
        bs.stream()
    ], done);
});
// remove the dist/js/libs/ folder
gulp.task("task-clean-jslibs", function(done) {
    pump([gulp.src(__PATHS_DIST_JS_LIBS, opts),
        clean()
    ], done);
});
// copy js libraries folder
gulp.task("task-jslibsfolder", ["task-clean-jslibs"], function(done) {
    pump([gulp.src(__PATHS_DIST_JS_LIBS_FILE_SOURCE),
        gulp.dest(__PATHS_DIST_JS_LIBS),
        bs.stream()
    ], done);
});
// -------------------------------------
// copy img/ to dist/img/
gulp.task("task-img", function(done) {
    // need to copy hidden files/folders?
    // [https://github.com/klaascuvelier/gulp-copy/issues/5]
    pump([gulp.src(__PATHS_IMG_SOURCE),
        gulp.dest(__PATHS_DIST_IMG),
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
        bs.stream()
    ], done);
});
// -------------------------------------
// markdown to html (with github style/layout)
gulp.task("task-readme", function(done) {
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
            bs.stream()
        ], done);
    });
});
// -------------------------------------
//
// **************************************************************************
// * The following tasks are helper tasks and should be modified as needed. *
// **************************************************************************
//
// build gulpfile.js
gulp.task("helper-make-gulpfile", function(done) {
    pump([gulp.src(bundle_gulp.source.files, {
            cwd: __PATHS_GULP_SOURCE
        }),
        insert.append("// " + "-".repeat(37)),
        concat(bundle_gulp.source.name_setup),
        beautify(opts_bt),
        gulp.dest(__PATHS_BASE),
    ], done);
});
// check for any unused CSS
gulp.task("helper-purify", function(done) {
    // run yargs
    var _args = args.usage("Usage: $0 --remove [boolean]")
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
        .example("$0", "No options creates pure.css which contains only used styles.")
        .example("$0 --remove", "Deletes pure.css and removes unused CSS.")
        .example("$0 --delete", "Deletes pure.css.")
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
        purify([__PATHS_PURIFY_JS_SOURCE_FILES, INDEX], {
            info: true,
            rejected: true
        }),
        gulpif(!remove, rename(__PATHS_PURE_FILE_NAME)),
        beautify(opts_bt),
        gulp.dest(__PATHS_PURE_CSS + (remove ? __PATHS_PURE_SOURCE : ""))
    ], done);
});
// markdown to html (with github style/layout)
gulp.task("helper-tohtml", function(done) {
    // run yargs
    var _args = args.usage("Usage: $0 --input [string] --output [string] --name [string]")
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
        .example("$0 --input README.md --output /markdown/preview --name Converted.html", "Convert README.md to Converted.html and place in /markdown/preview.")
        .argv;
    // get provided parameters
    var input = _args.i || _args.input;
    var output = _args.o || _args.output;
    var new_name = _args.n || _args.name;
    // file has to exist
    fe(input, function(err, exists) {
        if (!exists) {
            log(color("[warning]", "yellow"), "File does not exist.");
            return done();
        }
        // continue...file exists
        // check for an .md file
        var input_ext = path.extname(input);
        // file must be an .md file
        if (input_ext.toLowerCase() !== ".md") {
            log(color("[warning]", "yellow"), "Input file must be an .md file.");
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
                gulp.dest(output)
            ], function() {
                // if a new name was provided delete the file with the old input file
                if (new_name) del([new_file_path]);
                done();
            });
        });
    });
});
// clear config/.hidden-internal.json keys
gulp.task("helper-clear", function(done) {
    // run yargs
    var _args = args.usage("Usage: $0 --names [string]")
        .option("names", {
            alias: "n",
            demandOption: true,
            describe: "Name(s) of files to clear.",
            type: "string"
        })
        .coerce("names", function(value) {
            return value.replace("gulpstatus", "gulppid")
                .split(" ");
        })
        .example("$0 --names=\"gulpstatus gulpports\"", "Clear pid and ports keys.")
        .example("$0 --names=\"gulpstatus\"", "Clear pid key.")
        .example("$0 --names gulpports", "Clear ports key.")
        .argv;
    // get provided parameters
    var names = _args.n || _args.names;
    // loop over provided arguments array
    for (var i = 0, l = names.length; i < l; i++) {
        var key = names[i].replace("gulp", "");
        // using the flag "w+" will create the file if it does not exists. if
        // it does exists it will truncate the current file. in effect clearing
        // if out. which is what is needed.
        config_internal.set(key, null);
        // reset name if needed
        if (key === "pid") key = "status";
        log(color("[complete]", "green"), color(key, "yellow"), "cleared.");
    }
    config_internal.write(function() {
        done();
    }, null, json_format);
});
// open index.html in browser
gulp.task("helper-open", function(done) {
    // run yargs
    var _args = args.usage("Usage: $0 --file [string] --port [number]")
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
        .example("$0 --file index.html --port 3000", "Open index.html in port 3000.")
        .argv;
    // get the command line arguments from yargs
    var file = _args.f || _args.file;
    var port = _args.p || _args.port;
    // if port is provided use that
    if (port) {
        open_file_in_browser(file, port, done);
    } else { // else get the used port, if any
        // get the ports
        var ports = config_internal.get("ports");
        // no ports...
        if (!ports) {
            log(color("[warning]", "yellow"), "No ports are in use.");
            return done();
        }
        // open file in the browser
        open_file_in_browser(file, ports.local, done);
    }
});
// print the status of gulp (is it running or not?)
gulp.task("helper-status", function(done) {
    log(color("[status]", "yellow"), "Gulp is", ((config_internal.get("pid")) ? "running. " + color(("(pid:" + process.pid + ")"), "yellow") : "not running."));
    done();
});
// print the used ports for browser-sync
gulp.task("helper-ports", function(done) {
    // get the ports
    var ports = config_internal.get("ports");
    // if file is empty
    if (!ports) {
        log(color("[warning]", "yellow"), "No ports are in use.");
        return done();
    }
    // ports exist...
    log(color("(local)", "green"), ports.local);
    log(color("(ui)", "green"), ports.ui);
    done();
});
// beautify html, js, css, & json files
gulp.task("helper-clean-files", function(done) {
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
    pump([gulp.src([__PATHS_FILES_BEAUTIFY, __PATHS_FILES_BEAUTIFY_EXCLUDE, __PATHS_NOT_NODE_MODULES], {
            dot: true,
            cwd: __PATHS_BASE
        }),
        print(function(filepath) {
            return "file: " + filepath;
        }),
        beautify(opts_bt),
        gulpif(condition, json_sort({
            "space": json_spaces
        })),
        eol(),
        gulp.dest(__PATHS_BASE),
    ], done);
});
// finds all the files that contain .min in the name and prints them
gulp.task("helper-findmin", function(done) {
    // get min files
    pump([gulp.src([__PATHS_FILES_MIN, __PATHS_NOT_NODE_MODULES], {
            dot: true,
            cwd: __PATHS_BASE
        }),
        print(function(filepath) {
            return "file: " + filepath;
        })
    ], done);
});
// -------------------------------------
// Generate the icons. This task takes a few seconds to complete.
// You should run it at least once to create the icons. Then,
// you should run it whenever RealFaviconGenerator updates its
// package (see the check-for-favicon-update task below).
gulp.task("task-favicon-generate", function(done) {
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
gulp.task("task-favicon-edit-manifest", function(done) {
    var manifest = json.read(__PATHS_FAVICON_ROOT_MANIFEST);
    manifest.set("name", "wa-devkit");
    manifest.set("short_name", "WADK");
    manifest.write(function() {
        done();
    }, null, json_spaces);
});
//
// copy favicon.ico and apple-touch-icon.png to the root
gulp.task("task-favicon-root", function(done) {
    pump([gulp.src([__PATHS_FAVICON_ROOT_ICO, __PATHS_FAVICON_ROOT_PNG, __PATHS_FAVICON_ROOT_CONFIG, __PATHS_FAVICON_ROOT_MANIFEST]),
        gulp.dest(__PATHS_BASE),
        bs.stream()
    ], done);
});
// copy delete unneeded files
gulp.task("task-favicon-delete", function(done) {
    pump([gulp.src([__PATHS_FAVICON_ROOT_CONFIG, __PATHS_FAVICON_ROOT_MANIFEST]),
    	clean()
    ], done);
});
// inject new favicon html:
gulp.task("task-favicon-html", function(done) {
    pump([gulp.src(__PATHS_FAVICON_HTML),
        real_favicon.injectFaviconMarkups(JSON.parse(fs.readFileSync(__PATHS_FAVICON_DATA_FILE))
            .favicon.html_code),
        gulp.dest(__PATHS_FAVICON_HTML_DEST),
        bs.stream()
    ], done);
});
gulp.task("helper-favicon-build", function(done) {
    // this task can only run when gulp is not running as gulps watchers
    // can run too many times as many files are potentially being beautified
    if (config_internal.get("pid")) { // Gulp instance exists so cleanup
        gulp_check_warn();
        return done();
    }
    return sequence("task-favicon-generate", "task-favicon-edit-manifest", "task-favicon-root", "task-favicon-delete", "task-favicon-html", "task-html", "task-readme", "helper-clean-files", function(err) {
        log("Favicons generated.");
        done();
    });
});
// Check for updates on RealFaviconGenerator (think: Apple has just
// released a new Touch icon along with the latest version of iOS).
// Run this task from time to time. Ideally, make it part of your
// continuous integration system.
gulp.task("helper-favicon-updates", function(done) {
    var currentVersion = JSON.parse(fs.readFileSync(__PATHS_FAVICON_DATA_FILE))
        .version;
    real_favicon.checkForUpdates(currentVersion, function(err) {
        if (err) {
            throw err;
        }
    });
});
// -------------------------------------
