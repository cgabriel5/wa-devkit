// build app.js + minify + beautify
gulp.task("task-js-app", function(done) {
    var task = this;
    pump([gulp.src(bundle_js.source.files, {
            cwd: __PATHS_JS_SOURCE
        }),
    	debug(),
        concat(bundle_js.source.name),
        beautify(opts_bt),
    	debug(task.__wadevkit.debug),
        gulp.dest(__PATHS_JS_BUNDLES),
        bs.stream()
    ], done);
});
// build libs.js + minify + beautify
gulp.task("task-js-libs", function(done) {
    var task = this;
    pump([gulp.src(bundle_js.thirdparty.files, {
            cwd: __PATHS_JS_THIRDPARTY
        }),
    	debug(),
        concat(bundle_js.thirdparty.name),
        beautify(opts_bt),
    	debug(task.__wadevkit.debug),
        gulp.dest(__PATHS_JS_BUNDLES),
        bs.stream()
    ], done);
});
