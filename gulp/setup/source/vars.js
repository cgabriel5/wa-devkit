// dynamic configuration files (load via json-file to modify later)
var config_internal = json.read(__PATHS_CONFIG_INTERNAL);
var config_pkg = json.read(__PATHS_CONFIG_PKG);
var config_gulp_bundles = json.read(__PATHS_CONFIG_GULP_BUNDLES);

// static configuration files (just need to read file)
var config_gulp_plugins = jsonc.parse(
	fs.readFileSync(__PATHS_CONFIG_GULP_PLUGINS).toString()
);
var config_jsbeautify = jsonc.parse(
	fs.readFileSync(__PATHS_CONFIG_JSBEAUTIFY).toString()
);
var config_app = jsonc.parse(fs.readFileSync(__PATHS_CONFIG_APP).toString());

// plugin options
var json_spaces = config_gulp_plugins.json_format.indent_size;

var questions = require(__PATHS_GULP_SETUP_QUESTIONS).questions;
var templates = require(__PATHS_GULP_SETUP_TEMPLATES).templates;
var jsconfigs = require(__PATHS_GULP_SETUP_JSCONFIGS).jsconfigs;
var utils = require(__PATHS_GULP_UTILS);
var log = utils.log;
var time = utils.time;
var notify = utils.notify;
var gulp = utils.gulp;
var format = utils.format;

var __data__ = {}; // placeholder fillers
var INDEX = config_app.index;

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
