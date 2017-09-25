// preform custom regexp replacements
gulp.task("task-precssapp-cleanup", function(done) {
    // RegExp used for custom CSS code modifications
    var pf = regexp_css.prefixes;
    var lz = regexp_css.lead_zeros;
    var ez = regexp_css.empty_zero;
    var lh = regexp_css.lowercase_hex;
    pump([gulp.src(__PATHS_USERS_CSS_FILE, {
            cwd: __PATHS_CSS_SOURCE
        }),
        // [https://www.mikestreety.co.uk/blog/find-and-remove-vendor-prefixes-in-your-css-using-regex]
        replace(new RegExp(pf.p, pf.f), pf.r),
        replace(new RegExp(lz.p, lz.f), lz.r),
        replace(new RegExp(ez.p, ez.f), ez.r),
        replace(new RegExp(lh.p, lh.f), function(match) {
            return match.toLowerCase();
        }),
        gulp.dest(__PATHS_CSS_SOURCE),
        bs.stream()
    ], done);
});
// build app.css + autoprefix + minify
gulp.task("task-cssapp", ["task-precssapp-cleanup"], function(done) {
    pump([gulp.src(bundle_css.source.files, {
            cwd: __PATHS_CSS_SOURCE
        }),
        concat(bundle_css.source.name),
        autoprefixer(opts_ap),
        shorthand(),
        beautify(opts_bt),
        gulp.dest(__PATHS_CSS_BUNDLES),
        clean_css(),
        gulp.dest(__PATHS_DIST_CSS),
        bs.stream()
    ], done);
});
// build libs.css + minify + beautify
gulp.task("task-csslibs", function(done) {
    pump([gulp.src(bundle_css.thirdparty.files, {
            cwd: __PATHS_CSS_THIRDPARTY
        }),
        concat(bundle_css.thirdparty.name),
        autoprefixer(opts_ap),
        shorthand(),
        beautify(opts_bt),
        gulp.dest(__PATHS_CSS_BUNDLES),
        clean_css(),
        gulp.dest(__PATHS_DIST_CSS),
        bs.stream()
    ], done);
});
// remove the dist/css/libs/ folder
gulp.task("task-clean-csslibs", function(done) {
    pump([gulp.src(__PATHS_DIST_CSS_LIBS, opts),
        clean()
    ], done);
});
// copy css libraries folder
gulp.task("task-csslibsfolder", ["task-clean-csslibs"], function(done) {
    pump([gulp.src(__PATHS_DIST_CSS_LIBS_FILE_SOURCE),
        gulp.dest(__PATHS_DIST_CSS_LIBS),
        bs.stream()
    ], done);
});
