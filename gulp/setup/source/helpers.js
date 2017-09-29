// beautify html, js, css, & json files
gulp.task("helper-clean-files", function(done) {
    var task = this;
    // beautify html, js, css, & json files
    var condition = function(file) {
        return (path.extname(file.path)
            .toLowerCase() === ".json");
    };
    // get needed files
    pump([gulp.src([__PATHS_FILES_BEAUTIFY, __PATHS_FILES_BEAUTIFY_EXCLUDE, __PATHS_NOT_NODE_MODULES], {
            dot: true,
            cwd: __PATHS_BASE
        }),
		sort(opts_sort),
		beautify(opts_bt),
		gulpif(condition, json_sort({
            "space": json_spaces
        })),
		eol(),
		debug(task.__wadevkit.debug),
		gulp.dest(__PATHS_BASE)
	], done);
});
