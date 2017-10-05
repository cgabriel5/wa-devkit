// Generate the icons. This task takes a few seconds to complete.
// You should run it at least once to create the icons. Then,
// you should run it whenever RealFaviconGenerator updates its
// package (see the check-for-favicon-update task below).
// @internal
gulp.task("favicon:generate", function(done) {
    real_favicon.generateFavicon({
        masterPicture: __PATHS_FAVICON_MASTER_PIC,
        dest: __PATHS_FAVICON_DEST,
        iconsPath: __PATHS_FAVICON_DEST,
        design: {
            ios: {
                pictureAspect: "backgroundAndMargin",
                backgroundColor: "#f6f5dd",
                margin: "53%",
                assets: {
                    ios6AndPriorIcons: true,
                    ios7AndLaterIcons: true,
                    precomposedIcons: true,
                    declareOnlyDefaultIcon: true
                }
            },
            desktopBrowser: {},
            windows: {
                pictureAspect: "whiteSilhouette",
                backgroundColor: "#00a300",
                onConflict: "override",
                assets: {
                    windows80Ie10Tile: true,
                    windows10Ie11EdgeTiles: {
                        small: true,
                        medium: true,
                        big: true,
                        rectangle: true
                    }
                }
            },
            androidChrome: {
                pictureAspect: "backgroundAndMargin",
                margin: "42%",
                backgroundColor: "#f6f5dd",
                themeColor: "#f6f5dd",
                manifest: {
                    display: "standalone",
                    orientation: "notSet",
                    onConflict: "override",
                    declared: true
                },
                assets: {
                    legacyIcon: false,
                    lowResolutionIcons: false
                }
            },
            safariPinnedTab: {
                pictureAspect: "silhouette",
                themeColor: "#699935"
            }
        },
        settings: {
            scalingAlgorithm: "Mitchell",
            errorOnImageTooSmall: false
        },
        markupFile: __PATHS_FAVICON_DATA_FILE
    }, function() {
        done();
    });
});

// update manifest.json
// @internal
gulp.task("favicon:edit-manifest", function(done) {
    var manifest = json.read(__PATHS_FAVICON_ROOT_MANIFEST);
    manifest.set("name", "wa-devkit");
    manifest.set("short_name", "WADK");
    manifest.write(function() {
        done();
    }, null, json_spaces);
});

// copy favicon.ico and apple-touch-icon.png to the root
// @internal
gulp.task("favicon:root", function(done) {
    var task = this;
    pump([gulp.src([__PATHS_FAVICON_ROOT_ICO, __PATHS_FAVICON_ROOT_PNG, __PATHS_FAVICON_ROOT_CONFIG, __PATHS_FAVICON_ROOT_MANIFEST]),
        gulp.dest(__PATHS_BASE),
    	debug(task.__wadevkit.debug),
        bs.stream()
    ], done);
});

// copy delete unneeded files
// @internal
gulp.task("favicon:delete", function(done) {
    var task = this;
    pump([gulp.src([__PATHS_FAVICON_ROOT_CONFIG, __PATHS_FAVICON_ROOT_MANIFEST]),
    	clean(),
    	debug(task.__wadevkit.debug)
    ], done);
});

// inject new favicon html
// @internal
gulp.task("favicon:html", function(done) {
    var task = this;
    pump([gulp.src(__PATHS_FAVICON_HTML),
        real_favicon.injectFaviconMarkups(JSON.parse(fs.readFileSync(__PATHS_FAVICON_DATA_FILE))
            .favicon.html_code),
        gulp.dest(__PATHS_FAVICON_HTML_DEST),
        debug(task.__wadevkit.debug),
        bs.stream()
    ], done);
});

/**
 * Re-build project favicons.
 *
 * Usage
 *
 * $ gulp favicon # Re-build favicons.
 */
gulp.task("favicon", function(done) {
    // this task can only run when gulp is not running as gulps watchers
    // can run too many times as many files are potentially being beautified
    if (config_internal.get("pid")) { // Gulp instance exists so cleanup
        gulp_check_warn();
        return done();
    }
    return sequence("favicon:generate", "favicon:edit-manifest", "favicon:root", "favicon:delete", "favicon:html", "html:main", "readme:main", "pretty", function(err) {
        log("Favicons generated.");
        done();
    });
});

// Check for updates on RealFaviconGenerator (think: Apple has just
// released a new Touch icon along with the latest version of iOS).
// Run this task from time to time. Ideally, make it part of your
// continuous integration system.
// Check for RealFaviconGenerator updates.
// @internal
gulp.task("favicon-updates", function(done) {
    var currentVersion = JSON.parse(fs.readFileSync(__PATHS_FAVICON_DATA_FILE))
        .version;
    real_favicon.checkForUpdates(currentVersion, function(err) {
        if (err) {
            throw err;
        }
    });
});
