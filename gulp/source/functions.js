/**
 * @description [Opens the provided file in the user's browser.]
 * @param  {String}   file     [The file to open.]
 * @param  {Number}   port     [The port to open on.]
 * @param  {Function} callback [The Gulp task callback to run.]
 * @return {Undefined}         [Nothing is returned.]
 */
function open_file_in_browser(file, port, callback) {
    pump([gulp.src(file, {
            cwd: BASE,
            dot: true
        }),
        open({
            app: browser,
            uri: uri(file, port)
        })
    ], function() {
        notify("File opened!");
        callback();
    });
};
