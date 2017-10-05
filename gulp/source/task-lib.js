// remove old lib/ folder
// @internal
gulp.task("lib:clean", function(done) {
    var task = this;
    pump([gulp.src(__PATHS_LIB_HOME, opts),
        clean(),
        debug(task.__wadevkit.debug)
    ], done);
});

// @internal
gulp.task("lib:js", function(done) {
    var task = this;
    pump([gulp.src(bundle_js.source.files, {
            nocase: true,
            cwd: __PATHS_JS_SOURCE
        }),
    	// filter out all but test files (^test*/i)
		filter([__PATHS_ALLFILES, __PATHS_FILES_TEST]),
		debug(),
        concat(bundle_js.vendor.name),
        beautify(opts_bt),
        gulp.dest(__PATHS_LIB_HOME),
        debug(task.__wadevkit.debug),
        uglify(),
        rename(bundle_js.vendor.minified_name),
		gulp.dest(__PATHS_LIB_HOME),
        debug(task.__wadevkit.debug)
    ], done);
});

/**
 * Build the lib/ folder. (only for library projects).
 *
 * Usage
 *
 * $ gulp lib # Create lib/ folder.
 */
gulp.task("lib", function(done) {
    var task = this;
    if (APPTYPE !== "library") {
        log("This helper task is only available for library projects.");
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
