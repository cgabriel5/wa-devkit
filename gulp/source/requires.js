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
var modify = require("gulp-modify");
var foreach = require("gulp-foreach");
var replace = require("gulp-replace");
var marked = require("gulp-markdown");
var csscomb = require("gulp-csscomb");
var purify = require("gulp-purifycss");
var imagemin = require("gulp-imagemin");
var shorthand = require("gulp-shorthand");
var clean_css = require("gulp-clean-css");
var json_sort = require("gulp-json-sort")
    .default;
var beautify = require("gulp-jsbeautifier");
var minify_html = require("gulp-minify-html");
var injection = require("gulp-inject-content");
var autoprefixer = require("gulp-autoprefixer");
var real_favicon = require("gulp-real-favicon");

// [https://stackoverflow.com/questions/45533101/how-to-use-uglify-es-with-gulp/45554108#45554108]
// By default es-uglify is used to uglify JS. If ES support is not needed,
// simply default back to "gulp-uglify" by commenting and uncommenting the
// following lines.
var uglify = require("gulp-uglify/composer")(require("uglify-es"), console);
// var uglify = require("gulp-uglify");

var del = require("del");
var pump = require("pump");
var glob = require("glob");
var fuzzy = require("fuzzy");
var yargs = require("yargs");
var chalk = require("chalk");
var dir = require("node-dir");
var mkdirp = require("mkdirp");
var git = require("git-state");
var prism = require("prismjs");
var fe = require("file-exists");
var json = require("json-file");
var jsonc = require("comment-json");
var modernizr = require("modernizr");
var de = require("directory-exists");
var cleanup = require("node-cleanup");
var sequence = require("run-sequence");
var browser_sync = require("browser-sync");
var prism_langs = require("prism-languages");
var find_free_port = require("find-free-port");
var alphabetize = require("alphabetize-object-keys");
var bs_autoclose = require("browser-sync-close-hook");
