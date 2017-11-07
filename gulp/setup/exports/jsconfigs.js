"use strict";

exports.jsconfigs = {
    library: {
        source: {
            files: [
                "lib/iife/open.js",
                "lib/library/open.js",
                "modules/fn.helpers.js",
                "modules/fn.source.js",
                "modules/fn.core.js",
                "modules/constructor.js",
                "lib/library/close.js",
                "modules/globals.js",
                "modules/bottom.js",
                "lib/iife/close.js",
                "test/main.js"
            ],
            names: {
                main: "app.js",
                libs: {
                    main: "libs.js",
                    min: "lib.min.js"
                }
            }
        },
        vendor: {
            files: [
                "js/vendor/modernizr/modernizr.js",
                "js/vendor/jquery/jquery.js",
                "js/vendor/fastclick/fastclick.js",
                "js/vendor/__init__.js"
            ],
            names: {
                main: "vendor.js"
            }
        }
    },
    webapp: {
        source: {
            files: [
                "app/iife/open.js",
                "app/__init__.js",
                "modules/libs.js",
                "modules/globals.js",
                "modules/utils.js",
                "modules/$$.js",
                "modules/core.js",
                "modules/events.js",
                "modules/main.js",
                "app/iife/close.js"
            ],
            names: {
                main: "app.js"
            }
        },
        vendor: {
            files: [
                "js/vendor/modernizr/modernizr.js",
                "js/vendor/jquery/jquery.js",
                "js/vendor/fastclick/fastclick.js"
            ],
            names: {
                main: "vendor.js"
            }
        }
    },
    lib: {
        tasks: ["lib:clean", "lib:js"]
    }
};
