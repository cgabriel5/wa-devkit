// watch for files changes
// @internal
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
				https: config_gulp_plugins.open.https
			}), // "markdown/preview/README.html"
			port: bs.__ports__[0],
			ui: {
				port: bs.__ports__[1]
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
					cwd: __paths__.html_source
				},
				function() {
					return sequence("html:main");
				}
			);

			// watch for any changes to CSS Source files
			gulp.watch(
				watch_paths.css.source,
				{
					cwd: __paths__.css_source
				},
				function() {
					return sequence("css:app");
				}
			);

			// watch for any changes to CSS Lib files
			gulp.watch(
				watch_paths.css.vendor,
				{
					cwd: __paths__.css_vendor
				},
				function() {
					return sequence("css:vendor");
				}
			);

			// watch for any changes to JS Source files
			gulp.watch(
				watch_paths.js.source,
				{
					cwd: __paths__.js_source
				},
				function() {
					return sequence("js:app");
				}
			);

			// watch for any changes to JS Lib files
			gulp.watch(
				watch_paths.js.vendor,
				{
					cwd: __paths__.js_vendor
				},
				function() {
					return sequence("js:vendor");
				}
			);

			// watch for any changes to IMG files
			gulp.watch(
				watch_paths.img,
				{
					cwd: __paths__.img_source
				},
				function() {
					return sequence("img:main");
				}
			);

			// watch for any changes to config files
			gulp.watch(
				__paths__.config_settings_json_files,
				{
					cwd: __paths__.base
				},
				function() {
					return sequence("settings");
				}
			);

			// is the following watcher needed?

			// // watch for any changes to README.md
			// gulp.watch([__paths__.readme], {
			//     cwd: __paths__.base
			// }, function() {
			//     return sequence("tohtml", function() {
			//         bs.reload();
			//     });
			// });

			done();
		}
	);
});
