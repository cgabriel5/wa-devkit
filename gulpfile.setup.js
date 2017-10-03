//
// --------------------------------------------------------------------------
// @start requires.js
//
"use strict";
// -------------------------------------
var path = require("path");
// -------------------------------------
var pump = require("pump");
var chalk = require("chalk");
var prompt = require("prompt");
var json = require("json-file");
var git = require("simple-git")();
var mds = require("markdown-styles");
var sequence = require("run-sequence");
var alphabetize = require("alphabetize-object-keys");
// -------------------------------------
var eol = require("gulp-eol");
var sort = require("gulp-sort");
var gulpif = require("gulp-if");
var debug = require("gulp-debug");
var clean = require("gulp-clean");
var insert = require("gulp-insert");
var concat = require("gulp-concat");
var rename = require("gulp-rename");
var foreach = require("gulp-foreach");
var replace = require("gulp-replace");
var json_sort = require("gulp-json-sort")
    .default;
// -------------------------------------
var uglify = require("gulp-uglify");
var beautify = require("gulp-jsbeautifier");
//
// @end   requires.js
// --------------------------------------------------------------------------
//
//
// --------------------------------------------------------------------------
// @start paths.js
//
// paths::BASES
var __PATHS_BASE = "./";
var __PATHS_CWD = process.cwd();
var __PATHS_HOMEDIR = ""; // "assets/";
// paths:JS
var __PATHS_JS_HOME = "js/";
var __PATHS_JS_OPTIONS_DYNAMIC;
// paths:GULP
var __PATHS_GULP_UTILS = `./${__PATHS_HOMEDIR}gulp/assets/utils/utils.js`;
var __PATHS_GULP_SETUP_QUESTIONS = `./${__PATHS_HOMEDIR}gulp/setup/exports/questions.js`;
var __PATHS_GULP_SETUP_TEMPLATES = `./${__PATHS_HOMEDIR}gulp/setup/exports/templates.js`;
var __PATHS_GULP_SETUP_JSCONFIGS = `./${__PATHS_HOMEDIR}gulp/setup/exports/jsconfigs.js`;
var __PATHS_GULP_SETUP_SOURCE = `./${__PATHS_HOMEDIR}gulp/setup/source/`;
var __PATHS_GULP_FILE_NAME = "gulpfile.js";
var __PATHS_GULP_FILE_SETUP = "gulpfile.setup.js";
var __PATHS_GULP_SETUP = `./${__PATHS_HOMEDIR}gulp/setup/`;
var __PATHS_GULP_FILE_UNACTIVE = "gulpfile.unactive.js";
// paths:MARKDOWN
var __PATHS_MARKDOWN_PREVIEW = `${__PATHS_HOMEDIR}markdown/preview/`;
var __PATHS_MARKDOWN_SOURCE = `${__PATHS_HOMEDIR}markdown/source/`;
// paths:CONFIG_FILES
var __PATHS_CONFIG_USER = `./${__PATHS_HOMEDIR}gulp/assets/config/user.json`;
var __PATHS_CONFIG_INTERNAL = `./${__PATHS_HOMEDIR}gulp/assets/config/.hidden-internal.json`;
var __PATHS_PKG = `./${__PATHS_HOMEDIR}package.json`;
// paths:OTHER
var __PATHS_DOCS_README_TEMPLATE = "docs/readme_template.md";
var __PATHS_README = "README.md";
var __PATHS_LICENSE = "LICENSE.txt";
var __PATHS_HTML_HEADMETA = "html/source/head/meta.html";
var __PATHS_FILES_BEAUTIFY = "**/*.{html,css,js,json}";
var __PATHS_FILES_BEAUTIFY_EXCLUDE = "!**/*.min.*";
var __PATHS_NOT_NODE_MODULES = "!node_modules/**";
var __PATHS_GIT = ".git/";
//
// @end   paths.js
// --------------------------------------------------------------------------
//
//
// --------------------------------------------------------------------------
// @start vars.js
//
// configuration information
var config_user = json.read(__PATHS_CONFIG_USER);
var config_internal = json.read(__PATHS_CONFIG_INTERNAL);
var pkg = json.read(__PATHS_PKG);
// -------------------------------------
// plugin options
var opts = config_user.get("options");
var opts_plugins = opts.plugins;
var opts_bt = opts_plugins.beautify;
var json_format = opts_plugins.json_format;
var json_spaces = json_format.indent_size;
// -------------------------------------
var questions = require(__PATHS_GULP_SETUP_QUESTIONS)
    .questions;
var templates = require(__PATHS_GULP_SETUP_TEMPLATES)
    .templates;
var jsconfigs = require(__PATHS_GULP_SETUP_JSCONFIGS)
    .jsconfigs;
var utils = require(__PATHS_GULP_UTILS);
var log = utils.log;
var time = utils.time;
var notify = utils.notify;
var gulp = utils.gulp;
var format = utils.format;
// -------------------------------------
var APPTYPE; // application-type
var __data__ = {}; // placeholder fillers
var INDEX = config_user.get("paths.index");
// -------------------------------------
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
//
// @end   vars.js
// --------------------------------------------------------------------------
//
//
// --------------------------------------------------------------------------
// @start functions.js
//
//                        -- blank_file --
//
// @end   functions.js
// --------------------------------------------------------------------------
//
//
// --------------------------------------------------------------------------
// @start helpers.js
//
// beautify html, js, css, & json files
// @internal
gulp.task("pretty", function(done) {
    var task = this;
    // beautify html, js, css, & json files
    var condition = function(file) {
        return (path.extname(file.path)
            .toLowerCase() === ".json");
    };
    // get needed files
    pump([gulp.src([__PATHS_FILES_BEAUTIFY, __PATHS_FILES_BEAUTIFY_EXCLUDE, __PATHS_NOT_NODE_MODULES], {
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
//
// @end   helpers.js
// --------------------------------------------------------------------------
//
//
// --------------------------------------------------------------------------
// @start init.js
//
// @internal
gulp.task("default", function(done) {
    var task = this;
    // show the user the init message
    log("Run \"$ gulp init\" before running Gulp's default command.");
    done();
});
// run the prompt to setup project
// @internal
gulp.task("init", function(done) {
    var task = this;
    prompt.start(); // start the prompt
    prompt.message = chalk.green("[question]");
    prompt.delimiter = " ";
    prompt.get(questions, function(err, result) {
        // kill prompt and show user error message
        if (err) {
            console.log("\n" + time(), (err.message === "canceled") ? chalk.red("Setup canceled.") : err);
            return prompt.stop();
        }
        // get user input
        __data__ = result;
        var type = __data__.apptype;
        // set the path for js option
        __PATHS_JS_OPTIONS_DYNAMIC = `gulp/setup/js/options/${type}/**/*.*`;
        // set the application type
        config_internal.set("apptype", type);
        // pick js bundle based on provided project type + reset the config js bundle
        config_user.data.bundles.js = jsconfigs[type];
        // remove distribution configuration if type is library
        // as the project is defaulted for a webapp project.
        if (type === "library") {
            // remove the distribution configuration
            delete config_user.data.bundles.dist;
            // add the library configuration
            config_user.data.bundles.lib = jsconfigs.lib;
        } // else leave as-is for webapp project
        // set package.json properties
        pkg.set("name", __data__.name);
        pkg.set("version", __data__.version);
        pkg.set("description", __data__.description);
        pkg.set("author", format(templates.author, __data__));
        pkg.set("repository", {
            type: "git",
            url: format(templates["repository.url"], __data__)
        });
        pkg.set("bugs", {
            url: format(templates["bugs.url"], __data__)
        });
        pkg.set("homepage", format(templates.homepage, __data__));
        pkg.set("private", __data__.private);
        // sort keys
        config_user.data = alphabetize(config_user.data);
        config_internal.data = alphabetize(config_internal.data);
        pkg.data = alphabetize(pkg.data);
        // saves changes to files
        config_user.write(function() {
            config_internal.write(function() {
                pkg.write(function() {
                    // run initialization steps
                    var tasks = [
						"init:clear-js",
						"init:pick-js-option",
						"init:fill-placeholders",
						"init:setup-readme",
						"init:rename-gulpfile",
						"init:remove-setup",
						"init:pretty",
						"init:git"
                    ];
                    tasks.push(function() {
                        var message = `Project initialized (${type})`;
                        notify(message);
                        log(message);
                        log("Run \"$ gulp\" to start watching project for any file changes.");
                        done();
                    });
                    return sequence.apply(task, tasks);
                }, null, json_spaces);
            }, null, json_spaces);
        }, null, json_spaces);
    });
});
//
// @end   init.js
// --------------------------------------------------------------------------
//
//
// --------------------------------------------------------------------------
// @start steps.js
//
// initialization step
// @internal
gulp.task("init:clear-js", function(done) {
    var task = this;
    // pick the js/ directory to use
    pump([gulp.src(__PATHS_JS_HOME, {
            dot: true,
            cwd: __PATHS_BASE
        }),
    	clean(),
    	debug(task.__wadevkit.debug)
    ], done);
});
// initialization step
// @internal
gulp.task("init:pick-js-option", function(done) {
    var task = this;
    // pick the js/ directory to use
    pump([gulp.src(__PATHS_JS_OPTIONS_DYNAMIC, {
            dot: true,
            cwd: __PATHS_BASE
        }),
        gulp.dest(__PATHS_JS_HOME),
    	debug(task.__wadevkit.debug)
    ], done);
});
// initialization step
// @internal
gulp.task("init:fill-placeholders", function(done) {
    var task = this;
    // replace placeholder with real data
    pump([
        gulp.src([__PATHS_DOCS_README_TEMPLATE, __PATHS_LICENSE, __PATHS_HTML_HEADMETA, INDEX], {
            base: __PATHS_BASE
        }),
        replace(/\{\{\#(.*?)\}\}/g, function(match) {
            match = match.replace(/^\{\{\#|\}\}$/g, "");
            return __data__[match] ? __data__[match] : match;
        }),
        gulp.dest(__PATHS_BASE),
		debug(task.__wadevkit.debug)
    ], done);
});
// initialization step
// @internal
gulp.task("init:setup-readme", function(done) {
    var task = this;
    // move ./docs/readme_template.md to ./README.md
    pump([
        gulp.src(__PATHS_DOCS_README_TEMPLATE, {
            base: __PATHS_BASE
        }),
		debug(),
        clean(),
        rename(__PATHS_README),
        gulp.dest(__PATHS_BASE),
    	debug(task.__wadevkit.debug)
    ], function() {
        // markdown to html (with github style/layout)
        mds.render(mds.resolveArgs({
            input: path.join(__PATHS_CWD, __PATHS_README),
            output: path.join(__PATHS_CWD, __PATHS_MARKDOWN_PREVIEW),
            layout: path.join(__PATHS_CWD, __PATHS_MARKDOWN_SOURCE)
        }), function() {
            done();
        });
    });
});
// initialization step
// @internal
gulp.task("init:rename-gulpfile", function(done) {
    var task = this;
    // rename the gulpfile.unactive.js to gulpfile.js
    pump([
        gulp.src(__PATHS_GULP_FILE_UNACTIVE, {
            base: __PATHS_BASE
        }),
    	debug(),
        clean(), // remove the file
        rename(__PATHS_GULP_FILE_NAME),
        gulp.dest(__PATHS_BASE),
    	debug(task.__wadevkit.debug)
    ], done);
});
// initialization step
// @internal
gulp.task("init:remove-setup", function(done) {
    var task = this;
    // remove the setup files/folders/old .git folder
    pump([
        gulp.src([__PATHS_GULP_FILE_SETUP, __PATHS_GULP_SETUP, __PATHS_GIT], {
            dot: true,
            read: false,
            base: __PATHS_BASE
        }),
        clean(),
    	debug(task.__wadevkit.debug)
    ], done);
});
// initialization step::alias
// @internal
gulp.task("init:pretty", ["pretty"]);
// initialization step
// @internal
gulp.task("init:git", function(done) {
    var task = this;
    // git init new project
    git.init("", function() {
            log(`Git initialized (${__data__.apptype})`);
            notify(`Git initialized (${__data__.apptype})`);
            done();
        })
        .add("./*")
        .commit("chore: Initial commit\n\nProject initialization.");
});
//
// @end   steps.js
// --------------------------------------------------------------------------
//
//
// --------------------------------------------------------------------------
// @start make.js
//
// build gulpfile.setup.js
// @internal
gulp.task("gulpfile", function(done) {
    var task = this;
    var files = [
        "requires.js",
        "paths.js",
        "vars.js",
        "functions.js",
        "helpers.js",
        "init.js",
        "steps.js",
        "make.js"
    ];
    pump([gulp.src(files, {
            cwd: __PATHS_GULP_SETUP_SOURCE
        }),
		debug(),
		foreach(function(stream, file) {
            var filename = path.basename(file.path);
            var decor = "-".repeat(74);
            var top = `//
            // ${decor}
            // @start ${filename}
            //\n`;
            var bottom = `\n//
            // @end   ${filename}
            // ${decor}
            //`;
            var padding = " ".repeat(filename.length + 10);
            var empty = `// ${padding} -- blank_file --`;
            // empty check
            var is_empty = file.contents.toString()
                .trim() === "";
            return stream.pipe(gulpif(is_empty, insert.prepend(empty)))
                .pipe(insert.prepend(top))
                .pipe(insert.append(bottom));
        }),
		concat("gulpfile.setup.js"),
		beautify(opts_bt),
		gulp.dest(__PATHS_BASE),
		debug(task.__wadevkit.debug)
	], done);
});
//
// @end   make.js
// --------------------------------------------------------------------------
//
