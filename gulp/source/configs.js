// dynamic configuration files (load via json-file to modify later)
var $internal = json.read($paths.config_internal);

// object will contain the all the config settings
var $configs = {};

// settings config file must exist to populate the configs object
if (fe.sync($paths.config_settings)) {
	// static configuration files (just need to read file)
	var $settings = jsonc.parse(
		fs.readFileSync($paths.config_settings).toString()
	);

	// get individual plugin settings and store in an object
	for (var $config in $paths) {
		// path must match the following pattern to be a config path
		if (
			$paths.hasOwnProperty($config) &&
			/^config_\$[a-z_.]+$/i.test($config)
		) {
			var config_name = $paths[$config];
			// get the config settings and add to the settings object
			$configs[config_name] = $settings[$paths[$config]];
		}
	}
} else {
	// config settings file does not exist so give a message and
	// exit the node process.
	log(
		chalk.yellow("warning"),
		chalk.magenta($paths.config_settings),
		'is missing. Run "$ gulp settings --reconfig" to create the file.'
	);

	// run yargs
	var _args = yargs.argv;
	// get the command line arguments from yargs

	// only continue when the reconfig flag is set. this will let the
	// settings to run.

	if (!_args.reconfig || !-~_args._.indexOf("settings")) {
		process.exit();
	}
}
