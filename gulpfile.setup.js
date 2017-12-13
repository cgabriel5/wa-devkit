//#! requires.js -- ./gulp/setup/source/requires.js

/*jshint esversion: 6 */
/*jshint bitwise: false*/
/*jshint browser: false*/
/*jshint node: true*/
/*jshint -W018 */
/*jshint -W014 */

"use strict";

// node modules
var fs = require("fs");
var path = require("path");

// lazy load gulp plugins
var $ = require("gulp-load-plugins")({
	rename: {
		"gulp-if": "gulpif",
		"gulp-markdown": "marked",
		"gulp-purifycss": "purify",
		"gulp-clean-css": "clean_css",
		"gulp-json-sort": "json_sort",
		"gulp-jsbeautifier": "beautify",
		"gulp-minify-html": "minify_html",
		"gulp-prettier-plugin": "prettier",
		"gulp-inject-content": "injection",
		"gulp-real-favicon": "real_favicon",
		"gulp-strip-json-comments": "strip_jsonc"
	},
	postRequireTransforms: {
		json_sort: function(plugin) {
			return plugin.default;
		},
		uglify: function() {
			// [https://stackoverflow.com/a/45554108]
			// By default es-uglify is used to uglify JS.
			var uglifyjs = require("uglify-es");
			var composer = require("gulp-uglify/composer");
			return composer(uglifyjs, console);
		}
	}
});

// universal modules
var pump = require("pump");
var chalk = require("chalk");
var cmd = require("node-cmd");
var json = require("json-file");
var git = require("simple-git")();
var inquirer = require("inquirer");
var jsonc = require("comment-json");
var sequence = require("run-sequence");
var license = require("create-license");
var alphabetize = require("alphabetize-object-keys");

// project utils
var utils = require("./gulp/assets/utils/utils.js");
var log = utils.log;
var notify = utils.notify;
var gulp = utils.gulp;
var format = utils.format;
var bangify = utils.bangify;
var globall = utils.globall;
var ext = utils.ext;
var expand_paths = utils.expand_paths;
var opts_sort = utils.opts_sort;

//#! paths.js -- ./gulp/setup/source/paths.js

// get and fill in path placeholders
var $paths = expand_paths(
	Object.assign(require("./gulp/setup/exports/paths.js"), {
		// add in the following paths
		dirname: __dirname,
		cwd: process.cwd(),
		// store the project folder name
		rootdir: path.basename(process.cwd())
	})
);

//#! configs.js -- ./gulp/setup/source/configs.js

// dynamic configuration files (load via json-file to modify later)
var $internal = require("./gulp/setup/exports/internal.json");
var $pkg = json.read($paths.config_pkg);

// get individual plugin settings
var $app = jsonc.parse(fs.readFileSync($paths.config_app).toString());
var $ap = require($paths.config_autoprefixer);
var $bundles = json.read($paths.config_bundles);
var $jsbeautify = require($paths.config_jsbeautify);
var $json_format = require($paths.config_json_format);
var jindent = $json_format.indent_size;
var $perfectionist = require($paths.config_perfectionist);
var $prettier = require($paths.config_prettier);

// setup exports
var $questions = require($paths.gulp_setup_questions);
var $templates = require($paths.gulp_setup_templates);
var $jsconfigs = require($paths.gulp_setup_jsconfigs);

//#! vars.js -- ./gulp/setup/source/vars.js

// placeholder fillers
var __data__ = {};

// app directory information
var INDEX = $app.index;

// line ending information
var EOL = $app.eol;
var EOL_ENDING = EOL.ending;
// var EOL_STYLE = EOL.style;

//#! functions.js -- ./gulp/setup/source/functions.js

//#! init.js -- ./gulp/setup/source/tasks/init.js

// @internal
gulp.task("default", function(done) {
	// show the user the init message
	log('Run "$ gulp init" before running Gulp\'s default command.');
	done();
});

gulp.task("init", function(done) {
	// cache task
	var task = this;

	inquirer.prompt($questions).then(function(answers) {
		// get answers
		__data__ = answers;
		var type = __data__.apptype;

		// set the path for js option
		$paths.js_options_dynamic = `gulp/setup/js/options/${type}/**/*.*`;

		// set the application type
		$internal.apptype = type;
		// pick js bundle based on provided project type + reset the
		// config js bundle
		$bundles.data.js = $jsconfigs[type];

		// remove distribution configuration if type is library
		// as the project is defaulted for a webapp project.
		if (type === "library") {
			// remove the distribution configuration
			delete $bundles.data.dist;
			// add the library configuration
			$bundles.data.lib = $jsconfigs.lib;
		} // else leave as-is for webapp project

		// set package.json properties
		$pkg.set("name", __data__.name);
		$pkg.set("version", __data__.version);
		$pkg.set("description", __data__.description);
		$pkg.set("author", format($templates.author, __data__));
		$pkg.set("repository", {
			type: "git",
			url: format($templates["repository.url"], __data__)
		});
		$pkg.set("bugs", {
			url: format($templates["bugs.url"], __data__)
		});
		$pkg.set("homepage", format($templates.homepage, __data__));
		$pkg.set("private", __data__.private);

		// sort keys
		$bundles.data = alphabetize($bundles.data);
		$pkg.data = alphabetize($pkg.data);

		// saves changes to files
		$bundles.writeSync(null, jindent);
		$pkg.write(
			function() {
				// run initialization steps
				var tasks = [
					"init:settings-internal",
					"init:settings-main",
					"init:remove-webapp-files",
					"init:add-library-files",
					"init:create-license",
					"init:fill-placeholders",
					"init:setup-readme",
					"init:rename-gulpfile",
					"init:remove-setup",
					"init:create-bundles",
					"init:pretty",
					"init:git"
				];
				// remove steps that are only for library project setup
				// when the apptype is set to webapp.
				if (__data__.apptype === "webapp") {
					tasks.splice(2, 2);
				}
				tasks.push(function() {
					var message = `Project initialized (${type})`;
					notify(message);
					log(message, "\n");
					log(
						"Run",
						chalk.green("$ gulp"),
						"to start watching project for any file changes.\n"
					);
					done();
				});
				return sequence.apply(task, tasks);
			},
			null,
			jindent
		);
	});
});

//#! steps.js -- ./gulp/setup/source/tasks/steps.js

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
			$.jsoncombine($paths.config_settings_name, function(data) {
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
gulp.task("init:create-bundles", function(done) {
	// create the CSS/JS bundles before
	cmd.get(
		`gulp js:app && gulp js:vendor && gulp css:app && gulp css:vendor`,
		function(err, data, test) {
			if (err) {
				throw err;
			}
			// all bundles made now end
			done();
		}
	);
});

// initialization step
// @internal
gulp.task("init:pretty", function(done) {
	// create the CSS/JS bundles before
	cmd.get(`gulp pretty`, function(err, data) {
		if (err) {
			throw err;
		}
		// end the task
		done();
	});
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
			function(err) {
				if (err) {
					throw err;
				}

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
								`Git initialized and configured (${
									__data__.apptype
								})`
							);
							done();
						}
					);
			}
		);
	});
});

//#! make.js -- ./gulp/setup/source/helpers/make.js

// build gulpfile.setup.js
// @internal
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
				var filename = path.basename(file.path);
				var filename_rel = path.relative(process.cwd(), file.path);
				return stream.pipe(
					$.insert.prepend(
						`//#! ${filename} -- ./${filename_rel}\n\n`
					)
				);
			}),
			$.concat($paths.gulp_file_setup),
			$.prettier($prettier),
			gulp.dest($paths.base),
			$.debug.edit()
		],
		done
	);
});
