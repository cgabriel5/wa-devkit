/**
 * The default Gulp task. As this file is the Gulp setup file this task
 *     does nothing but tell the user to run the init task before running
 *     the default task. The init task will ask questions to setup the
 *     project.
 */
gulp.task("default", function(done) {
	// Show the user the init message.
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
	 * Prints the message group name.
	 *
	 * @param  {string} message - The group message name.
	 * @return {undefined} - Nothing.
	 */
	function sep_message(message) {
		var messages = {
			initial: "Project Questions",
			author: "Author Questions",
			license: "Generate License",
			github: "GitHub Questions",
			app: "App Questions"
		};

		// Overwrite the var.
		message = messages[message];

		print.ln();
		print(chalk.green(`${message}\n`));
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

			sep_message("initial");

			return inquirer.prompt(QUESTIONS.initial).then(null, function() {
				return Promise.reject(
					"Something went wrong with the initial questions."
				);
			});
		})
		.then(function(answers) {
			// Store the answers.
			__answers.push(answers);

			sep_message("author");

			return inquirer.prompt(QUESTIONS.author).then(null, function() {
				return Promise.reject(
					"Something went wrong with the author questions."
				);
			});
		})
		.then(function(answers) {
			// Store the answers.
			__answers.push(answers);

			sep_message("license");

			return inquirer.prompt(QUESTIONS.license).then(null, function() {
				return Promise.reject(
					"Something went wrong with the license questions."
				);
			});
		})
		.then(function(answers) {
			// Store the answers.
			__answers.push(answers);

			sep_message("app");

			return inquirer.prompt(QUESTIONS.app).then(null, function() {
				return Promise.reject(
					"Something went wrong with the app questions."
				);
			});
		})
		.then(function(answers) {
			// Store the answers.
			__answers.push(answers);

			sep_message("github");

			return inquirer.prompt(QUESTIONS.github).then(null, function() {
				return Promise.reject(
					"Something went wrong with the GitHub questions."
				);
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
						// !-- The following 2 tasks are only ran
						// for library type projects. They are
						// removed for webapp projects.
						"init:--lib-remove-webapp-files",
						"init:--lib-add-library-files",
						// --!
						"init:create-license",
						"init:fill-placeholders",
						"init:setup-readme",
						"init:rename-gulpfile",
						"init:remove-setup",
						"init:create-bundles",
						"init:pretty",
						"init:git"
					];

					// Remove steps that are only for library project setup
					// when the apptype is set to webapp.
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
			print.gulp(err_message);
		});
});
