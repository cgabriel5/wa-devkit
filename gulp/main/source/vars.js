// create browsersync server
var bs = browser_sync.create(get($configs, "browsersync.server_name", ""));

// get current branch name
var branch_name;

// remove options
var opts_remove = {
	read: false,
	cwd: $paths.base
};
