/**
 * Print whether there is an active Gulp instance.
 *
 * Usage
 *
 * $ gulp status # Print Gulp status.
 */
gulp.task("status", function(done) {
    log("Gulp is", ((config_internal.get("pid")) ? "running. " + chalk.yellow(("(pid:" + process.pid + ")")) : "not running."));
    done();
});

/**
 * Print the currently used ports for browser-sync.
 *
 * Usage
 *
 * $ gulp ports # Print uses ports.
 */
gulp.task("ports", function(done) {
    // get the ports
    var ports = config_internal.get("ports");
    // if file is empty
    if (!ports) {
        log(chalk.yellow("No ports are in use."));
        return done();
    }
    // ports exist...
    log(chalk.green("(local)"), ports.local);
    log(chalk.green("(ui)"), ports.ui);
    done();
});
