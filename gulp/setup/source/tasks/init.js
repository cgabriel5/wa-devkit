// @internal
gulp.task("default", function(done) {
	var task = this;
	// show the user the init message
	log('Run "$ gulp init" before running Gulp\'s default command.');
	done();
});

// run the prompt to setup project
// @internal
gulp.task("init", function(done) {
	var task = this;

	prompt.start(); // start the prompt
	prompt.message = chalk.green("[question]");
	prompt.delimiter = " ";

	prompt.get(questions, function(err, result) {
		// kill prompt and show user error message
		if (err) {
			console.log(
				"\n" + time(),
				err.message === "canceled" ? chalk.red("Setup canceled.") : err
			);
			return prompt.stop();
		}

		// get user input
		__data__ = result;
		var type = __data__.apptype;

		// set the path for js option
		__PATHS_JS_OPTIONS_DYNAMIC = `gulp/setup/js/options/${type}/**/*.*`;

		// set the application type
		config_internal.set("apptype", type);
		// pick js bundle based on provided project type + reset the config js bundle
		config_gulp_bundles.data.js = jsconfigs[type];

		// remove distribution configuration if type is library
		// as the project is defaulted for a webapp project.
		if (type === "library") {
			// remove the distribution configuration
			delete config_gulp_bundles.data.dist;
			// add the library configuration
			config_gulp_bundles.data.lib = jsconfigs.lib;
		} // else leave as-is for webapp project

		// set package.json properties
		config_pkg.set("name", __data__.name);
		config_pkg.set("version", __data__.version);
		config_pkg.set("description", __data__.description);
		config_pkg.set("author", format(templates.author, __data__));
		config_pkg.set("repository", {
			type: "git",
			url: format(templates["repository.url"], __data__)
		});
		config_pkg.set("bugs", {
			url: format(templates["bugs.url"], __data__)
		});
		config_pkg.set("homepage", format(templates.homepage, __data__));
		config_pkg.set("private", __data__.private);

		// sort keys
		config_gulp_bundles.data = alphabetize(config_gulp_bundles.data);
		config_internal.data = alphabetize(config_internal.data);
		config_pkg.data = alphabetize(config_pkg.data);

		// saves changes to files
		config_gulp_bundles.write(
			function() {
				config_internal.write(
					function() {
						config_pkg.write(
							function() {
								// run initialization steps
								var tasks = [
									"init:clear-js",
									"init:pick-js-option",
									"init:fill-placeholders",
									"init:setup-readme",
									"init:rename-gulpfile",
									"init:remove-setup",
									"init:pretty",
									"init:git"
								];
								tasks.push(function() {
									var message = `Project initialized (${type})`;
									notify(message);
									log(message);
									log(
										'Run "$ gulp" to start watching project for any file changes.'
									);
									done();
								});
								return sequence.apply(task, tasks);
							},
							null,
							json_spaces
						);
					},
					null,
					json_spaces
				);
			},
			null,
			json_spaces
		);
	});
});
