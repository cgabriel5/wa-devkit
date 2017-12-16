/**
 * Provides Gulp task documentation (this documentation).
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
 * -i, --internal
 *     [boolean] Shows all internal (yellow) tasks.
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
 *
 * $ gulp help --internal
 *     Show documentation for internally used tasks.
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
		})
		.option("internal", {
			alias: "i",
			type: "boolean"
		}).argv;
	var verbose = _args.v || _args.verbose;
	var filter = _args.f || _args.filter;
	var internal = _args.i || _args.internal;

	// get concat file names to use
	var names = bundle_gulp.source.names;
	var name_default = names.default;
	var name_main = names.main;

	// if gulpfile.js exists use that name, else fallback to gulpfile.main.js
	var gulpfile = fe.sync($paths.base + name_default)
		? name_default
		: name_main;

	// store file content in a variable
	var content = "";

	pump(
		[
			gulp.src(gulpfile, {
				cwd: $paths.base
			}),
			$.fn(function(file) {
				// get the file content
				content = file.contents.toString();
			})
		],
		function() {
			// loop over gulpfile content string and file all the docblocks
			var blocks = [];
			var string = content;
			var docblock_pattern = /^\/\*\*[\s\S]*?\*\/$/m;
			var task_name_pattern = /^gulp.task\(('|")([a-z:\-_]+)\1/;
			var match = string.match(docblock_pattern);
			while (match) {
				var comment = match[0];
				// get the match index
				var index = match.index;
				// get the match length
				var length = comment.length;
				// reset the string to exclude the match
				string = string.substring(index + length, string.length).trim();

				// now look for the task name
				// the name needs to be at the front of the string
				// to pertain to the current docblock comment. therefore,
				// it must have an index of 0.
				var task_name_match = string.match(task_name_pattern);

				// if no task name match continue and skip, or...
				// task name has to be at the front of the string
				if (!task_name_match || task_name_match.index !== 0) {
					// reset the match pattern
					match = string.match(docblock_pattern);
					continue;
				}

				// add the comment and task name to array
				// [ task name , task docblock comment ]
				blocks.push([task_name_match[2], comment]);
				// reset the match pattern
				match = string.match(docblock_pattern);
			}

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

			console.log(newline);
			console.log(chalk.bold("Tasks"));
			console.log(newline);

			var tasks = {};
			var names = [];
			var lengths = [];

			// loop over every match get needed data
			blocks.forEach(function(block) {
				// get task name
				var name = block[0];
				// reset the block var to the actual comment block
				block = block[1];

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

				tasks[name] = {
					text: block,
					desc: desc
				};
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

				var is_internal = -~name.indexOf(":");

				// task name color will change based on whether its
				// an internal task.
				var color = is_internal ? "yellow" : "cyan";

				// only print internal tasks when the internal flag
				// is provided.
				if (is_internal && !internal) {
					return;
				}

				// loop over lines
				if (verbose || name === "help") {
					// bold the tasks
					block = block.replace(/\s\-\-?[a-z-]+/g, replacer);

					// print the task name
					console.log("   " + chalk[color](name));

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
							chalk[color](name) +
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
