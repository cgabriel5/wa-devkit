// configuration information
var config = require("./gulp/config.json");
// internal Gulp configuration file
var gulpconfig = json.read("./gulp/.gulpconfig.json");
// -------------------------------------
// paths/bundles
var paths = config.paths;
var bundles = paths.bundles;
var bundle_html = bundles.html;
var bundle_css = bundles.css;
var bundle_js = bundles.js;
var bundle_gulp = bundles.gulp;
// gulp core/tasks/paths
var gulp_core = bundle_gulp.core;
var gulp_tasks = bundle_gulp.tasks;
var gulp_watch = bundle_gulp.watch;
// -------------------------------------
// plugin options
var options = config.options;
var plugin_options = options.plugins;
var options_beautify = plugin_options.beautify;
var options_autoprefixer = plugin_options.autoprefixer;
// -------------------------------------
// config regexp
var regexp = config.regexp;
var regexp_html = config.regexp.html;
var regexp_css = config.regexp.css;
// -------------------------------------
// project utils
var utils = require("./gulp/utils.js");
var log = utils.log;
var time = utils.time;
var notify = utils.notify;
var gulp = utils.gulp;
var uri = utils.uri;
var browser = utils.browser;
// -------------------------------------
var APPTYPE = config.apptype;
var PATH = __dirname;
var INDEX = config.index;
var BASE = "./";
// -------------------------------------
var bs = browser_sync.create("localhost");
// -------------------------------------
var branch_name;
// remove options
var opts = {
    read: false,
    cwd: BASE
};
