// Get all needed configuration values.

// Bundles.
var bundle_html = get($configs, "bundles.html", "");
var bundle_css = get($configs, "bundles.css", "");
var bundle_js = get($configs, "bundles.js", "");
// var bundle_img = get($configs, "bundles.img", "");
var bundle_gulp = get($configs, "bundles.gulp", "");
var bundle_dist = get($configs, "bundles.dist", "");
var bundle_lib = get($configs, "bundles.lib", "");

// App configuration information.

// App directory information.
var INDEX = get($configs, "app.index", "");
var APPDIR = path.join(get($configs, "app.base", ""), $paths.rootdir);

// App line ending information.
var EOL = get($configs, "app.eol", "");
var EOL_ENDING = get(EOL, "ending", "");
// var EOL_STYLE = EOL.style;

// Use https or not.
var HTTPS = get($configs, "app.https", false);

// App JSON indentation.
var JINDENT = get($configs, "app.indent_char", "\t");

// Plugin configurations.
var PRETTIER = get($configs, "prettier", {});
var JSBEAUTIFY = get($configs, "jsbeautify", {});
var AUTOPREFIXER = get($configs, "autoprefixer", {});
var PERFECTIONIST = get($configs, "perfectionist", {});

// Internal information.
var INT_APPTYPE = get($internal.data, "apptype", "");
var INT_PROCESS = get($internal.data, "process", "");
var INT_PID = get(INT_PROCESS, "pid", "");
var INT_TITLE = get(INT_PROCESS, "title", "");
var INT_PORTS = get(INT_PROCESS, "ports", "");

// Get the current Gulp file name.
var GULPFILE = path.basename($paths.filename);
var GULPCLI = `gulp --gulpfile ${GULPFILE}`;
