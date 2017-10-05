// configuration information
var config_user = json.read(__PATHS_CONFIG_USER);
var config_internal = json.read(__PATHS_CONFIG_INTERNAL);
var pkg = json.read(__PATHS_PKG);

// plugin options
var opts = config_user.get("options");
var opts_plugins = opts.plugins;
var opts_bt = opts_plugins.beautify;
var json_format = opts_plugins.json_format;
var json_spaces = json_format.indent_size;

var questions = require(__PATHS_GULP_SETUP_QUESTIONS)
    .questions;
var templates = require(__PATHS_GULP_SETUP_TEMPLATES)
    .templates;
var jsconfigs = require(__PATHS_GULP_SETUP_JSCONFIGS)
    .jsconfigs;
var utils = require(__PATHS_GULP_UTILS);
var log = utils.log;
var time = utils.time;
var notify = utils.notify;
var gulp = utils.gulp;
var format = utils.format;

var APPTYPE; // application-type
var __data__ = {}; // placeholder fillers
var INDEX = config_user.get("paths.index");

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
