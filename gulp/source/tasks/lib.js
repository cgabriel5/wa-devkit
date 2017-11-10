// remove old lib/ folder
// @internal
gulp.task("lib:clean", function(done) {
	var task = this;
	pump(
		[gulp.src(__paths__.lib_home, opts_remove), $.debug.clean(), $.clean()],
		done
	);
});

// @internal
gulp.task("lib:js", function(done) {
	var task = this;
	pump(
		[
			gulp.src(bundle_js.source.files, {
				nocase: true,
				cwd: __paths__.js_source
			}),
			// filter out all but test files (^test*/i)
			$.filter([__paths__.allfiles, __paths__.files_test]),
			$.debug(),
			$.concat(bundle_js.source.names.libs.main),
			$.prettier(config_prettier),
			gulp.dest(__paths__.lib_home),
			$.debug.edit(),
			$.uglify(),
			$.rename(bundle_js.source.names.libs.min),
			gulp.dest(__paths__.lib_home),
			$.debug.edit()
		],
		done
	);
});

/**
 * Build the lib/ folder. (only for library projects).
 *
 * Usage
 *
 * $ gulp lib # Create lib/ folder.
 */
gulp.task("lib", function(done) {
	var task = this;
	if (APPTYPE !== "library") {
		log("This helper task is only available for library projects.");
		return done();
	}
	// get the gulp build tasks
	var tasks = bundle_lib.tasks;
	// add callback to the sequence
	tasks.push(function() {
		notify("Library folder complete.");
		log("Library folder complete.");
		done();
	});
	// apply the tasks and callback to sequence
	return sequence.apply(task, tasks);
});
