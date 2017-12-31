/**
 * Build gulpfile from source files.
 *
 * Usage
 *
 * $ gulp make
 *     Re-build gulpfile.
 */
gulp.task("make", function(done) {
	// get concat file names to use
	var names = bundle_gulp.source.names;
	var name_default = names.default;
	var name_main = names.main;
	pump(
		[
			gulp.src(bundle_gulp.source.files, {
				cwd: $paths.gulp_source
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
			// if gulpfile.js exists use that name,
			// else fallback to gulpfile.main.js
			$.gulpif(
				fe.sync($paths.base + name_default),
				$.concat(name_default),
				$.concat(name_main)
			),
			$.prettier(PRETTIER),
			gulp.dest($paths.base),
			$.debug.edit()
		],
		done
	);
});
