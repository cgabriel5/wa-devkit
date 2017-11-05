/**
 * Beautify all HTML, JS, CSS, and JSON project files.
 *
 * Note
 *
 * - Ignores ./node_modules/, ./git/ and vendor/ files.
 *
 * Options
 *
 * -t, --type    [string]  The optional extension types to clean.
 *
 * Usage
 *
 * $ gulp pretty # Prettify all HTML, CSS, JS, JSON files.
 * $ gulp pretty --type "js, json" # Only prettify JS and JSON files.
 */
gulp.task("pretty", function(done) {
    var task = this;
    // this task can only run when gulp is not running as gulps watchers
    // can run too many times as many files are potentially being beautified
    if (config_internal.get("pid")) { // Gulp instance exists so cleanup
        gulp_check_warn();
        return done();
    }

    // run yargs
    var _args = yargs.option("type", {
            alias: "t",
            demandOption: false,
            describe: "The file type extensions to clean.",
            type: "string"
        })
        .argv;
    // get the command line arguments from yargs
    var type = _args.t || _args.type;

    // default files to clean:
    // HTML, CSS, JS, and JSON files. exclude files containing
    // a ".min." as this is the convention used for minified files.
    // the node_modules/, .git/, and all vendor/ files are also excluded.
    var files = [
	    	__PATHS_FILES_BEAUTIFY,
	    	__PATHS_FILES_BEAUTIFY_EXCLUDE_MIN,
	    	bangify(globall(__PATHS_NODE_MODULES_NAME)),
	    	bangify(globall(__PATHS_GIT)),
    		__PATHS_NOT_VENDOR
    	];

    // reset the files array when extension types are provided
    if (type) {
        // remove all spaces from provided types string
        type = type.replace(/\s+?/g, "");

        // ...when using globs and there is only 1 file
        // type in .{js} for example, it will not work.
        // if only 1 file type is provided the {} must
        // not be present. they only seem to work when
        // multiple options are used like .{js,css,html}.
        // this is normalized below.
        if (-~type.indexOf(",")) type = "{" + type + "}";
        // finally, reset the files array
        files[0] = `**/*.${type}`;
    }

    // get needed files
    pump([gulp.src(files, {
            dot: true
        }),
		sort(opts_sort),
		// run css files through csscomb, everything else through jsbeautify
		gulpif(ext.iscss, csscomb(__PATHS_CONFIG_CSSCOMB), beautify(config_jsbeautify)),
		gulpif(ext.isjson, json_sort({
            "space": json_spaces
        })),
		eol(),
		debug.edit(),
		gulp.dest(__PATHS_BASE)
    ], done);
});
