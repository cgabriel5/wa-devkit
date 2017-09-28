// just trigger a browser-sync stream
gulp.task("task-img", function(done) {
    var task = this;
    // need to copy hidden files/folders?
    // [https://github.com/klaascuvelier/gulp-copy/issues/5]
    pump([gulp.src(__PATHS_IMG_SOURCE),
    	debug(task._wa_devkit.debug_off),
    	size(task._wa_devkit.size),
        bs.stream()
    ], done);
});
