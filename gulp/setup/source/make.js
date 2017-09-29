// build gulpfile.setup.js
gulp.task("helper-make-gulpfile", function(done) {
    var task = this;
    var files = [
        "requires.js",
        "paths.js",
        "vars.js",
        "functions.js",
        "helpers.js",
        "init.js",
        "steps.js",
        "make.js"
    ];
    pump([gulp.src(files, {
            cwd: __PATHS_GULP_SETUP_SOURCE
        }),
		debug(),
		insert.append("// " + "-".repeat(37)),
		concat("gulpfile.setup.js"),
		beautify(opts_bt),
		gulp.dest(__PATHS_BASE),
		debug(task.__wadevkit.debug)
	], done);
});
