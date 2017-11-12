"use strict";

module.exports = [
	{
		type: "list",
		name: "apptype",
		message: "Setup project as a webapp or library?",
		choices: ["webapp", "library"],
		default: "webapp"
	},
	{
		type: "input",
		name: "name",
		message: "What's the name of your application?",
		default: "my-app"
	},
	{
		type: "input",
		name: "version",
		message: "Start project version at?",
		default: "0.0.1"
	},
	{
		type: "input",
		name: "description",
		message: "Describe your application.",
		default: "The next big thing."
	},
	{
		type: "input",
		name: "fullname",
		message: "Author fullname?",
		default: "John Doe"
	},
	{
		type: "input",
		name: "email",
		message: "What's your email?",
		default: "johndoe@example.com"
	},
	{
		type: "input",
		name: "git_id",
		message: "What's your GitHub username?",
		default: "johndoe23"
	},
	{
		type: "input",
		name: "repo_name",
		message: "What's the name of the repository?",
		default: "my-app"
	},
	{
		type: "input",
		name: "private",
		message: "Should this project be kept private?",
		choices: ["Yes", "No"],
		default: "yes"
	},
	{
		type: "input",
		name: "year",
		message: "The project license year?",
		default: new Date().getFullYear()
	}
];
