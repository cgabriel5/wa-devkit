/**
 * Beautify all HTML, JS, CSS, and JSON project files.
 *
 * Flags
 *
 * --filename
 *     <string> The file name of the new module file.
 *
 * --remove
 *     [string] The file name of the module to remove.
 *
 * --modname
 *     [string] The name of the module within the app. Defaults to the
 *     filename without the extension.
 *
 * --description
 *     [string] Optional description of the module.
 *
 * --mode
 *     [string] The mode the module should load via. (interactive/complete)
 *
 * --same
 *     [boolean] Flag indicating whether to use the same filename for the
 *     modname.
 *
 * Usage
 *
 * $ gulp module --filename "my_module" --same --mode "complete"
 *     Make a module "new_module.js". The extension will be added it not
 *     provided. The same file name will be used for the modname. It will
 *     also load when the document readyState hits complete.
 *
 * $ gulp module --filename "test" --same --description "My cool module."
 *     Make a module "test.js" with a description of "My cool module."
 *
 * $ gulp module --filename "my_cool_module"
 *     Simplest way to make a module. This will make a module with the name
 *     "my_cool_module.js". Have the name of "my_cool_module", load on
 *     "complete", and have an empty description.
 *
 * $ gulp module --filename "my_cool_module" --modname "coolModule"
 *     This will make a module with the name "my_cool_module.js". Have the
 *     name of "coolModule", load on "complete", and have an empty
 *     description.
 *
 * $ gulp module --remove "my_cool_module.js"
 *     This will remove the module "my_cool_module.js".
 */
gulp.task("module", function(done) {
	var linenumber = require("linenumber");

	// run yargs
	var _args = yargs.option("remove", {
		type: "string"
	}).argv;

	// get the command line arguments from yargs
	var remove = _args.remove;

	// Get the config file.
	var config_file = get_config_file($paths.config_$bundles);

	// Remove the module when the remove flag is provided.
	if (remove) {
		// Check for a file extension.
		var ext = extension({ path: remove });

		// If no extension make sure to add the extension
		if (!ext) {
			remove += ".js";
		}

		// Path to the config file.
		var file = path.join($paths.js_source_modules, remove);

		// Before anything is done make sure to check that the name
		// is not already taken by another file. We don't want to
		// overwrite an existing file.
		if (!fe.sync(file)) {
			print.gulp(
				chalk.magenta(remove),
				chalk.yellow("does not exist. Task was aborted.")
			);
			return done();
		}

		pump(
			[gulp.src(file, opts_remove), $.debug.clean(), $.clean()],
			function() {
				// Get the line number where the config array exists.
				// Looking for the js.source.files.
				var line = (linenumber(
					config_file,
					/\s"js":\s+\{\n\s+"source":\s+\{\n\s+"files":\s+\[/gim
				) || [{ line: 0 }])[0].line;

				cmd.get(
					`gulp --gulpfile ${GULPFILE} open -e ${config_file} --line ${line} --wait`,
					function(err, data) {
						if (err) {
							throw err;
						}

						// Update the js:app bundle.
						return sequence("js:app", function() {
							done();
						});
					}
				);
			}
		);
	} else {
		// run yargs
		var _args = yargs
			.option("filename", {
				type: "string",
				demandOption: true
			})
			.option("modname", {
				type: "string"
			})
			.option("description", {
				default: "",
				type: "string"
			})
			.option("mode", {
				choices: ["interactive", "complete"],
				default: "complete",
				type: "string",
				demandOption: true
			})
			.option("same", {
				type: "boolean"
			}).argv;

		// get the command line arguments from yargs
		var filename = _args.filename;
		var modname = _args.modname;
		var description = _args.description;
		var mode = _args.mode;
		var same = _args.same;
		var ending = _args["line-ending"] || EOL_ENDING;

		// Get the basename from the filename.
		var ext = path.extname(filename);

		// When no extension is found reset it and the file name
		if (!ext) {
			ext = ".js";
			filename = filename + ext;
		}

		// If the same flag is provided this means to use the same filename
		// for the name flag as well. Also, if no name is provided use the
		// filename without the extension as the name.
		if (same || !modname) {
			// Get the filename without the extension.
			modname = path.basename(filename, ext);
		}

		// The content template string for a module.
		var content = `app.module(
	"${modname}",
	function(modules, name) {
		// App logic...
	},
	"${mode}",
	"${description}"
);`;

		// Path to the config file.
		var file = path.join($paths.js_source_modules, filename);

		// Before anything is done make sure to check that the name
		// is not already taken by another file. We don't want to
		// overwrite an existing file.
		if (fe.sync(file)) {
			print.gulp(
				chalk.magenta(modname),
				chalk.yellow("exists. Use another file name. Task was aborted.")
			);
			return done();
		}

		pump(
			[
				// Create the file via gulp-file and use is at the Gulp.src.
				$.file(file, content, {
					src: true
				}),
				$.debug.edit(),
				gulp.dest($paths.basedir)
			],
			function() {
				// Get the line number where the config array exists.
				// Looking for the js.source.files.
				var line = (linenumber(
					config_file,
					/\s"js":\s+\{\n\s+"source":\s+\{\n\s+"files":\s+\[/gim
				) || [{ line: 0 }])[0].line;

				cmd.get(
					`gulp --gulpfile ${GULPFILE} open -e ${config_file} --line ${line} --wait`,
					function(err, data) {
						if (err) {
							throw err;
						}

						// Update the js:app bundle.
						return sequence("js:app", function() {
							done();
						});
					}
				);
			}
		);
	}
});
