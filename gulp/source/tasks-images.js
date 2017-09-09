// copy img/ to dist/img/
gulp.task("task-img", function(done) {
    // need to copy hidden files/folders?
    // [https://github.com/klaascuvelier/gulp-copy/issues/5]
    pump([gulp.src("img/**/*"),
        gulp.dest("dist/img/"),
        cache(imagemin([
            imagemin.gifsicle({
                interlaced: true
            }),
            imagemin.jpegtran({
                progressive: true
            }),
            imagemin.optipng({
                optimizationLevel: 5
            }),
            imagemin.svgo({
                plugins: [{
                    removeViewBox: true
                }]
            })
        ])),
        bs.stream()
    ], done);
});
