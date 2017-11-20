/**
 * task: open
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
 * -p, --port
 *     [number] The port to open in. (Defaults to browser-sync port if
 *     available or no port at all.)
 *
 * Usage
 *
 * $ gulp open --file index.html --port 3000
 *     Open index.html in port 3000.
 * $ gulp open --file index.html
 *     Open index.html in browser-sync port is available or no port.
 */
gulp.task("open", function(done) {
	// cache task
	var task = this;

	// run yargs
	var _args = yargs
		.option("file", {
			alias: "f",
			demandOption: true,
			describe: "The file to open.",
			type: "string"
		})
		.option("port", {
			alias: "p",
			demandOption: false,
			describe: "The port to open browser in.",
			type: "number"
		}).argv;

	// get the command line arguments from yargs
	var file = _args.f || _args.file;
	// check for explicitly provided port...if none is provided
	// check the internally fetched free ports and get the local port
	var port =
		_args.p ||
		_args.port ||
		($internal.get("ports") || {
			local: null
		}).local;

	// run the open function
	return open_file_in_browser(file, port, done, task);
});
