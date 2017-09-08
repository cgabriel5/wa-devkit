# Setup

### Before Use
* Remove `.gitignore` file from `img/` directory before using. File is only a placeholder to include empty folder.
* Boilerplate uses `NodeJS`, `Gulp`, and `Yarn`. *Make sure they are installed*.

### Yarn Setup
Run the following commands in the following order:

```bash
$ yarn init # Create a package.json file. Update package.json as needed.
$ yarn install # Installs needed package.json modules.
```

### Gulp Setup

Make sure to initialize project before running `gulp`! Follow the on-screen prompt by entering project information.

**Note**: Provided information will be used to auto-fill `README.md`, `LICENSE.txt`, and `package.json`.

```bash
$ gulp init --silent
```

### Files To Modify
* **CSS** &mdash; Modify `css/source/styles.css`. `Gulp` will handle auto-prefixing, minifying, and concatenation.
* **JS-App** &mdash; Modify `js/source/modules/*.js` files. `Gulp` will handle file concatenation, minifying, and beautification.
* **JS-Libs** &mdash; Add third-party libraries to `js/libs/`. Then make sure to update the `jslibs` `Gulp` task by adding the library path file to the `src` array. `Gulp` will handle file concatenation, minifying, and beautification.
* **HTML** &mdash; Modify `html/source/**/*.html` files. `Gulp` will handle file concatenation, minifying, and beautification.
