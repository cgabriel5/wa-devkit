/**
 * Build Modernizr file.
 *
 * Usage
 *
 * $ gulp modernizr # Build modernizr.js. Make changes to ./modernizr.config.json
 */
gulp.task("modernizr", function(done) {
    var modernizr = require("modernizr");

    modernizr.build(config_modernizr, function(build) {
        var file_location = __PATHS_VENDOR_MODERNIZR + __PATHS_MODERNIZR_FILE;
        // create missing folders
        mkdirp(__PATHS_VENDOR_MODERNIZR, function(err) {
            if (err) throw err;
            // save the file to vendor
            fs.writeFile(file_location, build, function() {
                var message = chalk.blue("Modernizr build complete. Placed in");
                var location = chalk.green(file_location);
                log(`${message} ${location}`);
                done();
            });
        });
    });
});
