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
	pump(
		[
			gulp.src(bundle_gulp.source.files, {
				cwd: __paths__.gulp_source
			}),
			$.debug(),
			$.foreach(function(stream, file) {
				var filename = path.basename(file.path);
				var filename_rel = path.relative(process.cwd(), file.path);
				return stream.pipe(
					$.insert.prepend(
						`//#! ${filename} -- ./${filename_rel}\n\n`
					)
				);
			}),
			// if gulpfile.js exists use that name, else fallback to gulpfile.main.js
			$.gulpif(
				fe.sync(__paths__.base + main_name),
				$.concat(main_name),
				$.concat(setup_name)
			),
			$.prettier(config_prettier),
			gulp.dest(__paths__.base),
			$.debug.edit()
		],
		done
	);
});
