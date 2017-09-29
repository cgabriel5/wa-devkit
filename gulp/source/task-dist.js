// remove old dist / folder
gulp.task("task-dist-clean", function(done) {
    var task = this;
    pump([gulp.src(__PATHS_DIST_HOME, opts),
        clean(),
        debug(task.__wadevkit.debug)
    ], done);
});
// copy new file/folders
gulp.task("task-dist-favicon", function(done) {
    var task = this;
    pump([gulp.src(bundle_dist.source.files.favicon, {
            dot: true,
            cwd: __PATHS_HOMEDIR,
            // https://github.com/gulpjs/gulp/issues/151#issuecomment-41508551
            base: __PATHS_BASE_DOT
        }),
    	gulp.dest(__PATHS_DIST_HOME),
    	debug(task.__wadevkit.debug)
    ], done);
});
gulp.task("task-dist-css", function(done) {
    var task = this;
    pump([gulp.src(bundle_dist.source.files.css, {
            dot: true,
            cwd: __PATHS_HOMEDIR,
            base: __PATHS_BASE_DOT
        }),
		clean_css(),
    	gulp.dest(__PATHS_DIST_HOME),
		debug(task.__wadevkit.debug)
    ], done);
});
gulp.task("task-dist-img", function(done) {
    var task = this;
    // need to copy hidden files/folders?
    // [https://github.com/klaascuvelier/gulp-copy/issues/5]
    pump([gulp.src(bundle_dist.source.files.img, {
            dot: true,
            cwd: __PATHS_HOMEDIR,
            base: __PATHS_BASE_DOT
        }),
		cache(imagemin([
            imagemin.gifsicle({
                interlaced: true
            }),
            imagemin.jpegtran({
                progressive: true
            }),
            imagemin.optipng({
                optimizationLevel: 5
            }),
            imagemin.svgo({
                plugins: [{
                    removeViewBox: true
                }]
            })
        ])),
    	gulp.dest(__PATHS_DIST_HOME),
		debug(task.__wadevkit.debug)
    ], done);
});
gulp.task("task-dist-js", function(done) {
    var task = this;
    pump([gulp.src(bundle_dist.source.files.js, {
            dot: true,
            cwd: __PATHS_HOMEDIR,
            base: __PATHS_BASE_DOT
        }),
		uglify(),
    	gulp.dest(__PATHS_DIST_HOME),
		debug(task.__wadevkit.debug)
    ], done);
});
gulp.task("task-dist-root", function(done) {
    var task = this;
    var is_html = function(file) {
        return (path.extname(file.path)
            .toLowerCase() === ".html");
    };
    pump([gulp.src(bundle_dist.source.files.root, {
            dot: true,
            cwd: __PATHS_HOMEDIR,
            base: __PATHS_BASE_DOT
        }),
    	gulpif(is_html, minify_html()),
    	gulp.dest(__PATHS_DIST_HOME),
    	debug(task.__wadevkit.debug)
    ], done);
});
// helper distribution make task
gulp.task("helper-make-dist", function(done) {
    var task = this;
    if (APPTYPE !== "webapp") {
        log(chalk.yellow("[warning]"), "This helper task is only available for", chalk.magenta("webapp"), "projects.");
        return done();
    }
    // get the gulp build tasks
    var tasks = bundle_dist.tasks;
    // add callback to the sequence
    tasks.push(function() {
        notify("Distribution folder complete.");
        log("Distribution folder complete.");
        done();
    });
    // apply the tasks and callback to sequence
    return sequence.apply(task, tasks);
});
