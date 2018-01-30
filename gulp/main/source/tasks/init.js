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
		$internal.set("argv", null);
		$internal.set("title", null);
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
 *
 * @internal - Used with the default task.
 */
gulp.task("init:save-pid", function(done) {
	$internal.set("pid", process.pid); // set the status
	$internal.set("title", process.title);
	$internal.set("argv", process.argv);
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
 *
 * @internal - Used with the default task.
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
					cwd: $paths.basedir,
					dot: true
				},
				function() {
					var brn_current = git.checkSync($paths.dirname).branch;
					if (branch_name) {
						print.gulp(
							chalk.yellow("(pid:" + process.pid + ")"),
							"Gulp monitoring",
							chalk.green(branch_name),
							"branch."
						);
					}
					if (brn_current !== branch_name) {
						// message + exit
						print.gulp(
							"Gulp stopped due to branch switch. (",
							chalk.green(branch_name),
							"=>",
							chalk.yellow(brn_current),
							")"
						);
						print.gulp(
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
 *
 * @internal - Used with the default task.
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
 * Variables are declared outside of tasks to be able to use it in
 *     multiple tasks. The variables are populated in the
 *     default:active-pid-check task and used in the default task.
 */
var __process_exists;
var __process_stopped;

/**
 * Checks for an active Gulp process before making another.
 *
 * @internal - Used with the default task.
 */
gulp.task("default:active-pid-check", function(done) {
	var args = yargs.argv; // Get cli parameters.

	if (args.s || args.stop) {
		// end the running Gulp process

		__process_stopped = true;

		// get pid, if any
		var pid = $internal.get("pid");
		if (pid) {
			// kill the open process
			print.gulp(chalk.green("Gulp process stopped."));
			process.kill(pid);
		} else {
			// no open process exists
			print.gulp("No Gulp process exists.");
		}

		return done();
	}

	// Get pid, if any.
	var pid = $internal.get("pid");
	// If a pid is stored present it means a Gulp instance has
	// already started or the file was not cleared properly. This task
	// will help determine if an active gulp process with the stored
	// pid exists.

	var find = require("find-process");

	// If no stored pid simply continue. No stored pid means there is
	// no active running gulp instance so continue the task normally.
	if (!pid) {
		return done();
	} else {
		// Else if a pid exists determine if its active and a gulp
		// process.

		// Get the process information using the stored pid.
		find("pid", pid).then(
			function(processes) {
				// This module will return an array containing the found
				// process in objects. Because we are supplying it the
				// pid the array will only return 1 object.

				// Get the process.
				var p = processes[0];

				// If no process exists then the process with the stored pid
				// does not exist and the we can proceed to the next task.
				if (!p) {
					return done();
				}

				// The following have to match to make sure the process
				// is legit. If they match then the process exists. This
				// will prevent making other processes.
				// To-Do: Possible make this check better in the future.
				if (
					p.cmd === $internal.get("title") &&
					p.name.toLowerCase() === "gulp"
				) {
					// A process exists.
					__process_exists = p;
				}

				return done();
			},
			function(err) {
				if (err) {
					throw err;
				}
			}
		);
	}
});

/**
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
gulp.task("default", ["default:active-pid-check"], function(done) {
	// Check the default:active-pid-check variables before the actual
	// task code runs.

	// When the --stop flag is provided only do not let the task run.
	if (__process_stopped) {
		return done();
	}

	// Return if a process exists.
	if (__process_exists) {
		print.gulp(
			chalk.yellow(
				"Gulp instance",
				chalk.green("(pid:" + __process_exists.pid + ")"),
				"running. Stop it before starting a new one."
			)
		);
		return done();
	}

	// Actual task starts here.

	var find_free_port = require("find-free-port");

	return find_free_port(
		$configs.findfreeport.range.start,
		$configs.findfreeport.range.end,
		$configs.findfreeport.ip,
		$configs.findfreeport.count,
		function(err, p1, p2) {
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

					// After getting the free ports, finally run the
					// build task.
					return sequence(
						"init:save-pid",
						"init:watch-git-branch",
						"init:build",
						function() {
							// Pretty files before working on them for
							// the first time.
							cmd.get(`${GULPCLI} pretty -q`, function(
								err,
								data
							) {
								if (err) {
									throw err;
								}

								// highlight data string
								print(cli_highlight(data));

								// Finally, watch all files for changes.
								return sequence("watch", function() {
									done();
								});
							});
						}
					);
				},
				null,
				JINDENT
			);
		}
	);
});
