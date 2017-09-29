// remove old lib / folder
gulp.task("task-lib-clean", function(done) {
    var task = this;
    pump([gulp.src(__PATHS_LIB_HOME, opts),
        clean(),
        debug(task.__wadevkit.debug)
    ], done);
});
gulp.task("task-lib-js", function(done) {
    var task = this;
    pump([gulp.src(bundle_js.source.files, {
            nocase: true,
            cwd: __PATHS_JS_SOURCE
        }),
    	// filter out all but test files (^test*/i)
		filter([__PATHS_ALLFILES, __PATHS_FILES_TEST]),
		debug(),
        concat(bundle_js.thirdparty.name),
        beautify(opts_bt),
        gulp.dest(__PATHS_LIB_HOME),
        debug(task.__wadevkit.debug),
        uglify(),
        rename(bundle_js.thirdparty.minified_name),
		gulp.dest(__PATHS_LIB_HOME),
        debug(task.__wadevkit.debug)
    ], done);
});
// helper library make task
gulp.task("helper-make-lib", function(done) {
    var task = this;
    if (APPTYPE !== "library") {
        log(chalk.yellow("[warning]"), "This helper task is only available for", chalk.magenta("library"), "projects.");
        return done();
    }
    // get the gulp build tasks
    var tasks = bundle_lib.tasks;
    // add callback to the sequence
    tasks.push(function() {
        notify("Library folder complete.");
        log("Library folder complete.");
        done();
    });
    // apply the tasks and callback to sequence
    return sequence.apply(task, tasks);
});
