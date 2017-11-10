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
			gulp.src(__paths__.config_settings_json_files, {
				cwd: __paths__.base
			}),
			$.debug(),
			$.jsoncombine(__paths__.config_settings_name, function(data, meta) {
				return new Buffer(JSON.stringify(data, null, json_spaces));
			}),
			gulp.dest(__paths__.config_home),
			$.debug.edit()
		],
		done
	);
});
