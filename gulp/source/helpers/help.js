/**
 * task: help
 * Provides Gulp task documentation (this documentation).
 *
 *
 * Notes
 *
 * • Help documentation will always show even when verbose flag
 *   is not provided.
 *
 * Flags
 *
 * --verbose
 *     [boolean] Shows all documentation.
 *
 * -f, --filter
 *     [string] Names of tasks to show documentation for.
 *
 * Usage
 *
 * $ gulp help
 *     Show a list of tasks and their short descriptions.
 *
 * $ gulp help --verbose
 *     Show full documentation (flags, usage, notes...).
 *
 * $ gulp help --filter "open default dependency"
 *     Show documentation for specific tasks.
 */
gulp.task("help", function(done) {
	// run yargs
	var _args = yargs
		.option("verbose", {
			alias: "v",
			type: "boolean"
		})
		.option("filter", {
			alias: "f",
			type: "string"
		}).argv;
	var verbose = _args.v || _args.verbose;
	var filter = _args.f || _args.filter;

	// get the gulpfile.js content
	var content = "";
	pump(
		[
			gulp.src("gulpfile.main.js", {
				cwd: $paths.base
			}),
			$.fn(function(file) {
				content = file.contents.toString();
			})
		],
		function() {
			// get all the docblocks from the file
			var blocks = content.match(/^\/\*\*[\s\S]*?\*\/$/gm);

			var newline = "\n";
			var headers = ["Flags", "Usage", "Notes"];

			// [https://stackoverflow.com/a/9175783]
			// sort alphabetically fallback to a length
			var cmp = function(a, b) {
				if (a > b) {
					return +1;
				}
				if (a < b) {
					return -1;
				}
				return 0;
			};

			var replacer = function(match) {
				return chalk.cyan(match);
			};

			var remove_comment_syntax = function(string) {
				return string
					.replace(/(^\/\*\*)|( \*\/$)|( \* ?)/gm, "")
					.trim();
			};

			var get_task_name = function(string) {
				return (string.match(/\* task\: ([a-z]+)$/m) || "")[1];
			};

			console.log(newline);
			console.log(chalk.bold("Tasks"));
			console.log(newline);

			var tasks = {};
			var names = [];
			var lengths = [];

			// loop over every match get needed data
			blocks.forEach(function(block) {
				// get task name
				var name = get_task_name(block);

				// skip if no name is found
				if (!name) {
					return;
				}

				// reset name
				block = block.replace(
					new RegExp("task: " + name + "$", "m"),
					""
				);

				// remove doc comment syntax
				block = remove_comment_syntax(block);

				// get the description
				var desc = block.substring(0, block.indexOf("\n\n"));

				tasks[name] = { text: block, desc: desc };
				if (name !== "help") {
					names.push(name);
				}
				lengths.push(name.length);
			});

			// sort the array names
			names.sort(function(a, b) {
				return cmp(a, b) || cmp(a.length, b.length);
			});

			// get the task max length
			var max_length = Math.max.apply(null, lengths);

			// filter if flag present
			if (filter) {
				filter = filter.split(" ");
				names = names.filter(function(name) {
					return -~filter.indexOf(name);
				});
			}

			// add the help task to the front of the array
			names.unshift("help");

			// loop over to print this time
			names.forEach(function(name) {
				// get the block
				var task = tasks[name];
				var block = task.text;
				var desc = task.desc;

				// loop over lines
				if (verbose || name === "help") {
					// bold the tasks
					block = block.replace(/\s\-\-?[a-z-]+/g, replacer);

					// print the task name
					console.log("   " + chalk.cyan(name));

					var lines = block.split(newline);
					lines.forEach(function(line) {
						if (-~headers.indexOf(line.trim())) {
							line = " ".repeat(6) + (line + ":");
						} else {
							line = "\t" + line;
						}
						console.log(line);
					});

					// bottom padding
					console.log(newline);
				} else {
					// only show the name and its description
					console.log(
						"   " +
							chalk.cyan(name) +
							" ".repeat(max_length - name.length + 3) +
							desc
					);
				}
			});

			if (!verbose) {
				// bottom padding
				console.log(newline);
			}

			done();
		}
	);
});
