/**
 * Variable is declared outside of tasks to use be able to use in
 *     multiple tasks. The variable is populated in the tohtml:prepcss
 *     task and used in the tohtml task.
 */
var _markdown_styles_;

/**
 * Get the CSS markdown + prismjs styles.
 */
gulp.task("tohtml:prepcss", function(done) {
	// run gulp process
	pump(
		[
			gulp.src(
				[$paths.markdown_styles_github, $paths.markdown_styles_prismjs],
				{
					cwd: $paths.markdown_assets
				}
			),
			$.debug(),
			$.concat($paths.markdown_concat_name),
			$.modify({
				fileModifier: function(file, contents) {
					// store the contents in variable
					_markdown_styles_ = contents;
					return contents;
				}
			}),
			$.debug.edit()
		],
		done
	);
});

/**
 * Converts Markdown (.md) file to .html.
 *
 * Notes
 *
 * • Files will get placed in ./markdown/previews/
 *
 * Flags
 *
 * -f, --file
 *     [string] Path of file to convert. Defaults to ./README.md
 *
 * Usage
 *
 * $ gulp tohtml --file ./README.md
 *     Convert README.md to README.html.
 */
gulp.task("tohtml", ["tohtml:prepcss"], function(done) {
	var prism = require("prismjs");
	// extend the default prismjs languages.
	require("prism-languages");

	// run yargs
	var _args = yargs.option("file", {
		alias: "f",
		default: "./README.md",
		type: "string"
	}).argv;
	// get the command line arguments from yargs
	var file_name = _args.f || _args.file;

	// get file markdown file contents
	// convert contents into HTML via marked
	// inject HTML fragment into HTML markdown template
	// save file in markdown/previews/

	// [https://github.com/krasimir/techy/issues/30]
	// make marked use prism for syntax highlighting
	$.marked.marked.setOptions({
		highlight: function(code, language) {
			// default to markup when language is undefined
			return prism.highlight(code, prism.languages[language || "markup"]);
		}
	});

	// run gulp process
	pump(
		[
			gulp.src(file_name),
			$.debug(),
			$.marked(),
			$.modify({
				fileModifier: function(file, contents) {
					// path offsets
					var fpath = "../../favicon/";
					// get file name
					var file_name = path.basename(file.path);

					// return filled in template
					return `
<!doctype html>
<html lang="en">
<head>
    <title>${file_name}</title>
    <meta charset="utf-8">
    <meta name="description" content="Markdown to HTML preview.">
    <meta http-equiv="x-ua-compatible" content="ie=edge">
    <meta name="viewport" content="width=device-width, initial-scale=1, shrink-to-fit=no">
    <link rel="apple-touch-icon" sizes="180x180" href="${
		fpath
	}/apple-touch-icon.png">
    <link rel="icon" type="image/png" sizes="32x32" href="${
		fpath
	}/favicon-32x32.png">
    <link rel="icon" type="image/png" sizes="16x16" href="${
		fpath
	}/favicon-16x16.png">
    <link rel="manifest" href="${fpath}/manifest.json">
    <link rel="mask-icon" href="${fpath}/safari-pinned-tab.svg" color="#699935">
    <link rel="shortcut icon" href="${fpath}/favicon.ico">
    <meta name="msapplication-TileColor" content="#00a300">
    <meta name="msapplication-TileImage" content="${fpath}/mstile-144x144.png">
    <meta name="msapplication-config" content="${fpath}/browserconfig.xml">
    <meta name="theme-color" content="#f6f5dd">
    <!-- https://github.com/sindresorhus/github-markdown-css -->
	<style>${_markdown_styles_}</style>
</head>
    <body class="markdown-body">${contents}</body>
</html>`;
				}
			}),
			$.beautify($configs.jsbeautify),
			gulp.dest($paths.markdown_preview),
			$.debug.edit(),
			bs.stream()
		],
		done
	);
});
