// build gulpfile.setup.js
// @internal
gulp.task("make", function(done) {
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
            var filename_length = filename.length;
            var decor = "-".repeat(79 - 11 - filename_length) + "|";
            var top = `// @start ${filename} ${decor}\n\n`;
            var bottom = `\n// @end   ${filename} ${decor}\n`;
            var empty = "// file is empty..."; // file does not contain code
            // empty check
            var is_empty = file.contents.toString()
                .trim() === "";
            return stream.pipe(gulpif(is_empty, insert.prepend(empty)))
                .pipe(insert.prepend(top))
                .pipe(insert.append(bottom));
        }),
		concat(__PATHS_GULP_FILE_SETUP),
		beautify(opts_bt),
		gulp.dest(__PATHS_BASE),
		debug(task.__wadevkit.debug)
	], done);
});
