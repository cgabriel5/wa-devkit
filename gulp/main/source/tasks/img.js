/**
 * Just trigger a browser-sync stream.
 */
gulp.task("img:main", function(done) {
	// need to copy hidden files/folders?
	// [https://github.com/klaascuvelier/gulp-copy/issues/5]
	pump([gulp.src($paths.img_source), $.debug(), bs.stream()], done);
});
