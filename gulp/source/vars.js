// dynamic configuration files (load via json-file to modify later)
var config_internal = json.read(__PATHS_CONFIG_INTERNAL);

// static configuration files (just need to read file)
var config_settings = jsonc.parse(
	fs.readFileSync(__PATHS_CONFIG_SETTINGS).toString()
);

// get each individually files settings from the consolidated settings file
var config_bundles = config_settings[__PATHS_CONFIG_BUNDLES];
var config_jsbeautify = config_settings[__PATHS_CONFIG_JSBEAUTIFY];
var config_prettier = config_settings[__PATHS_CONFIG_PRETTIER];
var config_perfectionist = config_settings[__PATHS_CONFIG_PERFECTIONIST];
var config_modernizr = config_settings[__PATHS_CONFIG_MODERNIZR];
var config_app = config_settings[__PATHS_CONFIG_APP];

// plugin options
var opts_ap = config_settings[__PATHS_CONFIG_AUTOPREFIXER];
var opts_bs = config_settings[__PATHS_CONFIG_BROWSERSYNC];
var opts_ffp = config_settings[__PATHS_CONFIG_FINDFREEPORT];
var json_format = config_settings[__PATHS_CONFIG_JSON_FORMAT];
var json_spaces = json_format.indent_size;

// bundles
var bundle_html = config_bundles.html;
var bundle_css = config_bundles.css;
var bundle_js = config_bundles.js;
var bundle_img = config_bundles.img;
var bundle_gulp = config_bundles.gulp;
var bundle_dist = config_bundles.dist;
var bundle_lib = config_bundles.lib;

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
