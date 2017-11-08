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
			demandOption: true,
			describe: "The module name.",
			type: "string"
		})
		.option("type", {
			alias: "t",
			demandOption: true,
			describe: "js or css dependency?",
			choices: ["js", "css"],
			type: "string"
		})
		.option("action", {
			alias: "a",
			demandOption: true,
			describe: "Add or remove dependency?",
			choices: ["add", "remove"],
			type: "string"
		}).argv;
	// get the command line arguments from yargs
	var name = _args.n || _args.name;
	var type = _args.t || _args.type;
	var action = _args.a || _args.action;
	// get needed paths
	var dest = type === "js" ? __PATHS_JS_VENDOR : __PATHS_CSS_VENDOR;
	var delete_path = dest + name;
	var module_path = __PATHS_NODE_MODULES + name;
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
					gulp.src(name + __PATHS_DEL + __PATHS_ALLFILES, {
						dot: true,
						cwd: __PATHS_NODE_MODULES,
						base: __PATHS_BASE_DOT
					}),
					$.rename(function(path) {
						// [https://stackoverflow.com/a/36347297]
						// remove the node_modules/ parent folder
						var regexp = new RegExp(
							"^" + __PATHS_NODE_MODULES_NAME
						);
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
