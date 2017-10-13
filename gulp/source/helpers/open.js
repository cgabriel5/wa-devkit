/**
 * Opens provided file in browser.
 *
 * Options
 *
 * -f, --file  <file>    The path of the file to open.
 * -p, --port  [number]  The port to open in. (Defaults to browser-sync port)
 *
 * Note
 *
 * - New tabs should be opened via the terminal using `open`. Doing so will
 * ensure the generated tab will auto-close when Gulp is closed/existed. Opening
 * tabs by typing/copy-pasting the project URL into the browser address bar will
 * not auto-close the tab(s) due to security issues as noted here:
 * [https://stackoverflow.com/q/19761241].
 *
 * Usage
 *
 * $ gulp open --file index.html --port 3000 # Open index.html in port 3000.
 */
gulp.task("open", function(done) {
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
        })
        .argv;

    // get the command line arguments from yargs
    var file = _args.f || _args.file;
    // check for explicitly provided port...if none is provided
    // check the internally fetched free ports and get the local port
    var port = _args.p || _args.port || (config_internal.get("ports") || {
            "local": null
        })
        .local;

    // no ports...
    if (!port) {
        log("No ports are in use.");
        return done();
    }

    // else a port was found...use it
    return open_file_in_browser(file, port, done, task);
});
