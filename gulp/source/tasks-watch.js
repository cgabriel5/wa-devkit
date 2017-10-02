// watch for files changes
// @internal
gulp.task("watch:main", function(done) {
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
        proxy: uri({
            "appdir": APPDIR,
            "filepath": INDEX,
            "https": config_user.https
        }), // "markdown/preview/README.html"
        port: bs.__ports__[0],
        ui: {
            port: bs.__ports__[1]
        },
        notify: false,
        open: true
    }, function() {
        // the gulp watchers
        //
        // watch for any changes to HTML files
        gulp.watch(bundles.gulp.watch.html, {
            cwd: __PATHS_HTML_SOURCE
        }, function() {
            return sequence("html:main");
        });
        // watch for any changes to CSS Source files
        gulp.watch(bundles.gulp.watch.css.source, {
            cwd: __PATHS_CSS_SOURCE
        }, function() {
            return sequence("css:app");
        });
        // watch for any changes to CSS Lib files
        gulp.watch(bundles.gulp.watch.css.thirdparty, {
            cwd: __PATHS_CSS_THIRDPARTY
        }, function() {
            return sequence("css:libs");
        });
        // watch for any changes to JS Source files
        gulp.watch(bundles.gulp.watch.js.source, {
            cwd: __PATHS_JS_SOURCE
        }, function() {
            return sequence("js:app");
        });
        // watch for any changes to JS Lib files
        gulp.watch(bundles.gulp.watch.js.thirdparty, {
            cwd: __PATHS_JS_THIRDPARTY
        }, function() {
            return sequence("js:libs");
        });
        // watch for any changes to IMG files
        gulp.watch(bundles.gulp.watch.img, {
            cwd: __PATHS_IMG_SOURCE
        }, function() {
            return sequence("img:main");
        });
        // watch for any changes to README.md
        gulp.watch([__PATHS_README], {
            cwd: __PATHS_BASE
        }, function() {
            return sequence("readme:main", function() {
                bs.reload();
            });
        });
        done();
    });
});
