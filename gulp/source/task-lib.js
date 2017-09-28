// remove old lib / folder
gulp.task("task-lib-clean", function(done) {
    var task = this;
    pump([gulp.src(__PATHS_LIB_HOME, opts),
    	debug(task._wa_devkit.debug),
        clean(),
        size(task._wa_devkit.size)
    ], done);
});
gulp.task("task-lib-js", function(done) {
    var task = this;
    var files = bundle_js.source.files;
    files.push(__PATHS_FILES_TEST); // ignore test files
    pump([gulp.src(bundle_js.source.files, {
            nocase: true,
            cwd: __PATHS_JS_THIRDPARTY
        }),
    	debug(task._wa_devkit.debug),
        concat(bundle_js.thirdparty.name),
        beautify(opts_bt),
        size(task._wa_devkit.size),
        gulp.dest(__PATHS_LIB_HOME),
        uglify(),
        rename(bundle_js.thirdparty.minified_name),
        size(task._wa_devkit.size),
        gulp.dest(__PATHS_LIB_HOME),
    ], done);
});
// helper library make task
gulp.task("helper-make-lib", function(done) {
    var task = this;
    if (APPTYPE !== "library") {
        log("This helper task is only available for \"library\" projects.");
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
