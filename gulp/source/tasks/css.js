// preform custom regexp replacements
// @internal
gulp.task("css:preapp", function(done) {
    var task = this;
    // RegExp used for custom CSS code modifications
    var lead_zeros = regexp_css.lead_zeros;
    var empty_zero = regexp_css.empty_zero;
    var lowercase_hex = regexp_css.lowercase_hex;
    var prefixes = regexp_css.prefixes;
    pump([gulp.src(__PATHS_USERS_CSS_FILE, {
            cwd: __PATHS_CSS_SOURCE
        }),
    	debug(),
		beautify(config_jsbeautify),
		// replacements...regexp pattern will match all declarations and their values
		replace(/^\s*([\w\d-]*):\s*(.*)/gm, function(match, p1, offset, string) {
            // modifications...

            // complete floats (i.e. .23 => 0.23)
            match = match.replace(new RegExp(lead_zeros.p, lead_zeros.f), lead_zeros.r);

            // remove empty zeros (i.e. 0px => 0 and 0.0 => 0, 0.0em, -0 => 0)
            match = match.replace(new RegExp(empty_zero.p, empty_zero.f), empty_zero.r);

            // lowercase hex colors (i.e. #FFFFFF => #ffffff, or #abc => #aabbcc)
            match = match.replace(new RegExp(lowercase_hex.p, lowercase_hex.f), function(hexcolor) {
                // expand the color if needed...
                if (hexcolor.length === 4) {
                    // remove the hash-sign
                    hexcolor = hexcolor.slice(1);
                    // split into tree sections
                    var parts = hexcolor.split("");
                    parts.forEach(function(part, index) {
                        // repeat section part
                        parts[index] = part + part;
                    });
                    // reset variable...
                    hexcolor = "#" + parts.join("");
                }
                return hexcolor.toLowerCase();
            });

            // remove prefixes all together
            // [https://www.mikestreety.co.uk/blog/find-and-remove-vendor-prefixes-in-your-css-using-regex]
            match = match.replace(new RegExp(prefixes.p, prefixes.f), prefixes.r);

            return match;
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
