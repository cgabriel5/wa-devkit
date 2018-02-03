/**
 * Watch for file changes.
 */
gulp.task("watch", function(done) {
	// Add auto tab closing capability to browser-sync. This will
	// auto close the created browser-sync tabs when gulp closes.
	bs.use({
		plugin() {},
		hooks: {
			"client:js": bs_autoclose
		}
	});

	// Start browser-sync.
	bs.init(
		{
			browser: browser,
			proxy: uri({
				appdir: APPDIR,
				filepath: INDEX,
				https: HTTPS
			}),
			port: bs.__ports[0],
			ui: {
				port: bs.__ports[1]
			},
			notify: false,
			open: true
		},
		function() {
			// Gulp watcher paths.
			var watch_paths = BUNDLE_GULP.watch;

			// Watch for any changes to HTML source files.
			$.watcher.create("watcher:html", watch_paths.html, ["html"]);

			// Watch for any changes to CSS source files.
			$.watcher.create("watcher:css:app", watch_paths.css.app, [
				"css:app"
			]);

			// Watch for any changes to CSS vendor files.
			$.watcher.create("watcher:css:vendor", watch_paths.css.vendor, [
				"css:vendor"
			]);

			// Watch for any changes to JS source files.
			$.watcher.create("watcher:js:app", watch_paths.js.app, ["js:app"]);

			// Watch for any changes to JS vendor files.
			$.watcher.create("watcher:js:vendor", watch_paths.js.vendor, [
				"js:vendor"
			]);

			// Watch for any changes to IMG files.
			$.watcher.create("watcher:img", watch_paths.img, ["img"]);

			// Watch for any changes to config files.
			$.watcher.create("watcher:settings", watch_paths.config, [
				"settings"
			]);

			// Is the following watcher needed?

			// // Watch for any changes to README.md.
			// gulp.watch([$paths.readme], {
			//     cwd: $paths.basedir
			// }, function() {
			//     return sequence("tohtml", function() {
			//         bs.reload();
			//     });
			// });

			done();
		}
	);
});
