/**
 * List project files.
 *
 * Flags
 *
 * -t, --type
 *     [string] The optional extensions of files to list.
 *
 * -s, --stypes
 *     [string] The optional sub-extensions of files to list.
 *
 * -w, --whereis
 *     [string] Substring to search for. Uses fuzzy search by
 *     and default. (Ignores ./node_modules/ and .git/).
 *
 * -n, --nofuzzy
 *     [string] Flag indicating to turn off fuzzy search. Will
 *     use a simple indexOf() search instead.
 *
 * -h, --highlight
 *     [string] Highlight the --whereis term in the file path.
 *
 * Usage
 *
 * $ gulp files
 *     Shows all files excluding files in ./node_modules/ &
 *     .git/.
 *
 * $ gulp files --type "js html"
 *     Only list HTML and JS files.
 *
 * $ gulp files --type "js" --whereis "jquery"
 *     Print JS files containing "jquery" in path.
 *
 * $ gulp files --whereis "fastclick.js"
 *     Prints files containing fastclick.js in path.
 *
 * $ gulp files --stype "ig" --nofuzzy --highlight
 *     Turn off fuzzy search, find all files containing
 *     the "ig" sub-extension, and highlight string matches.
 *
 * $ gulp files --stype "min" --type "js"
 *     Find all files of type JS and containing the sub-extension
 *     "min".
 *
 * $ gulp files --subs
 *     List all used file sub-extensions.
 */
gulp.task("files", function(done) {
	var fuzzy = require("fuzzy");

	// Run yargs.
	var __flags = yargs
		.option("type", {
			alias: "t",
			type: "string"
		})
		.option("stype", {
			alias: "s",
			type: "string"
		})
		.option("whereis", {
			alias: "w",
			type: "string"
		})
		.option("nofuzzy", {
			alias: "n",
			type: "boolean"
		})
		.option("highlight", {
			alias: "H",
			type: "boolean"
		})
		.option("subs", {
			type: "boolean"
		}).argv;

	// Get the command line arguments from yargs.
	var types = __flags.t || __flags.type;
	var stypes = __flags.s || __flags.stype;
	var whereis = __flags.w || __flags.whereis;
	var no_fuzzy = __flags.n || __flags.nofuzzy;
	var highlight = __flags.H || __flags.highlight;
	var sub_extensions = __flags.subs;

	var clean_types = function(text) {
		// Collapse multiple spaces + remove left/right padding.
		text = text.replace(/\s+/g, " ").replace(/^\s+|\s+$/g, "");
		// Turn to an array.
		text = text.split(/\s+/);

		return text;
	};

	// If types provided clean them.
	if (types) {
		types = clean_types(types);
	}

	// If sub types provided clean them.
	if (stypes) {
		stypes = clean_types(stypes);
	}

	// Where files will be contained.
	var files = [];

	// Get all project files.
	dir.files($paths.dirname, function(err, paths) {
		if (err) {
			throw err;
		}

		// Skip files from these locations: .git/, node_modules/.
		loop1: for (var i = 0, l = paths.length; i < l; i++) {
			// Only get the relative path (relative to the root directory
			// of the project). The absolute path is not needed.
			var filepath = path.relative($paths.cwd, paths[i]);

			// Globs to ignore.
			var ignores = [$paths.node_modules_name, $paths.git];
			// Ignore files containing the above globs.
			for (var j = 0, ll = ignores.length; j < ll; j++) {
				var ignore = ignores[j];
				if (-~filepath.indexOf(ignore)) {
					continue loop1;
				}
			}
			// Add to files array.
			files.push(filepath);
		}

		// Filter the files based on their file extensions when the type
		// argument is provided.
		if (types) {
			files = files.filter(function(filepath) {
				return ext({ path: filepath }, types);
			});
		}

		// Filter the files based on their sub extensions when the type
		// argument is provided.
		if (stypes) {
			files = files.filter(function(filepath) {
				var subs_extensions = extension.subs({ path: filepath });

				// Check if path contains any of the passed in subs.
				for (var i = 0, l = stypes.length; i < l; i++) {
					var sub = stypes[i];
					if (-~subs_extensions.indexOf(sub)) {
						return true;
					}
				}

				// Else nothing matched so filter path out.
				return false;
			});
		}

		// List the used sub-extensions.
		if (sub_extensions) {
			// Store used sub-extensions.
			var subs_ = [];

			print.ln();
			print(chalk.underline("Sub-extensions"));

			// Loop over each path to find the sub-extensions.
			files.forEach(function(path_) {
				// Get the paths sub-extensions.
				var subs = extension.subs({ path: path_ });

				// Loop over the found sub-extensions and print them.
				if (subs.length) {
					subs.forEach(function(sub) {
						// If the sub does not exist store it and print.
						if (!-~subs_.indexOf(sub)) {
							print(`  ${sub}`);
							subs_.push(sub);
						}
					});
				}
			});

			print.ln();

			return done();
		}

		// Note: This lookup object is only used for highlight purposes
		// and will only be populate when the --whereis flag is provided.
		// It is a work around the fuzzy module. It will store the relative
		// file path with its file path containing the highlight wrappers
		// so it can be accessed in the debug modifier function.
		// Basically: { relative_file_path: file_path_with_wrappers}
		var lookup = whereis ? {} : false;

		// If whereis parameter is provided run a search on files.
		if (whereis) {
			// Filtered files containing the whereis substring/term
			// will get added into this array.
			var results = [];

			// Highlight wrappers: These will later be replaced and the
			// wrapped text highlight and bolded.
			var highlight_pre = "$<";
			var highlight_post = ">";

			// Run a non fuzzy search. When fuzzy search is turned off
			// we default back to an indexOf() search.
			if (no_fuzzy) {
				files.forEach(function(file) {
					if (-~file.indexOf(whereis)) {
						// Add the file path to the array.
						results.push(file);

						// Add the path to object.
						lookup[file] = file.replace(
							new RegExp(escape(whereis), "gi"),
							function(match) {
								return highlight_pre + match + highlight_post;
							}
						);
					}
				});
			} else {
				// Run a fuzzy search on the file paths.
				var fuzzy_results = fuzzy.filter(whereis, files, {
					pre: highlight_pre,
					post: highlight_post
				});

				// Turn into an array.
				fuzzy_results.forEach(function(result) {
					// Cache the original file path.
					var og_filepath = result.original;

					// Add the file path to the array.
					results.push(og_filepath);

					// Add the path containing the highlighting wrappers
					// to the object.
					lookup[og_filepath] = result.string;
				});
			}

			// Reset var to the newly filtered files.
			files = results;
		}

		// If the highlight flag is not provided simply run the debug
		// with default options. Else use the modifier option to
		// highlight the path. This was not done through gulpif because
		// gulpif was not playing nice with the debug plugin as the CLI
		// loader was messing up.
		var options =
			highlight && whereis
				? {
						// The modifier function will be used to highlight
						// the search term in the file path.
						modifier: function(data) {
							// Remove placeholders and apply highlight.
							var string = lookup[data.paths.relative].replace(
								/\$<(.*?)\>/g,
								function(match) {
									return chalk.bold.yellow(
										match.replace(/^\$<|\>$/g, "")
									);
								}
							);

							// Update the data object.
							data.file_path = string;
							data.output = `=> ${string} ${data.size} ${
								data.action
							}`;

							// Return the updated data object.
							return data;
						}
					}
				: {};

		// Log files.
		pump([gulp.src(files), $.sort(opts_sort), $.debug(options)], done);
	});
});
