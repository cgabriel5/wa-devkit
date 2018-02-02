// Create browsersync server.
var bs = browser_sync.create(get($configs, "browsersync.server_name", ""));

// Get current branch name.
var branch_name;

// Remove options.
var opts_remove = {
	read: false,
	cwd: $paths.basedir
};
