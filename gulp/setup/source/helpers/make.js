// build gulpfile.setup.js
// @internal
gulp.task("make", function(done) {
    var task = this;
    var files = [
        "requires.js",
        "paths.js",
        "vars.js",
        "functions.js",
        "tasks/init.js",
        "tasks/steps.js",
        "helpers/pretty.js",
        "helpers/make.js"
    ];
    pump([gulp.src(files, {
            cwd: __PATHS_GULP_SETUP_SOURCE
        }),
		debug(),
		foreach(function(stream, file) {
            var filename = path.basename(file.path);
            var filename_length = filename.length;
            var decor = "*".repeat(45);
            var spacer = " ".repeat(5);
            var header_top = `/* ${decor}\n ${spacer} Start ${filename}\n ${decor} */\n`;
            var header_bottom = `/* ${decor}\n ${spacer} End ${filename}\n ${decor} */\n`;
            // empty check
            if (file.contents.toString()
                .trim() === "") filename += " is empty";
            return stream.pipe(insert.prepend(header_top))
                .pipe(insert.append(header_bottom));
        }),
		concat(__PATHS_GULP_FILE_SETUP),
		beautify(config_jsbeautify),
		gulp.dest(__PATHS_BASE),
		debug(task.__wadevkit.debug)
	], done);
});
