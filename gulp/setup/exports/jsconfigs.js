exports.jsconfigs = {
    "library": {
        "source": {
            "files": [
                    "lib.iife.top.js",
                    "lib.library.top.js",
                    "modules/fn.helpers.js",
                    "modules/fn.source.js",
                    "modules/fn.core.js",
                    "modules/constructor.js",
                    "lib.library.end.js",
                    "modules/globals.js",
                    "modules/bottom.js",
                    "lib.iife.end.js",
                    "test.js"
                ],
            "name": "app.js"
        },
        "thirdparty": {
            "files": [
                    "fastclick.js",
                    "libs.init.js"
                ],
            "name": "libs.js",
            "minified_name": "lib.min.js"
        }
    },
    "webapp": {
        "source": {
            "files": [
                    "app.iife.top.js",
                    "app.init.js",
                    "modules/libs.js",
                    "modules/globals.js",
                    "modules/utils.js",
                    "modules/$$.js",
                    "modules/core.js",
                    "modules/events.js",
                    "modules/main.js",
                    "app.iife.end.js"
                ],
            "name": "app.js"
        },
        "thirdparty": {
            "files": [
                    "fastclick.js"
                ],
            "name": "libs.js"
        }
    },
    "lib": {
        "tasks": [
                "task-lib-clean",
                "task-lib-js"
            ]
    }
};
