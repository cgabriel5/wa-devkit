/**
 * Watch for files changes.
 */
gulp.task("watch", function(done) {
	// add auto tab closing capability to browser-sync. this will
	// auto close the used bs tabs when gulp closes.
	bs.use({
		plugin() {},
		hooks: {
			"client:js": bs_autoclose
		}
	});

	// start browser-sync
	bs.init(
		{
			browser: browser,
			proxy: uri({
				appdir: APPDIR,
				filepath: INDEX,
				https: HTTPS
			}), // "markdown/preview/README.html"
			port: bs.__ports[0],
			ui: {
				port: bs.__ports[1]
			},
			notify: false,
			open: true
		},
		function() {
			// gulp watcher paths
			var watch_paths = bundle_gulp.watch;

			// Watch for any changes to HTML files.
			$.watcher.create("watcher:html", watch_paths.html, ["html"]);

			// Watch for any changes to CSS Source files.
			$.watcher.create("watcher:css:app", watch_paths.css.app, [
				"css:app"
			]);

			// Watch for any changes to CSS Lib files.
			$.watcher.create("watcher:css:vendor", watch_paths.css.vendor, [
				"css:vendor"
			]);

			// watch for any changes to JS Source files
			$.watcher.create("watcher:js:app", watch_paths.js.app, ["js:app"]);

			// watch for any changes to JS Lib files
			$.watcher.create("watcher:js:vendor", watch_paths.js.vendor, [
				"js:vendor"
			]);

			// watch for any changes to IMG files
			$.watcher.create("watcher:img", watch_paths.img, ["img"]);

			// watch for any changes to config files
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
