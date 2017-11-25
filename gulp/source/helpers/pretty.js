/**
 * task: pretty
 * Beautify all HTML, JS, CSS, and JSON project files.
 *
 *
 * Notes
 *
 * • By default files in the following directories or containing the
 *   following sub-extensions are ignored: ./node_modules/, ./git/,
 *   vendor/, .ig., and .min. files.
 * • Special characters in globs provided via the CLI (--glob) might
 *   need to be escaped if getting an error.
 *
 * Flags
 *
 * -t, --type
 *     [string] The file extensions types to clean.
 *
 * -g, --glob
 *     [array] Use a glob to find files to prettify.
 *
 * -s, --show
 *     [boolean] Show the used globs before prettifying.
 *
 * -e, --empty
 *     [boolean] Empty default globs array. Careful as this can prettify
 *     all project files. By default the node_modules/ is ignored, for
 *     example. Be sure to exclude files that don't need to be prettified
 *     by adding the necessary globs with the --glob option.
 *
 * -l, --line-ending
 *     [string] If provided, the file ending will get changed to provided
 *     character(s). Line endings default to LF ("\n").
 *
 * Usage
 *
 * $ gulp pretty
 *     Prettify all HTML, CSS, JS, JSON files.
 *
 * $ gulp pretty --type "js, json"
 *     Only prettify JS and JSON files.
 *
 * $ gulp pretty --glob "some/folder/*.js"
 *     Prettify default files and all JS files.
 *
 * $ gulp pretty --show
 *     Halts prettifying to show the globs to be used for prettifying.
 *
 * $ gulp pretty --empty --glob "some/folder/*.js"
 *     Flag indicating to remove default globs.
 *
 * $ gulp pretty --line-ending "\n"
 *     Make files have "\n" line-ending.
 */
gulp.task("pretty", function(done) {
	var unprefix = require("postcss-unprefix");
	var autoprefixer = require("autoprefixer");
	var perfectionist = require("perfectionist");
	var shorthand = require("postcss-merge-longhand");

	// this task can only run when gulp is not running as gulps watchers
	// can run too many times as many files are potentially being beautified
	if ($internal.get("pid")) {
		// Gulp instance exists so cleanup
		gulp_check_warn();
		return done();
	}

	// run yargs
	var _args = yargs
		.option("type", {
			alias: "t",
			demandOption: false,
			type: "string"
		})
		.option("glob", {
			alias: "g",
			demandOption: false,
			type: "array"
		})
		.option("show", {
			alias: "s",
			demandOption: false,
			type: "boolean"
		})
		.option("empty", {
			alias: "e",
			demandOption: false,
			type: "boolean"
		})
		.option("line-ending", {
			alias: "l",
			demandOption: false,
			type: "string"
		}).argv;
	// get the command line arguments from yargs
	var type = _args.t || _args.type;
	var globs = _args.g || _args.glob;
	var show = _args.s || _args.show;
	var empty = _args.e || _args.empty;
	var ending = _args.l || _args["line-ending"] || EOL_ENDING;

	// default files to clean:
	// HTML, CSS, JS, and JSON files. exclude files containing
	// a ".min." as this is the convention used for minified files.
	// the node_modules/, .git/, and all vendor/ files are also excluded.
	var files = [
		$paths.files_common,
		$paths.not_min,
		bangify(globall($paths.node_modules_name)),
		bangify(globall($paths.git)),
		$paths.not_vendor,
		$paths.not_ignore
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
		if (-~type.indexOf(",")) {
			type = "{" + type + "}";
		}
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
				base: $paths.base_dot
			}),
			$.sort(opts_sort),
			$.gulpif(ext.ishtml, $.beautify($configs.jsbeautify)),
			$.gulpif(
				function(file) {
					// file must be a JSON file and cannot contain the
					// comment (.cm.) sub-extension to be sortable as
					// comments are not allowed in JSON files.
					return ext(file, ["json"]) && !-~file.path.indexOf(".cm.")
						? true
						: false;
				},
				$.json_sort({
					space: jindent
				})
			),
			$.gulpif(function(file) {
				// exclude HTML and CSS files
				return ext(file, ["html", "css"]) ? false : true;
			}, $.prettier($configs.prettier)),
			$.gulpif(
				ext.iscss,
				$.postcss([
					unprefix(),
					shorthand(),
					autoprefixer($configs.autoprefixer),
					perfectionist($configs.perfectionist)
				])
			),
			$.eol(ending),
			$.debug.edit(),
			gulp.dest($paths.base)
		],
		done
	);
});
