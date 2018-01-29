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
	// run yargs
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
		// name, type, and action must all be provided when one is provided
		.implies({
			name: "type",
			type: "action",
			action: "name"
		})
		.option("list", {
			alias: "l",
			type: "boolean"
		}).argv;
	// get the command line arguments from yargs
	var name = _args.n || _args.name;
	var type = _args.t || _args.type;
	var action = _args.a || _args.action;
	var list = _args.l || _args.list;

	// get needed paths
	var dest = type === "js" ? $paths.js_vendor : $paths.css_vendor;
	var delete_path = dest + name;
	var module_path = $paths.node_modules + name;

	// print used vendor dependencies if flag provided
	if (list) {
		// get the vendor dependencies
		var css_dependencies = bundle_css.vendor.files;
		var js_dependencies = bundle_js.vendor.files;

		// printer function
		var printer = function(dependency) {
			// get the name of the folder.
			var name = dependency.match(/^(css|js)\/vendor\/(.*)\/.*$/);
			// when folder name is not present leave the name empty.
			name = name ? `(${name[2]})` : "";

			print.gulp(" ".repeat(10), chalk.magenta(dependency), name);
		};

		// get the config path for the bundles file
		var bundles_path = get_config_file($paths.config_$bundles);
		var header = `${bundles_path} > $.vendor.files[...]`;

		// print the dependencies
		print.gulp(chalk.green(header.replace("$", "css")));
		css_dependencies.forEach(printer);
		print.gulp(chalk.green(header.replace("$", "js")));
		js_dependencies.forEach(printer);

		return done();
	}

	// check that the module exists
	if (action === "add" && !de.sync(module_path)) {
		print.gulp(
			"The module",
			chalk.magenta(`${module_path}`),
			"does not exist."
		);
		print.gulp(
			`First install by running "$ yarn add ${name} --dev". Then try adding the dependency again.`
		);
		return done();
	} else if (action === "remove" && !de.sync(delete_path)) {
		print.gulp(
			"The module",
			chalk.magenta(`${delete_path}`),
			"does not exist. Removal aborted."
		);
		return done();
	}
	// delete the old module folder
	del([delete_path]).then(function() {
		var message =
			`Dependency (${name}) ` +
			(action === "add" ? "added" : "removed" + ".");
		if (action === "add") {
			// copy module to location
			pump(
				[
					gulp.src(name + $paths.delimiter + $paths.files_all, {
						dot: true,
						cwd: $paths.node_modules,
						base: $paths.dot
					}),
					$.rename(function(path) {
						// [https://stackoverflow.com/a/36347297]
						// remove the node_modules/ parent folder
						var regexp = new RegExp("^" + $paths.node_modules_name);
						path.dirname = path.dirname.replace(regexp, "");
					}),
					gulp.dest(dest),
					$.debug.edit()
				],
				function() {
					print.gulp(message);
					done();
				}
			);
		} else {
			// remove
			print.gulp(message);
			done();
		}
	});
});
