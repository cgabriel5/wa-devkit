// get all needed configuration values

// bundles
var bundle_html = get($configs, "bundles.html", "");
var bundle_css = get($configs, "bundles.css", "");
var bundle_js = get($configs, "bundles.js", "");
// var bundle_img = get($configs, "bundles.img", "");
var bundle_gulp = get($configs, "bundles.gulp", "");
var bundle_dist = get($configs, "bundles.dist", "");
var bundle_lib = get($configs, "bundles.lib", "");

// app config information

// app directory information
var INDEX = get($configs, "app.index", "");
var APPDIR = path.join(get($configs, "app.base", ""), $paths.rootdir);

// app line ending information
var EOL = get($configs, "app.eol", "");
var EOL_ENDING = get(EOL, "ending", "");
// var EOL_STYLE = EOL.style;

// use https or not?
var HTTPS = get($configs, "app.https", false);

// app JSON indentation
var JINDENT = get($configs, "app.indent_char", "\t");

// plugin configs
var PRETTIER = get($configs, "prettier", {});
var JSBEAUTIFY = get($configs, "jsbeautify", {});
var AUTOPREFIXER = get($configs, "autoprefixer", {});
var PERFECTIONIST = get($configs, "perfectionist", {});

// internal information
var APPTYPE = $internal.get("apptype");

// get the current Gulp file name
var GULPFILE = path.basename($paths.filename);
var GULPCLI = `gulp --gulpfile ${GULPFILE}`;
