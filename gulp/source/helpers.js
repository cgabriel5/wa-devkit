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
    gulp_check(done); // check for Gulp instance
    var condition = function(file) {
        return (path.extname(file.path)
            .toLowerCase() === ".json");
    };
    // get needed files
    pump([gulp.src([__PATHS_FILES_BEAUTIFY, __PATHS_FILES_BEAUTIFY_EXCLUDE, __PATHS_NOT_NODE_MODULES], {
            dot: true,
            cwd: __PATHS_BASE
        }),
		// gulpif(config_internal.get("pid"), fail("")),
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
