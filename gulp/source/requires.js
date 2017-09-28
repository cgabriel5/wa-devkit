"use strict";
// -------------------------------------
var fs = require("fs");
var path = require("path");
// -------------------------------------
var eol = require("gulp-eol");
var open = require("gulp-open");
var gulpif = require("gulp-if");
var fail = require("gulp-fail");
var sort = require("gulp-sort");
var size = require("gulp-size");
var clean = require("gulp-clean");
var cache = require("gulp-cache");
var print = require("gulp-print");
var order = require("gulp-order");
var debug = require("gulp-debug");
var insert = require("gulp-insert");
var concat = require("gulp-concat");
var rename = require("gulp-rename");
var filter = require("gulp-filter");
var replace = require("gulp-replace");
var purify = require("gulp-purifycss");
var imagemin = require("gulp-imagemin");
var shorthand = require("gulp-shorthand");
var clean_css = require("gulp-clean-css");
var json_sort = require("gulp-json-sort")
    .default;
var minify_html = require("gulp-minify-html");
var autoprefixer = require("gulp-autoprefixer");
var real_favicon = require("gulp-real-favicon");
var alphabetize = require("alphabetize-object-keys");
// -------------------------------------
// // Non es-uglify
// Remove the following two lines and uncomment the
// following lines if uglify-es is needed.
var uglify = require("gulp-uglify");
var beautify = require("gulp-jsbeautifier");
// -------------------------------------
// // Uncomment for uglify-es
// var composer = require("gulp-uglify/composer");
// var uglify = composer(require("uglify-es"), console);
// var beautify = require("gulp-jsbeautifier");
// -------------------------------------
var del = require("del");
var pump = require("pump");
var glob = require("glob");
var args = require("yargs");
var git = require("git-state");
var fe = require("file-exists");
var json = require("json-file");
var mds = require("markdown-styles");
var cleanup = require("node-cleanup");
var sequence = require("run-sequence");
var browser_sync = require("browser-sync");
var find_free_port = require("find-free-port");
var bs_autoclose = require("browser-sync-close-hook");
