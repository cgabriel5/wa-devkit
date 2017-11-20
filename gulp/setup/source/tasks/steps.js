// initialization step
// @internal
gulp.task("init:settings-internal", function(done) {
	// save the $internal JSON object
	fs.writeFile(
		$paths.config_home + $paths.gulp_setup_settings_internal_name,
		JSON.stringify(alphabetize($internal), null, jindent),
		function() {
			done();
		}
	);
});

// initialization step
// @internal
gulp.task("init:settings-main", function(done) {
	// make the main settings file
	pump(
		[
			gulp.src($paths.config_settings_json_files, {
				cwd: $paths.base
			}),
			$.debug(),
			$.strip_jsonc(), // remove any json comments
			$.jsoncombine($paths.config_settings_name, function(data, meta) {
				return new Buffer(JSON.stringify(data, null, jindent));
			}),
			gulp.dest($paths.config_home),
			$.debug.edit()
		],
		done
	);
});

// initialization step
// @internal
gulp.task("init:remove-webapp-files", function(done) {
	// only when apptype is library:
	// replace ./js/source/ to later add the needed library
	// project files, i.e. ./js/vendor/__init__.js and
	// ./js/bundles/.

	pump(
		[
			gulp.src($paths.js_source, {
				dot: true,
				cwd: $paths.base
			}),
			$.debug.clean(),
			$.clean()
		],
		done
	);
});

// initialization step
// @internal
gulp.task("init:add-library-files", function(done) {
	// copy the library project files from the setup
	// directory into the ./js/ directory. this will
	// also overwrite needed files, like the bundle files.

	pump(
		[
			gulp.src($paths.js_options_dynamic, {
				dot: true,
				cwd: $paths.base_dot
			}),
			$.debug(),
			gulp.dest($paths.js_home),
			$.debug.edit()
		],
		done
	);
});

// initialization step
// @internal
gulp.task("init:create-license", function(done) {
	// generate the license
	license($paths.base, __data__.license, {
		author: __data__.fullname,
		year: __data__.year,
		project: __data__.name
	});

	// remove the ext from the path
	var license_no_ext = $paths.license.replace(".txt", "");

	// rename the generated license
	pump(
		[
			gulp.src(license_no_ext, {
				base: $paths.base
			}),
			$.rename($paths.license),
			gulp.dest($paths.base),
			$.debug.edit()
		],
		// remove the old license file
		function() {
			pump(
				[
					gulp.src(license_no_ext, {
						base: $paths.base
					}),
					$.debug.clean(),
					$.clean()
				],
				done
			);
		}
	);
});

// initialization step
// @internal
gulp.task("init:fill-placeholders", function(done) {
	// replace placeholder with real data
	pump(
		[
			gulp.src(
				[
					$paths.gulp_setup_readme_template,
					$paths.html_headmeta,
					INDEX
				],
				{
					base: $paths.base
				}
			),
			$.injection(__data__),
			gulp.dest($paths.base),
			$.debug.edit()
		],
		done
	);
});

// initialization step
// @internal
gulp.task("init:setup-readme", function(done) {
	// move templates to new locations
	pump(
		[
			gulp.src([$paths.gulp_setup_readme_template]),
			$.debug(),
			gulp.dest($paths.base),
			$.debug.edit()
		],
		done
	);
});

// initialization step
// @internal
gulp.task("init:rename-gulpfile", function(done) {
	// rename the gulpfile.main.js to gulpfile.js
	pump(
		[
			gulp.src($paths.gulp_file_main, {
				base: $paths.base
			}),
			$.debug(),
			$.clean(), // remove the file
			$.rename($paths.gulp_file_name),
			gulp.dest($paths.base),
			$.debug.edit()
		],
		done
	);
});

// initialization step
// @internal
gulp.task("init:remove-setup", function(done) {
	// remove the setup files/folders/old .git folder
	pump(
		[
			gulp.src([$paths.gulp_file_setup, $paths.gulp_setup, $paths.git], {
				dot: true,
				read: false,
				base: $paths.base
			}),
			$.debug.clean(),
			$.clean()
		],
		done
	);
});

// initialization step
// @internal
gulp.task("init:git", function(done) {
	// git init new project
	git.init("", function() {
		// set gitconfig values
		cmd.get(
			`
		git config --local core.fileMode false
		git config --local core.autocrlf input
		git config --local user.email ${__data__.email}
		git config --local user.name ${__data__.git_id}`,
			function(err, data, stderr) {
				// make the first commit
				git
					.add("./*")
					.commit(
						"chore: Initial commit\n\nProject initialization.",
						function() {
							console.log("");
							log(
								"Make sure to set your editor of choice with Git if not already set."
							);
							log(
								"For example, if using Sublime Text run ",
								chalk.green(
									'$ git config core.editor "subl -n w"'
								)
							);
							log("More information can be found here:");
							log(
								"https://git-scm.com/book/en/v2/Customizing-Git-Git-Configuration\n"
							);
							log(`Git initialized and configured.\n`);
							notify(
								`Git initialized and configured (${__data__.apptype})`
							);
							done();
						}
					);
			}
		);
	});
});
