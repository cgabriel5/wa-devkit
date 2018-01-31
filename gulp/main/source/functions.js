/**
 * Opens the provided file in the user's browser.
 *
 * @param {string} filepath - The path of the file to open.
 * @param {number} port - The port to open on.
 * @param {function} callback - The Gulp task callback to run.
 * @return {undefined} - Nothing.
 */
function open_file_in_browser(filepath, port, callback) {
	pump(
		[
			gulp.src(filepath, {
				cwd: $paths.basedir,
				dot: true
			}),
			$.open({
				app: browser,
				uri: uri({
					appdir: APPDIR,
					filepath: filepath,
					port: port,
					https: HTTPS
				})
			}),
			$.debug({ loader: false })
		],
		function() {
			notify("File opened!");
			callback();
		}
	);
}

function get_editor(options) {
	// Default options
	options = options || {};

	// Use the provided editor or get the environment variables
	var editor = options.editor || process.env.EDITOR || process.env.VISUAL;

	// Default to the tried and true editors when nothing is found.
	if (!editor) editor = /^win/.test(process.platform) ? "notepad" : "vim";

	// Lowercase everything
	editor = editor.toLowerCase();

	// If nothing is found check the check the Git config??

	// If an editor is found in an environment variable it will
	// simply be a command followed by a flag(s). For example,
	// this it could be something like this: "subl -w -n". "subl"
	// being the editor command and "-w -n" the flags to use.

	// Get any flags.
	var flags = [];
	if (options.flags) {
		// Add the provided flags to the flags array.
		flags = flags.concat(options.flags);
	}

	// Now get any flags found in the editor string
	var parts = editor.split(/\s+/);
	// Flags exist.
	if (parts.length > 1) {
		// Reset the editor variable and remove the editor from the
		// parts array.
		editor = parts.shift();
		// Add all the flags to the flags array.
		flags = flags.concat(parts);
	} // Else there only exists an editor in the string

	// Add other needed flags to make this work...
	// Code lifted and modified from here:
	// [https://github.com/sindresorhus/open-editor]

	// Get the file parts
	var file = options.file;
	var name = file.name;
	var line = file.line || 1;
	var column = file.column || 1;

	// Visual Studio Code needs a flag to open file at line number/column.
	if (-~["code"].indexOf(editor)) {
		flags.push("--goto");
	}

	// Add needed flags depending on the editor being used.
	if (-~["atom", "code"].indexOf(editor) || /^subl/.test(editor)) {
		// Open in a new window and wait for the file to close.
		flags.push("--new-window", "--wait", `${name}:${line}:${column}`);
	} else if (editor === "gedit") {
		// gedit --new-window --wait ./configs/bundles.json +135:1
		flags.push("--new-window", "--wait", name, `+${line}:${column}`);
	} else if (-~["webstorm", "intellij"].indexOf(editor)) {
		flags.push(`${name}:${line}`);
	} else if (editor === "textmate") {
		flags.push("--line", `${line}:${column}`, name);
	} else if (-~["vim", "neovim"].indexOf(editor)) {
		flags.push(`+call cursor(${line}, ${column})`, name);
	} else {
		// Default to pushing the file only
		flags.push(name);
	}

	// Return the editor command with the flags to apply.
	return {
		command: editor,
		flags: flags
	};
}

/**
 * Build the config file path with the provided file name.
 *
 * @param  {string} name - The name of the config file.
 * @return {string} - The built file path.
 */
function get_config_file(name) {
	return `${$paths.config_home}${name}.json`;
}
