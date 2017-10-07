"use strict";

var fs = require("fs");
var path = require("path");

var eol = require("gulp-eol");
var open = require("gulp-open");
var gulpif = require("gulp-if");
var fail = require("gulp-fail");
var sort = require("gulp-sort");
var debug = require("gulp-debug");
var clean = require("gulp-clean");
var cache = require("gulp-cache");
var order = require("gulp-order");
var insert = require("gulp-insert");
var concat = require("gulp-concat");
var rename = require("gulp-rename");
var filter = require("gulp-filter");
var foreach = require("gulp-foreach");
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

// @non_es_uglify
// By default the non es-uglify is used as the default uglifier.
// Remove this comment block, following two require lines, and
// uncomment the @uglify_es comment block to use uglify-es instead.
var uglify = require("gulp-uglify");
var beautify = require("gulp-jsbeautifier");

// @uglify_es
// var composer = require("gulp-uglify/composer");
// var uglify = composer(require("uglify-es"), console);
// var beautify = require("gulp-jsbeautifier");

var del = require("del");
var pump = require("pump");
var glob = require("glob");
var fuzzy = require("fuzzy");
var yargs = require("yargs");
var chalk = require("chalk");
var dir = require("node-dir");
var mkdirp = require("mkdirp");
var git = require("git-state");
var fe = require("file-exists");
var json = require("json-file");
var jsonc = require("comment-json");
var modernizr = require("modernizr");
var de = require("directory-exists");
var mds = require("markdown-styles");
var cleanup = require("node-cleanup");
var sequence = require("run-sequence");
var browser_sync = require("browser-sync");
var find_free_port = require("find-free-port");
var bs_autoclose = require("browser-sync-close-hook");
