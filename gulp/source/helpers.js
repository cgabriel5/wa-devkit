/**
 * Provides Gulp task documentation.
 *
 * Options
 *
 * (no options) List tasks and their descriptions.
 * -v, --verbose [boolean] Flag indicating whether to show all documentation.
 * -n, --names   [string]  Names of tasks to show documentation for.
 *
 * Usage
 *
 * $ gulp help # Show list of tasks and their descriptions.
 * $ gulp help --verbose # Show all documentation for all tasks.
 * $ gulp help --name "open default dependency" # Show documentation for specific tasks.
 */
gulp.task("help", function() {
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
    })(this);
});
/**
 * Build gulpfile from source files. Useful after making changes to source files.
 *
 * Usage
 *
 * $ gulp gulpfile # Re-build gulpfile
 */
gulp.task("gulpfile", function(done) {
    var task = this;
    var setup_name = bundle_gulp.source.name_setup;
    var name = bundle_gulp.source.name;
    pump([gulp.src(bundle_gulp.source.files, {
            cwd: __PATHS_GULP_SOURCE
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
        // if gulpfile.js exists use that name, else fallback to gulpfile.unactive.js
        gulpif((fe.sync(__PATHS_BASE + name)), concat(name), concat(setup_name)),
        beautify(opts_bt),
        gulp.dest(__PATHS_BASE),
    	debug(task.__wadevkit.debug)
    ], done);
});
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
 * (no options) Creates pure.css which contains only used styles.
 * -r, --remove [boolean] Deletes pure.css and removes unused CSS.
 * -D, --delete [boolean] Deletes pure.css.
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
 * -i, --input  <string> Path of file to convert (Markdown => HTML).
 * -o, --output <string> Path where converted HTML file should be placed.
 * -n, --name   <string> New name of converted file.
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
/**
 * Opens provided file in browser.
 *
 * Options
 *
 * -f, --file <file> The path of the file to open.
 * -p, --port <number> The port to open in. Defaults to browser-sync port.
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
/**
 * Find and print all min (.min.) files in project.
 *
 * Usage
 *
 * $ gulp findmin # Find all .min. files.
 */
gulp.task("findmin", function(done) {
    var task = this;
    // get min files
    pump([gulp.src([__PATHS_FILES_MIN, __PATHS_NOT_NODE_MODULES], {
            dot: true,
            cwd: __PATHS_BASE
        }),
		sort(opts_sort),
		debug()
    ], done);
});
/**
 * Add/remove front-end dependencies from ./node_modules/ to its JS/CSS library folder.
 *
 * Options
 *
 * -n, --name   <string> The module name.
 * -t, --type   <string> Dependency type (js/css).
 * -a, --action <string> Action to take (add/remove).
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
    var dest = (type === "js") ? __PATHS_JS_THIRDPARTY : __PATHS_CSS_THIRDPARTY;
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
