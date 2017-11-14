// node modules
var fs = require("fs");
var path = require("path");

// lazy load gulp plugins
var $ = require("gulp-load-plugins")({
	rename: {
		"gulp-if": "gulpif",
		"gulp-markdown": "marked",
		"gulp-purifycss": "purify",
		"gulp-clean-css": "clean_css",
		"gulp-json-sort": "json_sort",
		"gulp-jsbeautifier": "beautify",
		"gulp-minify-html": "minify_html",
		"gulp-prettier-plugin": "prettier",
		"gulp-inject-content": "injection",
		"gulp-real-favicon": "real_favicon",
		"gulp-strip-json-comments": "strip_jsonc"
	},
	postRequireTransforms: {
		json_sort: function(plugin) {
			return plugin.default;
		},
		uglify: function(plugin) {
			// [https://stackoverflow.com/a/45554108]
			// By default es-uglify is used to uglify JS.
			var uglifyjs = require("uglify-es");
			var composer = require("gulp-uglify/composer");
			return composer(uglifyjs, console);
		}
	}
});

// universal modules
var pump = require("pump");
var yargs = require("yargs");
var chalk = require("chalk");
var cmd = require("node-cmd");
var marked = require("marked");
var prism = require("prismjs");
var json = require("json-file");
var git = require("simple-git")();
var inquirer = require("inquirer");
var jsonc = require("comment-json");
var sequence = require("run-sequence");
var license = require("create-license");
var alphabetize = require("alphabetize-object-keys");
