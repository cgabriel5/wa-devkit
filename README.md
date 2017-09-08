## § Read Before Use
* Make sure to remove the `.gitignore` file from the `img/` directory before using. The file is used as a placeholder to include the otherwise empty folder with `Git`.
* Remove setup sections `§` from the `README` after reading and fully understanding what to do.
* Boilerplate uses `NodeJS`, `Gulp`, and `Yarn`. *Please make sure they are installed*.

## § Yarn Setup
Run the following commands in the following order:

```bash
$ yarn init # Create a package.json file. Update package.json as needed.
$ yarn install # Installs needed package.json modules.
```

## § Gulp Setup

First and foremost, **make sure** to initialize the project via `Gulp` before doing anything else!

```bash
$ gulp init --silent # follow the prompt by entering project information.
```

## § Using Gulp

```bash
# Runs the default task which runs the build and watch tasks. 
# This creates the needed folders/files, starts browser-sync servers, 
# & watches project for file changes. Only one Gulp instance can be run
# at a time.
$ gulp

# Stops active Gulp instance. Only one instance can be run at a time.
$ gulp --stop
```

```bash
# Checks whether Gulp is active or not.
$ gulp helper-status
```

```bash
# Checks the ports being used by the Gulp.
$ gulp helper-ports
```

**Note**: New tabs should be opened via the terminal using `helper-open`. Doing so will ensure the generated tab will auto-close when Gulp is closed/existed. Opening tabs by typing/copy-pasting the project URL into the browser address bar will not auto-close the tab(s) [due to security issues](https://stackoverflow.com/questions/19761241/window-close-and-self-close-do-not-close-the-window-in-chrome).

```bash
# Will open the given file at the given port in browser.
$ gulp helper-open -p/--port [optional:num] -f/--file [req:str]

# When a port is not provided and Gulp is running the currently used port by Gulp will be used.
$ gulp helper-open --file markdown/preview/README.html
$ gulp helper-open --file index.html --port 3000 # Open index.html in port 3000.
```

```bash
# Check project for any unused CSS.
$ gulp helper-purify -D/--delete [optional:boolean] -r/--remove [optional:boolean]

$ gulp helper-purify # Create pure.css containing any unused CSS.
$ gulp helper-purify --delete # Delete pure.css file.
$ gulp helper-purify --remove # Delete pure.css and remove unused CSS from /css/source/styles.css.
```

```bash
# Convert a MarkDown (.md) file to its HTML equivalent.
$ gulp helper-tohtml -i/--input [req:string] -o/--output [req:string] -n/--name [optional:string]

# Convert README.md to Converted.html and place in /markdown/preview.
$ gulp helper-tohtml --input README.md --output /markdown/preview --name Converted.html
```

```bash
# Clear ./gulp/.gulpconfig.json keys if needed.
$ gulp helper-clear -n/--names [req:string]

$ gulp helper-clear --names="gulpstatus gulpports" # Clear pid and ports keys.
$ gulp helper-clear --names="gulpstatus" # Clear pid key.
$ gulp helper-clear --names gulpports # Clear ports key.
```

```bash
# Will run js-beautify on HTML, JS, CSS, & JSON project files.
$ gulp helper-clean-files 
```

```bash
# Console logs all minified files in project.
$ gulp helper-findmin 
```

## § Files To Modify
* **CSS** &mdash; Modify `css/source/styles.css`. `Gulp` will handle auto-prefixing, minifying, and concatenation.
* **JS-App** &mdash; Modify `js/source/modules/*.js` files. `Gulp` will handle file concatenation, minifying, and beautification.
* **JS-Libs** &mdash; Add third-party libraries to `js/libs/`. Then make sure to update the `jslibs` `Gulp` task by adding the library path file to the `src` array. `Gulp` will handle file concatenation, minifying, and beautification.
* **HTML** &mdash; Modify `html/source/i*.html` files. `Gulp` will handle file concatenation, minifying, and beautification.

# {{#repo_name}}

{{#description}}

### Purpose

The purpose of {{#repo_name}} is to...

### Live Demo

Live demo can be accessed [here](https://{{#git_id}}.github.io/{{#repo_name}}/).

### How It Works

Explain how it works...

### How To Use

Take a look at...

### Issues

* Issues if any...

### Contributing

Contributions are welcome! Found a bug, feel like documentation is lacking/confusing and needs an update, have performance/feature suggestions or simply found a typo? Let me know! :)

See how to contribute [here](https://github.com/{{#git_id}}/{{#repo_name}}/blob/master/CONTRIBUTING.md).

### TODO

- [ ] TODO item.

### License

This project uses the [MIT License](https://github.com/{{#git_id}}/{{#repo_name}}/blob/master/LICENSE.txt).
