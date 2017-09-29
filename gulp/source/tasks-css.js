// preform custom regexp replacements
gulp.task("task-precssapp-cleanup", function(done) {
    var task = this;
    // RegExp used for custom CSS code modifications
    var pf = regexp_css.prefixes;
    var lz = regexp_css.lead_zeros;
    var ez = regexp_css.empty_zero;
    var lh = regexp_css.lowercase_hex;
    pump([gulp.src(__PATHS_USERS_CSS_FILE, {
            cwd: __PATHS_CSS_SOURCE
        }),
    	debug(),
        // [https://www.mikestreety.co.uk/blog/find-and-remove-vendor-prefixes-in-your-css-using-regex]
        replace(new RegExp(pf.p, pf.f), pf.r),
        replace(new RegExp(lz.p, lz.f), lz.r),
        replace(new RegExp(ez.p, ez.f), ez.r),
        replace(new RegExp(lh.p, lh.f), function(match) {
            return match.toLowerCase();
        }),
        gulp.dest(__PATHS_CSS_SOURCE),
		debug(task.__wadevkit.debug),
        bs.stream()
    ], done);
});
// build app.css + autoprefix + minify
gulp.task("task-css-app", ["task-precssapp-cleanup"], function(done) {
    var task = this;
    pump([gulp.src(bundle_css.source.files, {
            cwd: __PATHS_CSS_SOURCE
        }),
    	debug(),
        concat(bundle_css.source.name),
        autoprefixer(opts_ap),
        shorthand(),
        beautify(opts_bt),
        gulp.dest(__PATHS_CSS_BUNDLES),
    	debug(task.__wadevkit.debug),
        bs.stream()
    ], done);
});
// build libs.css + minify + beautify
gulp.task("task-css-libs", function(done) {
    var task = this;
    pump([gulp.src(bundle_css.thirdparty.files, {
            cwd: __PATHS_CSS_THIRDPARTY
        }),
    	debug(),
        concat(bundle_css.thirdparty.name),
        autoprefixer(opts_ap),
        shorthand(),
        beautify(opts_bt),
		gulp.dest(__PATHS_CSS_BUNDLES),
    	debug(task.__wadevkit.debug),
        bs.stream()
    ], done);
});
