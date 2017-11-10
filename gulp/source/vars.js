// dynamic configuration files (load via json-file to modify later)
var config_internal = json.read(__paths__.config_internal);

// static configuration files (just need to read file)
var config_settings = jsonc.parse(
	fs.readFileSync(__paths__.config_settings).toString()
);

// get each individually files settings from the consolidated settings file
var config_bundles = config_settings[__paths__.config_bundles];
var config_jsbeautify = config_settings[__paths__.config_jsbeautify];
var config_prettier = config_settings[__paths__.config_prettier];
var config_perfectionist = config_settings[__paths__.config_perfectionist];
var config_modernizr = config_settings[__paths__.config_modernizr];
var config_app = config_settings[__paths__.config_app];

// plugin options
var opts_ap = config_settings[__paths__.config_autoprefixer];
var opts_bs = config_settings[__paths__.config_browsersync];
var opts_ffp = config_settings[__paths__.config_findfreeport];
var json_format = config_settings[__paths__.config_json_format];
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
var ROOTDIR = path.basename(path.resolve(__paths__.dirname)) + "/";
var APPDIR = BASE + ROOTDIR;

// internal information
var APPTYPE = config_internal.get("apptype");

// project utils
var utils = require(__paths__.gulp_utils);
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
	cwd: __paths__.base
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
