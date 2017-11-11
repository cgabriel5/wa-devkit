/**
 * Indent all JS files with tabs or spaces.
 *
 * Options
 *
 * --style    [string]  Indent using spaces or tabs. Defaults to tabs.
 * --size     [string]  The amount of spaces to use. Defaults to 4.
 *
 * Notes
 *
 * • @experimental: This task is currently experimental.
 * • Ignores ./node_modules/, ./git/ and vendor/ files.
 *
 * Usage
 *
 * $ gulp indent --style tabs # Turn all 4 starting spaces into tabs.
 * $ gulp indent --style spaces # Expand all line starting tabs into 4 spaces.
 */
gulp.task("indent", function(done) {
	// run yargs
	var _args = yargs
		.option("style", {
			demandOption: false,
			type: "string"
		})
		.option("size", {
			demandOption: false,
			type: "number"
		}).argv;

	// get the command line arguments from yargs
	var style = _args.style || "tabs";
	var size = _args.size || 4; // spaces to use

	// print the indentation information
	log("Using:", chalk.green(style), "Size:", chalk.green(size));

	pump(
		[
			gulp.src(
				[
					__paths__.allfiles.replace(/\*$/, "js"), // only JS FILES
					bangify(globall(__paths__.node_modules_name)),
					bangify(globall(__paths__.git)),
					__paths__.not_vendor
				],
				{
					base: __paths__.base_dot
				}
			),
			$.gulpif(
				// convert tabs to spaces
				style === "tabs",
				$.replace(/^( )+/gm, function(match) {
					// split on the amount size provided [https://stackoverflow.com/a/6259543]
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
