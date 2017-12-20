/**
 * Build ./configs/.__settings.json
 *
 * Flags
 *
 * --reconfig
 *     [boolean] Flag is used to rebuild the combined config file
 *     when it was deleted for example. The gulpfile needs this
 *     file and this will force its re-build when it gets deleted
 *     for whatever reason.
 *
 * Usage
 *
 * $ gulp settings # Re-build the settings file.
 * $ gulp settings --reconfig # Force settings file re-build when
 *     the file gets deleted for whatever reason.
 */
gulp.task("settings", function(done) {
	pump(
		[
			gulp.src($paths.config_settings_json_files, {
				cwd: $paths.base
			}),
			$.debug(),
			$.strip_jsonc(), // remove any json comments
			$.jsoncombine($paths.config_settings_name, function(data) {
				return new Buffer(JSON.stringify(data, null, jindent));
			}),
			gulp.dest($paths.config_home),
			$.debug.edit()
		],
		done
	);
});
