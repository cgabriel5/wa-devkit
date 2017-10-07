# JS HTML Injection

If needed, the project can inject variables from within `gulpfile.js` into your HTML files.

### Syntax

```
$:pre{$<variable_name>}
$:post{$<variable_name>}
```

### Usage

Works the same way as [`$:post{}`](/html.post.md/) or [`$:pre{}`](/html.pre.md/) injection. However, the content is not from files but from variables.

- First add needed variables and its content to the `html_injection_bundle_paths` variable found in `./gulp/source/vars.js`.
- Then add the place holder to your HTML file(s).
- Re-build the `gulpfile.js` by running `$ gulp make`.
- Run `$ gulp` to update files with changes.

```js
// HTML injection bundle paths
var html_injection_bundle_paths = {
    "my_script_path": "path/to/my/script.js"
};
```

```html
<script src="$:pre{$my_script_path}"></script>
```

After:

```html
<script src="path/to/my/script.js"></script>
```


