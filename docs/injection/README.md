# HTML Content Injection

If needed, the project can inject contents from a `file` or a Javascript `object` to where ever specified from within your `HTML` files. The goal is to inject unmodified text into your `HTML` files. This is achieved by using the custom project Gulp plugin, [`gulp-inject-content`](https://github.com/cgabriel5/gulp-inject-content).

##### Table of Contents

- [Syntax](#syntax)
- [File Injection](#file-injection)
- [Variable Injection](#variable-injection)

<a name="syntax"></a>
### Syntax

```
$:pre{<file_name>}       <!-- pre file-content injection -->
$:pre{$<variable_name>}  <!-- pre variable-injection -->

$:post{<file_name>}      <!-- post file-content injection -->
$:post{$<variable_name>} <!-- post variable-injection -->

${<file_name>}      	 <!-- any time file-content injection -->
${$<variable_name>} 	 <!-- any time variable-injection -->
```

<a name="file-injection"></a>
### File Injection

Say we have some content that should maintain its structural integrity and should not be modified (prettified, minified, etc..) for example.

`my_html_file.html`

```html
<div>
    <textarea>$:post{injection_content}</textarea>
</div>
``` 

`injection_content.text` (content file)

```css
body {
	color: black;
}

div {
	background: green;
}
```

`gulpfile.js`

```js
var gulp = require("gulp");
var pump = require("pump");
var beautify = require("gulp-jsbeautifier");
var injection = require("gulp-inject-content");

gulp.task("my_task", function(done) {
    pump([gulp.src("my_html_file.html"),
		injection.pre(), // any pre content injection
		beautify(),
		injection.post(), // any post content injection
		gulp.dest("./")
    ], done);
});
```

**Note**: The project will look for a file under `./html/injection/`. In this case for `./html/injection/injection_example.text`. If found, it will inject the contents of the file into its injection placeholder. When a file is not found it will injection `undefined`.

After, `my_html_file.html` will look like this:

```html
<div>
    <textarea>body {
	color: black;
}

div {
	background: green;
}</textarea>
</div>
``` 

<a name="variable-injection"></a>
### Variable Injection

Say we need to dynamically make paths for an `HTML` file. This can also be handled with [`gulp-inject-content`](https://github.com/cgabriel5/gulp-inject-content). This time via `variable` injection.

`my_html_file.html`

```html
<script src="$:post{$js_bundle_vendor}"></script>
<script src="$:post{$js_bundle_app}"></script>
``` 

`gulpfile.js`

```js
var gulp = require("gulp");
var pump = require("pump");
var injection = require("gulp-inject-content");

gulp.task("my_task", function(done) {
	var replacements = {
		"js_bundle_vendor": "some/path/to/js/vendor.js",
		"js_bundle_app": "some/path/to/js/app.js"
	};

    pump([gulp.src("my_html_file.html"),
		injection.post(replacements), // variable injection
		gulp.dest("./")
    ], done);
});
```

**Note**: At the moment, `Objects` can only go `1` level deep. When a variable is not found injection will default to `undefined`.

After, `my_html_file.html` will look like this:

```html
<script src="some/path/to/js/vendor.js"></script>
<script src="some/path/to/js/app.js"></script>
``` 
