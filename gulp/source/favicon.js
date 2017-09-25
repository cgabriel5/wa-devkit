// File where the favicon markups are stored
var FAVICON_DATA_FILE = "favicondata.json";
// Generate the icons. This task takes a few seconds to complete.
// You should run it at least once to create the icons. Then,
// you should run it whenever RealFaviconGenerator updates its
// package (see the check-for-favicon-update task below).
gulp.task("generate-favicon", function(done) {
    real_favicon.generateFavicon({
        masterPicture: "img/logo/leaf-900.png",
        dest: "favicon/",
        iconsPath: "favicon/",
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
        markupFile: FAVICON_DATA_FILE
    }, function() {
        done();
    });
});
// Inject the favicon markups in your HTML pages. You should run
// this task whenever you modify a page. You can keep this task
// as is or refactor your existing HTML pipeline.
gulp.task("inject-favicon-markups", function() {
    return gulp.src(["./html/source/head/favicon.html"])
        .pipe(real_favicon.injectFaviconMarkups(JSON.parse(fs.readFileSync(FAVICON_DATA_FILE))
            .favicon.html_code))
        .pipe(gulp.dest("./html/source/head"));
});
// Check for updates on RealFaviconGenerator (think: Apple has just
// released a new Touch icon along with the latest version of iOS).
// Run this task from time to time. Ideally, make it part of your
// continuous integration system.
gulp.task("check-for-favicon-update", function(done) {
    var currentVersion = JSON.parse(fs.readFileSync(FAVICON_DATA_FILE))
        .version;
    real_favicon.checkForUpdates(currentVersion, function(err) {
        if (err) {
            throw err;
        }
    });
});
