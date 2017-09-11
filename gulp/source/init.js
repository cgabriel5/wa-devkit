//
// **************************************************************************
// *           The following tasks are the main application tasks.          *
// **************************************************************************
//
// update the status of gulp to active
gulp.task("task-start-gulp", function(done) {
    gulpconfig.set("pid", process.pid); // set the status
    gulpconfig.write(function() { // save changes to file
        done();
    }, null, 4);
});
// watch for git branch changes:
// branch name checks are done to check whether the branch was changed after
// the gulp command was used. this is done as when switching branches files
// and file structure might be different. this can cause some problems with
// the watch tasks and could perform gulp tasks when not necessarily wanted.
// to resume gulp simply restart with the gulp command.
gulp.task("task-git-branch", ["task-start-gulp"], function(done) {
    git.isGit(PATH, function(exists) {
        // if no .git exists simply ignore and return done
        if (!exists) return done();
        git.check(PATH, function(err, result) {
            if (err) throw err;
            // record branch name
            branch_name = result.branch;
            log(("(pid:" + process.pid + ")")
                .yellow + " Gulp monitoring " + branch_name.green + " branch.");
            // set the gulp watcher as .git exists
            gulp.watch([".git/HEAD"], {
                cwd: BASE,
                dot: true
            }, function() {
                var brn_current = git.checkSync(PATH)
                    .branch;
                if (brn_current !== branch_name) {
                    // message + exit
                    log(("[warning]")
                        .yellow + " Gulp stopped due to branch switch. (" + branch_name.green + " => " + brn_current.yellow + ")");
                    log(("[warning]")
                        .yellow + " Restart Gulp to monitor " + brn_current.yellow + " branch.");
                    process.exit();
                }
            });
            // when gulp is closed do a quick cleanup
            cleanup(function(exit_code, signal) {
                // clear gulp status and ports
                gulpconfig.set("pid", null);
                gulpconfig.set("ports", null);
                gulpconfig.writeSync(null, 4);
                branch_name = undefined;
                if (bs) bs.exit();
                if (process) process.exit();
            });
            done();
        });
    });
});
// remove the dist/ folder
gulp.task("task-clean-dist", ["task-git-branch"], function(done) {
    pump([gulp.src("dist/", opts),
        clean()
    ], done);
});
// build the dist/ folder
gulp.task("task-build", ["task-clean-dist"], function(done) {
    // add callback to the sequence
    gulp_tasks.push(function() {
        notify("Build complete");
        done();
    });
    // apply the tasks and callback to sequence
    return sequence.apply(this, gulp_tasks);
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
        var pid = gulpconfig.get("pid");
        if (pid) { // kill the open process
            log(("[success]")
                .green + " Gulp process stopped.");
            process.kill(pid);
        } else { // no open process exists
            log(("[warning]")
                .yellow + " No Gulp process exists.");
        }
        return done();
    } else { // start up Gulp like normal
        return find_free_port(3000, 3100, "127.0.0.1", 2, function(err, p1, p2) {
            // get pid, if any
            var pid = gulpconfig.get("pid");
            // if there is a pid present it means a Gulp instance has already started.
            // therefore, prevent another from starting.
            if (pid) {
                log(("[warning]")
                    .yellow + " A Gulp instance is already running " + ("(pid:" + pid + ")")
                    .yellow + ". Stop that instance before starting a new one.");
                return done();
            }
            // store the ports
            gulpconfig.set("ports", {
                "local": p1,
                "ui": p2
            });
            // save ports
            gulpconfig.write(function() {
                // store ports on the browser-sync object itself
                bs.__ports__ = [p1, p2]; // [app, ui]
                // after getting the free ports, finally run the build task
                return sequence("task-build", function() {
                    sequence("task-watch");
                    done();
                });
            }, null, 4);
        });
    }
});
// >>> IMPORTANT
// The debug tasks are used internally and should not be used for development purposes.
// <<< IMPORTANT
//
// debug tasks will...
// 1. delete the current ./gulpfile.js
// 2. rename the ___gulpfile.js to gulpfile.js
gulp.task("debug-setup", function(done) {
    // delete the current ./gulpfile.js
    del(["./gulpfile.js"]);
    done();
});
gulp.task("debug-end", ["debug-setup"], function(done) {
    // rename the ___gulpfile.js back to gulpfile.js
    pump([
        gulp.src(["./___gulpfile.js"], {
            base: BASE
        }),
        rename("gulpfile.js"),
        gulp.dest(BASE)
    ], done);
});
