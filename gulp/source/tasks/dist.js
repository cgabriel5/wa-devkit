// remove old dist / folder
// @internal
gulp.task("dist:clean", function(done) {
	pump(
		[gulp.src($paths.dist_home, opts_remove), $.debug.clean(), $.clean()],
		done
	);
});

// copy new file/folders
// @internal
gulp.task("dist:favicon", function(done) {
	pump(
		[
			gulp.src(bundle_dist.source.files.favicon, {
				dot: true,
				cwd: $paths.base,
				// https://github.com/gulpjs/gulp/issues/151#issuecomment-41508551
				base: $paths.base_dot
			}),
			$.debug(),
			gulp.dest($paths.dist_home),
			$.debug.edit()
		],
		done
	);
});

// @internal
gulp.task("dist:css", function(done) {
	pump(
		[
			gulp.src(bundle_dist.source.files.css, {
				dot: true,
				cwd: $paths.base,
				base: $paths.base_dot
			}),
			$.debug(),
			$.gulpif(ext.iscss, $.clean_css()),
			gulp.dest($paths.dist_home),
			$.debug.edit()
		],
		done
	);
});

// @internal
gulp.task("dist:img", function(done) {
	// need to copy hidden files/folders?
	// [https://github.com/klaascuvelier/gulp-copy/issues/5]
	pump(
		[
			gulp.src(bundle_dist.source.files.img, {
				dot: true,
				cwd: $paths.base,
				base: $paths.base_dot
			}),
			$.cache(
				$.imagemin([
					$.imagemin.gifsicle({
						interlaced: true
					}),
					$.imagemin.jpegtran({
						progressive: true
					}),
					$.imagemin.optipng({
						optimizationLevel: 5
					}),
					$.imagemin.svgo({
						plugins: [
							{
								removeViewBox: true
							}
						]
					})
				])
			),
			gulp.dest($paths.dist_home),
			$.debug.edit()
		],
		done
	);
});

// @internal
gulp.task("dist:js", function(done) {
	pump(
		[
			gulp.src(bundle_dist.source.files.js, {
				dot: true,
				cwd: $paths.base,
				base: $paths.base_dot
			}),
			$.debug(),
			$.gulpif(ext.isjs, $.uglify()),
			gulp.dest($paths.dist_home),
			$.debug.edit()
		],
		done
	);
});

// @internal
gulp.task("dist:root", function(done) {
	pump(
		[
			gulp.src(bundle_dist.source.files.root, {
				dot: true,
				cwd: $paths.base,
				base: $paths.base_dot
			}),
			$.debug(),
			$.gulpif(ext.ishtml, $.minify_html()),
			gulp.dest($paths.dist_home),
			$.debug.edit()
		],
		done
	);
});

/**
 * task: dist
 * Build the dist/ folder. (only for webapp projects).
 *
 *
 * Usage
 *
 * $ gulp dist
 *     Create dist/ folder.
 */
gulp.task("dist", function(done) {
	// cache task
	var task = this;

	if (APPTYPE !== "webapp") {
		log("This helper task is only available for webapp projects.");
		return done();
	}
	// get the gulp build tasks
	var tasks = bundle_dist.tasks;
	// add callback to the sequence
	tasks.push(function() {
		notify("Distribution folder complete.");
		log("Distribution folder complete.");
		done();
	});
	// apply the tasks and callback to sequence
	return sequence.apply(task, tasks);
});
