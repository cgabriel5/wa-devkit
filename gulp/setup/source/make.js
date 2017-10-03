// build gulpfile.setup.js
// @internal
gulp.task("gulpfile", function(done) {
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
		concat("gulpfile.setup.js"),
		beautify(opts_bt),
		gulp.dest(__PATHS_BASE),
		debug(task.__wadevkit.debug)
	], done);
});
