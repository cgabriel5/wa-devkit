/**
 * This initialization step updates the app config file with the user
 *     provided values.
 */
gulp.task("init:app-settings", function(done) {
	// Run gulp process.
	pump(
		[
			gulp.src($paths.config_app),
			$.debug(),
			$.modify({
				fileModifier: function(file, contents) {
					// Note: Since the app file has already been loaded we
					// don't use the modifier's contents variable. We modify
					// the app object and return the stringified text of the
					// object. Doing this will prevent the file from being
					// re-opened again via jsonc and will also log the
					// task in the terminal.

					// Update the app object.
					APP.index = __data.entry_point;
					APP.base = __data.base;
					APP.https = __data.https;
					APP.port = __data.port;
					APP.eol = {
						ending: __data.eol[1],
						style: __data.eol[0]
					};

					// Hacky-method: comment-json removes all empty lines so
					// the lines are added back to make the config file easier
					// to read.
					for (var key in APP) {
						if (APP.hasOwnProperty(key)) {
							// Only modify the comments.
							if (key.charAt(0) === "/") {
								// Prepend a placeholder for the new lines.
								APP[key][0].unshift("// $LINE");
							}
						}
					}

					// Stringify the answers object and remove the placeholders
					// with new lines.
					var content = jsonc
						.stringify(APP, null, JINDENT)
						.replace(/\/\/ \$LINE/gm, "\n")
						.trim();

					return content;
				}
			}),
			$.debug.edit(),
			gulp.dest($paths.basedir)
		],
		done
	);
});

/**
 * This initialization step takes the internal JSON object export and saves
 *     it into the configs/ directory.
 *
 * Notes
 *
 * • This file (.__internal.json) is used internally and should not be
 *     modified.
 */
gulp.task("init:settings-internal", function(done) {
	// Get the internal filepath.
	var internal_filepath =
		$paths.config_home + $paths.gulp_setup_settings_internal_name;

	// Save the $internal JSON object.
	fs.writeFile(
		internal_filepath,
		JSON.stringify(alphabetize($internal), null, JINDENT),
		function() {
			// The following is only needed to log the file.
			pump(
				[
					gulp.src(internal_filepath, {
						cwd: $paths.basedir
					}),
					$.debug(),
					$.debug.edit()
				],
				done
			);
		}
	);
});

/**
 * This initialization step combines all the config files under configs/
 *     to generate the collective .__settings.js file.
 */
gulp.task("init:settings-main", function(done) {
	// Make the main settings file.
	pump(
		[
			gulp.src($paths.config_settings_json_files, {
				cwd: $paths.basedir
			}),
			$.debug(),
			$.strip_jsonc(), // Remove any JSON comments.
			$.jsoncombine($paths.config_settings_name, function(data) {
				return new Buffer(JSON.stringify(data, null, JINDENT));
			}),
			gulp.dest($paths.config_home),
			$.debug.edit()
		],
		done
	);
});

/**
 * This initialization step removes unneeded doc files depending on whether
 *     setting up a webapp or library.
 */
gulp.task("init:clean-docs", function(done) {
	// Get the correct file sub types to remove. This depends on the project
	// setup.
	var files =
		$paths[
			"gulp_setup_docs_" + (__data.apptype === "webapp" ? "lib" : "app")
		];

	// Remove files.
	pump(
		[
			gulp.src(files, {
				cwd: $paths.gulp_setup_docs_source
			}),
			$.debug(),
			$.debug.clean(),
			$.clean()
		],
		done
	);
});

/**
 * This initialization step is only ran when setting up a library project.
 *     It removes all webapp files as the project is defaulted to a webapp.
 */
gulp.task("init:--lib-remove-webapp-files", function(done) {
	// Note: When setting up a library project ./js/source/ will get
	// overwritten with the library setup folder files. This will in effect
	// combine the folders and add the needed files/folders for the library.
	// (i.e. ./js/vendor/__init.js and ./js/bundles/)

	pump(
		[
			gulp.src($paths.js_source, {
				dot: true,
				cwd: $paths.basedir
			}),
			$.debug.clean(),
			$.clean()
		],
		done
	);
});

/**
 * This initialization step is only ran when setting up a library project.
 *     As the project is defaulted to a webapp it adds the needed library
 *     project files.
 */
gulp.task("init:--lib-add-library-files", function(done) {
	// This will copy the library project files from the setup directory
	// into the ./js/ directory. This will also overwrite needed files,
	// like the bundle files.

	pump(
		[
			gulp.src($paths.js_options_dynamic, {
				dot: true,
				cwd: $paths.dot
			}),
			$.debug(),
			gulp.dest($paths.js_home),
			$.debug.edit()
		],
		done
	);
});

/**
 * This initialization step creates the user selected license and inserts
 *     the provided data (year, name, etc.).
 */
gulp.task("init:create-license", function(done) {
	// Generate the license.
	license($paths.basedir, __data.license, {
		author: __data.fullname,
		year: __data.year,
		project: __data.name
	});

	// Remove the ext from the path.
	var license_no_ext = $paths.license.replace(".txt", "");

	// Rename the generated license.
	pump(
		[
			gulp.src(license_no_ext, {
				base: $paths.basedir
			}),
			$.rename($paths.license),
			gulp.dest($paths.basedir),
			$.debug.edit()
		],
		// Remove the old license file.
		function() {
			pump(
				[
					gulp.src(license_no_ext, {
						base: $paths.basedir
					}),
					$.debug.clean(),
					$.clean()
				],
				done
			);
		}
	);
});

/**
 * This initialization step inserts any placeholders with the provided
 *    data.
 */
gulp.task("init:fill-placeholders", function(done) {
	// Replace placeholder with real data.
	pump(
		[
			gulp.src(
				[
					$paths.gulp_setup_readme_template,
					$paths.html_headmeta,
					INDEX
				],
				{
					base: $paths.basedir
				}
			),
			$.injection({ replacements: __data }),
			gulp.dest($paths.basedir),
			$.debug.edit()
		],
		done
	);
});

/**
 * This initialization step moves the readme template export to its setup
 *     location to the root.
 */
gulp.task("init:setup-readme", function(done) {
	// Move templates to new locations.
	pump(
		[
			gulp.src([$paths.gulp_setup_readme_template]),
			$.debug(),
			gulp.dest($paths.basedir),
			$.debug.edit()
		],
		done
	);
});

/**
 * This initialization step renames the main gulpfile to the conventional
 *     Gulp file name.
 */
gulp.task("init:rename-gulpfile", function(done) {
	// Rename the gulpfile.main.js to gulpfile.js.
	pump(
		[
			gulp.src($paths.gulp_file_main, {
				base: $paths.basedir
			}),
			$.debug(),
			$.clean(), // Remove the file.
			$.rename($paths.gulp_file_name),
			gulp.dest($paths.basedir),
			$.debug.edit()
		],
		done
	);
});

/**
 * This initialization step removes all setup files as they are no longer
 *     needed in the further steps.
 */
gulp.task("init:remove-setup", function(done) {
	// Remove the setup files/folders/old .git folder.
	pump(
		[
			gulp.src([$paths.gulp_file_setup, $paths.gulp_setup, $paths.git], {
				dot: true,
				read: false,
				base: $paths.basedir
			}),
			$.debug.clean(),
			$.clean()
		],
		done
	);
});

/**
 * This initialization step runs gulpfile.js, formerly gulpfile.main.js,
 *     Gulp tasks. More specifically, it runs the tasks that generate the
 *     project CSS/JS bundles.
 */
gulp.task("init:create-bundles", function(done) {
	// Create the CSS/JS bundles before.
	cmd.get(`gulp js && gulp css`, function(err, data, test) {
		if (err) {
			throw err;
		}

		// Highlight data string.
		print(cli_highlight(data));

		// End the task.
		done();
	});
});

/**
 * This initialization step runs the gulpfile.js, formerly gulpfile.main.js,
 *     pretty task. This task runs through all the project files and pretty
 *     prints them.
 */
gulp.task("init:pretty", function(done) {
	// Create the CSS/JS bundles before.
	cmd.get(`gulp pretty`, function(err, data) {
		if (err) {
			throw err;
		}

		// Highlight data string.
		print(cli_highlight(data));

		// End the task.
		done();
	});
});

/**
 * This initialization step programmatically makes the first project Git
 *     commit and lightly configures Git with useful settings.
 */
gulp.task("init:git", function(done) {
	// Git init new project.
	git.init("", function() {
		// Set gitconfig values.
		cmd.get(
			`
		git config --local core.fileMode false
		git config --local core.autocrlf input
		git config --local user.email ${__data.email}
		git config --local user.name ${__data.git_id}`,
			function(err) {
				if (err) {
					throw err;
				}

				// Make the first commit.
				git
					.add("./*")
					.commit(
						"chore: Initial commit\n\nProject initialization.",
						function() {
							print.gulp.info(
								"It not already set, make sure to set your default text editor."
							);
							print.gulp.info(
								"https://git-scm.com/book/en/v2/Customizing-Git-Git-Configuration"
							);
							print.gulp.success(
								"Git initialized and configured ($ git config --list --local)."
							);

							done();
						}
					);
			}
		);
	});
});
