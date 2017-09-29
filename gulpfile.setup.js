"use strict";
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
var rename = require("gulp-rename");
var replace = require("gulp-replace");
var json_sort = require("gulp-json-sort")
    .default;
// -------------------------------------
var uglify = require("gulp-uglify");
var beautify = require("gulp-jsbeautifier");
// -------------------------------------
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
// -------------------------------------
gulp.task("default", function(done) {
    var task = this;
    // show the user the init message
    log("Run", chalk.magenta("gulp init"), "before running gulp's default command.");
    done();
});
gulp.task("init", function(done) {
    var task = this;
    prompt.start(); // start the prompt
    prompt.message = time();
    prompt.delimiter = " ";
    prompt.get(questions, function(err, result) {
        // kill prompt and show user error message
        if (err) {
            log("\n", (err.message === "canceled") ? chalk.red("Setup canceled.") : err);
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
                    return sequence("init-pick-js-option", "init-fill-placeholders", "init-setup-readme", "init-rename-gulpfile", "init-remove-setup", "init-beautify-files", "init-git", function() {
                        notify(`Project initialized (${type})`);
                        log(`Project initialized (${type})`);
                        log("Run \"$ gulp\" to build project files and start watching project for any file changes.");
                        done();
                    });
                }, null, json_spaces);
            }, null, json_spaces);
        }, null, json_spaces);
    });
});
// initialization step
gulp.task("init-pick-js-option", function(done) {
    var task = this;
    // pick the js/ directory to use
    pump([gulp.src(__PATHS_JS_OPTIONS_DYNAMIC, {
            dot: true,
            cwd: __PATHS_BASE
        }),
    	debug(task.__wadevkit.debug),
        gulp.dest(__PATHS_JS_HOME, {
            cwd: __PATHS_BASE
        })
    ], done);
});
// initialization step
gulp.task("init-fill-placeholders", function(done) {
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
		debug(task.__wadevkit.debug),
        gulp.dest("")
    ], done);
});
// initialization step
gulp.task("init-setup-readme", function(done) {
    var task = this;
    // move ./docs/readme_template.md to ./README.md
    pump([
        gulp.src(__PATHS_DOCS_README_TEMPLATE, {
            base: __PATHS_BASE
        }),
		debug(task.__wadevkit.debug),
        clean(),
        rename(__PATHS_README),
    	debug(task.__wadevkit.debug),
        gulp.dest(__PATHS_BASE)
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
gulp.task("init-rename-gulpfile", function(done) {
    var task = this;
    // rename the gulpfile.unactive.js to gulpfile.js
    pump([
        gulp.src(__PATHS_GULP_FILE_UNACTIVE, {
            base: __PATHS_BASE
        }),
    	debug(task.__wadevkit.debug),
        clean(), // remove the file
        rename(__PATHS_GULP_FILE_NAME),
    	debug(task.__wadevkit.debug),
        gulp.dest(__PATHS_BASE)
    ], done);
});
// initialization step
gulp.task("init-remove-setup", function(done) {
    var task = this;
    // remove the setup files/folders/old .git folder
    pump([
        gulp.src([__PATHS_GULP_FILE_SETUP, __PATHS_GULP_SETUP, __PATHS_GIT], {
            dot: true,
            read: false,
            base: __PATHS_BASE
        }),
    	debug(task.__wadevkit.debug),
        clean()
    ], done);
});
// initialization step
gulp.task("init-beautify-files", function(done) {
    var task = this;
    // beautify html, js, css, & json files
    var condition = function(file) {
        return (path.extname(file.path) === ".json");
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
        gulp.dest(__PATHS_BASE),
    ], done);
});
// initialization step
gulp.task("init-git", function(done) {
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
