// build app.js + minify + beautify
// @internal
gulp.task("js:app", function(done) {
	var task = this;
	pump(
		[
			gulp.src(bundle_js.source.files, {
				cwd: __paths__.js_source
			}),
			$.debug(),
			$.concat(bundle_js.source.names.main),
			$.prettier(config_prettier),
			gulp.dest(__paths__.js_bundles),
			$.debug.edit(),
			bs.stream()
		],
		done
	);
});

// build vendor bundle + minify + beautify
// @internal
gulp.task("js:vendor", function(done) {
	var task = this;

	// NOTE: absolute vendor library file paths should be used.
	// The paths should be supplied in ./configs/bundles.json
	// within the js.vendor.files array.

	pump(
		[
			gulp.src(bundle_js.vendor.files),
			$.debug(),
			$.concat(bundle_js.vendor.names.main),
			$.prettier(config_prettier),
			gulp.dest(__paths__.js_bundles),
			$.debug.edit(),
			bs.stream()
		],
		done
	);
});
