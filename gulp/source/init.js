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
 * Runs Gulp, builds project files, watches files, and starts browser-sync.
 *
 * Options
 *
 * -s, --stop [boolean] Flag indicating to stop Gulp.
 *
 * Usage
 *
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
