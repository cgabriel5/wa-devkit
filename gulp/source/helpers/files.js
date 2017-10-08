/**
 * List project files.
 *
 * Options
 *
 * -t, --types    [string]  The optional extensions of files to list.
 * -m, --min      [string]  Flag indicating whether to show .min. files.
 * -w, --whereis  [string]  File to look for. (Uses fuzzy search, Ignores ./node_modules/)
 *
 * Usage
 *
 * $ gulp files # Default shows all files excluding files in ./node_modules/ & .git/.
 * $ gulp files --type "js html" # Only list HTML and JS files.
 * $ gulp files --type "js" --whereis "jquery" # List JS files with jquery in basename.
 * $ gulp files --whereis "fastclick.js" # Lists files containing fastclick.js in basename.
 */
gulp.task("files", function(done) {
    // run yargs
    var _args = yargs.usage("Usage: $0 --type [string]")
        .option("type", {
            alias: "t",
            demandOption: false,
            type: "string"
        })
        .option("min", {
            alias: "m",
            demandOption: false,
            type: "boolean"
        })
        .option("whereis", {
            alias: "w",
            demandOption: false,
            type: "string"
        })
        .argv;

    // get the command line arguments from yargs
    var types = (_args.t || _args.type);
    var min = (_args.m || _args.min);
    var whereis = (_args.w || _args.whereis);
    // turn to an array when present
    if (types) types = types.split(/\s+/);

    // where files will be contained
    var files = [];

    // get all project files
    dir.files(__dirname, function(err, paths) {
        if (err) throw err;

        loop1: for (var i = 0, l = paths.length; i < l; i++) {
            var filepath = paths[i];

            // skip .git/, node_modules/
            var ignores = [__PATHS_NODE_MODULES_NAME, __PATHS_GIT];
            for (var j = 0, ll = ignores.length; j < ll; j++) {
                var ignore = ignores[j];
                if (-~filepath.indexOf(ignore)) continue loop1;
            }
            // add to files array
            files.push(filepath);
        }

        // filter the files based on their file extensions
        // when the type argument is provided
        if (types) {
            files = files.filter(function(filepath) {
                return (-~types.indexOf(path.extname(filepath)
                    .toLowerCase()
                    .slice(1)));
            });
        }

        // filter the files based on their whether its a minified (.min.) file
        if (min) {
            files = files.filter(function(filepath) {
                return (-~path.basename(filepath)
                    .indexOf(".min."));
            });
        }

        // if whereis parameter is provided run a fuzzy search on files
        if (whereis) {
            var fuzzy_results = fuzzy.filter(whereis, files, {});
            // turn into an array
            var results = [];
            fuzzy_results.forEach(function(result) {
                results.push(result.string);
            });
            // reset var
            files = results;
        }

        // log files
        pump([gulp.src(files),
			sort(opts_sort),
			debug()
	    ], done);

    });
});
