/**
 * Build gulpfile.setup.js from source.
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
				var filename = path.basename(file.path);
				var filename_rel = path.relative($paths.cwd, file.path);
				return stream.pipe(
					$.insert.prepend(
						`//#! ${filename} -- ./${filename_rel}\n\n`
					)
				);
			}),
			$.concat($paths.gulp_file_setup),
			$.prettier($prettier),
			gulp.dest($paths.base),
			$.debug.edit()
		],
		done
	);
});
