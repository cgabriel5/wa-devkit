/**
 * task: status
 * Print whether there is an active Gulp instance.
 *
 *
 * Usage
 *
 * $ gulp status
 *     Print Gulp status.
 */
gulp.task("status", function(done) {
	var pid = $internal.get("pid");
	log(
		pid
			? "Gulp is running. " + chalk.green(`(pid: ${pid})`)
			: chalk.yellow("Gulp is not running.")
	);
	done();
});

/**
 * task: ports
 * Print the currently used ports for browser-sync.
 *
 *
 * Usage
 *
 * $ gulp ports
 *     Print uses ports.
 */
gulp.task("ports", function(done) {
	// get the ports
	var ports = $internal.get("ports");
	// if file is empty
	if (!ports) {
		log(chalk.yellow("No ports are in use."));
		return done();
	}
	// ports exist...
	log(
		chalk.green("(local, ui)"),
		chalk.magenta("(" + ports.local + ", " + ports.ui + ")")
	);
	done();
});
