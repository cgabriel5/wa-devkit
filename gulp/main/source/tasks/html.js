/**
 * Init HTML files + minify.
 */
gulp.task("html:main", function(done) {
	pump(
		[
			gulp.src(bundle_html.source.files, {
				cwd: $paths.html_source
			}),
			$.debug(),
			$.concat(bundle_html.source.names.main),
			$.injection.pre({ replacements: html_injection }),
			$.beautify(JSBEAUTIFY),
			$.injection.post({ replacements: html_injection }),
			gulp.dest($paths.base),
			$.debug.edit(),
			bs.stream()
		],
		done
	);
});
