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
var APPDIR = path.join($app.base, $paths.rootdir);

// line ending information
var EOL = $app.eol;
var EOL_ENDING = EOL.ending;
// var EOL_STYLE = EOL.style;

// internal information
var APPTYPE = $internal.get("apptype");

// create browsersync server
var bs = browser_sync.create($browsersync.server_name);

// get current branch name
var branch_name;

// remove options
var opts_remove = {
	read: false,
	cwd: $paths.base
};
