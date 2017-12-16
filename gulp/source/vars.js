// get JSON indentation size
var jindent = get($configs, "json_format.indent_size", "\t");

// bundles
var bundle_html = get($configs, "bundles.html", "");
var bundle_css = get($configs, "bundles.css", "");
var bundle_js = get($configs, "bundles.js", "");
// var bundle_img = get($configs, "bundles.img", "");
var bundle_gulp = get($configs, "bundles.gulp", "");
var bundle_dist = get($configs, "bundles.dist", "");
var bundle_lib = get($configs, "bundles.lib", "");

// app directory information
var INDEX = get($configs, "app.index", "");
var APPDIR = path.join(get($configs, "app.base", ""), $paths.rootdir);

// line ending information
var EOL = get($configs, "app.eol", "");
var EOL_ENDING = get(EOL, "ending", "");
// var EOL_STYLE = EOL.style;

// internal information
var APPTYPE = $internal.get("apptype");

// get the current Gulp file name
var GULPFILE = path.basename(__filename);

// create browsersync server
var bs = browser_sync.create(get($configs, "browsersync.server_name", ""));

// get current branch name
var branch_name;

// remove options
var opts_remove = {
	read: false,
	cwd: $paths.base
};
