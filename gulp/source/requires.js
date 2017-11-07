"use strict";

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
        "gulp-real-favicon": "real_favicon"
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
var del = require("del");
var pump = require("pump");
var yargs = require("yargs");
var chalk = require("chalk");
var dir = require("node-dir");
var mkdirp = require("mkdirp");
var fe = require("file-exists");
var json = require("json-file");
var jsonc = require("comment-json");
var de = require("directory-exists");
var sequence = require("run-sequence");
var browser_sync = require("browser-sync");
var bs_autoclose = require("browser-sync-close-hook");
