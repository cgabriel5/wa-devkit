/*jshint bitwise: false*/
/*jshint browser: false*/
/*jshint esversion: 6 */
/*jshint node: true*/
/*jshint -W014 */
/*jshint -W018 */

"use strict";

// Node modules.
var fs = require("fs");
var path = require("path");

// Lazy load gulp plugins.
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
		uglify: function() {
			// By default es-uglify is used to uglify JS.
			// [https://stackoverflow.com/a/45554108]
			var uglifyjs = require("uglify-es");
			var composer = require("gulp-uglify/composer");
			return composer(uglifyjs, console);
		}
	}
});

// Universal modules.
var pump = require("pump");
var chalk = require("chalk");
var cmd = require("node-cmd");
var json = require("json-file");
var git = require("simple-git")();
var inquirer = require("inquirer");
var jsonc = require("comment-json");
var sequence = require("run-sequence");
var license = require("create-license");
var alphabetize = require("alphabetize-object-keys");

// Project utils.
var utils = require("./gulp/assets/utils/utils.js");
var print = utils.print;
var notify = utils.notify;
var gulp = utils.gulp;
var format = utils.format;
var bangify = utils.bangify;
var globall = utils.globall;
var ext = utils.ext;
var expand_paths = utils.expand_paths;
var opts_sort = utils.opts_sort;
