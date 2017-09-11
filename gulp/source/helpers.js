//
// **************************************************************************
// * The following tasks are helper tasks and should be modified as needed. *
// **************************************************************************
//
// build gulpfile.js
gulp.task("helper-make-gulpfile", function(done) {
    pump([gulp.src(bundle_gulp.core, {
            cwd: "./gulp/source/"
        }),
        insert.append("// " + "-".repeat(37)),
        concat("gulpfile.js"),
        beautify(options_beautify),
        gulp.dest(BASE),
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
    if (remove || delete_file) del(["./css/pure.css"]);
    // don't run gulp just delete the file.
    if (delete_file) return done();
    pump([gulp.src("./css/source/styles.css"),
        purify(["./js/app.js", "./index.html"], {
            info: true,
            rejected: true
        }),
        gulpif(!remove, rename("pure.css")),
        beautify(options_beautify),
        gulp.dest("./css/" + (remove ? "source/" : ""))
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
            log(("[warning]")
                .yellow + " File does not exist.");
            return done();
        }
        // continue...file exists
        // check for an .md file
        var input_ext = path.extname(input);
        // file must be an .md file
        if (input_ext.toLowerCase() !== ".md") {
            log(("[warning]")
                .yellow + " Input file must be an .md file.");
            return done();
        }
        // get the input file name
        var input_filename = path.basename(input, input_ext);
        // get the new file name, default to input_filename when nothing is given
        new_name = (!new_name) ? undefined : path.basename(new_name, path.extname(new_name));
        // render Markdown to HTML
        var cwd = process.cwd();
        mds.render(mds.resolveArgs({
            input: path.join(cwd, input),
            output: path.join(cwd, output),
            layout: path.join(cwd, "/markdown/source")
        }), function() {
            var new_file_path = output + "/" + input_filename + ".html";
            // cleanup README.html
            pump([gulp.src(new_file_path, {
                    cwd: BASE
                }),
                beautify(options_beautify),
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
// clear ./gulp/.gulpconfig.json keys
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
        gulpconfig.set(key, null);
        // reset name if needed
        if (key === "pid") key = "status";
        log(("[complete]")
            .green + " " + key.yellow + " cleared.");
    }
    gulpconfig.write(function() {
        done();
    }, null, 4);
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
        var ports = gulpconfig.get("ports");
        // no ports...
        if (!ports) {
            log(("[warning]")
                .yellow + " No ports are in use.");
            return done();
        }
        // open file in the browser
        open_file_in_browser(file, ports.local, done);
    }
});
// print the status of gulp (is it running or not?)
gulp.task("helper-status", function(done) {
    log(("[status]")
        .yellow + " Gulp is " + ((gulpconfig.get("pid")) ? "running. " + (("(pid:" + process.pid + ")")
            .yellow) : "not running."));
    done();
});
// print the used ports for browser-sync
gulp.task("helper-ports", function(done) {
    // get the ports
    var ports = gulpconfig.get("ports");
    // if file is empty
    if (!ports) {
        log(("[warning]")
            .yellow + " No ports are in use.");
        return done();
    }
    // ports exist...
    log(("(local)")
        .green, ports.local);
    log(("(ui)")
        .green, ports.ui);
    done();
});
// run gulp-jsbeautifier on html, js, css, & json files to clean them
gulp.task("helper-clean-files", function(done) {
    // this task can only run when gulp is not running as gulps watchers
    // can run too many times as many files are potentially being beautified
    var pid = gulpconfig.get("pid");
    // if file is empty gulp is not active
    if (pid) {
        log(("[warning]")
            .yellow + " Files cannot be cleaned while Gulp is running. Close Gulp then try again.");
        return done();
    }
    var condition = function(file) {
        var filepath = file.path;
        var parts = filepath.split(".");
        var ext = parts.pop()
            .toLowerCase();
        var path = parts.join(".");
        // this array may be populated with files needed to be ignored
        // just add the file's path to the array.
        var exclude = [];
        // file ext must be of one of the following types
        if (!-~["html", "js", "css", "json"].indexOf(ext)) return false;
        // cannot be in the exclude array
        if (-~exclude.indexOf(filepath.replace(PATH + "/", ""))) return false;
        // check if file is a min
        var path_parts = path.split("/");
        var last = path_parts[path_parts.length - 1].toLowerCase();
        // cannot be a minimized file
        if (-~last.indexOf(".min")) return false;
        return true;
    };
    // get all files
    pump([gulp.src(["**/*.*", "!node_modules/**"], {
            cwd: BASE,
            dot: true
        }),
        gulpif(condition, print(function(filepath) {
            return "file: " + filepath;
        })),
        gulpif(condition, beautify(options_beautify)),
        gulp.dest(BASE),
    ], done);
});
// finds all the files that contain .min in the name and prints them
gulp.task("helper-findmin", function(done) {
    var condition = function(file) {
        var filepath = file.path;
        var parts = filepath.split(".");
        var ext = parts.pop()
            .toLowerCase();
        var path = parts.join(".");
        // file ext must be of one of the following types
        if (!-~["html", "js", "css", "json"].indexOf(ext)) return false;
        // check if file is a min
        var path_parts = path.split("/");
        var last = path_parts[path_parts.length - 1].toLowerCase();
        // must be a minimized file
        if (!-~last.indexOf(".min")) return false;
        return true;
    };
    // get all files
    pump([gulp.src(["**/*.*", "!node_modules/**"], {
            cwd: BASE,
            dot: true
        }),
        gulpif(condition, print(function(filepath) {
            return "file: " + filepath;
        })),
    ], done);
});
