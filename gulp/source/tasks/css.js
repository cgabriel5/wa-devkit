// preform custom regexp replacements
// @internal
gulp.task("css:preapp", function(done) {
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
// @internal
gulp.task("css:app", ["css:preapp"], function(done) {
    var task = this;
    pump([gulp.src(bundle_css.source.files, {
            cwd: __PATHS_CSS_SOURCE
        }),
    	debug(),
        concat(bundle_css.source.names.main),
        autoprefixer(opts_ap),
        shorthand(),
        beautify(config_jsbeautify),
        gulp.dest(__PATHS_CSS_BUNDLES),
    	debug(task.__wadevkit.debug),
        bs.stream()
    ], done);
});

// build vendor bundle + minify + beautify
// @internal
gulp.task("css:vendor", function(done) {
    var task = this;

    // NOTE: absolute vendor library file paths should be used.
    // The paths should be supplied in ./configs/bundles.json
    // within the css.vendor.files array.

    pump([gulp.src(bundle_css.vendor.files),
    	debug(),
        concat(bundle_css.vendor.names.main),
        autoprefixer(opts_ap),
        shorthand(),
        beautify(config_jsbeautify),
		gulp.dest(__PATHS_CSS_BUNDLES),
    	debug(task.__wadevkit.debug),
        bs.stream()
    ], done);
});
