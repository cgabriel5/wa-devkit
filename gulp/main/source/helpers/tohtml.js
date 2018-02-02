/**
 * Variables are declared outside of tasks to be able to use them in
 *     multiple tasks. The variables are populated in the tohtml:prepcss
 *     task and used in the tohtml task.
 */
var __markdown_styles;
var __markdown_stopped;

/**
 * Get the CSS markdown + prismjs styles.
 *
 * @internal - Used to prepare the tohtml task.
 */
gulp.task("tohtml:prepcss", function(done) {
	// Run yargs.
	var __flags = yargs.option("file", {
		type: "string"
	}).argv;

	// Get the command line arguments from yargs.
	var filename = __flags.f || __flags.file;

	// Check that the file is a markdown file.
	if (!extension.ismd({ path: filename })) {
		print.gulp.warn(
			`.${extension({
				path: filename
			})} file was provided.`
		);
		print.gulp.info("Need a .md (Markdown) file.");

		// Set the variable.
		__markdown_stopped = true;

		return done();
	}

	// Run gulp process.
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
					// Store the contents in variable.
					__markdown_styles = contents;
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
 * • Files will get placed in ./markdown/previews/.
 *
 * Flags
 *
 * -f, --file
 *     [string] Path of file to convert. Defaults to ./README.md
 *
 * -o, --open
 *     [boolean] Flag indicating whether to open the converted file
 *     in the browser.
 *
 * Usage
 *
 * $ gulp tohtml --file ./README.md
 *     Convert README.md to README.html.
 *
 * $ gulp tohtml --file ./README.md --open
 *     Convert README.md to README.html and open file in browser.
 */
gulp.task("tohtml", ["tohtml:prepcss"], function(done) {
	// Check the tohtml:prepcss variables before the actual task code runs.
	if (__markdown_stopped) {
		return done();
	}

	// Actual task starts here.

	var prism = require("prismjs");
	// Extend the default prismjs languages.
	require("prism-languages");

	// Run yargs.
	var __flags = yargs
		.option("file", {
			alias: "f",
			default: "./README.md",
			type: "string"
		})
		.option("open", {
			alias: "o",
			type: "boolean"
		}).argv;

	// Get the command line arguments from yargs.
	var filename = __flags.f || __flags.file;
	var open = __flags.o || __flags.open;

	// Task logic:
	// - Get file markdown file contents.
	// - Convert contents into HTML via marked.
	// - Inject HTML fragment into HTML markdown template.
	// - Save file in markdown/previews/.

	// Make marked use prism for syntax highlighting.
	// [https://github.com/krasimir/techy/issues/30#issuecomment-238850743]
	$.marked.marked.setOptions({
		highlight: function(code, language) {
			// Default to markup when language is undefined or get an error.
			return prism.highlight(code, prism.languages[language || "markup"]);
		}
	});

	// Run gulp process.
	pump(
		[
			gulp.src(filename),
			$.debug(),
			$.marked(),
			$.modify({
				fileModifier: function(file, contents) {
					// Path offsets.
					var fpath = "../../favicon/";
					// Get file name.
					var filename = path.basename(file.path);

					// Return filled in template.
					return `
<!doctype html>
<html lang="en">
<head>
    <title>${filename}</title>
    <meta charset="utf-8">
    <meta name="description" content="Markdown to HTML preview.">
    <meta http-equiv="x-ua-compatible" content="ie=edge">
    <meta name="viewport" content="width=device-width, initial-scale=1, shrink-to-fit=no">
    <link rel="apple-touch-icon" sizes="180x180" href="${fpath}/apple-touch-icon.png">
    <link rel="icon" type="image/png" sizes="32x32" href="${fpath}/favicon-32x32.png">
    <link rel="icon" type="image/png" sizes="16x16" href="${fpath}/favicon-16x16.png">
    <link rel="manifest" href="${fpath}/manifest.json">
    <link rel="mask-icon" href="${fpath}/safari-pinned-tab.svg" color="#699935">
    <link rel="shortcut icon" href="${fpath}/favicon.ico">
    <meta name="msapplication-TileColor" content="#00a300">
    <meta name="msapplication-TileImage" content="${fpath}/mstile-144x144.png">
    <meta name="msapplication-config" content="${fpath}/browserconfig.xml">
    <meta name="theme-color" content="#f6f5dd">
    <!-- https://github.com/sindresorhus/github-markdown-css -->
	<style>${__markdown_styles}</style>
</head>
    <body class="markdown-body">${contents}</body>
</html>`;
				}
			}),
			$.beautify(JSBEAUTIFY),
			gulp.dest($paths.markdown_preview),
			// Open the file when the open flag is provided.
			$.gulpif(
				open,
				$.modify({
					fileModifier: function(file, contents) {
						// Note: fileModifier is being used here in a 'hacky'
						// way. fileModifier is intended to modify the file's
						// contents. However, the original file contents are
						// being returned. fileModifier in this case is being
						// used as a callback function to run the open task
						// as a shell command.

						// Get the converted HTML file name.
						var filename_rel = path.relative($paths.cwd, file.path);

						// Run the open task as a shell command to not
						// re-write the task logic.
						cmd.get(
							`${GULPCLI} open --file ${filename_rel}`,
							function(err, data) {
								if (err) {
									throw err;
								}
							}
						);

						return contents;
					}
				})
			),
			$.debug.edit(),
			bs.stream()
		],
		done
	);
});
