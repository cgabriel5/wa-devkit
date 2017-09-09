var path = require("path");
var fs = require("fs");
// -------------------------------------
var autoprefixer = require("gulp-autoprefixer");
var clean = require("gulp-clean");
var purify = require("gulp-purifycss");
var rename = require("gulp-rename");
var replace = require("gulp-replace");
var shorthand = require("gulp-shorthand");
var concat = require("gulp-concat");
var minify_html = require("gulp-minify-html");
var clean_css = require("gulp-clean-css");
var open = require("gulp-open");
var imagemin = require("gulp-imagemin");
var cache = require("gulp-cache");
var insert = require("gulp-insert");
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
var json = require("json-file");
var del = require("del");
var fe = require("file-exists");
var browser_sync = require("browser-sync");
var bs_autoclose = require("browser-sync-close-hook");
var cleanup = require("node-cleanup");
var git = require("git-state");
var find_free_port = require("find-free-port");
var gulpif = require("gulp-if");
var print = require("gulp-print");
var mds = require("markdown-styles");
var sequence = require("run-sequence");
var pump = require("pump");
var args = require("yargs");
