//#! requires.js -- ./gulp/setup/source/requires.js

"use strict";

// node modules
var fs = require("fs");
var path = require("path");

// lazy load gulp plugins
var $ = require("gulp-load-plugins")({
    rename: {
        "gulp-if": "gulpif",
        "gulp-autoprefixer": "ap",
        "gulp-markdown": "marked",
        "gulp-purifycss": "purify",
        "gulp-clean-css": "clean_css",
        "gulp-json-sort": "json_sort",
        "gulp-jsbeautifier": "beautify",
        "gulp-minify-html": "minify_html",
        "gulp-inject-content": "injection",
        "gulp-real-favicon": "real_favicon"
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
var pump = require("pump");
var yargs = require("yargs");
var chalk = require("chalk");
var prompt = require("prompt");
var marked = require("marked");
var prism = require("prismjs");
var json = require("json-file");
var git = require("simple-git")();
var jsonc = require("comment-json");
var sequence = require("run-sequence");
var alphabetize = require("alphabetize-object-keys");

//#! paths.js -- ./gulp/setup/source/paths.js

// paths::BASES
var __PATHS_BASE = "./";
var __PATHS_BASE_DOT = ".";
var __PATHS_CWD = process.cwd();
var __PATHS_HOMEDIR = ""; // "assets/";

// paths:JS
var __PATHS_JS_HOME = `./${__PATHS_HOMEDIR}js/`;
var __PATHS_JS_SOURCE = `./${__PATHS_HOMEDIR}js/source/`;
var __PATHS_JS_OPTIONS_DYNAMIC;

// paths:GULP
var __PATHS_GULP_UTILS = `./${__PATHS_HOMEDIR}gulp/assets/utils/utils.js`;
var __PATHS_GULP_SETUP_QUESTIONS = `./${__PATHS_HOMEDIR}gulp/setup/exports/questions.js`;
var __PATHS_GULP_SETUP_TEMPLATES = `./${__PATHS_HOMEDIR}gulp/setup/exports/templates.js`;
var __PATHS_GULP_SETUP_JSCONFIGS = `./${__PATHS_HOMEDIR}gulp/setup/exports/jsconfigs.js`;
var __PATHS_GULP_SETUP_SOURCE = `./${__PATHS_HOMEDIR}gulp/setup/source/`;
var __PATHS_GULP_SETUP_README_TEMPLATE = `./${__PATHS_HOMEDIR}gulp/setup/templates/README.md`;
var __PATHS_GULP_SETUP_LICENSE_TEMPLATE = `./${__PATHS_HOMEDIR}gulp/setup/templates/LICENSE.txt`;
var __PATHS_GULP_FILE_NAME = "gulpfile.js";
var __PATHS_GULP_FILE_SETUP = "gulpfile.setup.js";
var __PATHS_GULP_SETUP = `./${__PATHS_HOMEDIR}gulp/setup/`;
var __PATHS_GULP_FILE_MAIN = "gulpfile.main.js";

// paths:MARKDOWN
var __PATHS_MARKDOWN_PREVIEW = `${__PATHS_HOMEDIR}markdown/preview/`;
var __PATHS_MARKDOWN_SOURCE = `${__PATHS_HOMEDIR}markdown/source/`;

// paths:CONFIG_FILES
var __PATHS_CONFIG_GULP_BUNDLES = `./${__PATHS_HOMEDIR}configs/gulp/bundles.json`;
var __PATHS_CONFIG_GULP_PLUGINS = `./${__PATHS_HOMEDIR}configs/gulp/plugins.json`;
var __PATHS_CONFIG_JSBEAUTIFY = `./${__PATHS_HOMEDIR}configs/jsbeautify.json`;
var __PATHS_CONFIG_INTERNAL = `./${__PATHS_HOMEDIR}configs/.hidden-internal.json`;
var __PATHS_CONFIG_CSSCOMB = `./${__PATHS_HOMEDIR}configs/csscomb.json`;
var __PATHS_CONFIG_APP = `./${__PATHS_HOMEDIR}configs/app.json`;
var __PATHS_CONFIG_PKG = `./${__PATHS_HOMEDIR}package.json`;

// paths:OTHER
var __PATHS_GIT = ".git/";
var __PATHS_README = "README.md";
var __PATHS_LICENSE = "LICENSE.txt";
var __PATHS_HTML_HEADMETA = "html/source/head/meta.html";
var __PATHS_FILES_BEAUTIFY = "**/*.{html,css,js,json}";
var __PATHS_FILES_BEAUTIFY_EXCLUDE_MIN = "!**/*.min.*";
// exclude all vendor files from any directory
var __PATHS_NOT_VENDOR = "!**/vendor/**";
var __PATHS_NODE_MODULES_NAME = "node_modules/";

//#! vars.js -- ./gulp/setup/source/vars.js

// dynamic configuration files (load via json-file to modify later)
var config_internal = json.read(__PATHS_CONFIG_INTERNAL);
var config_pkg = json.read(__PATHS_CONFIG_PKG);
var config_gulp_bundles = json.read(__PATHS_CONFIG_GULP_BUNDLES);

// static configuration files (just need to read file)
var config_gulp_plugins = jsonc.parse(
    fs.readFileSync(__PATHS_CONFIG_GULP_PLUGINS).toString()
);
var config_jsbeautify = jsonc.parse(
    fs.readFileSync(__PATHS_CONFIG_JSBEAUTIFY).toString()
);
var config_app = jsonc.parse(fs.readFileSync(__PATHS_CONFIG_APP).toString());

// plugin options
var json_spaces = config_gulp_plugins.json_format.indent_size;

var questions = require(__PATHS_GULP_SETUP_QUESTIONS).questions;
var templates = require(__PATHS_GULP_SETUP_TEMPLATES).templates;
var jsconfigs = require(__PATHS_GULP_SETUP_JSCONFIGS).jsconfigs;
var utils = require(__PATHS_GULP_UTILS);
var log = utils.log;
var time = utils.time;
var notify = utils.notify;
var gulp = utils.gulp;
var format = utils.format;

var __data__ = {}; // placeholder fillers
var INDEX = config_app.index;

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

//#! functions.js -- ./gulp/setup/source/functions.js

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
 * @param  {String} type [The optional extension type to check against.]
 * @return {String|Boolean}      [The file's extension or boolean indicating compare result.]
 */
function ext(file, type) {
    // when no file exists return an empty string
    if (!file) return "";

    // get the file extname
    var extname = path.extname(file.path).toLowerCase();

    // simply return the extname when no type is
    // provided to check against.
    if (!type) return extname;

    // else when a type is provided check against it
    return extname.slice(1) === type.toLowerCase();
}

// check for the usual file types
ext.ishtml = function(file) {
    return ext(file, "html");
};
ext.iscss = function(file) {
    return ext(file, "css");
};
ext.isjs = function(file) {
    return ext(file, "js");
};
ext.isjson = function(file) {
    return ext(file, "json");
};

//#! init.js -- ./gulp/setup/source/tasks/init.js

// @internal
gulp.task("default", function(done) {
    var task = this;
    // show the user the init message
    log('Run "$ gulp init" before running Gulp\'s default command.');
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
            console.log(
                "\n" + time(),
                err.message === "canceled" ? chalk.red("Setup canceled.") : err
            );
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
        config_gulp_bundles.data.js = jsconfigs[type];

        // remove distribution configuration if type is library
        // as the project is defaulted for a webapp project.
        if (type === "library") {
            // remove the distribution configuration
            delete config_gulp_bundles.data.dist;
            // add the library configuration
            config_gulp_bundles.data.lib = jsconfigs.lib;
        } // else leave as-is for webapp project

        // set package.json properties
        config_pkg.set("name", __data__.name);
        config_pkg.set("version", __data__.version);
        config_pkg.set("description", __data__.description);
        config_pkg.set("author", format(templates.author, __data__));
        config_pkg.set("repository", {
            type: "git",
            url: format(templates["repository.url"], __data__)
        });
        config_pkg.set("bugs", {
            url: format(templates["bugs.url"], __data__)
        });
        config_pkg.set("homepage", format(templates.homepage, __data__));
        config_pkg.set("private", __data__.private);

        // sort keys
        config_gulp_bundles.data = alphabetize(config_gulp_bundles.data);
        config_internal.data = alphabetize(config_internal.data);
        config_pkg.data = alphabetize(config_pkg.data);

        // saves changes to files
        config_gulp_bundles.write(
            function() {
                config_internal.write(
                    function() {
                        config_pkg.write(
                            function() {
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
                                    log(
                                        'Run "$ gulp" to start watching project for any file changes.'
                                    );
                                    done();
                                });
                                return sequence.apply(task, tasks);
                            },
                            null,
                            json_spaces
                        );
                    },
                    null,
                    json_spaces
                );
            },
            null,
            json_spaces
        );
    });
});

//#! steps.js -- ./gulp/setup/source/tasks/steps.js

// initialization step
// @internal
gulp.task("init:clear-js", function(done) {
    // no need to change any as the project
    // is defaulted to this type anyway. just
    // complete the task.
    if (__data__.apptype === "webapp") return done();

    // only when apptype is library:
    // replace ./js/source/
    // add ./js/vendor/__init__.js
    // ./js/bundles/ will get replaced on setup

    var task = this;
    // pick the js/ directory to use
    pump(
        [
            gulp.src(__PATHS_JS_SOURCE, {
                dot: true,
                cwd: __PATHS_BASE
            }),
            $.debug.clean(),
            $.clean()
        ],
        done
    );
});

// initialization step
// @internal
gulp.task("init:pick-js-option", function(done) {
    // no need to change any as the project
    // is defaulted to this type anyway. just
    // complete the task.
    if (__data__.apptype === "webapp") return done();

    var task = this;
    // pick the js/ directory to use
    pump(
        [
            gulp.src(__PATHS_JS_OPTIONS_DYNAMIC, {
                dot: true,
                cwd: __PATHS_BASE_DOT
            }),
            $.debug(),
            gulp.dest(__PATHS_JS_HOME),
            $.debug.edit()
        ],
        done
    );
});

// initialization step
// @internal
gulp.task("init:fill-placeholders", function(done) {
    var task = this;
    // replace placeholder with real data
    pump(
        [
            gulp.src(
                [
                    __PATHS_GULP_SETUP_README_TEMPLATE,
                    __PATHS_GULP_SETUP_LICENSE_TEMPLATE,
                    __PATHS_HTML_HEADMETA,
                    INDEX
                ],
                {
                    base: __PATHS_BASE
                }
            ),
            $.injection(__data__),
            gulp.dest(__PATHS_BASE),
            $.debug.edit()
        ],
        done
    );
});

// initialization step
// @internal
gulp.task("init:setup-readme", function(done) {
    var task = this;
    // move templates to new locations
    pump(
        [
            gulp.src([
                __PATHS_GULP_SETUP_README_TEMPLATE,
                __PATHS_GULP_SETUP_LICENSE_TEMPLATE
            ]),
            $.debug(),
            gulp.dest(__PATHS_BASE),
            $.debug.edit()
        ],
        done
    );
});

// initialization step
// @internal
gulp.task("init:rename-gulpfile", function(done) {
    var task = this;
    // rename the gulpfile.main.js to gulpfile.js
    pump(
        [
            gulp.src(__PATHS_GULP_FILE_MAIN, {
                base: __PATHS_BASE
            }),
            $.debug(),
            $.clean(), // remove the file
            $.rename(__PATHS_GULP_FILE_NAME),
            gulp.dest(__PATHS_BASE),
            $.debug.edit()
        ],
        done
    );
});

// initialization step
// @internal
gulp.task("init:remove-setup", function(done) {
    var task = this;
    // remove the setup files/folders/old .git folder
    pump(
        [
            gulp.src(
                [__PATHS_GULP_FILE_SETUP, __PATHS_GULP_SETUP, __PATHS_GIT],
                {
                    dot: true,
                    read: false,
                    base: __PATHS_BASE
                }
            ),
            $.debug.clean(),
            $.clean()
        ],
        done
    );
});

// initialization step
// @internal
gulp.task("init:git", function(done) {
    var task = this;

    // git init new project
    git.init("", function() {
        // set gitconfig values
        git.raw(["config", "--local", "core.fileMode", "false"], function(
            err,
            result
        ) {
            git.raw(["config", "--local", "core.autocrlf", "input"], function(
                err,
                result
            ) {
                git.raw(
                    ["config", "--local", "user.email", __data__.email],
                    function(err, result) {
                        git.raw(
                            ["config", "--local", "user.name", __data__.git_id],
                            function(err, result) {
                                git
                                    .add("./*")
                                    .commit(
                                        "chore: Initial commit\n\nProject initialization.",
                                        function() {
                                            console.log("");
                                            log(
                                                "Make sure to set your editor of choice with Git if not already set."
                                            );
                                            log(
                                                "For example, if using Sublime Text run ",
                                                chalk.green(
                                                    '$ git config core.editor "subl -n w"'
                                                )
                                            );
                                            log(
                                                "More information can be found here: https://git-scm.com/book/en/v2/Customizing-Git-Git-Configuration\n"
                                            );
                                            log(
                                                `Git initialized and configured (${__data__.apptype})`
                                            );
                                            notify(
                                                `Git initialized and configured (${__data__.apptype})`
                                            );
                                            done();
                                        }
                                    );
                            }
                        );
                    }
                );
            });
        });
    });
});

//#! pretty.js -- ./gulp/setup/source/helpers/pretty.js

// beautify html, js, css, & json files
// @internal
gulp.task("pretty", function(done) {
    var task = this;

    // run yargs
    var _args = yargs.option("type", {
        alias: "t",
        demandOption: false,
        describe: "The file type extensions to clean.",
        type: "string"
    }).argv;
    // get the command line arguments from yargs
    var type = _args.t || _args.type;

    // default files to clean:
    // HTML, CSS, JS, and JSON files. exclude files containing
    // a ".min." as this is the convention used for minified files.
    // the node_modules/, .git/, and all vendor/ files are also excluded.
    var files = [
        __PATHS_FILES_BEAUTIFY,
        __PATHS_FILES_BEAUTIFY_EXCLUDE_MIN,
        bangify(globall(__PATHS_NODE_MODULES_NAME)),
        bangify(globall(__PATHS_GIT)),
        __PATHS_NOT_VENDOR
    ];

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

    // get needed files
    pump(
        [
            gulp.src(files, {
                dot: true
            }),
            $.sort(opts_sort),
            // run css files through csscomb, everything else through jsbeautify
            $.gulpif(
                ext.iscss,
                $.csscomb(__PATHS_CONFIG_CSSCOMB),
                $.beautify(config_jsbeautify)
            ),
            $.gulpif(
                ext.isjson,
                $.json_sort({
                    space: json_spaces
                })
            ),
            $.eol(),
            $.debug.edit(),
            gulp.dest(__PATHS_BASE)
        ],
        done
    );
});

// initialization step::alias
// @internal
gulp.task("init:pretty", ["pretty"]);

//#! make.js -- ./gulp/setup/source/helpers/make.js

// build gulpfile.setup.js
// @internal
gulp.task("make", function(done) {
    var task = this;
    var files = [
        "requires.js",
        "paths.js",
        "vars.js",
        "functions.js",
        "tasks/init.js",
        "tasks/steps.js",
        "helpers/pretty.js",
        "helpers/make.js"
    ];
    pump(
        [
            gulp.src(files, {
                cwd: __PATHS_GULP_SETUP_SOURCE
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
            $.concat(__PATHS_GULP_FILE_SETUP),
            $.beautify(config_jsbeautify),
            gulp.dest(__PATHS_BASE),
            $.debug.edit()
        ],
        done
    );
});
