var del = require("del");
var pump = require("pump");
var prompt = require("prompt");
var json = require("json-file");
var sequence = require("run-sequence");
var alphabetize = require("alphabetize-object-keys");
// -------------------------------------
var clean = require("gulp-clean");
var rename = require("gulp-rename");
var replace = require("gulp-replace");
// -------------------------------------
var utils = require("./gulp/utils.js");
var log = utils.log;
var time = utils.time;
var notify = utils.notify;
var gulp = utils.gulp;
var format = utils.format;
// -------------------------------------
var APPTYPE; // application-type
var __data__ = {}; // placeholder fillers
var BASE = "./";
// -------------------------------------
gulp.task("default", function(done) {
    // show the user the init message
    log('Run "gulp init" before running gulp\'s default command.'.yellow);
    done();
});
gulp.task("init", function(done) {
    prompt.start(); // start the prompt
    prompt.message = time();
    prompt.delimiter = " ";
    prompt.get({
        properties: {
            type: {
                description: "Setup as a webapp or library?",
                type: "string",
                pattern: /^(webapp|library)$/i,
                default: "webapp",
                message: "Enter 'webapp' or 'library'.",
                required: true
            },
            name: {
                description: "Application name?",
                type: "string",
                default: "my-app"
            },
            version: {
                description: "Version? (format #.#.#)",
                type: "string",
                pattern: /^\d+.\d+.\d+$/,
                default: "0.0.1"
            },
            description: {
                description: "Application description",
                type: "string",
                default: ""
            },
            fullname: {
                description: "Fullname",
                type: "string",
                default: "John Doe"
            },
            email: {
                description: "Email",
                type: "string",
                default: "johndoe@example.com"
            },
            git_id: {
                description: "GitHub username",
                type: "string",
                default: "johndoe23",
                required: true
            },
            repo_name: {
                description: "Repository name",
                type: "string",
                default: "my-app",
                required: true
            },
            private: {
                description: "Keep private?",
                type: "string",
                pattern: /^(y(es)?|no?)$/i,
                message: "Enter 'yes' or 'no'.",
                default: "yes",
                before: function(value) {
                    return (value.charAt(0) === "y");
                }
            }
        }
    }, function(err, result) {
        // kill prompt and show user error message
        if (err) {
            log(true, (err.message === "canceled") ? "Setup canceled.".red : err);
            return prompt.stop();
        }
        // get the input
        APPTYPE = result.type;
        // get the gulpconfig.json file
        var config = new json.File("./gulp/config.json");
        var pkg = new json.File("./package.json");
        config.read(function() {
            // set the application type
            config.set("apptype", APPTYPE);
            // pick the js bundle structure based on the provided project type
            var structure = config.data.paths.bundles.js[APPTYPE];
            // reset the js bundle
            config.data.paths.bundles.js = structure;
            // sort the keys
            config.data = alphabetize(config.data);
            // save file changes
            config.write(function() {
                pkg.read(function() {
                    // get user input
                    __data__ = {
                        name: result.name,
                        version: result.version,
                        description: result.description,
                        fullname: result.fullname,
                        email: result.email,
                        git_id: result.git_id,
                        repo_name: result.repo_name,
                        private: result.private,
                        year: new Date()
                            .getFullYear()
                    };
                    // get pkg info
                    var templates = {
                        "repository.url": "git+https://github.com/{{#git_id}}/{{#repo_name}}.git",
                        author: "{{#fullname}} <{{#email}}> (https://github.com/{{#git_id}})",
                        "bugs.url": "https://github.com/{{#git_id}}/{{#repo_name}}/issues",
                        homepage: "https://github.com/{{#git_id}}/{{#repo_name}}#readme"
                    };
                    // set properties
                    pkg.set("name", __data__.name);
                    pkg.set("version", __data__.version);
                    pkg.set("description", __data__.description);
                    pkg.set("license", "MIT");
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
                    pkg.set("scripts", {
                        test: "echo \"Error: no test specified\" && exit 1"
                    });
                    // sort the keys
                    pkg.data = alphabetize(pkg.data);
                    pkg.write(function() {
                        // run initialization steps
                        return sequence("init-1", "init-2", "init-3", "init-4", "init-5", "init-6", function() {
                            notify(`Project initialized (${APPTYPE})`);
                            log("Project initialized ".bold.green + `(${APPTYPE})`);
                            log("Run", "\"$ gulp\"".bold, "to build project files and start watching project for any file changes.");
                            done();
                        });
                    }, null, 4);
                });
            }, null, 4);
        });
    });
});
// initialization step
gulp.task("init-1", function(done) {
    // pick the js/ directory to use
    pump([gulp.src("js/options/" + APPTYPE + "/**/*.*", {
            dot: true,
            cwd: BASE
        }),
        gulp.dest("./js/", {
            cwd: BASE
        })
    ], done);
});
// initialization step
gulp.task("init-2", function(done) {
    // remove the js/source/ files
    pump([gulp.src("js/options/", {
        read: false,
        cwd: BASE
    }), clean()], done);
});
// initialization step
gulp.task("init-3", function(done) {
    // replace gulpfile with new gulpfile
    pump([
        gulp.src("./gulp/gulpfile.js", {
            dot: true,
            cwd: BASE
        }),
        gulp.dest(BASE)
    ], done);
});
// initialization step
gulp.task("init-4", function(done) {
    // remove ./gulp/gulpfile.js
    pump([
        gulp.src("./gulp/gulpfile.js", {
            read: false,
            cwd: BASE
        }), clean()
    ], done);
});
// initialization step
gulp.task("init-5", function(done) {
    // replace placeholder with real data
    pump([
        gulp.src(["./docs/readme_template.md", "./LICENSE.txt", "./html/source/head/meta.html"], {
            base: BASE
        }),
        replace(/\{\{\#(.*?)\}\}/g, function(match) {
            match = match.replace(/^\{\{\#|\}\}$/g, "");
            return __data__[match] ? __data__[match] : match;
        }), gulp.dest("")
    ], done);
});
// initialization step
gulp.task("init-6", function(done) {
    // move ./docs/readme_template.md to ./README.md
    pump([
        gulp.src(["./docs/readme_template.md"], {
            base: BASE
        }),
        rename("README.md"),
        gulp.dest(BASE)
    ], function() {
        // delete the file
        del(["./docs/readme_template.md"])
            .then(function() {
                done();
            });
    });
});
//
// ***************************************************************** IMPORTANT
// This task is only used for internal purposes and should not be used at all.
// ***************************************************************** IMPORTANT
//
// 1. rename the current gulpfile.js to ___gulpfile.js
// 2. copy the ./gulp/gulpfile.js to ./gulpfile.js
gulp.task("preswitch", function(done) {
    // rename the current gulpfile.js to ___gulpfile.js
    pump([
        gulp.src(["./gulpfile.js"], {
            base: BASE
        }),
        rename("___gulpfile.js"),
        gulp.dest(BASE)
    ], done);
});
gulp.task("switch", ["preswitch"], function(done) {
    // copy the ./gulp/gulpfile.js to ./gulpfile.js
    pump([
        gulp.src(["./gulp/gulpfile.js"], {
            base: BASE
        }),
        rename("gulpfile.js"),
        gulp.dest(BASE)
    ], done);
});
