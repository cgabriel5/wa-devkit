/**
 * Beautify all HTML, JS, CSS, and JSON project files.
 *
 * Options
 *
 * -t, --type     [string]   The optional extension types to clean.
 * -g, --glob     [array]    Use glob to find files to prettify.
 * -s, --show     [boolean]  Show the used globs before prettifying.
 * -e, --empty    [boolean]  Empty default globs array. Careful as this can prettify
 *                           all project files. By default the node_modules/ is ignored,
 *                           for example. Be sure to exclude files that don't need to be
 *                           prettified.
 *
 * Notes
 *
 * • By default files in the following directories or containing the following
 *          sub-extensions are ignored: ./node_modules/, ./git/, vendor/, .ig.,
 *          and .min. files.
 * • Special characters in globs provided via the CLI (--glob) might need to be
 *          escaped if getting an error.
 *
 * Usage
 *
 * $ gulp pretty # Prettify all HTML, CSS, JS, JSON files.
 * $ gulp pretty --type "js, json" # Only prettify JS and JSON files.
 * $ gulp pretty --glob "**\/*.js" # Prettify default files and all JS files.
 * $ gulp pretty --show # Halts prettifying to show the globs to be used for prettifying.
 * $ gulp pretty --empty --glob "**\/*.js" # Flag indicating to remove default globs.
 */
gulp.task("pretty", function(done) {
	var unprefix = require("postcss-unprefix");
	var autoprefixer = require("autoprefixer");
	var perfectionist = require("perfectionist");
	var shorthand = require("postcss-merge-longhand");

	var task = this;
	// this task can only run when gulp is not running as gulps watchers
	// can run too many times as many files are potentially being beautified
	if (config_internal.get("pid")) {
		// Gulp instance exists so cleanup
		gulp_check_warn();
		return done();
	}

	// run yargs
	var _args = yargs
		.option("type", {
			alias: "t",
			demandOption: false,
			describe: "The file type extensions to clean.",
			type: "string"
		})
		.option("glob", {
			alias: "g",
			demandOption: false,
			describe: "Use glob to find files to prettify.",
			type: "array"
		})
		.option("show", {
			alias: "s",
			demandOption: false,
			describe: "Show the used globs before prettifying.",
			type: "boolean"
		})
		.option("empty", {
			alias: "e",
			demandOption: false,
			describe: "Empty default globs array.",
			type: "boolean"
		}).argv;
	// get the command line arguments from yargs
	var type = _args.t || _args.type;
	var globs = _args.g || _args.glob;
	var show = _args.s || _args.show;
	var empty = _args.e || _args.empty;

	// default files to clean:
	// HTML, CSS, JS, and JSON files. exclude files containing
	// a ".min." as this is the convention used for minified files.
	// the node_modules/, .git/, and all vendor/ files are also excluded.
	var files = [
		__paths__.files_beautify,
		__paths__.files_beautify_exclude_min,
		bangify(globall(__paths__.node_modules_name)),
		bangify(globall(__paths__.git)),
		__paths__.not_vendor,
		__paths__.not_ignore
	];

	// empty the files array?
	if (empty) {
		files.length = 0;
	}

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

	if (globs) {
		// only do changes when the type flag is not provided
		// therefore, in other words, respect the type flag.
		if (!type) {
			files.shift();
		}

		// add the globs
		globs.forEach(function(glob) {
			files.push(glob);
		});
	}

	if (show) {
		log(chalk.green("Using globs:"));
		var prefix = " ".repeat(10);
		files.forEach(function(glob) {
			log(prefix, chalk.blue(glob));
		});
		return done();
	}

	// get needed files
	pump(
		[
			gulp.src(files, {
				dot: true,
				base: __paths__.base_dot
			}),
			$.sort(opts_sort),
			$.gulpif(ext.ishtml, $.beautify(config_jsbeautify)),
			$.gulpif(
				function(file) {
					// file must be a JSON file and cannot contain the comment (.cm.) sub-extension
					// to be sortable as comments are not allowed in JSON files.
					return ext(file, ["json"]) && !-~file.path.indexOf(".cm.")
						? true
						: false;
				},
				$.json_sort({
					space: json_spaces
				})
			),
			$.gulpif(function(file) {
				// exclude HTML and CSS files
				return ext(file, ["html", "css"]) ? false : true;
			}, $.prettier(config_prettier)),
			$.gulpif(
				ext.iscss,
				$.postcss([
					unprefix(),
					shorthand(),
					autoprefixer(opts_ap),
					perfectionist(config_perfectionist)
				])
			),
			$.eol(),
			$.debug.edit(),
			gulp.dest(__paths__.base)
		],
		done
	);
});
