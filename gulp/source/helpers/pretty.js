/**
 * Beautify all HTML, JS, CSS, and JSON project files. Ignores ./node_modules/.
 *
 * Usage
 *
 * $ gulp pretty # Prettify files.
 */
gulp.task("pretty", function(done) {
    var task = this;
    // this task can only run when gulp is not running as gulps watchers
    // can run too many times as many files are potentially being beautified
    if (config_internal.get("pid")) { // Gulp instance exists so cleanup
        gulp_check_warn();
        return done();
    }
    var condition = function(file) {
        return (path.extname(file.path)
            .toLowerCase() === ".json");
    };
    // get needed files
    pump([gulp.src([
	    	__PATHS_FILES_BEAUTIFY,
	    	__PATHS_FILES_BEAUTIFY_EXCLUDE_MIN,
	    	bangify(globall(__PATHS_NODE_MODULES_NAME)),
	    	bangify(globall(__PATHS_GIT)),
    		__PATHS_NOT_VENDOR
    	], {
            dot: true
        }),
		sort(opts_sort),
		beautify(config_jsbeautify),
		gulpif(condition, json_sort({
            "space": json_spaces
        })),
		eol(),
		debug.edit(),
		gulp.dest(__PATHS_BASE)
    ], done);
});
