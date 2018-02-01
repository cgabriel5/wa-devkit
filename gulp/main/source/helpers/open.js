/**
 * Opens provided file in browser.
 *
 * Notes
 *
 * • New tabs should be opened via the terminal using `open`. Doing
 *   so will ensure the generated tab will auto-close when Gulp is
 *   closed. Opening tabs by typing/copy-pasting the project URL
 *   into the browser address bar will not auto-close the tab(s)
 *   due to security issues as noted here:
 *   [https://stackoverflow.com/q/19761241].
 *
 * Flags
 *
 * -f, --file
 *     <file> The path of the file to open.
 *
 * -p, --port
 *     [number] The port to open in. (Defaults to browser-sync port if
 *     available or no port at all.)
 *
 * -d, --directory
 *     [string] The directory path to open in a file manager.
 *
 * -e, --editor
 *     [string] The file path to open in the user's text editor to edit.
 *
 * --wait
 *     [boolean] To be Used with the -e/--editor flag. If provided the
 *     editor will wait to close and will only close manually (i.e.
 *     close the editor or exit the terminal task).
 *
 * --line
 *     [number] To be used with -e/--editor flag. Open the file at the
 *     provided line.
 *
 * --column
 *     [number] To be used with -e/--editor flag. Open the file at the
 *     provided column.
 *
 * --use
 *     [string] To be used with -e/--editor flag. Manually set the editor
 *     to use. Will default to the user's default editor via ($EDITOR/$VISUAL)
 *     environment variables.
 *
 * Usage
 *
 * $ gulp open --file index.html --port 3000
 *     Open index.html in port 3000.
 *
 * $ gulp open --file index.html
 *     Open index.html in browser-sync port is available or no port.
 *
 * $ gulp open --editor ./index.html --wait --line 12 --column 20 --use atom
 *     Open "./index.html" using the text editor Atom if available. Set
 *     the line to 12 and column 20. Use the --wait flag to close the process
 *     after the editor is close or the process is killed via the terminal.
 *
 * $ gulp open --directory .
 *     Open the root directory in a file manager.
 *
 * $ gulp open --directory ./docs
 *     Open the docs directory in a file manager.
 *
 * $ gulp open --directory docs/subextensions.md
 *     When a file is provided along with the directory, only the directory
 *     section of the path will be used to try and open in a file manager.
 */
gulp.task("open", function(done) {
	// cache task
	var task = this;

	// run yargs
	var _args = yargs
		.option("directory", {
			alias: "d",
			type: "string"
		})
		.option("editor", {
			alias: "e",
			type: "string"
		}).argv;

	// get the command line arguments from yargs
	// Open the root when nothing provided.
	var directory = _args.d || _args.directory;
	var editor = _args.e || _args.editor;

	// If the directory flag is provided open the directory in a file
	// manager.
	if (directory) {
		// Parse the directory.
		var parts = path.parse(directory);
		if (!parts.ext) {
			// No file was passed in.
			// Reset the directory
			directory = parts.dir + "/" + parts.base + "/";
		} else {
			// If a file is passed only get the dir part.
			directory = parts.dir + "/";
		}

		// Make the path absolute and relative to the main project root.
		directory = path.join("./", directory);

		// Check that the directory exists
		if (!de.sync(directory)) {
			print.gulp.warn(
				"The directory",
				chalk.magenta(directory),
				"does not exist."
			);
			return done();
		}

		// Else the directory exists so open the file manager.
		require("opener")(directory, function() {
			done();
		});
	} else if (editor) {
		var spawn = require("child_process").spawn;

		// Check that the file exists.
		if (!fe.sync(editor)) {
			print.gulp.warn(
				"The file",
				chalk.magenta(directory),
				"does not exist."
			);
			return done();
		}

		// run yargs
		var _args = yargs
			.option("wait", {
				type: "boolean"
			})
			.option("line", {
				type: "number"
			})
			.option("column", {
				type: "number"
			})
			.option("use", {
				type: "string"
			}).argv;

		// Get the command line arguments from yargs
		var wait = _args.wait;
		var line = _args.line;
		var column = _args.column;
		var use_editor = _args.use;

		// Get the user's editor and any flags needed to open the
		// file via the terminal.
		var editor = get_editor({
			file: {
				name: editor,
				line: line,
				column: 0
			},
			editor: use_editor
		});

		// Create the child process to open the editor
		var child_process = spawn(editor.command, editor.flags, {
			stdio: "inherit",
			detached: true
		});

		// If an error occurs throw it
		child_process.on("error", function(err) {
			if (err) {
				throw err;
			}
		});

		// If the wait flag is provided make the process hold until the
		// user closes the file or the terminal process is ended manually.
		if (wait) {
			// Once the file is closed continue with the task...
			child_process.on("exit", function(code, sig) {
				done();
			});
		} else {
			// Close the process immediately.
			child_process.unref();
			return done();
		}
	} else {
		// Else open the file in a browser. What this task was originally
		// set out to do.

		// run yargs
		var _args = yargs
			.option("file", {
				alias: "f",
				demandOption: true,
				type: "string"
			})
			.option("port", {
				alias: "p",
				type: "number"
			}).argv;

		// get the command line arguments from yargs
		var file = _args.f || _args.file;
		// check for explicitly provided port...if none is provided
		// check the internally fetched free ports and get the local port
		var port =
			_args.p ||
			_args.port ||
			(
				INT_PORTS || {
					local: null
				}
			).local;

		// run the open function
		return open_file_in_browser(file, port, done, task);
	}
});
