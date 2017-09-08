# Commands

### Gulp

```bash
# Runs the default task which runs the build and watch tasks. 
# This creates the needed folders/files, starts browser-sync servers, 
# & watches project for file changes. Only one Gulp instance can be run
# at a time.
$ gulp

# Stops active Gulp instance. Only one instance can be run at a time.
$ gulp --stop
```

### Gulp-Helpers

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
