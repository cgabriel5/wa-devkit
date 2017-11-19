/**
 * task: settings
 * Re-build ./configs/._settings.json
 *
 *
 * Usage
 *
 * $ gulp settings # Re-build ._settings.json
 */
gulp.task("settings", function(done) {
	var task = this;

	pump(
		[
			gulp.src($paths.config_settings_json_files, {
				cwd: $paths.base
			}),
			$.debug(),
			$.strip_jsonc(), // remove any json comments
			$.jsoncombine($paths.config_settings_name, function(data, meta) {
				return new Buffer(JSON.stringify(data, null, jindent));
			}),
			gulp.dest($paths.config_home),
			$.debug.edit()
		],
		done
	);
});
