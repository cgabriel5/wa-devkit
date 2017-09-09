// preform custom regexp replacements
gulp.task("task-precssapp-clean-styles", function(done) {
    // regexp used for custom CSS code modifications
    var r = regexp.css;
    var pf = r.prefixes;
    var lz = r.lead_zeros;
    var ez = r.empty_zero;
    var lh = r.lowercase_hex;
    pump([gulp.src(["styles.css"], {
            cwd: "css/source/"
        }),
        // [https://www.mikestreety.co.uk/blog/find-and-remove-vendor-prefixes-in-your-css-using-regex]
        replace(new RegExp(pf.p, pf.f), pf.r),
        replace(new RegExp(lz.p, lz.f), lz.r),
        replace(new RegExp(ez.p, ez.f), ez.r),
        replace(new RegExp(lh.p, lh.f), function(match) {
            return match.toLowerCase();
        }),
        gulp.dest("css/source/"),
        bs.stream()
    ], done);
});
// build app.css + autoprefix + minify
gulp.task("task-cssapp", ["task-precssapp-clean-styles"], function(done) {
    pump([gulp.src(paths.tasks.cssapp, {
            cwd: "css/source/"
        }),
        concat("app.css"),
        autoprefixer(autoprefixer_options),
        shorthand(),
        beautify(beautify_options),
        gulp.dest("css/"),
        clean_css(),
        gulp.dest("dist/css/"),
        bs.stream()
    ], done);
});
// build libs.css + minify + beautify
gulp.task("task-csslibs", function(done) {
    pump([gulp.src(paths.tasks.csslibs, {
            cwd: "css/libs/"
        }),
        concat("libs.css"),
        autoprefixer(autoprefixer_options),
        shorthand(),
        beautify(beautify_options),
        gulp.dest("css/"),
        clean_css(),
        gulp.dest("dist/css/"),
        bs.stream()
    ], done);
});
// remove the css/libs/ folder
gulp.task("task-clean-csslibs", function(done) {
    pump([gulp.src("dist/css/libs/", opts),
        clean()
    ], done);
});
// copy css libraries folder
gulp.task("task-csslibsfolder", ["task-clean-csslibs"], function(done) {
    pump([gulp.src(["css/libs/**"]),
        gulp.dest("dist/css/libs/"),
        bs.stream()
    ], done);
});
