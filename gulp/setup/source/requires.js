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

var uglify = require("gulp-uglify");
var beautify = require("gulp-jsbeautifier");
var injection = require("gulp-inject-content");
