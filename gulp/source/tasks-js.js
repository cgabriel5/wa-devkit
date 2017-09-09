// build app.js + minify + beautify
gulp.task("task-jsapp", function(done) {
    pump([gulp.src(paths.flavor.jsapp, {
            cwd: "js/source/"
        }),
        concat("app.js"),
        beautify(beautify_options),
        gulp.dest("js/"),
        uglify(),
        gulp.dest("dist/js/"),
        bs.stream()
    ], done);
});
// build lib/lib.js + lib/lib.min.js
gulp.task("task-jslibsource", function(done) {
    // check if application is a library
    var is_library = __type__ === "library";
    if (!is_library) return done(); // return on apps of type "webapp"
    // remove test files from files
    var files_array = paths.flavor.jsapp.filter(function(filename) {
        return !(/^test/i)
            .test(filename);
    });
    pump([gulp.src(files_array, {
            cwd: "js/source/"
        }),
        concat("app.js"),
        beautify(beautify_options),
        gulpif(is_library, rename("lib.js")),
        gulpif(is_library, gulp.dest("lib/")),
        gulpif(is_library, gulp.dest("dist/lib/")), // <-- also add to dist/ directory
        uglify(),
        gulpif(is_library, rename("lib.min.js")),
        gulpif(is_library, gulp.dest("lib/")),
        gulpif(is_library, gulp.dest("dist/lib/")), // <-- also add to dist/ directory
        bs.stream()
    ], done);
});
// build libs.js + minify + beautify
gulp.task("task-jslibs", function(done) {
    pump([gulp.src(paths.flavor.jslibs, {
            cwd: "js/libs/"
        }),
        concat("libs.js"),
        beautify(beautify_options),
        gulp.dest("js/"),
        uglify(),
        gulp.dest("dist/js/"),
        bs.stream()
    ], done);
});
// remove the js/libs/ folder
gulp.task("task-clean-jslibs", function(done) {
    pump([gulp.src("dist/js/libs/", opts),
        clean()
    ], done);
});
// copy js libraries folder
gulp.task("task-jslibsfolder", ["task-clean-jslibs"], function(done) {
    pump([gulp.src(["js/libs/**"]),
        gulp.dest("dist/js/libs/"),
        bs.stream()
    ], done);
});
