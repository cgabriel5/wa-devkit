"use strict";

module.exports = [
	{
		type: "list",
		name: "apptype",
		message: "Setting up a:",
		choices: ["webapp", "library"],
		default: "webapp"
	},
	{
		type: "input",
		name: "name",
		message: "Project name:",
		default: "my-app"
	},
	{
		type: "confirm",
		name: "same_name",
		message: "Use project name for repo name?"
	},
	{
		type: "input",
		name: "repo_name",
		message: "Repository name:",
		default: "my-app",
		when: function(answers) {
			// only show this question when wanting to use
			// a different name than the project name.
			return !answers.same_name;
		}
	},
	{
		type: "input",
		name: "version",
		message: "Start version at:",
		default: "0.0.1"
	},
	{
		type: "input",
		name: "description",
		message: "Application description:",
		default: "The next big thing."
	},
	{
		type: "input",
		name: "fullname",
		message: "Your fullname:",
		default: "John Doe"
	},
	{
		type: "input",
		name: "email",
		message: "Your email:",
		default: "johndoe@example.com"
	},
	{
		type: "input",
		name: "git_id",
		message: "Your GitHub username:",
		default: "johndoe23"
	},
	{
		type: "confirm",
		name: "private",
		message: "Keep repo private:",
		default: true
	},
	{
		type: "list",
		name: "license",
		message: "Use (license):",
		choices: [
			"AGPL",
			"APACHE",
			"ARTISTIC",
			"BSD-3-CLAUSE",
			"BSD",
			"CC0",
			"ECLIPSE",
			"GPL-V2",
			"GPL-V3",
			"LGPL-V2.1",
			"LGPL-V3",
			"MIT",
			"MOZILLA",
			"NO-LICENSE",
			"UNLICENSE",
			"WTFPL"
		],
		default: "MIT",
		filter: function(license) {
			return license.toLowerCase();
		}
	},
	{
		type: "input",
		name: "year",
		message: "License year:",
		default: new Date().getFullYear()
	}
];
