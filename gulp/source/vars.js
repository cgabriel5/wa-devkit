// get JSON indentation size
var jindent = $json_format.indent_size;

// bundles
var bundle_html = $bundles.html;
var bundle_css = $bundles.css;
var bundle_js = $bundles.js;
// var bundle_img = $bundles.img;
var bundle_gulp = $bundles.gulp;
var bundle_dist = $bundles.dist;
var bundle_lib = $bundles.lib;

// app directory information
var INDEX = $app.index;
var BASE = $app.base;
var ROOTDIR = path.basename(path.resolve($paths.dirname)) + "/";
var APPDIR = BASE + ROOTDIR;

// internal information
var APPTYPE = $internal.get("apptype");

// project utils
var utils = require($paths.gulp_utils);
var log = utils.log;
var notify = utils.notify;
var gulp = utils.gulp;
var uri = utils.uri;
var browser = utils.browser;

// create browsersync server
var bs = browser_sync.create($browsersync.server_name);

// get current branch name
var branch_name;

// remove options
var opts_remove = {
	read: false,
	cwd: $paths.base
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
