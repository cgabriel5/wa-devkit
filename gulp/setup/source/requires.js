"use strict";
// -------------------------------------
var path = require("path");
// -------------------------------------
var pump = require("pump");
var chalk = require("chalk");
var prompt = require("prompt");
var json = require("json-file");
var git = require("simple-git")();
var mds = require("markdown-styles");
var sequence = require("run-sequence");
var alphabetize = require("alphabetize-object-keys");
// -------------------------------------
var eol = require("gulp-eol");
var sort = require("gulp-sort");
var gulpif = require("gulp-if");
var debug = require("gulp-debug");
var clean = require("gulp-clean");
var insert = require("gulp-insert");
var concat = require("gulp-concat");
var rename = require("gulp-rename");
var foreach = require("gulp-foreach");
var replace = require("gulp-replace");
var json_sort = require("gulp-json-sort")
    .default;
// -------------------------------------
var uglify = require("gulp-uglify");
var beautify = require("gulp-jsbeautifier");
