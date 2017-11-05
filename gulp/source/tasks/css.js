// preform custom regexp replacements
// @internal
gulp.task("css:preapp", function(done) {
    var task = this;
    pump([gulp.src(__PATHS_USERS_CSS_FILE, {
            cwd: __PATHS_CSS_SOURCE
        }),
    	csscomb(__PATHS_CONFIG_CSSCOMB),
		// replacements...regexp pattern will match all declarations and their values
		replace(/^\s*([\w\d-]*):\s*(.*)/gm, function(match, p1, offset, string) {
            var pattern;
            // modifications...

            // complete floats (i.e. .23 => 0.23)
            match = match.replace(new RegExp("([^\\d])(\\.\\d+)", "g"), "$10$2");

            // remove empty zeros (i.e. 0px => 0 and 0.0 => 0, 0.0em, -0 => 0)
            pattern = "(\\-?\\b(0|0\\.0)(em|ex|%|px|cm|mm|in|pt|pc|ch|rem|vh|vw|vmin|vmax)|\\-?\\b0\\.0\\b)";
            match = match.replace(new RegExp(pattern, "gi"), "0");

            // lowercase hex colors (i.e. #FFFFFF => #ffffff, or #abc => #aabbcc)
            match = match.replace(new RegExp("#[a-f0-9]{3,6}", "gi"), function(hexcolor) {
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
            pattern = "(\\s+)?\\-(moz|o|webkit|ms|khtml)\\-(?!font-smoothing|osx|print|backface).+?;";
            match = match.replace(new RegExp(pattern, "gi"), "");

            return match;
        }),
        gulp.dest(__PATHS_CSS_SOURCE),
		debug.edit(),
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
        csscomb(__PATHS_CONFIG_CSSCOMB),
        gulp.dest(__PATHS_CSS_BUNDLES),
    	debug.edit(),
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
        csscomb(__PATHS_CONFIG_CSSCOMB),
		gulp.dest(__PATHS_CSS_BUNDLES),
    	debug.edit(),
        bs.stream()
    ], done);
});
