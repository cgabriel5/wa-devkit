// beautify html, js, css, & json files
// @internal
gulp.task("pretty", function(done) {
	var unprefix = require("postcss-unprefix");
	var autoprefixer = require("autoprefixer");
	var perfectionist = require("perfectionist");
	var shorthand = require("postcss-merge-longhand");

	var task = this;

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

	// get needed files
	pump(
		[
			gulp.src(files, {
				dot: true,
				base: $paths.base_dot
			}),
			$.sort(opts_sort),
			$.gulpif(ext.ishtml, $.beautify($jsbeautify)),
			$.gulpif(
				function(file) {
					// file must be a JSON file and cannot contain the comment (.cm.) sub-extension
					// to be sortable as comments are not allowed in JSON files.
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
			}, $.prettier($prettier)),
			$.gulpif(
				ext.iscss,
				$.postcss([
					unprefix(),
					shorthand(),
					autoprefixer($ap),
					perfectionist($perfectionist)
				])
			),
			$.eol(),
			$.debug.edit(),
			gulp.dest($paths.base)
		],
		done
	);
});

// initialization step::alias
// @internal
gulp.task("init:pretty", ["pretty"]);
