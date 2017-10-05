"use strict";

var os = require("os");
var path = require("path");

var path_offset = "../../../";
var modules_path = path_offset + "node_modules/";

var gulp = require(modules_path + "gulp-task-doc");
var notifier = require(modules_path + "node-notifier");
var format_date = require(modules_path + "dateformat");
var gutil = require(modules_path + "gulp-util");
var log = gutil.log;
var chalk = gutil.colors;

/**
 * @description [Detects the default Google Chrome browser based on OS. Falls back to "firefox".]
 * @source [Lifted from https://github.com/stevelacy/gulp-open]
 * @return {String} [The browser name.]
 */
var browser = function() {
    var platform = os.platform();
    // linux (else) darwin (else) windows (else) firefox
    return ((platform === "linux") ? "google-chrome" : (platform === "darwin" ? "google chrome" : (platform === "win32" ? "chrome" : "firefox")));
};

/**
 * @description [Creates a Gulp like time formated, colored string.]
 * @return {String} [The time formated, colored, Gulp like string.]
 */
var time = function() {
    // return the formated/colored time
    return "[" + chalk.gray(format_date(new Date(), "HH:MM:ss")) + "]";
};

/**
 * @description [Creates an OS notifcation.]
 * @param  {String} message [The notifcation message to display.]
 * @param  {Boolean} error   [Flag indicating what image to use.]
 * @return {Undefined} [Nothing is returned.]
 */
var notify = function(message, error) {
    // determine what image to show
    var image = (!error ? "success" : "error") + "_256.png";
    // OS agnostic
    notifier.notify({
        title: "Gulp",
        message: message,
        icon: path.join(__dirname, "../img/node-notifier/" + image),
        sound: true
    });
};

/**
 * @description [Modifies Gulp by adding a currentTask.name property. To access in a task.]
 * @param  {Object} gulp [Gulp itself.]
 * @return {Object}      [Modified Gulp.]
 */
var current_task = function(gulp) {
    // Get the current task name inside task itself
    // [http://stackoverflow.com/a/27535245]
    gulp.Gulp.prototype.__runTask = gulp.Gulp.prototype._runTask;
    gulp.Gulp.prototype._runTask = function(task) {
        this.__wadevkit = {
            "debug": {
                "suffix": chalk.yellow("✎"),
                "names": {
                    "full": task.name,
                    "short": task.name.replace(/^(helper|task)\-/, "")
                }
            }
        };
        this.__runTask(task);
    };
    return gulp;
};

/**
 * @description [Builds the project localhost URL.]
 * @param  {Object} params 	   [The parameters used to build the URL.]
 * @return {String}       	   [The URL.]
 */
var uri = function(params) {
    var appdir = params.appdir;
    var filepath = params.filepath;
    var port = params.port;
    var https = params.https;
    return ("http" + (https ? "s" : "")) + "://" + appdir + filepath + (port ? (":" + port) : "");
};

/**
 * @description [Formats template with provided data object.]
 * @param  {String} template [The template to use.]
 * @param  {Object} data     [The object containing the data to replace placeholders with.]
 * @return {Undefined}  [Nothing is returned.]
 */
function format(template, data) {
    return template.replace(/\{\{\#(.*?)\}\}/g, function(match) {
        match = match.replace(/^\{\{\#|\}\}$/g, "");
        return data[match] ? data[match] : match;
    });
}

/**
 * @description [Stream pipe error handler.]
 * @return {Undefined}       [Nothing is returned.]
 */
// var pipe_error = function() {
//     notify("Error with `" + this.currentTask.name + "` task.", true);
//     this.emit("end");
// };

/**
 * @description [Custom Gulp pipe error wrapper for pipe_error function.]
 * @param  {Object} error [Gulp task object.]
 * @return {Function}       [Returns new pipe_error function with property thsis bound to it.]
 */
// var error = function(task) {
//     return pipe_error.bind(task);
// };

// export functions
exports.browser = browser();
exports.time = time;
exports.log = log;
exports.notify = notify;
exports.gulp = current_task(gulp);
exports.uri = uri;
// exports.error = error;
exports.format = format;
