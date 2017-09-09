// markdown to html (with github style/layout)
gulp.task("task-readme", function(done) {
    mds.render(mds.resolveArgs({
        input: path.normalize(process.cwd() + "/README.md"),
        output: path.normalize(process.cwd() + "/markdown/preview"),
        layout: path.normalize(process.cwd() + "/markdown/source")
    }), function() {
        // cleanup README.html
        pump([gulp.src("README.html", {
                cwd: "markdown/preview/"
            }),
            beautify(beautify_options),
            gulp.dest("./markdown/preview/"),
            bs.stream()
        ], done);
    });
});
