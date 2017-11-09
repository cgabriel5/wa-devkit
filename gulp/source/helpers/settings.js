/**
 * Re-build ./configs/._settings.json.
 *
 * Usage
 *
 * $ gulp settings # Re-build ._settings.json.
 */
gulp.task("settings", function(done) {
	var task = this;

	pump(
		[
			gulp.src(__PATHS_CONFIG_SETTINGS_JSON_FILES, {
				cwd: __PATHS_BASE
			}),
			$.debug(),
			$.jsoncombine(__PATHS_CONFIG_SETTINGS_NAME, function(data, meta) {
				return new Buffer(JSON.stringify(data, null, json_spaces));
			}),
			gulp.dest(__PATHS_CONFIG_HOME),
			$.debug.edit()
		],
		done
	);
});
