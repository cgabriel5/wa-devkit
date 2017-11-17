/**
 * Add/remove front-end dependencies from ./node_modules/ to its JS/CSS vendor folder.
 *
 * Options
 *
 * -n, --name    <string>  The module name.
 * -t, --type    <string>  Dependency type (js/css).
 * -a, --action  <string>  Action to take (add/remove).
 *
 * Usage
 *
 * $ gulp dependency -n fastclick -t js -a add # Copy fastclick to JS vendor directory.
 * $ gulp dependency -n fastclick -t js -a remove # Remove fastclick from JS vendor directory.
 * $ gulp dependency -n font-awesome -t css -a add # Add font-awesome to CSS vendor directory.
 */
gulp.task("dependency", function(done) {
	var task = this;
	// run yargs
	var _args = yargs
		.option("name", {
			alias: "n",
			describe: "The module name.",
			type: "string"
		})
		.option("type", {
			alias: "t",
			describe: "js or css dependency?",
			choices: ["js", "css"],
			type: "string"
		})
		.option("action", {
			alias: "a",
			describe: "Add or remove dependency?",
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
			name: "action",
			type: "name",
			type: "action",
			action: "name",
			action: "type"
		})
		.option("list", {
			alias: "l",
			describe: "List vendor dependencies.",
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
			var name = dependency.match(/^(css|js)\/vendor\/(.*)\/.*$/)[2];
			log(" ".repeat(10), chalk.magenta(dependency), `(${name})`);
		};

		// get the config path for the bundles file
		var bundles_path = $paths.config_home + $paths.config_bundles + ".json";
		var header = `${bundles_path} > $.vendor.files[...]`;

		// print the dependencies
		log(chalk.green(header.replace("$", "css")));
		css_dependencies.forEach(printer);
		log(chalk.green(header.replace("$", "js")));
		js_dependencies.forEach(printer);

		return done();
	}

	// check that the module exists
	if (action === "add" && !de.sync(module_path)) {
		log("The module", chalk.magenta(`${module_path}`), "does not exist.");
		log(
			`First install by running "$ yarn add ${name} --dev". Then try adding the dependency again.`
		);
		return done();
	} else if (action === "remove" && !de.sync(delete_path)) {
		log(
			"The module",
			chalk.magenta(`${delete_path}`),
			"does not exist. Removal aborted."
		);
		return done();
	}
	// delete the old module folder
	del([delete_path]).then(function(paths) {
		var message =
			`Dependency (${name}) ` +
			(action === "add" ? "added" : "removed" + ".");
		if (action === "add") {
			// copy module to location
			pump(
				[
					gulp.src(name + $paths.del + $paths.files_all, {
						dot: true,
						cwd: $paths.node_modules,
						base: $paths.base_dot
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
					log(message);
					done();
				}
			);
		} else {
			// remove
			log(message);
			done();
		}
	});
});
