// get the CSS markdown + prismjs styles
// @internal
var __markdown_styles__;
gulp.task("tohtml:prepcss", function(done) {
    var task = this;

    var __PATHS_MARKDOWN_STYLES_GITHUB = "github-markdown.css";
    var __PATHS_MARKDOWN_STYLES_PRISMJS = "prism-github.css";
    var __PATHS_MARKDOWN_ASSETS = "./markdown/assets/css/";
    var __PATHS_MARKDOWN_CONCAT_NAME = "markdown.css";

    // run gulp process
    pump([
    	gulp.src([
    		__PATHS_MARKDOWN_STYLES_GITHUB,
    		__PATHS_MARKDOWN_STYLES_PRISMJS
    	], {
            cwd: __PATHS_MARKDOWN_ASSETS
        }),
        concat(__PATHS_MARKDOWN_CONCAT_NAME),
		modify({
            fileModifier: function(file, contents) {
                // store the contents in variable
                __markdown_styles__ = contents;
                return contents;
            }
        }),
    	debug(task.__wadevkit.debug)
        ], done);
});

/**
 * Converts MarkDown (.md) file to its HTML counterpart (with GitHub style/layout).
 *
 * Options
 *
 * -f, --file   [string]  Path of file to convert. Defaults to ./README.md
 * Note: Files will get placed in ./markdown/previews/
 *
 * Usage
 *
 * $ gulp tohtml --file ./README.md # Convert README.md to README.html.
 */
gulp.task("tohtml", ["tohtml:prepcss"], function(done) {
    var task = this;

    // run yargs
    var _args = yargs.usage("Usage: $0 --file [boolean]")
        .option("file", {
            alias: "f",
            default: "./README.md",
            describe: "The file to convert.",
            type: "string"
        })
        .argv;
    // get the command line arguments from yargs
    var file_name = _args.f || _args.file;

    // get file markdown file contents
    // convert contents into HTML via marked
    // inject HTML fragment into HTML markdown template
    // save file in markdown/previews/

    // [https://github.com/krasimir/techy/issues/30]
    // make marked use prism for syntax highlighting
    marked.marked.setOptions({
        highlight: function(code, language) {
            return prism.highlight(code, prism.languages[language]);
        }
    });

    // run gulp process
    pump([gulp.src(file_name),
    	debug(task.__wadevkit.debug),
		marked(),
		modify({
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
	<style>${__markdown_styles__}</style>
</head>
    <body class="markdown-body">${contents}</body>
</html>`;
            }
        }),
        beautify(config_jsbeautify),
		gulp.dest(__PATHS_MARKDOWN_PREVIEW),
		debug(task.__wadevkit.debug),
		bs.stream()
        ], done);
});
