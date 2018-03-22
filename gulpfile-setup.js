// -----------------------------------------------------------------------------
// requires.js -- ./gulp/setup/source/requires.js
// -----------------------------------------------------------------------------

/*jshint bitwise: false*/
/*jshint browser: false*/
/*jshint esversion: 6 */
/*jshint node: true*/
/*jshint -W014 */
/*jshint -W018 */

"use strict";

// Node modules.
var fs = require("fs");
var path = require("path");

// Lazy load gulp plugins.
var $ = require("gulp-load-plugins")({
	rename: {
		"gulp-prettier-plugin": "prettier",
		"gulp-inject-content": "injection"
	}
});

// Universal modules.
var pump = require("pump");
var chalk = require("chalk");
var cmd = require("node-cmd");
var json = require("json-file");
var inquirer = require("inquirer");
var jsonc = require("comment-json");
var sequence = require("run-sequence");
var license = require("create-license");
var sgit = require("simple-git/promise");
var alphabetize = require("alphabetize-object-keys");

// Project utils.
var utils = require("./gulp/assets/utils/utils.js");
var print = utils.print;
var notify = utils.notify;
var gulp = utils.gulp;
var format = utils.format;
var expand_paths = utils.expand_paths;
var cli_highlight = utils.cli_highlight;

// -----------------------------------------------------------------------------
// paths.js -- ./gulp/setup/source/paths.js
// -----------------------------------------------------------------------------

// Get and fill in path placeholders.
var $paths = expand_paths(
	Object.assign(require("./gulp/setup/exports/paths.js"), {
		// Add in the following paths.

		dirname: __dirname,
		cwd: process.cwd(),

		// Store the project folder name.
		rootdir: path.basename(process.cwd()),
		filepath: __filename,

		// Get the filepath file name.
		filename: path.basename(__filename)
	})
);

// -----------------------------------------------------------------------------
// configs.js -- ./gulp/setup/source/configs.js
// -----------------------------------------------------------------------------

// Dynamic configuration files (load via json-file to modify later).
var $internal = require("./gulp/setup/exports/internal.json");
var $pkg = json.read($paths.config_pkg);

// Get individual plugin settings.
var APP = jsonc.parse(fs.readFileSync($paths.config_app).toString());
var BUNDLES = json.read($paths.config_bundles);
var PRETTIER = require($paths.config_prettier);

// Setup exports.
var QUESTIONS = require($paths.gulp_setup_questions);
var TEMPLATES = require($paths.gulp_setup_templates);
var JSCONFIGS = require($paths.gulp_setup_jsconfigs);

// -----------------------------------------------------------------------------
// vars.js -- ./gulp/setup/source/vars.js
// -----------------------------------------------------------------------------

// Placeholder fillers.
var __data = {};

// App directory information.
var INDEX = APP.index;

// App JSON indentation.
var JINDENT = APP.indent_char;

// -----------------------------------------------------------------------------
// functions.js -- ./gulp/setup/source/functions.js
// -----------------------------------------------------------------------------

// -----------------------------------------------------------------------------
// init.js -- ./gulp/setup/source/tasks/init.js
// -----------------------------------------------------------------------------

/**
 * The default Gulp task. As this file is the Gulp setup file, this task
 *     does nothing but tell the user to run the init task before running
 *     the default task. The init task will ask questions to setup the
 *     project.
 */
gulp.task("default", function(done) {
	print.gulp.info("To start project setup run: $ gulp init.");
	done();
});

/**
 * Ask user questions and setup the project based on the replies. The
 *     initialization steps are shown below.
 */
gulp.task("init", function(done) {
	// Cache task.
	var task = this;

	// Contain user replies/answers here.
	var __answers = [];

	print.ln();

	/**
	 * Prints current setup question section.
	 *
	 * @param  {string} section - The name of the current section.
	 * @return {undefined} - Nothing.
	 */
	function print_header_section(section) {
		var sections = {
			initial: "Project Questions",
			author: "Author Questions",
			license: "Generate License",
			github: "GitHub Questions",
			app: "App Questions"
		};

		// Overwrite the var.
		var header = sections[section];

		print.ln();
		print(chalk.green(`${header}\n`));
	}

	/**
	 * Make template-error question-setup message.
	 *
	 * @param  {string} section - The name of the current section.
	 * @return {string} - The setup error.
	 */
	function setup_error(section) {
		return `Something went wrong with the ${section} questions.`;
	}

	// Promises:
	// [https://stackoverflow.com/a/20715224].
	// [https://github.com/steveukx/git-js/issues/230]

	inquirer
		.prompt(QUESTIONS.ready)
		.then(function(answers) {
			if (!answers.continue) {
				return Promise.reject("Project setup was aborted.");
			}

			print_header_section("initial");

			return inquirer.prompt(QUESTIONS.initial).then(null, function() {
				return Promise.reject(setup_error("initial"));
			});
		})
		.then(function(answers) {
			// Store the answers.
			__answers.push(answers);

			print_header_section("author");

			return inquirer.prompt(QUESTIONS.author).then(null, function() {
				return Promise.reject(setup_error("author"));
			});
		})
		.then(function(answers) {
			// Store the answers.
			__answers.push(answers);

			print_header_section("license");

			return inquirer.prompt(QUESTIONS.license).then(null, function() {
				return Promise.reject(setup_error("license"));
			});
		})
		.then(function(answers) {
			// Store the answers.
			__answers.push(answers);

			print_header_section("app");

			return inquirer.prompt(QUESTIONS.app).then(null, function() {
				return Promise.reject(setup_error("app"));
			});
		})
		.then(function(answers) {
			// Store the answers.
			__answers.push(answers);

			print_header_section("github");

			return inquirer.prompt(QUESTIONS.github).then(null, function() {
				return Promise.reject(setup_error("GitHub"));
			});
		})
		.then(function(answers) {
			// Store the answers.
			__answers.push(answers);

			// Combine all answers.
			answers = Object.assign.apply({}, __answers);

			// Get answers.
			__data = answers;
			var type = __data.apptype;

			// Use the project name as the repo name when the same name
			// flag is true.
			if (__data.same_name) {
				__data.repo_name = __data.name;
			}

			// Set the path for js option.
			$paths.js_options_dynamic = `gulp/setup/${type}/**/*.*`;

			// Set the application type.
			$internal.apptype = type;
			// Pick js bundle based on provided project type + reset the
			// config js bundle.
			BUNDLES.data.js = JSCONFIGS[type];

			// Remove distribution configuration if type is library
			// as the project is defaulted for a webapp project.
			if (type === "library") {
				// Remove the distribution configuration.
				delete BUNDLES.data.dist;
				// Add the library configuration.
				BUNDLES.data.lib = JSCONFIGS.lib;
			} // Else leave as-is for webapp project.

			// Set package.json properties.
			$pkg.set("name", __data.name);
			$pkg.set("version", __data.version);
			$pkg.set("description", __data.description);
			$pkg.set("author", format(TEMPLATES.author, __data));
			$pkg.set("repository", {
				type: "git",
				url: format(TEMPLATES["repository.url"], __data)
			});
			$pkg.set("bugs", {
				url: format(TEMPLATES["bugs.url"], __data)
			});
			$pkg.set("homepage", format(TEMPLATES.homepage, __data));
			$pkg.set("private", __data.private);

			// Sort keys.
			BUNDLES.data = alphabetize(BUNDLES.data);
			$pkg.data = alphabetize($pkg.data);

			// Saves changes to files.
			BUNDLES.writeSync(null, JINDENT);
			$pkg.write(
				function() {
					// Run initialization steps.
					var tasks = [
						"init:app-settings",
						"init:settings-internal",
						"init:settings-main",
						"init:clean-docs",
						// Note: The following 2 tasks are only for library
						// type projects and are removed for webapp projects.
						"init:--lib-remove-webapp-files",
						"init:--lib-add-library-files",
						"init:create-license",
						"init:fill-placeholders",
						"init:setup-readme",
						"init:rename-gulpfile",
						"init:remove-setup",
						"init:create-bundles",
						"init:pretty",
						"init:git"
					];

					// Remove steps only for library project setup when
					// apptype is webapp.
					if (__data.apptype === "webapp") {
						tasks = tasks.filter(function(task) {
							return !-~task.indexOf("--lib");
						});
					}

					tasks.push(function() {
						var message = `Project initialized. (${type})`;
						notify(message);
						print.gulp.success(message);
						print.gulp.info(
							"Start watching for file changes by running: $ gulp."
						);

						done();
					});
					return sequence.apply(task, tasks);
				},
				null,
				JINDENT
			);
		})
		.catch(function(err_message) {
			print.gulp.error(err_message);
		});
});

// -----------------------------------------------------------------------------
// steps.js -- ./gulp/setup/source/tasks/steps.js
// -----------------------------------------------------------------------------

/**
 * Initialization step: Update app config file with the user provided values.
 */
gulp.task("init:app-settings", function(done) {
	pump(
		[
			gulp.src($paths.config_app, {
				base: $paths.dot
			}),
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
 * Initialization step: Takes the internal JSON object export and saves
 *     it into the configs/ directory.
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
 * Initialization step: Combines all the config files under configs/
 *     to generate the collective .__settings.js file.
 */
gulp.task("init:settings-main", function(done) {
	// Create settings file by running settings task from the main gulp file.
	cmd.get(`gulp -f gulpfile-main.js settings --rebuild`, function(err, data) {
		if (err) {
			throw err;
		}

		// Highlight data string.
		print(cli_highlight(data));

		done();
	});
});

/**
 * Initialization step: Removes unneeded doc files depending on whether
 *     setting up a webapp or library.
 */
gulp.task("init:clean-docs", function(done) {
	// Get the correct file sub types to remove (depends on project setup).
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
 * Initialization step: Is only ran when setting up a library project.
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
 * Initialization step: Is only ran when setting up a library project.
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
 * Initialization step: Creates the user selected license and inserts
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
 * Initialization step: Replaces placeholders with the provided data.
 */
gulp.task("init:fill-placeholders", function(done) {
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
 * Initialization step: Moves the readme template export to its setup
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
 * Initialization step: Renames the main gulpfile to the conventional
 *     Gulp file name.
 */
gulp.task("init:rename-gulpfile", function(done) {
	// Rename the gulpfile-main.js to gulpfile.js.
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
 * Initialization step: Remove all setup files and old .git/ folder as
 *     they are no longer needed in the further steps.
 */
gulp.task("init:remove-setup", function(done) {
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
 * Initialization step: Runs gulpfile.js, formerly gulpfile-main.js,
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

		done();
	});
});

/**
 * Initialization step: Runs the gulpfile.js, formerly gulpfile-main.js,
 *     pretty task. This task runs through all the project files and
 *     prettifies them.
 */
gulp.task("init:pretty", function(done) {
	// Create the CSS/JS bundles before.
	cmd.get(`gulp pretty`, function(err, data) {
		if (err) {
			throw err;
		}

		// Highlight data string.
		print(cli_highlight(data));

		done();
	});
});

/**
 * Initialization step: Programmatically setup Git, lightly configures Git,
 *     make the first commit, and push project to repo.
 */
gulp.task("init:git", function(done) {
	var git = sgit($paths.cwd);

	git
		// Determine whether the cwd is part of a git repository.
		.checkIsRepo()
		.then(function(is_git_repo) {
			if (is_git_repo) {
				return Promise.reject("Project is already a Git repo.");
			}

			// If directory has not been setup as a repo, do so.
			return init_repo(git).then(null, function(err) {
				return Promise.reject("Failed to Git initialize project.");
			});
		})
		.then(function() {
			if (__data.git_commit) {
				return git
					.add("./*")
					.then(function() {
						return git.commit(
							"chore: Initial commit\n\nProject initialization."
						);
					})
					.then(null, function() {
						return Promise.reject("Failed to make first commit.");
					});
			}
		})
		.then(function() {
			if (__data.git_push) {
				return git
					.push(["-u", "origin", "master"])
					.then(final_success, function() {
						return Promise.reject(
							"Failed to push project to repo."
						);
					});
			}
		})
		.then(function() {
			done();
		})
		.catch(function(err_message) {
			print.gulp(err_message);
		});

	function final_success() {
		print.gulp.info("Set a default editor if not set already.");
		print.gulp.info(
			"https://git-scm.com/book/en/v2/Customizing-Git-Git-Configuration"
		);
		print.gulp.success(
			"Git initialized and configured ($ git config --list --local)."
		);
	}

	function init_repo(git) {
		return git.init().then(function() {
			// Add custom Git configuration settings.
			git.addConfig("core.autocrlf", "input");
			git.addConfig("core.fileMode", false);
			git.addConfig("user.name", `${__data.git_id}`);
			git.addConfig("user.email", `${__data.email}`);

			// Add the remote is user wanted to.
			if (__data.git_remote) {
				// Get the needed user data.
				var type = __data.git_repo_type;
				var username = __data.git_id;
				var repo_name = __data.repo_name;

				// Make the remote string.
				var remote_template =
					type === "ssh"
						? `git@github.com:${username}/${repo_name}.git`
						: `https://github.com/${username}/${repo_name}.git`;

				// Add the remote.
				git.addRemote("origin", remote_template);
			}
		});
	}
});

// -----------------------------------------------------------------------------
// make.js -- ./gulp/setup/source/helpers/make.js
// -----------------------------------------------------------------------------

/**
 * Build gulpfile from source files.
 *
 * $ gulp make
 *     Build gulpfile.
 */
gulp.task("make", function(done) {
	var files = [
		"requires.js",
		"paths.js",
		"configs.js",
		"vars.js",
		"functions.js",
		"tasks/init.js",
		"tasks/steps.js",
		"helpers/make.js"
	];
	pump(
		[
			gulp.src(files, {
				cwd: $paths.gulp_setup_source
			}),
			$.debug(),
			$.foreach(function(stream, file) {
				// The max length of characters for decoration line.
				var max_length = 80;
				var decor = "// " + "-".repeat(max_length - 3);

				var filename = path.basename(file.path);
				var filename_rel = path.relative($paths.cwd, file.path);

				var line_info = `${decor}\n// ${filename} -- ./${filename_rel}\n${decor}\n\n`;

				return stream.pipe($.insert.prepend(line_info));
			}),
			$.concat($paths.gulp_file_setup),
			$.prettier(PRETTIER),
			gulp.dest($paths.basedir),
			$.debug.edit()
		],
		done
	);
});
