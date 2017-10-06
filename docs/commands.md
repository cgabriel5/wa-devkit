# Commands

The same documentation can be accessed by running `$ gulp help --verbose` from the terminal. More information on the `help` command can be found below.

```bash
Help

   help         Provides Gulp task documentation (this documentation).
                  
                  Options
                  
                  (no options) List tasks and their descriptions.
                  -v, --verbose  [boolean]  Flag indicating whether to show all documentation.
                  -n, --name     [string]   Names of tasks to show documentation for.
                  
                  Usage
                  
                  $ gulp help # Show list of tasks and their descriptions.
                  $ gulp help --verbose # Show all documentation for all tasks.
                  $ gulp help --name "open default dependency" # Show documentation for specific tasks.

Tasks

   default      Runs Gulp. (builds project files, watches files, & runs browser-sync)
                  
                  Options
                  
                  -s, --stop  [boolean]  Flag indicating to stop Gulp.
                  
                  Usage
                  
                  $ gulp # Run Gulp.
                  $ gulp --stop # Stops active Gulp process, if running.


   dependency   Add/remove front-end dependencies from ./node_modules/ to its JS/CSS library folder.
                  
                  Options
                  
                  -n, --name    <string>  The module name.
                  -t, --type    <string>  Dependency type (js/css).
                  -a, --action  <string>  Action to take (add/remove).
                  
                  Usage
                  
                  $ gulp dependency -n fastclick -t js -a add # Copy fastclick to JS libs directory.
                  $ gulp dependency -n fastclick -t js -a remove # Remove fastclick from JS libs directory.
                  $ gulp dependency -n font-awesome -t css -a add # Add font-awesome to CSS libs directory.


   dist         Build the dist/ folder. (only for webapp projects).
                  
                  Usage
                  
                  $ gulp dist # Create dist/ folder.


   favicon      Re-build project favicons.
                  
                  Usage
                  
                  $ gulp favicon # Re-build favicons.


   files        List project files.
                  
                  Options
                  
                  -t, --types    [string]  The optional extensions of files to list.
                  -m, --min      [string]  Flag indicating whether to show .min. files.
                  -w, --whereis  [string]  File to look for. (Uses fuzzy search, Ignores ./node_modules/)
                  
                  Usage
                  
                  $ gulp files # Default shows all files excluding files in ./node_modules/ & .git/.
                  $ gulp files --type "js html" # Only list HTML and JS files.
                  $ gulp files --type "js" --whereis "jquery" # List JS files with jquery in basename.
                  $ gulp files --whereis "fastclick.js" # Lists files containing fastclick.js in basename.


   lib          Build the lib/ folder. (only for library projects).
                  
                  Usage
                  
                  $ gulp lib # Create lib/ folder.


   make         Build gulpfile from source files. Useful after making changes to source files.
                  
                  Usage
                  
                  $ gulp make # Re-build gulpfile


   modernizr    Build Modernizr file.
                  
                  Usage
                  
                  $ gulp modernizr # Build modernizr.js. Make changes to ./modernizr.config.json


   open         Opens provided file in browser.
                  
                  Options
                  
                  -f, --file  <file>    The path of the file to open.
                  -p, --port  [number]  The port to open in. (Defaults to browser-sync port)
                  
                  Note: New tabs should be opened via the terminal using `open`. Doing so will
                  ensure the generated tab will auto-close when Gulp is closed/existed. Opening
                  tabs by typing/copy-pasting the project URL into the browser address bar will
                  not auto-close the tab(s) due to security issues as noted here:
                  [https://stackoverflow.com/q/19761241].
                  
                  Usage
                  
                  $ gulp open --file index.html --port 3000 # Open index.html in port 3000.


   ports        Print the currently used ports for browser-sync.
                  
                  Usage
                  
                  $ gulp ports # Print uses ports.


   pretty       Beautify all HTML, JS, CSS, and JSON project files. Ignores ./node_modules/.
                  
                  Usage
                  
                  $ gulp pretty # Prettify files.


   purify       Purge potentially unused CSS style definitions.
                  
                  Options
                  
                  (no options)  ---------  Creates pure.css which contains only used styles.
                  -r, --remove  [boolean]  Deletes pure.css and removes unused CSS.
                  -D, --delete  [boolean]  Deletes pure.css.
                  
                  Usage
                  
                  $ gulp purify # Creates pure.css which contains only used styles.
                  $ gulp purify --remove # Deletes pure.css and removes unused CSS.
                  $ gulp purify --delete # Deletes pure.css.


   status       Print whether there is an active Gulp instance.
                  
                  Usage
                  
                  $ gulp status # Print Gulp status.


   tohtml       Converts MarkDown (.md) file to its HTML counterpart (with GitHub style/layout).
                  
                  Options
                  
                  -i, --input   <string>  Path of file to convert (Markdown => HTML).
                  -o, --output  <string>  Path where converted HTML file should be placed.
                  -n, --name    [string]  New name of converted file.
                  
                  Usage
                  
                  $ gulp tohtml --input README.md --output /markdown/preview --name Converted.html.
                  # Convert README.md to Converted.html and place in /markdown/preview.
```
