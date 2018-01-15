/**
 * Indent all JS files with tabs or spaces.
 *
 * Notes
 *
 * • This task is currently experimental.
 * • Ignores ./node_modules/, ./git/ and vendor/ files.
 *
 * Flags
 *
 * --style
 *     [string] Indent using spaces or tabs. Defaults to tabs.
 *
 * --size
 *     [string] The amount of spaces to use. Defaults to 4.
 *
 * Usage
 *
 * $ gulp indent --style tabs
 *     Turn all 4 starting spaces into tabs.
 *
 * $ gulp indent --style spaces --size 2
 *     Expand all line starting tabs into 2 spaces.
 */
gulp.task("indent", function(done) {
	// run yargs
	var _args = yargs
		.option("style", {
			type: "string"
		})
		.option("size", {
			type: "number"
		}).argv;

	// get the command line arguments from yargs
	var style = _args.style || "tabs";
	var size = _args.size || 4; // spaces to use

	// print the indentation information
	print.gulp("Using:", chalk.green(style), "Size:", chalk.green(size));

	pump(
		[
			gulp.src(
				[
					$paths.files_all.replace(/\*$/, "js"), // only JS FILES
					bangify(globall($paths.node_modules_name)),
					bangify(globall($paths.git)),
					$paths.not_vendor
				],
				{
					base: $paths.base_dot
				}
			),
			$.gulpif(
				// convert tabs to spaces
				style === "tabs",
				$.replace(/^( )+/gm, function(match) {
					// split on the amount size provided
					// [https://stackoverflow.com/a/6259543]
					var chunks = match.match(new RegExp(`.\{1,${size}\}`, "g"));

					// modify the chunks
					chunks = chunks.map(function(chunk) {
						return !(chunk.length % size) ? "\t" : chunk;
					});

					// join and return new indentation
					return chunks.join("");
				})
			),
			$.gulpif(
				// convert spaces to tabs
				style === "spaces",
				$.replace(/^([\t ])+/gm, function(match) {
					// replace all tabs with spaces
					match = match.replace(/\t/g, " ".repeat(size));
					return match;
				})
			),
			gulp.dest("./"),
			$.debug.edit()
		],
		done
	);
});
