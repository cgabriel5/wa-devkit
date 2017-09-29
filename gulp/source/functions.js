/**
 * @description [Opens the provided file in the user's browser.]
 * @param  {String}   filepath  [The path of the file to open.]
 * @param  {Number}   port     	[The port to open on.]
 * @param  {Function} callback  [The Gulp task callback to run.]
 * @param  {Object} task  		[The Gulp task.]
 * @return {Undefined}          [Nothing is returned.]
 */
function open_file_in_browser(filepath, port, callback, task) {
    pump([gulp.src(filepath, {
            cwd: __PATHS_BASE,
            dot: true
        }),
        open({
            app: browser,
            uri: uri({
                "appdir": APPDIR,
                "filepath": filepath,
                "port": port,
                "https": config_user.https
            })
        }),
		debug(task.__wadevkit.debug)
    ], function() {
        notify("File opened!");
        callback();
    });
}
/**
 * @description [Returns a function that handles HTML $:pre/post{file-content/$variable}
 *               injection.]
 * @param {Object} [Replacements object.]
 * @return {Function} [Replacement function.]
 */
function html_replace_fn(replacements) {
    return function(match) {
        var injection_name = match.replace(/\$\:(pre|post)\{|\}$/g, "");
        // check whether doing a file or variable injection
        if (injection_name.charAt(0) !== "$") { // file content-injection
            injection_name = __PATHS_HTML_REGEXP_SOURCE + match.replace(/\$\:(pre|post)\{|\}$/g, "");
            var extentions = ".{text,txt}";
            var filename = glob.sync(injection_name + extentions)[0];
            // if glob does not return a match then the file does not exists.
            // therefore, just return undefined.
            if (!filename) return undefined;
            // check that file exists before opening/reading...
            // return undefined when file does not exist...else return its contents
            return (!fe.sync(filename)) ? undefined : fs.readFileSync(filename)
                .toString()
                .trim();
        } else { //variable injection
            injection_name = injection_name.replace(/^\$/, "");
            // lookup its replacement
            return replacements[injection_name] || undefined;
        }
    };
}
/**
 * @description [Print that an active Gulp instance exists.]
 * @return {Undefined} 			[Nothing is returned.]
 */
function gulp_check_warn() {
    log(color("[warning]", "yellow"), "Task cannot be performed while Gulp is running. Close Gulp then try again.");
}
