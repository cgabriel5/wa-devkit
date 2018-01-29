/**
 * Variable is declared outside of tasks to be able to use it in
 *     multiple tasks. The variable is populated in the pretty:gitfiles
 *     task and used in the pretty task.
 */
var __modified_git_files;

/**
 * Gets the modified files via Git.
 *
 * Flags
 *
 * --quick
 *     [boolean] Only prettify the git modified files.
 *
 * --staged
 *     [boolean] Used with the --quick flag it only prettifies the staged
 *     files.
 *
 * @internal - Used to prepare the pretty task.
 */
gulp.task("pretty:gitfiles", function(done) {
	// get the changed files according to git if the quick/staged flags

	// run yargs
	var _args = yargs
		.option("quick", {
			type: "boolean"
		})
		.option("staged", {
			type: "boolean"
		}).argv;

	// get the command line arguments from yargs
	var quick = _args.quick;
	var staged = _args.staged;

	// the flags must be present to get the modified files...else
	// skip to the main pretty task
	if (!(quick || staged)) return done();

	// reset the variable when the staged flag is provided
	staged = staged ? "--cached" : "";

	// diff filter [https://stackoverflow.com/a/6879568]
	// example plugin [https://github.com/azz/pretty-quick]

	// the command to run
	var command = `git diff --name-only --diff-filter="ACMRTUB" ${staged}`;

	// get the list of modified files
	cmd.get(command, function(err, data, stderr) {
		// clean the data
		data = data.trim();

		// set the variable. if the data is empty there are no
		// files to prettify so return an empty array.
		__modified_git_files = data ? data.split("\n") : [];

		return done();
	});
});

/**
 * Beautify all HTML, JS, CSS, and JSON project files.
 *
 * Notes
 *
 * • By default files in the following directories or containing the
 *   following sub-extensions are ignored: ./node_modules/, ./git/,
 *   vendor/, .ig., and .min. files.
 * • Special characters in globs provided via the CLI (--pattern) might
 *   need to be escaped if getting an error.
 *
 * Flags
 *
 * -t, --type
 *     [string] The file extensions types to clean.
 *
 * -p, --pattern
 *     [array] Use a glob to find files to prettify.
 *
 * -i, --ignore
 *     [array] Use a glob to ignore files.
 *
 * --test
 *     [boolean] A test run that only shows the used globs before
 *     prettifying. Does not prettify at all.
 *
 * -e, --empty
 *     [boolean] Empty default globs array. Careful as this can prettify
 *     all project files. By default the node_modules/ is ignored, for
 *     example. Be sure to exclude files that don't need to be prettified
 *     by adding the necessary globs with the --pattern option.
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
 * $ gulp pretty --pattern "some/folder/*.js"
 *     Prettify default files and all JS files.
 *
 * $ gulp pretty --ignore "*.js"
 *     Prettify default files and ignore JS files.
 *
 * $ gulp pretty --test
 *     Halts prettifying to show the globs to be used for prettifying.
 *
 * $ gulp pretty --empty --pattern "some/folder/*.js"
 *     Flag indicating to remove default globs.
 *
 * $ gulp pretty --line-ending "\n"
 *     Make files have "\n" line-ending.
 *
 * $ gulp pretty --quick
 *     Only prettify the git modified files.
 *
 * $ gulp pretty --staged
 *     Performs a --quick prettification on Git staged files.
 */
gulp.task("pretty", ["pretty:gitfiles"], function(done) {
	var unprefix = require("postcss-unprefix");
	var autoprefixer = require("autoprefixer");
	var perfectionist = require("perfectionist");
	var shorthand = require("postcss-merge-longhand");

	// **This might no longer be needed
	// // this task can only run when gulp is not running as gulps watchers
	// // can run too many times as many files are potentially being beautified
	// if ($internal.get("pid")) {
	// 	// Gulp instance exists so cleanup
	// 	gulp_check_warn();
	// 	return done();
	// }

	// run yargs
	var _args = yargs
		.option("type", {
			alias: "t",
			type: "string"
		})
		.option("pattern", {
			alias: "p",
			type: "array"
		})
		.option("ignore", {
			alias: "i",
			type: "array"
		})
		.option("test", {
			type: "boolean"
		})
		.option("empty", {
			alias: "e",
			type: "boolean"
		})
		.option("line-ending", {
			alias: "l",
			type: "string"
		}).argv;

	// get the command line arguments from yargs
	var type = _args.t || _args.type;
	var patterns = _args.p || _args.pattern;
	var ignores = _args.i || _args.ignore;
	var test = _args.test;
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

	// merge the changed files to the patterns array...this means that
	// the --quick/--staged flags are set.
	if (__modified_git_files) {
		// Important: when the __modified_git_files variable is an empty
		// array this means that there are no Git modified/staged files.
		// So simply remove all the globs from the files array to prevent
		// anything from being prettified.
		if (!__modified_git_files.length) {
			files.length = 0;
		}

		// add the changed files to the patterns array
		patterns = (patterns || []).concat(__modified_git_files);
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

	// add user provided glob patterns
	if (patterns) {
		// only do changes when the type flag is not provided
		// therefore, in other words, respect the type flag.
		if (!type) {
			files.shift();
		}

		// add the globs
		patterns.forEach(function(glob) {
			files.push(glob);
		});
	}

	// add user provided exclude/negative glob patterns. this is
	// useful when needing to exclude certain files/directories.
	if (ignores) {
		// add the globs
		ignores.forEach(function(glob) {
			files.push(bangify(glob));
		});
	}

	// show the used glob patterns when the flag is provided
	if (test) {
		// log the globs
		files.forEach(function(glob) {
			print.gulp(chalk.blue(glob));
		});

		return done();
	}

	pump(
		[
			gulp.src(files, {
				dot: true,
				base: $paths.dot
			}),
			// Filter out all non common files. This is more so a preventive
			// measure as when using the --quick flag any modified files will
			// get passed in. This makes sure to remove all image, markdown
			// files for example.
			$.filter([$paths.files_common]),
			$.sort(opts_sort),
			$.gulpif(extension.ishtml, $.beautify(JSBEAUTIFY)),
			$.gulpif(
				function(file) {
					// file must be a JSON file and cannot contain the
					// comment (.cm.) sub-extension to be sortable as
					// comments are not allowed in JSON files.
					return extension(file, ["json"]) &&
						!-~file.path.indexOf(".cm.")
						? true
						: false;
				},
				$.json_sort({
					space: JINDENT
				})
			),
			$.gulpif(function(file) {
				// exclude HTML and CSS files
				return extension(file, ["html", "css"]) ? false : true;
			}, $.prettier(PRETTIER)),
			$.gulpif(
				extension.iscss,
				$.postcss([
					unprefix(),
					shorthand(),
					autoprefixer(AUTOPREFIXER),
					perfectionist(PERFECTIONIST)
				])
			),
			$.eol(ending),
			$.debug.edit(),
			gulp.dest($paths.basedir)
		],
		done
	);
});
