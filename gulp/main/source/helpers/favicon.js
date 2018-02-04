/**
 * Generate the favicon icons.
 *
 * Notes
 *
 * • This task takes a few seconds to complete. You should run it at
 *     least once to create the icons. Then, you should run it whenever
 *     RealFaviconGenerator updates its package
 *     (see the check-for-favicon-update task below).
 *
 * @internal - Used to prepare the favicon task.
 */
gulp.task("favicon:generate", function(done) {
	$.real_favicon.generateFavicon(
		Object.assign(REALFAVICONGEN, {
			// Add in the following paths to the settings object:
			masterPicture: $paths.favicon_master_pic,
			dest: $paths.favicon_dest,
			iconsPath: $paths.favicon_dest,
			markupFile: get_config_file($paths.config_$favicondata)
		}),
		function() {
			done();
		}
	);
});

/**
 * Copy favicon.ico and apple-touch-icon.png to the root.
 *
 * @internal - Used to prepare the favicon task.
 */
gulp.task("favicon:root", function(done) {
	pump(
		[
			gulp.src([
				$paths.favicon_root_ico,
				$paths.favicon_root_png,
				$paths.favicon_root_config,
				$paths.favicon_root_manifest
			]),
			$.debug(),
			gulp.dest($paths.basedir),
			$.debug.edit(),
			bs.stream()
		],
		done
	);
});

/**
 * Copy delete unneeded files.
 *
 * @internal - Used to prepare the favicon task.
 */
gulp.task("favicon:delete", function(done) {
	pump(
		[
			gulp.src([
				$paths.favicon_root_config,
				$paths.favicon_root_manifest
			]),
			$.debug.clean(),
			$.clean()
		],
		done
	);
});

/**
 * Inject new favicon HTML.
 *
 * @internal - Used to prepare the favicon task.
 */
gulp.task("favicon:html", function(done) {
	pump(
		[
			gulp.src($paths.favicon_html),
			$.real_favicon.injectFaviconMarkups(
				JSON.parse(
					fs.readFileSync(get_config_file($paths.config_$favicondata))
				).favicon.html_code
			),
			gulp.dest($paths.favicon_html_dest),
			$.debug.edit(),
			bs.stream()
		],
		done
	);
});

/**
 * Re-build project favicons.
 *
 * Usage
 *
 * $ gulp favicon
 *     Re-build favicons.
 */
gulp.task("favicon", function(done) {
	// Cache task.
	var task = this;

	// Get the gulp favicon tasks.
	var tasks = favicon.tasks;

	tasks.push(function() {
		print.gulp.success("Favicons generated.");
		done();
	});

	// Apply the tasks and callback to sequence and run the tasks.
	return sequence.apply(task, tasks);
});

/**
 * Check for RealFaviconGenerator updates.
 *
 * Notes
 *
 * • Think: Apple has just released a new Touch icon along with the
 *     latest version of iOS. Run this task from time to time. Ideally,
 *     make it part of your continuous integration system. Check for
 *     RealFaviconGenerator updates.
 */
gulp.task("favicon-updates", function(done) {
	var currentVersion = JSON.parse(
		fs.readFileSync(get_config_file($paths.config_$favicondata))
	).version;
	$.real_favicon.checkForUpdates(currentVersion, function(err) {
		if (err) {
			throw err;
		} else {
			return done();
		}
	});
});
