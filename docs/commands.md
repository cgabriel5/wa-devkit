# Commands

Command documentation can be accessed by running `$ gulp help`. `help` command information is shown below.

```bash
Tasks


   help
	Provides Gulp task documentation (this documentation).
	
	
      Notes:
	
		• Help documentation will always show even when verbose flag
		  is not provided.
	
      Flags:
	
		--verbose
		    [boolean] Shows all documentation.
		
		-f, --filter
		    [string] Names of tasks to show documentation for.
	
      Usage:
	
		$ gulp help
		    Show a list of tasks and their short descriptions.
		
		$ gulp help --verbose
		    Show full documentation (flags, usage, notes...).
		
		$ gulp help --filter "open default dependency"
		    Show documentation for specific tasks.


   default      Runs Gulp.
   dependency   Add/remove front-end dependencies.
   dist         Build the dist/ folder. (only for webapp projects).
   eol          Correct file line endings.
   favicon      Re-build project favicons.
   files        List project files.
   indent       Indent all JS files with tabs or spaces.
   lib          Build the lib/ folder. (only for library projects).
   make         Build gulpfile from source files.
   modernizr    Build Modernizr file.
   open         Opens provided file in browser.
   ports        Print the currently used ports for browser-sync.
   pretty       Beautify all HTML, JS, CSS, and JSON project files.
   settings     Re-build ./configs/._settings.json
   stats        Prints table containing project file type breakdown.
   status       Print whether there is an active Gulp instance.
   tohtml       Converts Markdown (.md) file to .html.
```
