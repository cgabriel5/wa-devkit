/**
 * Build Modernizr file.
 *
 * Usage
 *
 * $ gulp modernizr
 *     Build modernizr.js. (uses ./modernizr.config.json)
 */
gulp.task("modernizr", function(done) {
	var modernizr = require("modernizr");

	modernizr.build($configs.modernizr, function(build) {
		var file_location =
			$paths.vendor_modernizr + $paths.modernizr_file_name;
		// create missing folders
		mkdirp($paths.vendor_modernizr, function(err) {
			if (err) {
				throw err;
			}
			// save the file to vendor
			fs.writeFile(file_location, build + EOL_ENDING, function() {
				// the following gulp code is really only needed to log the
				// file.
				pump(
					[
						gulp.src(file_location, {
							cwd: $paths.basedir
						}),
						$.debug.edit()
					],
					done
				);
			});
		});
	});
});
