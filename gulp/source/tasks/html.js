// init HTML files + minify
// @internal
gulp.task("html:main", function(done) {
	var task = this;
	pump(
		[
			gulp.src(bundle_html.source.files, {
				cwd: __PATHS_HTML_SOURCE
			}),
			$.debug(),
			$.concat(bundle_html.source.names.main),
			$.injection.pre(html_injection),
			$.prettier(config_prettier),
			$.injection.post(html_injection),
			gulp.dest(__PATHS_BASE),
			$.debug.edit(),
			bs.stream()
		],
		done
	);
});
