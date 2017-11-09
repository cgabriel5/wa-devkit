// dynamic configuration files (load via json-file to modify later)
var config_internal = json.read(__PATHS_CONFIG_INTERNAL);

// static configuration files (just need to read file)
var config_gulp_bundles = jsonc.parse(
	fs.readFileSync(__PATHS_CONFIG_GULP_BUNDLES).toString()
);
var config_gulp_plugins = jsonc.parse(
	fs.readFileSync(__PATHS_CONFIG_GULP_PLUGINS).toString()
);
var config_jsbeautify = jsonc.parse(
	fs.readFileSync(__PATHS_CONFIG_JSBEAUTIFY).toString()
);
var config_prettier = jsonc.parse(
	fs.readFileSync(__PATHS_CONFIG_PRETTIER).toString()
);
var config_perfectionist = jsonc.parse(
	fs.readFileSync(__PATHS_CONFIG_PERFECTIONIST).toString()
);
var config_modernizr = jsonc.parse(
	fs.readFileSync(__PATHS_CONFIG_MODERNIZR).toString()
);
var config_app = jsonc.parse(fs.readFileSync(__PATHS_CONFIG_APP).toString());

// plugin options
var opts_ap = config_gulp_plugins.autoprefixer;
var opts_bs = config_gulp_plugins.browsersync;
var opts_ffp = config_gulp_plugins.find_free_port;
var json_format = config_gulp_plugins.json_format;
var json_spaces = json_format.indent_size;

// bundles
var bundle_html = config_gulp_bundles.html;
var bundle_css = config_gulp_bundles.css;
var bundle_js = config_gulp_bundles.js;
var bundle_img = config_gulp_bundles.img;
var bundle_gulp = config_gulp_bundles.gulp;
var bundle_dist = config_gulp_bundles.dist;
var bundle_lib = config_gulp_bundles.lib;

// app directory information
var INDEX = config_app.index;
var BASE = config_app.base;
var ROOTDIR = path.basename(path.resolve(__PATHS_DIRNAME)) + "/";
var APPDIR = BASE + ROOTDIR;

// internal information
var APPTYPE = config_internal.get("apptype");

// project utils
var utils = require(__PATHS_GULP_UTILS);
var color = utils.color;
var log = utils.log;
var time = utils.time;
var notify = utils.notify;
var gulp = utils.gulp;
var uri = utils.uri;
var browser = utils.browser;

// create browsersync server
var bs = browser_sync.create(opts_bs.server_name);

// get current branch name
var branch_name;

// remove options
var opts_remove = {
	read: false,
	cwd: __PATHS_BASE
};

// gulp-sort custom sort function
var opts_sort = {
	// sort based on dirname alphabetically
	comparator: function(file1, file2) {
		var dir1 = path.dirname(file1.path);
		var dir2 = path.dirname(file2.path);
		if (dir1 > dir2) return 1;
		if (dir1 < dir2) return -1;
		return 0;
	}
};
