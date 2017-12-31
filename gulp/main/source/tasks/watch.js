/**
 * Watch for files changes.
 */
gulp.task("watch:main", function(done) {
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

			// watch for any changes to HTML files
			gulp.watch(
				watch_paths.html,
				{
					cwd: $paths.html_source
				},
				function() {
					return sequence("html:main");
				}
			);

			// watch for any changes to CSS Source files
			gulp.watch(
				watch_paths.css.source,
				{
					cwd: $paths.css_source
				},
				function() {
					return sequence("css:app");
				}
			);

			// watch for any changes to CSS Lib files
			gulp.watch(
				watch_paths.css.vendor,
				{
					cwd: $paths.css_vendor
				},
				function() {
					return sequence("css:vendor");
				}
			);

			// watch for any changes to JS Source files
			gulp.watch(
				watch_paths.js.source,
				{
					cwd: $paths.js_source
				},
				function() {
					return sequence("js:app");
				}
			);

			// watch for any changes to JS Lib files
			gulp.watch(
				watch_paths.js.vendor,
				{
					cwd: $paths.js_vendor
				},
				function() {
					return sequence("js:vendor");
				}
			);

			// watch for any changes to IMG files
			gulp.watch(
				watch_paths.img,
				{
					cwd: $paths.img_source
				},
				function() {
					return sequence("img:main");
				}
			);

			// watch for any changes to config files
			gulp.watch(
				$paths.config_settings_json_files,
				{
					cwd: $paths.base
				},
				function() {
					return sequence("settings");
				}
			);

			// is the following watcher needed?

			// // watch for any changes to README.md
			// gulp.watch([$paths.readme], {
			//     cwd: $paths.base
			// }, function() {
			//     return sequence("tohtml", function() {
			//         bs.reload();
			//     });
			// });

			done();
		}
	);
});
