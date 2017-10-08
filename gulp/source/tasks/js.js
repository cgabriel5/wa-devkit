// build app.js + minify + beautify
// @internal
gulp.task("js:app", function(done) {
    var task = this;
    pump([gulp.src(bundle_js.source.files, {
            cwd: __PATHS_JS_SOURCE
        }),
    	debug(),
        concat(bundle_js.source.names.main),
        beautify(config_jsbeautify),
        gulp.dest(__PATHS_JS_BUNDLES),
    	debug(task.__wadevkit.debug),
        bs.stream()
    ], done);
});

// build vendor bundle + minify + beautify
// @internal
gulp.task("js:vendor", function(done) {
    var task = this;

    // NOTE: absolute vendor library file paths should be used.
    // The paths should be supplied in ./configs/bundles.json
    // within the js.vendor.files array.

    pump([gulp.src(bundle_js.vendor.files),
    	debug(),
        concat(bundle_js.vendor.names.main),
        beautify(config_jsbeautify),
        gulp.dest(__PATHS_JS_BUNDLES),
    	debug(task.__wadevkit.debug),
        bs.stream()
    ], done);
});
