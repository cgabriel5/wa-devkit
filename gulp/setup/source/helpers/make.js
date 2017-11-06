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
		$.debug(),
		$.foreach(function(stream, file) {
            var filename = path.basename(file.path);
            var filename_rel = path.relative(process.cwd(), file.path);
            return stream.pipe($.insert.prepend(`//#! ${filename} -- ./${filename_rel}\n\n`));
        }),
		$.concat(__PATHS_GULP_FILE_SETUP),
		$.beautify(config_jsbeautify),
		gulp.dest(__PATHS_BASE),
		$.debug.edit()
	], done);
});
