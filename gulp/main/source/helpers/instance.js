/**
 * Print whether there is an active Gulp instance.
 *
 * Usage
 *
 * $ gulp status
 *     Print Gulp status.
 */
gulp.task("status", function(done) {
	print.gulp.info(
		INT_PID
			? `Gulp instance running. Process ${chalk.green(INT_PID)}.`
			: "Gulp is not running."
	);
	done();
});

/**
 * Print the currently used ports for browser-sync.
 *
 * Usage
 *
 * $ gulp ports
 *     Print uses ports.
 */
gulp.task("ports", function(done) {
	// if file is empty
	if (!INT_PORTS) {
		print.gulp.info("No ports are in use.");
		return done();
	}

	// ports exist...
	print.gulp.info(
		`Local: ${chalk.green(INT_PORTS.local)}, UI: ${chalk.green(
			INT_PORTS.ui
		)}`
	);
	done();
});
