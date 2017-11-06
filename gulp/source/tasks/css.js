// build app.css + autoprefix + minify
// @internal
gulp.task("css:app", function(done) {

    var unprefix = require("postcss-unprefix");
    var autoprefixer = require("autoprefixer");
    var shorthand = require("postcss-merge-longhand");

    var task = this;

    pump([gulp.src(bundle_css.source.files, {
            cwd: __PATHS_CSS_SOURCE
        }),
    	$.debug(),
        $.concat(bundle_css.source.names.main),
        $.postcss([
        		unprefix(),
        		shorthand(),
        		autoprefixer(opts_ap)
        ]),
        // run csscomb outside of postcss plugin to be able to use a
        // custom config file. gulp-csscomb plugin allows the use of a
        // custom config file. the regular csscomb plugin says it does
        // but it does not work.
		$.csscomb(__PATHS_CONFIG_CSSCOMB),
        gulp.dest(__PATHS_CSS_BUNDLES),
    	$.debug.edit(),
        bs.stream()
    ], done);
});

// build vendor bundle + minify + beautify
// @internal
gulp.task("css:vendor", function(done) {

    var unprefix = require("postcss-unprefix");
    var autoprefixer = require("autoprefixer");
    var shorthand = require("postcss-merge-longhand");

    var task = this;

    // NOTE: absolute vendor library file paths should be used.
    // The paths should be supplied in ./configs/bundles.json
    // within the css.vendor.files array.

    pump([gulp.src(bundle_css.vendor.files),
    	$.debug(),
        $.concat(bundle_css.vendor.names.main),
        $.postcss([
        		unprefix(),
        		shorthand(),
        		autoprefixer(opts_ap)
        ]),
        // run csscomb outside of postcss plugin to be able to use a
        // custom config file. gulp-csscomb plugin allows the use of a
        // custom config file. the regular csscomb plugin says it does
        // but it does not work.
		$.csscomb(__PATHS_CONFIG_CSSCOMB),
		gulp.dest(__PATHS_CSS_BUNDLES),
    	$.debug.edit(),
        bs.stream()
    ], done);
});
