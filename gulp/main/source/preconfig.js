// Dynamic configuration files (load via json-file to modify later).
var $internal = json.read($paths.config_internal);

// Object will contain all the configuration settings.
var $configs = {};

// Settings configuration file must exist to populate the configs object.
if (fe.sync($paths.config_settings)) {
	// Static configuration files (just need to read file).
	var $settings = jsonc.parse(
		fs.readFileSync($paths.config_settings).toString()
	);

	// Get individual plugin settings and store in an object.
	for (var $config in $paths) {
		// configuration files must match this pattern.
		var config_file_pattern = /^config_\$[a-z_.]+$/i.test($config);

		// Path must match the following pattern to be a config path.
		if ($paths.hasOwnProperty($config) && config_file_pattern) {
			// Remove any file name sub-extensions. For example,
			// turn "csslint.cm" to "csslint".
			var config_name = $paths[$config].split(".")[0];

			// Get the config settings and add to the settings object.
			$configs[config_name] = $settings[$paths[$config]];
		}
	}
} else {
	// Run yargs.
	var _args = yargs.argv;

	// Note: When the settings file is missing this error message will get
	// shown. Follow the rebuild command and the file will get rebuilt. The
	// code is only allowed to run when the rebuild flag is set.

	if (!_args.rebuild || !-~_args._.indexOf("settings")) {
		// Settings file does not exist so give a message and exit process.
		print.gulp.error(
			chalk.magenta($paths.config_settings),
			"is missing (settings file)."
		);
		print.gulp.info(
			"Rebuild file by running:",
			"$ gulp settings --rebuild"
		);

		process.exit();
	}
}
