/**
 * Build gulpfile from source files.
 *
 * $ gulp make
 *     Build gulpfile.
 */
gulp.task("make", function(done) {
	var files = [
		"requires.js",
		"paths.js",
		"configs.js",
		"vars.js",
		"functions.js",
		"tasks/init.js",
		"tasks/steps.js",
		"helpers/make.js"
	];
	pump(
		[
			gulp.src(files, {
				cwd: $paths.gulp_setup_source
			}),
			$.debug(),
			$.foreach(function(stream, file) {
				// The max length of characters for decoration line.
				var max_length = 80;
				var decor = "// " + "-".repeat(max_length - 3);

				var filename = path.basename(file.path);
				var filename_rel = path.relative($paths.cwd, file.path);

				var line_info = `${decor}\n// ${filename} -- ./${filename_rel}\n${decor}\n\n`;

				return stream.pipe($.insert.prepend(line_info));
			}),
			$.concat($paths.gulp_file_setup),
			$.prettier(PRETTIER),
			gulp.dest($paths.basedir),
			$.debug.edit()
		],
		done
	);
});
