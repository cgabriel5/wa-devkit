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
# & watches project for file changes.
$ gulp 

# Builds the needed folders/files for the app.
$ gulp build 

# Watches project for file changes. Running the needed tasks to rebuild files.
$ gulp watch 
```

```bash
# Will open the given file at the given port in browser.
$ gulp open -p/--port [req:num] -f/--file [req:str] 

$ gulp open -p 3000 -f index.html # Will open index.html at port 3000.  
$ gulp open -p 3002 -f readme.md # Will open readme.md at port 3002.
```

```bash
$ gulp purify -D/--del [?flag-only] -r/--remove [?flag-only] # Will purify CSS of any unused CSS.

$ gulp purify # Create pure.css and scan for any unused CSS.
$ gulp purify -D # Delete pure.css file.
$ gulp purify --remove # Delete pure.css and remove unused CSS from /css/source/styles.css.
```

```bash
$ gulp clean-files # will run js-beautify on HTML, JS, CSS, & JSON project files.
$ gulp findmin # console logs all minified files in project
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

