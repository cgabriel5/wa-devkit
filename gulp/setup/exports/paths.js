"use strict";

module.exports = {
	// JS paths.
	js_home: "./${homedir}js/",
	js_source: "./${homedir}js/source/",
	js_options_dynamic: "",

	// Gulp paths.
	gulp_utils: "./${homedir}gulp/assets/utils/utils.js",
	gulp_setup: "./${homedir}gulp/setup/",
	gulp_setup_source: "./${homedir}gulp/setup/source/",
	gulp_setup_questions: "./${homedir}gulp/setup/exports/questions.js",
	gulp_setup_templates: "./${homedir}gulp/setup/exports/templates.js",
	gulp_setup_jsconfigs: "./${homedir}gulp/setup/exports/jsconfigs.js",
	gulp_setup_readme_template: "./${homedir}gulp/setup/templates/README.md",
	gulp_setup_settings_internal: "./gulp/setup/exports/internal.json",
	gulp_setup_settings_internal_name: ".__internal.json",
	gulp_setup_docs_source: "./${homedir}docs/",
	gulp_setup_docs_app: "**/*.app.*",
	gulp_setup_docs_lib: "**/*.lib.*",
	gulp_file_name: "gulpfile.js",
	gulp_file_setup: "gulpfile-setup.js",
	gulp_file_main: "gulpfile-main.js",

	// Configuration file paths.
	config_home: "./${homedir}configs/",
	config_settings_json_files: "./${homedir}configs/**/*.json",
	config_settings_name: ".__settings.json",
	config_perfectionist: "./${homedir}configs/perfectionist.json",
	config_autoprefixer: "./${homedir}configs/autoprefixer.json",
	config_jsbeautify: "./${homedir}configs/jsbeautify.json",
	config_prettier: "./${homedir}configs/prettier.json",
	config_bundles: "./${homedir}configs/bundles.json",
	config_app: "./${homedir}configs/app.cm.json",
	config_pkg: "./${homedir}package.json",

	// .git/ paths.
	git: ".git/",

	// node_modules/ paths.
	node_modules_name: "node_modules/",

	// File paths.
	files_common: "**/*.{html,css,js,json}",

	// Negative file paths (exclude files w/ following in path).
	not_min: "!**/*.min.*",
	not_vendor: "!**/vendor/**",
	not_ignore: "!**/*.ig.*",

	// Other paths.
	license: "LICENSE.txt",
	html_headmeta: "html/source/head/meta.html"
};
