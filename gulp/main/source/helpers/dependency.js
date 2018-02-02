/**
 * Add/remove front-end dependencies.
 *
 * Notes
 *
 * • Dependencies are grabbed from ./node_modules/<name> and moved
 *   to its corresponding ./<type>/vendor/ folder.
 * • name, type, and action options are grouped. This means when one
 *   is used they must all be provided.
 *
 * Flags
 *
 * -n, --name
 *     <string>  The module name.
 *
 * -t, --type
 *     <string>  Dependency type (js/css).
 *
 * -a, --action
 *     <string>  Action to take (add/remove).
 *
 * -l, --list
 *     <boolean> Print all CSS/JS dependencies.
 *
 * Usage
 *
 * $ gulp dependency --name fastclick --type js --action add
 *     Copy fastclick to JS vendor directory.
 *
 * $ gulp dependency --name fastclick --type js --action remove
 *     Remove fastclick from JS vendor directory.
 *
 * $ gulp dependency --name font-awesome --type css --action add
 *     Add font-awesome to CSS vendor directory.
 *
 * $ gulp dependency --list
 *     Show all CSS/JS dependencies.
 */
gulp.task("dependency", function(done) {
	// Run yargs.
	var _args = yargs
		.option("name", {
			alias: "n",
			type: "string"
		})
		.option("type", {
			alias: "t",
			choices: ["js", "css"],
			type: "string"
		})
		.option("action", {
			alias: "a",
			choices: ["add", "remove"],
			type: "string"
		})
		.group(
			["name", "type", "action"],
			"Options: Vendor dependency information (all required when any is provided)"
		)
		// Name, type, and action must all be provided when one is provided.
		.implies({
			name: "type",
			type: "action",
			action: "name"
		})
		.option("list", {
			alias: "l",
			type: "boolean"
		}).argv;
	// Get the command line arguments from yargs.
	var name = _args.n || _args.name;
	var type = _args.t || _args.type;
	var action = _args.a || _args.action;
	var list = _args.l || _args.list;

	// Get needed paths.
	var dest = type === "js" ? $paths.js_vendor : $paths.css_vendor;
	var delete_path = dest + name;
	var module_path = $paths.node_modules + name;

	// Print used vendor dependencies if flag provided.
	if (list) {
		// Get the vendor dependencies.
		var css_dependencies = bundle_css.vendor.files;
		var js_dependencies = bundle_js.vendor.files;

		print.ln();
		print(chalk.underline("Dependencies"));

		// Printer function.
		var printer = function(dependency) {
			// Get the name of the folder.
			var name = dependency.match(/^(css|js)\/vendor\/(.*)\/.*$/);
			// When folder name is not present leave the name empty.
			name = name ? `(${name[2]})` : "";

			print(`    ${chalk.magenta(dependency)} ${name}`);
		};

		// Get the config path for the bundles file.
		var bundles_path = get_config_file($paths.config_$bundles);
		var header = `${bundles_path} > $.vendor.files[...]`;

		// Print the dependencies.
		print(" ", chalk.green(header.replace("$", "css")));
		css_dependencies.forEach(printer);
		print(" ", chalk.green(header.replace("$", "js")));
		js_dependencies.forEach(printer);

		print.ln();

		return done();
	}

	// Check that the module exists.
	if (action === "add" && !de.sync(module_path)) {
		print.gulp.warn(
			"The module",
			chalk.magenta(module_path),
			"does not exist."
		);
		print.gulp.info(
			`Install the dependency by running: $ yarn add ${name} --dev. Then try again.`
		);
		return done();
	} else if (action === "remove" && !de.sync(delete_path)) {
		print.gulp.warn(
			"The module",
			chalk.magenta(delete_path),
			"does not exist."
		);
		return done();
	}
	// Delete the old module folder.
	del([delete_path]).then(function() {
		var message =
			`Dependency (${name}) ` +
			(action === "add" ? "added" : "removed" + ".");
		if (action === "add") {
			// Copy module to location.
			pump(
				[
					gulp.src(name + $paths.delimiter + $paths.files_all, {
						dot: true,
						cwd: $paths.node_modules,
						base: $paths.dot
					}),
					$.rename(function(path) {
						// Remove the node_modules/ parent folder.
						// [https://stackoverflow.com/a/36347297]
						var regexp = new RegExp("^" + $paths.node_modules_name);
						path.dirname = path.dirname.replace(regexp, "");
					}),
					gulp.dest(dest),
					$.debug.edit()
				],
				function() {
					print.gulp.success(message);
					done();
				}
			);
		} else {
			// Remove.
			print.gulp.success(message);
			done();
		}
	});
});
