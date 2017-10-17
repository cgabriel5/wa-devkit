// initialization step
// @internal
gulp.task("init:clear-js", function(done) {

    // no need to change any as the project
    // is defaulted to this type anyway. just
    // complete the task.
    if (__data__.apptype === "webapp") return done();

    // only when apptype is library:
    // replace ./js/source/
    // add ./js/vendor/__init__.js
    // ./js/bundles/ will get replaced on setup

    var task = this;
    // pick the js/ directory to use
    pump([gulp.src(__PATHS_JS_SOURCE, {
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

    // no need to change any as the project
    // is defaulted to this type anyway. just
    // complete the task.
    if (__data__.apptype === "webapp") return done();

    var task = this;
    // pick the js/ directory to use
    pump([gulp.src(__PATHS_JS_OPTIONS_DYNAMIC, {
            dot: true,
            cwd: __PATHS_BASE_DOT
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
        gulp.src([
        	__PATHS_GULP_SETUP_README_TEMPLATE,
        	__PATHS_GULP_SETUP_LICENSE_TEMPLATE,
        	__PATHS_HTML_HEADMETA,
        	INDEX
        ], {
            base: __PATHS_BASE
        }),
        injection(__data__),
        gulp.dest(__PATHS_BASE),
		debug(task.__wadevkit.debug)
    ], done);
});

// initialization step
// @internal
gulp.task("init:setup-readme", function(done) {
    var task = this;
    // move templates to new locations
    pump([
        gulp.src([
        	__PATHS_GULP_SETUP_README_TEMPLATE,
        	__PATHS_GULP_SETUP_LICENSE_TEMPLATE
        ]),
		debug(),
        gulp.dest(__PATHS_BASE),
    	debug(task.__wadevkit.debug)
    ], done);
});

// initialization step
// @internal
gulp.task("init:rename-gulpfile", function(done) {
    var task = this;
    // rename the gulpfile.main.js to gulpfile.js
    pump([
        gulp.src(__PATHS_GULP_FILE_MAIN, {
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
        gulp.src([
        	__PATHS_GULP_FILE_SETUP,
        	__PATHS_GULP_SETUP,
        	__PATHS_GIT
        ], {
            dot: true,
            read: false,
            base: __PATHS_BASE
        }),
        clean(),
    	debug(task.__wadevkit.debug)
    ], done);
});

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
