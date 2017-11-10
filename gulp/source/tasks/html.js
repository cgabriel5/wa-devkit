// init HTML files + minify
// @internal
gulp.task("html:main", function(done) {
	var task = this;
	pump(
		[
			gulp.src(bundle_html.source.files, {
				cwd: __paths__.html_source
			}),
			$.debug(),
			$.concat(bundle_html.source.names.main),
			$.injection.pre(html_injection),
			$.prettier(config_prettier),
			$.injection.post(html_injection),
			gulp.dest(__paths__.base),
			$.debug.edit(),
			bs.stream()
		],
		done
	);
});
