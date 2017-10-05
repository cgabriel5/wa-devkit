// initialization step
// @internal
gulp.task("init:clear-js", function(done) {
    var task = this;
    // pick the js/ directory to use
    pump([gulp.src(__PATHS_JS_HOME, {
            dot: true,
            cwd: __PATHS_BASE
        }),
    	clean(),
    	debug(task.__wadevkit.debug)
    ], done);
});

// initialization step
// @internal
gulp.task("init:pick-js-option", function(done) {
    var task = this;
    // pick the js/ directory to use
    pump([gulp.src(__PATHS_JS_OPTIONS_DYNAMIC, {
            dot: true,
            cwd: __PATHS_BASE
        }),
        gulp.dest(__PATHS_JS_HOME),
    	debug(task.__wadevkit.debug)
    ], done);
});

// initialization step
// @internal
gulp.task("init:fill-placeholders", function(done) {
    var task = this;
    // replace placeholder with real data
    pump([
        gulp.src([__PATHS_DOCS_README_TEMPLATE, __PATHS_LICENSE, __PATHS_HTML_HEADMETA, INDEX], {
            base: __PATHS_BASE
        }),
        replace(/\{\{\#(.*?)\}\}/g, function(match) {
            match = match.replace(/^\{\{\#|\}\}$/g, "");
            return __data__[match] ? __data__[match] : match;
        }),
        gulp.dest(__PATHS_BASE),
		debug(task.__wadevkit.debug)
    ], done);
});

// initialization step
// @internal
gulp.task("init:setup-readme", function(done) {
    var task = this;
    // move ./docs/readme_template.md to ./README.md
    pump([
        gulp.src(__PATHS_DOCS_README_TEMPLATE, {
            base: __PATHS_BASE
        }),
		debug(),
        clean(),
        rename(__PATHS_README),
        gulp.dest(__PATHS_BASE),
    	debug(task.__wadevkit.debug)
    ], function() {
        // markdown to html (with github style/layout)
        mds.render(mds.resolveArgs({
            input: path.join(__PATHS_CWD, __PATHS_README),
            output: path.join(__PATHS_CWD, __PATHS_MARKDOWN_PREVIEW),
            layout: path.join(__PATHS_CWD, __PATHS_MARKDOWN_SOURCE)
        }), function() {
            done();
        });
    });
});

// initialization step
// @internal
gulp.task("init:rename-gulpfile", function(done) {
    var task = this;
    // rename the gulpfile.main.js to gulpfile.js
    pump([
        gulp.src(__PATHS_GULP_FILE_UNACTIVE, {
            base: __PATHS_BASE
        }),
    	debug(),
        clean(), // remove the file
        rename(__PATHS_GULP_FILE_NAME),
        gulp.dest(__PATHS_BASE),
    	debug(task.__wadevkit.debug)
    ], done);
});

// initialization step
// @internal
gulp.task("init:remove-setup", function(done) {
    var task = this;
    // remove the setup files/folders/old .git folder
    pump([
        gulp.src([__PATHS_GULP_FILE_SETUP, __PATHS_GULP_SETUP, __PATHS_GIT], {
            dot: true,
            read: false,
            base: __PATHS_BASE
        }),
        clean(),
    	debug(task.__wadevkit.debug)
    ], done);
});

// initialization step::alias
// @internal
gulp.task("init:pretty", ["pretty"]);

// initialization step
// @internal
gulp.task("init:git", function(done) {
    var task = this;
    // git init new project
    git.init("", function() {
            log(`Git initialized (${__data__.apptype})`);
            notify(`Git initialized (${__data__.apptype})`);
            done();
        })
        .add("./*")
        .commit("chore: Initial commit\n\nProject initialization.");
});
