// watch for files changes
gulp.task("task-watch", function(done) {
    // add auto tab closing capability to browser-sync. this will
    // auto close the used bs tabs when gulp closes.
    bs.use({
        plugin() {},
        hooks: {
            "client:js": bs_autoclose
        },
    });
    // start browser-sync
    bs.init({
        browser: browser,
        proxy: uri(INDEX), // uri("markdown/preview/README.html"),
        port: bs.__ports__[0],
        ui: {
            port: bs.__ports__[1]
        },
        notify: false,
        open: true
    }, function() {
        // the gulp watchers
        gulp.watch(gulp_watch.html, {
            cwd: "html/source/"
        }, function() {
            return sequence("task-html");
        });
        gulp.watch(gulp_watch.css, {
            cwd: "css/"
        }, function() {
            return sequence("task-cssapp", "task-csslibs", "task-csslibsfolder");
        });
        gulp.watch(gulp_watch.js, {
            cwd: "js/"
        }, function() {
            return sequence("task-jsapp", "task-jslibsource", "task-jslibs", "task-jslibsfolder");
        });
        gulp.watch(gulp_watch.img, {
            cwd: BASE
        }, function() {
            return sequence("task-img");
        });
        gulp.watch(["README.md"], {
            cwd: BASE
        }, function() {
            return sequence("task-readme", function() {
                bs.reload();
            });
        });
        done();
    });
});
