/**
 * Print whether there is an active Gulp instance.
 *
 * Usage
 *
 * $ gulp status
 *     Print Gulp status.
 */
gulp.task("status", function(done) {
	print.gulp(
		INT_PID
			? "Gulp is running. " + chalk.green(`(pid: ${pid})`)
			: chalk.yellow("Gulp is not running.")
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
		print.gulp(chalk.yellow("No ports are in use."));
		return done();
	}
	// ports exist...
	print.gulp(
		chalk.green("(local, ui)"),
		chalk.magenta("(" + INT_PORTS.local + ", " + INT_PORTS.ui + ")")
	);
	done();
});
