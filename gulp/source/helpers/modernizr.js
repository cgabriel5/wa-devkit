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
		var file_location =
			__paths__.vendor_modernizr + __paths__.modernizr_file;
		// create missing folders
		mkdirp(__paths__.vendor_modernizr, function(err) {
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
