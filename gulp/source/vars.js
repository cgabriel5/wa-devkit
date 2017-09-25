// configuration information
var config_user = require(__PATHS_CONFIG_USER);
// internal Gulp configuration file
var config_internal = json.read(__PATHS_CONFIG_INTERNAL);
// -------------------------------------
// plugin options
var opts = config_user.options;
var opts_plugins = opts.plugins;
var opts_bt = opts_plugins.beautify;
var opts_ap = opts_plugins.autoprefixer;
var opts_bs = opts_plugins.browsersync;
var opts_ffp = opts_plugins.find_free_port;
var json_format = opts_plugins.json_format;
var json_spaces = json_format.indent_size;
// -------------------------------------
// config regexp
var regexp = config_user.regexp;
var regexp_html = config_user.regexp.html;
var regexp_css = config_user.regexp.css;
// -------------------------------------
// paths/bundles
var paths = config_user.paths;
var bundles = config_user.bundles;
var bundle_html = bundles.html;
var bundle_css = bundles.css;
var bundle_js = bundles.js;
var bundle_img = bundles.img;
var bundle_gulp = bundles.gulp;
// -------------------------------------
// project utils
var utils = require(__PATHS_GULP_UTILS);
var color = utils.color;
var log = utils.log;
var time = utils.time;
var notify = utils.notify;
var gulp = utils.gulp;
var uri = utils.uri;
var browser = utils.browser;
// -------------------------------------
var APPTYPE = config_user.apptype;
var INDEX = config_user.paths.index;
var BASE = config_user.paths.base;
var ROOTDIR = path.basename(path.resolve(__PATHS_DIRNAME)) + "/";
var APPDIR = BASE + ROOTDIR;
// -------------------------------------
var bs = browser_sync.create(opts_bs.server_name);
// -------------------------------------
var branch_name;
// remove options
var opts = {
    read: false,
    cwd: __PATHS_BASE
};
// -------------------------------------
var html_injection_vars = {
    "css_app_bundle": __PATHS_CSS_BUNDLES + bundle_css.source.name,
    "css_libs_bundle": __PATHS_CSS_BUNDLES + bundle_css.thirdparty.name,
    "js_app_bundle": __PATHS_JS_BUNDLES + bundle_js.source.name,
    "js_libs_bundle": __PATHS_JS_BUNDLES + bundle_js.thirdparty.name
};
