/**
 * When gulp is closed, either on error, crash, or intentionally, do
 *     a quick cleanup.
 */
var cleanup = require("node-cleanup");
cleanup(function(exit_code, signal) {
	var alphabetize = require("alphabetize-object-keys");

	// check for current Gulp process
	var pid = $internal.get("pid");

	// only perform this cleanup when the Gulp instance is closed.
	// when any other task is run the cleanup should not be done.
	// [https://goo.gl/rJNKNZ]

	if (pid && signal) {
		// Gulp instance exists so cleanup
		// clear gulp internal configuration keys
		$internal.set("pid", null);
		$internal.set("ports", null);
		$internal.data = alphabetize($internal.data);
		$internal.writeSync(null, JINDENT);
		// cleanup vars, process
		branch_name = undefined;
		if (bs) {
			bs.exit();
		}
		if (process) {
			process.exit();
			if (signal) {
				process.kill(pid, signal);
			}
		}
		cleanup.uninstall(); // don't call cleanup handler again
		return false;
	}
});

/**
 * Update the status of gulp to active.
 *
 * Notes
 *
 * • This will write the current gulp
 *     process id to the internal gulp configuration file. this is done
 *     to prevent another Gulp instance from being opened.
 */
gulp.task("init:save-pid", function(done) {
	$internal.set("pid", process.pid); // set the status
	$internal.write(
		function() {
			// save changes to file
			done();
		},
		null,
		JINDENT
	);
});

/**
 * Watch for git branch changes.
 *
 * Notes
 *
 * • Branch name checks are done to check
 *     whether the branch was changed after the gulp command was used.
 *     This is done as when switching branches files and file structure
 *     might be different. this can cause some problems with the watch
 *     tasks and could perform gulp tasks when not necessarily wanted.
 *     To resume gulp simply restart with the gulp command.
 */
gulp.task("init:watch-git-branch", function(done) {
	var git = require("git-state");

	git.isGit($paths.dirname, function(exists) {
		// if no .git exists simply ignore and return done
		if (!exists) {
			return done();
		}
		git.check($paths.dirname, function(err, result) {
			if (err) {
				throw err;
			}
			// record branch name
			branch_name = result.branch;
			// set the gulp watcher as .git exists
			gulp.watch(
				[$paths.githead],
				{
					cwd: $paths.base,
					dot: true
				},
				function() {
					var brn_current = git.checkSync($paths.dirname).branch;
					if (branch_name) {
						log(
							chalk.yellow("(pid:" + process.pid + ")"),
							"Gulp monitoring",
							chalk.green(branch_name),
							"branch."
						);
					}
					if (brn_current !== branch_name) {
						// message + exit
						log(
							"Gulp stopped due to branch switch. (",
							chalk.green(branch_name),
							"=>",
							chalk.yellow(brn_current),
							")"
						);
						log(
							"Restart Gulp to monitor",
							chalk.yellow(brn_current),
							"branch."
						);
						process.exit();
					}
				}
			);
			done();
		});
	});
});

/**
 * Build app files.
 */
gulp.task("init:build", function(done) {
	// cache task
	var task = this;

	// get the gulp build tasks
	var tasks = bundle_gulp.tasks;
	// add callback to the sequence
	tasks.push(function() {
		notify("Build complete");
		done();
	});
	// apply the tasks and callback to sequence
	return sequence.apply(task, tasks);
});

/**
 * task: default
 * Runs Gulp.
 *
 * Notes
 *
 * • This is the default task that will builds project files, watches
 *   files, run browser-sync, etc.
 * • Only one instance can be run at a time.
 *
 * Flags
 *
 * -s, --stop
 *     [boolean] Flag indicating to stop Gulp.
 *
 * Usage
 *
 * $ gulp
 *     Run Gulp.
 *
 * $ gulp --stop
 *     Stops active Gulp process, if running.
 */
gulp.task("default", function(done) {
	var find_free_port = require("find-free-port");

	var args = yargs.argv; // get cli parameters

	if (args.s || args.stop) {
		// end the running Gulp process

		// get pid, if any
		var pid = $internal.get("pid");
		if (pid) {
			// kill the open process
			log(chalk.green("Gulp process stopped."));
			process.kill(pid);
		} else {
			// no open process exists
			log("No Gulp process exists.");
		}

		return done();
	} else {
		// start up Gulp like normal

		return find_free_port(
			$configs.findfreeport.range.start,
			$configs.findfreeport.range.end,
			$configs.findfreeport.ip,
			$configs.findfreeport.count,
			function(err, p1, p2) {
				// get pid, if any
				var pid = $internal.get("pid");
				// if there is a pid present it means a Gulp instance has
				// already started. therefore, prevent another from starting.
				if (pid) {
					log(
						chalk.yellow(
							"A Gulp instance is already running",
							chalk.yellow("(pid:" + pid + ")") + ".",
							"Stop that instance before starting a new one."
						)
					);
					return done();
				}

				// store the ports
				$internal.set("ports", {
					local: p1,
					ui: p2
				});

				// save ports
				$internal.write(
					function() {
						// store ports on the browser-sync object itself
						bs.__ports = [p1, p2]; // [app, ui]
						// after getting the free ports, finally run the
						// build task
						return sequence(
							"init:save-pid",
							"init:watch-git-branch",
							"init:build",
							"watch:main",
							function() {
								done();
							}
						);
					},
					null,
					JINDENT
				);
			}
		);
	}
});
