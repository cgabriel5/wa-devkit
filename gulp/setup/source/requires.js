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
		"gulp-prettier-plugin": "prettier",
		"gulp-inject-content": "injection"
	}
});

// Universal modules.
var pump = require("pump");
var chalk = require("chalk");
var cmd = require("node-cmd");
var json = require("json-file");
var inquirer = require("inquirer");
var jsonc = require("comment-json");
var sequence = require("run-sequence");
var license = require("create-license");
var sgit = require("simple-git/promise");
var alphabetize = require("alphabetize-object-keys");

// Project utils.
var utils = require("./gulp/assets/utils/utils.js");
var print = utils.print;
var notify = utils.notify;
var gulp = utils.gulp;
var format = utils.format;
var expand_paths = utils.expand_paths;
var cli_highlight = utils.cli_highlight;
