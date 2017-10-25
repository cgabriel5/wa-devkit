// beautify html, js, css, & json files
// @internal
gulp.task("pretty", function(done) {
    var task = this;
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
		debug(),
		gulp.dest(__PATHS_BASE)
	], done);
});

// initialization step::alias
// @internal
gulp.task("init:pretty", ["pretty"]);
