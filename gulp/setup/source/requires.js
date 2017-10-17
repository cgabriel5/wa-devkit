"use strict";

var fs = require("fs");
var path = require("path");

var pump = require("pump");
var chalk = require("chalk");
var prompt = require("prompt");
var marked = require("marked");
var prism = require("prismjs");
var json = require("json-file");
var git = require("simple-git")();
var jsonc = require("comment-json");
var sequence = require("run-sequence");
var alphabetize = require("alphabetize-object-keys");

var eol = require("gulp-eol");
var sort = require("gulp-sort");
var gulpif = require("gulp-if");
var debug = require("gulp-debug");
var clean = require("gulp-clean");
var modify = require("gulp-modify");
var insert = require("gulp-insert");
var concat = require("gulp-concat");
var rename = require("gulp-rename");
var foreach = require("gulp-foreach");
var json_sort = require("gulp-json-sort")
    .default;
var beautify = require("gulp-jsbeautifier");
var injection = require("gulp-inject-content");

// @non_es_uglify
// By default the non es-uglify is used as the default uglifier.
// Uncomment the @uglify_es comment block to use uglify-es instead.
var uglify = require("gulp-uglify");

// // @uglify_es
// var composer = require("gulp-uglify/composer");
// var uglify = composer(require("uglify-es"), console);
