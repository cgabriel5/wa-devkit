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
		$paths.js_options_dynamic = `gulp/setup/${type}/**/*.*`;

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
