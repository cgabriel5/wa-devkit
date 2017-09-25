// build app.js + minify + beautify
gulp.task("task-jsapp", function(done) {
    pump([gulp.src(bundle_js.source.files, {
            cwd: __PATHS_JS_SOURCE
        }),
        concat(bundle_js.source.name),
        beautify(opts_bt),
        gulp.dest(__PATHS_JS_BUNDLES),
        uglify(),
        gulp.dest(__PATHS_DIST_JS),
        bs.stream()
    ], done);
});
// build lib/lib.js + lib/lib.min.js
gulp.task("task-jslibsource", function(done) {
    // check if application is a library
    var is_library = (APPTYPE === "library");
    if (!is_library) return done(); // return on apps of type "webapp"
    // get the source files
    var files = bundle_js.source.files;
    files.push(__PATHS_FILES_TEST); // ignore test files
    pump([gulp.src(bundle_js.source.files, {
            cwd: __PATHS_JS_THIRDPARTY,
            nocase: true
        }),
        concat(bundle_js.thirdparty.name),
        beautify(opts_bt),
        // gulpif(is_library, rename("lib.js")), ==> bundle_js.thirdparty.name
        gulpif(is_library, gulp.dest(__PATHS_LIB_HOME)),
        gulpif(is_library, gulp.dest(__PATHS_DIST_LIB)), // <-- also add to dist/ directory
        uglify(),
        gulpif(is_library, rename(bundle_js.thirdparty.minified_name)),
        gulpif(is_library, gulp.dest(__PATHS_LIB_HOME)),
        gulpif(is_library, gulp.dest(__PATHS_DIST_LIB)), // <-- also add to dist/ directory
        bs.stream()
    ], done);
});
// build libs.js + minify + beautify
gulp.task("task-jslibs", function(done) {
    pump([gulp.src(bundle_js.thirdparty.files, {
            cwd: __PATHS_JS_THIRDPARTY
        }),
        concat(bundle_js.thirdparty.name),
        beautify(opts_bt),
        gulp.dest(__PATHS_JS_BUNDLES),
        uglify(),
        gulp.dest(__PATHS_DIST_JS_LIBS),
        bs.stream()
    ], done);
});
// remove the dist/js/libs/ folder
gulp.task("task-clean-jslibs", function(done) {
    pump([gulp.src(__PATHS_DIST_JS_LIBS, opts),
        clean()
    ], done);
});
// copy js libraries folder
gulp.task("task-jslibsfolder", ["task-clean-jslibs"], function(done) {
    pump([gulp.src(__PATHS_DIST_JS_LIBS_FILE_SOURCE),
        gulp.dest(__PATHS_DIST_JS_LIBS),
        bs.stream()
    ], done);
});
