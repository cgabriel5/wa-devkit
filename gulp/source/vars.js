var config = require("./gulp/config.json");
// internal Gulp config file
var __config__ = json.read("./gulp/.gulpconfig.json");
var paths = config.paths;
var options = config.options;
var beautify_options = options.beautify;
var autoprefixer_options = options.autoprefixer;
var regexp = config.regexp;
var __type__ = config.__type__;
var __path__ = __dirname;
var branch_name;
// -------------------------------------
var utils = require("./gulp/utils.js");
var log = utils.log;
var time = utils.time;
var notify = utils.notify;
var gulp = utils.gulp;
var uri = utils.uri;
var browser = utils.browser;
// -------------------------------------
var bs = browser_sync.create("localhost");
// remove options
var opts = {
    read: false,
    cwd: "./"
};
