/**
 * Build gulpfile from source files. Useful after making changes to source files.
 *
 * Usage
 *
 * $ gulp make # Re-build gulpfile
 */
gulp.task("make", function(done) {
    var task = this;
    // get concat file names to use
    var names = bundle_gulp.source.names;
    var setup_name = names.setup;
    var main_name = names.main;
    pump([gulp.src(bundle_gulp.source.files, {
            cwd: __PATHS_GULP_SOURCE
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
		// if gulpfile.js exists use that name, else fallback to gulpfile.main.js
		gulpif((fe.sync(__PATHS_BASE + main_name)), concat(main_name), concat(setup_name)),
		beautify(config_jsbeautify),
		gulp.dest(__PATHS_BASE),
		debug(task.__wadevkit.debug)
	], done);
});
