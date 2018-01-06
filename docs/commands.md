# Commands

Command documentation can be accessed by running `$ gulp help`. `help` command information is shown below.

```
Tasks


   help
	Provides Gulp task documentation (this documentation).
	
      Notes:
	
	• Help documentation will always show even when verbose flag
	  is not provided.
	
      Flags:
	
	--verbose
	    [boolean] Shows all documentation.
	
	-i, --internal
	    [boolean] Shows all internal (yellow) tasks.
	
	-f, --filter
	    [string] Names of tasks to show documentation for.
	
      Usage:
	
	$ gulp help
	    Show a list of tasks and their short descriptions.
	
	$ gulp help --verbose
	    Show full documentation (flags, usage, notes...).
	
	$ gulp help --filter "open default dependency"
	    Show documentation for specific tasks.
	
	$ gulp help --internal
	    Show documentation for internally used tasks.


   csslint                 Run csslint on a file.
   default                 Runs Gulp.
   dependency              Add/remove front-end dependencies.
   dist                    Build the dist/ folder. (only for webapp projects).
   eol                     Correct file line endings.
   favicon                 Re-build project favicons.
   files                   List project files.
   hlint                   Run htmllint on a file.
   indent                  Indent all JS files with tabs or spaces.
   jshint                  Run jshint on a file.
   lib                     Build the lib/ folder. (only for library projects).
   make                    Build gulpfile from source files.
   modernizr               Build Modernizr file.
   open                    Opens provided file in browser.
   ports                   Print the currently used ports for browser-sync.
   pretty                  Beautify all HTML, JS, CSS, and JSON project files.
   settings                Build ./configs/.__settings.json
   stats                   Prints table containing project file type breakdown.
   status                  Print whether there is an active Gulp instance.
   tohtml                  Converts Markdown (.md) file to .html.
```
