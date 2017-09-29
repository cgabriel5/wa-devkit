// markdown to html (with github style/layout)
gulp.task("task-readme", function(done) {
    var task = this;
    mds.render(mds.resolveArgs({
        input: path.join(__PATHS_CWD, __PATHS_README),
        output: path.join(__PATHS_CWD, __PATHS_MARKDOWN_PREVIEW),
        layout: path.join(__PATHS_CWD, __PATHS_MARKDOWN_SOURCE)
    }), function() {
        // cleanup README.html
        pump([gulp.src(__PATHS_README_HTML, {
                cwd: __PATHS_MARKDOWN_PREVIEW
            }),
			debug(task.__wadevkit.debug),
            beautify(opts_bt),
            gulp.dest(__PATHS_MARKDOWN_PREVIEW),
            bs.stream()
        ], done);
    });
});
