/**
 * Converts MarkDown (.md) file to its HTML counterpart (with GitHub style/layout).
 *
 * Options
 *
 * -i, --input   <string>  Path of file to convert (Markdown => HTML).
 * -o, --output  <string>  Path where converted HTML file should be placed.
 * -n, --name    [string]  New name of converted file.
 *
 * Usage
 *
 * $ gulp tohtml --input README.md --output /markdown/preview --name Converted.html.
 * # Convert README.md to Converted.html and place in /markdown/preview.
 */
gulp.task("tohtml", function(done) {
    var task = this;
    // run yargs
    var _args = yargs.usage("Usage: $0 --input [string] --output [string] --name [string]")
        .option("input", {
            alias: "i",
            demandOption: true,
            describe: "Path of file to convert (Markdown => HTML).",
            type: "string"
        })
        .option("output", {
            alias: "o",
            demandOption: true,
            describe: "Path where converted HTML file should be placed.",
            type: "string"
        })
        .option("name", {
            alias: "n",
            demandOption: false,
            describe: "New name of converted file.",
            type: "string"
        })
        .argv;
    // get provided parameters
    var input = _args.i || _args.input;
    var output = _args.o || _args.output;
    var new_name = _args.n || _args.name;
    // file has to exist
    fe(input, function(err, exists) {
        if (!exists) {
            log("File does not exist.");
            return done();
        }
        // continue...file exists
        // check for an .md file
        var input_ext = path.extname(input);
        // file must be an .md file
        if (input_ext.toLowerCase() !== ".md") {
            log("Input file must be an .md file.");
            return done();
        }
        // get the input file name
        var input_filename = path.basename(input, input_ext);
        // get the new file name, default to input_filename when nothing is given
        new_name = (!new_name) ? undefined : path.basename(new_name, path.extname(new_name));
        // render Markdown to HTML
        mds.render(mds.resolveArgs({
            input: path.join(__PATHS_CWD, input),
            output: path.join(__PATHS_CWD, output),
            layout: path.join(__PATHS_CWD, __PATHS_MARKDOWN_SOURCE)
        }), function() {
            var new_file_path = output + "/" + input_filename + ".html";
            // cleanup README.html
            pump([gulp.src(new_file_path, {
                    cwd: __PATHS_BASE
                }),
				beautify(config_jsbeautify),
				// if a new name was provided, rename the file
				gulpif(new_name !== undefined, rename(new_name + ".html")),
				gulp.dest(output),
				debug(task.__wadevkit.debug)
			], function() {
                // if a new name was provided delete the file with the old input file
                if (new_name) del([new_file_path]);
                done();
            });
        });
    });
});
