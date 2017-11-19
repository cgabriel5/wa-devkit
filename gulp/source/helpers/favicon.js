// Generate the icons. This task takes a few seconds to complete.
// You should run it at least once to create the icons. Then,
// you should run it whenever RealFaviconGenerator updates its
// package (see the check-for-favicon-update task below).
// @internal
gulp.task("favicon:generate", function(done) {
	$.real_favicon.generateFavicon(
		{
			masterPicture: $paths.favicon_master_pic,
			dest: $paths.favicon_dest,
			iconsPath: $paths.favicon_dest,
			design: {
				ios: {
					pictureAspect: "backgroundAndMargin",
					backgroundColor: "#f6f5dd",
					margin: "53%",
					assets: {
						ios6AndPriorIcons: true,
						ios7AndLaterIcons: true,
						precomposedIcons: true,
						declareOnlyDefaultIcon: true
					}
				},
				desktopBrowser: {},
				windows: {
					pictureAspect: "whiteSilhouette",
					backgroundColor: "#00a300",
					onConflict: "override",
					assets: {
						windows80Ie10Tile: true,
						windows10Ie11EdgeTiles: {
							small: true,
							medium: true,
							big: true,
							rectangle: true
						}
					}
				},
				androidChrome: {
					pictureAspect: "backgroundAndMargin",
					margin: "42%",
					backgroundColor: "#f6f5dd",
					themeColor: "#f6f5dd",
					manifest: {
						display: "standalone",
						orientation: "notSet",
						onConflict: "override",
						declared: true
					},
					assets: {
						legacyIcon: false,
						lowResolutionIcons: false
					}
				},
				safariPinnedTab: {
					pictureAspect: "silhouette",
					themeColor: "#699935"
				}
			},
			settings: {
				scalingAlgorithm: "Mitchell",
				errorOnImageTooSmall: false
			},
			markupFile: $paths.config_favicondata
		},
		function() {
			done();
		}
	);
});

// update manifest.json
// @internal
gulp.task("favicon:edit-manifest", function(done) {
	var manifest = json.read($paths.favicon_root_manifest);
	manifest.set("name", "wa-devkit");
	manifest.set("short_name", "WADK");
	manifest.write(
		function() {
			done();
		},
		null,
		jindent
	);
});

// copy favicon.ico and apple-touch-icon.png to the root
// @internal
gulp.task("favicon:root", function(done) {
	var task = this;
	pump(
		[
			gulp.src([
				$paths.favicon_root_ico,
				$paths.favicon_root_png,
				$paths.favicon_root_config,
				$paths.favicon_root_manifest
			]),
			$.debug(),
			gulp.dest($paths.base),
			$.debug.edit(),
			bs.stream()
		],
		done
	);
});

// copy delete unneeded files
// @internal
gulp.task("favicon:delete", function(done) {
	var task = this;
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

// inject new favicon html
// @internal
gulp.task("favicon:html", function(done) {
	var task = this;
	pump(
		[
			gulp.src($paths.favicon_html),
			$.real_favicon.injectFaviconMarkups(
				JSON.parse(fs.readFileSync($paths.config_favicondata)).favicon
					.html_code
			),
			gulp.dest($paths.favicon_html_dest),
			$.debug.edit(),
			bs.stream()
		],
		done
	);
});

/**
 * task: favicon
 * Re-build project favicons.
 *
 *
 * Usage
 *
 * $ gulp favicon
 *     Re-build favicons.
 */
gulp.task("favicon", function(done) {
	var task = this;
	// this task can only run when gulp is not running as gulps watchers
	// can run too many times as many files are potentially being beautified
	if ($internal.get("pid")) {
		// Gulp instance exists so cleanup
		gulp_check_warn();
		return done();
	}
	var tasks = [
		"favicon:generate",
		"favicon:edit-manifest",
		"favicon:root",
		"favicon:delete",
		"favicon:html",
		"html:main",
		"tohtml",
		"pretty"
	];
	tasks.push(function(err) {
		log("Favicons generated.");
		done();
	});
	return sequence.apply(task, tasks);
});

// Check for updates on RealFaviconGenerator (think: Apple has just
// released a new Touch icon along with the latest version of iOS).
// Run this task from time to time. Ideally, make it part of your
// continuous integration system.
// Check for RealFaviconGenerator updates.
// @internal
gulp.task("favicon-updates", function(done) {
	var currentVersion = JSON.parse(fs.readFileSync($paths.config_favicondata))
		.version;
	$.real_favicon.checkForUpdates(currentVersion, function(err) {
		if (err) {
			throw err;
		}
	});
});
