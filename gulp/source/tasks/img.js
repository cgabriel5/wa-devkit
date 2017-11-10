// just trigger a browser-sync stream
// @internal
gulp.task("img:main", function(done) {
	var task = this;
	// need to copy hidden files/folders?
	// [https://github.com/klaascuvelier/gulp-copy/issues/5]
	pump([gulp.src(__paths__.img_source), $.debug(), bs.stream()], done);
});
