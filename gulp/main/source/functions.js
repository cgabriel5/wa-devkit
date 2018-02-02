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

/**
 * Determine the user's default text editor.
 *
 * @param  {object} options - Options object.
 * @return {object} - Object containing the user's editor and CLI flags
 */
function get_editor(options) {
	// Default options.
	options = options || {};

	// Use the provided editor or get the environment variables.
	var editor = options.editor || process.env.EDITOR || process.env.VISUAL;

	// Default to the tried and true editors when nothing is found.
	if (!editor) editor = /^win/.test(process.platform) ? "notepad" : "vim";

	// Lowercase everything.
	editor = editor.toLowerCase();

	// If nothing is found should we check the check the Git config??

	// If an editor is found in an environment variable it will simply
	// be a command followed by a flag(s). For example, it could be
	// something like this: "subl -w -n". "subl" being the editor command
	// and "-w -n" the flags to use.

	// Editor flags will be stored here.
	var flags = [];

	// When flags are provided via the options object join them.
	if (options.flags) {
		// Add the provided flags to the flags array.
		flags = flags.concat(options.flags);
	}

	// Now get any flags found in the editor string.
	var parts = editor.split(/\s+/);

	// Since the editor is the first item in the array there must be at
	// least 1 item. Check for any flags present in the string.
	if (parts.length > 1) {
		// Reset variable and remove the editor from the parts array.
		editor = parts.shift();
		// Add all the flags to the flags array.
		flags = flags.concat(parts);
	} // Else there only exists an editor in the string.

	// Add other needed flags to make this work...
	// Code lifted and modified from here:
	// [https://github.com/sindresorhus/open-editor]

	// Get the file parts.
	var file = options.file;
	var name = file.name;
	var line = file.line || 1;
	var column = file.column || 1;

	// Visual Studio Code needs a flag to open file at line number/column.
	// [https://code.visualstudio.com/docs/editor/command-line#_core-cli-options]
	if (-~["code"].indexOf(editor)) {
		flags.push("--goto");
	}

	// Add needed flags depending on the editor being used.
	if (-~["atom", "code"].indexOf(editor) || /^subl/.test(editor)) {
		// Open in a new window and wait for the file to close.
		// Format: editor --FLAGS... <FILE>[:LINE][:COLUMN]
		flags.push("--new-window", "--wait", `${name}:${line}:${column}`);
	} else if (editor === "gedit") {
		// Format: editor --FLAGS... <FILE> +[LINE][:COLUMN]
		flags.push("--new-window", "--wait", name, `+${line}:${column}`);
	} else if (-~["webstorm", "intellij"].indexOf(editor)) {
		// Format: editor <FILE>[:LINE]
		flags.push(`${name}:${line}`);
	} else if (editor === "textmate") {
		// Format: editor --line [LINE][:COLUMN] <FILE>
		flags.push("--line", `${line}:${column}`, name);
	} else if (-~["vim", "neovim"].indexOf(editor)) {
		// Format: editor +call cursor([LINE], [COLUMN]) <FILE>
		flags.push(`+call cursor(${line}, ${column})`, name);
	} else {
		// If the editor is none of the above only pass in the file name.
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
