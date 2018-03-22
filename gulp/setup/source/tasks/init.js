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
