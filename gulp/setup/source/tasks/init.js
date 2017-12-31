/**
 * The default Gulp task. As this file is the Gulp setup file this task
 *     does nothing but tell the user to run the init task before running
 *     the default task. The init task will ask questions to setup the
 *     project.
 */
gulp.task("default", function(done) {
	// show the user the init message
	print.gulp('Run "$ gulp init" before running Gulp\'s default command.');
	done();
});

/**
 * Ask user questions and setup the project based on the replies. The
 *     initialization steps are shown down below.
 */
gulp.task("init", function(done) {
	// cache task
	var task = this;
	var answers_ = [{}];

	print.ln();

	/**
	 * Prints the message group name.
	 *
	 * @param  {string} message - The group message name.
	 * @return {undefined} - Nothing gets returned.
	 */
	function sep_message(message) {
		var messages = {
			initial: "[Project Questions]",
			author: "[Author Questions]",
			license: "[Generate License]",
			app: "[App Questions]"
		};

		// overwrite the var
		message = messages[message];

		print.ln();
		print.gulp(chalk.green(`${message}\n`));
	}

	// not really the most ideal but to ask the setup questions in groups
	// this seems to be the way to go. questions are asked and their replies
	// are stored in the answers_ variable for later use.

	inquirer.prompt($questions.ready).then(function(answers) {
		if (answers.continue) {
			sep_message("initial");

			// ask the initial questions
			inquirer.prompt($questions.initial).then(function(answers) {
				// store the answer
				answers_.push(answers);

				sep_message("author");

				// ask the author questions
				inquirer.prompt($questions.author).then(function(answers) {
					// store the answer
					answers_.push(answers);

					sep_message("license");

					// ask the other
					inquirer.prompt($questions.license).then(function(answers) {
						// store the answer
						answers_.push(answers);

						sep_message("app");

						// ask the app questions
						inquirer
							.prompt($questions.app)
							.then(function(answers) {
								// store the answer
								answers_.push(answers);
							})
							.then(function() {
								// combine all answers
								var answers = Object.assign.apply(
									null,
									answers_
								);

								// get answers
								__data = answers;
								var type = __data.apptype;

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
								$pkg.set("name", __data.name);
								$pkg.set("version", __data.version);
								$pkg.set("description", __data.description);
								$pkg.set(
									"author",
									format($templates.author, __data)
								);
								$pkg.set("repository", {
									type: "git",
									url: format(
										$templates["repository.url"],
										__data
									)
								});
								$pkg.set("bugs", {
									url: format($templates["bugs.url"], __data)
								});
								$pkg.set(
									"homepage",
									format($templates.homepage, __data)
								);
								$pkg.set("private", __data.private);

								// sort keys
								$bundles.data = alphabetize($bundles.data);
								$pkg.data = alphabetize($pkg.data);

								// saves changes to files
								$bundles.writeSync(null, JINDENT);
								$pkg.write(
									function() {
										// run initialization steps
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
										// remove steps that are only for library project setup
										// when the apptype is set to webapp.
										if (__data.apptype === "webapp") {
											tasks = tasks.filter(function(
												task
											) {
												return !-~task.indexOf("--lib");
											});
										}
										tasks.push(function() {
											var message = `Project initialized. (${type})`;
											notify(message);
											print.gulp("");
											print.gulp(
												chalk.green("✔"),
												message
											);
											print.gulp("");
											print.gulp(
												"Run",
												chalk.green("$ gulp"),
												"to start watching project for any file changes."
											);
											print.gulp("");

											done();
										});
										return sequence.apply(task, tasks);
									},
									null,
									JINDENT
								);
							});
					});
				});
			});
		} else {
			print.ln();
			return print.gulp(chalk.red("Project setup canceled."));
		}
	});
});
