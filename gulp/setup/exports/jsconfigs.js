"use strict";

exports.jsconfigs = {
    "library": {
        "source": {
            "files": [
	                "lib/iife/top.js",
	                "lib/library/top.js",
	                "modules/fn.helpers.js",
	                "modules/fn.source.js",
	                "modules/fn.core.js",
	                "modules/constructor.js",
	                "lib/library/end.js",
	                "modules/globals.js",
	                "modules/bottom.js",
	                "lib/iife/end.js",
	                "test/main.js"
                ],
            "names": {
                "main": "app.js",
                "libs": {
                    "main": "libs.js",
                    "min": "lib.min.js"
                }
            }
        },
        "vendor": {
            "files": [
	            	"js/vendor/modernizr/modernizr.js",
	            	"js/vendor/jquery/jquery.js",
	                "js/vendor/fastclick/fastclick.js",
	                "js/vendor/__init__.js"
                ],
            "names": {
                "main": "vendor.js"
            }
        }
    },
    "webapp": {
        "source": {
            "files": [
	                "app/iife/top.js",
	                "app/__init__.js",
	                "modules/libs.js",
	                "modules/globals.js",
	                "modules/utils.js",
	                "modules/$$.js",
	                "modules/core.js",
	                "modules/events.js",
	                "modules/main.js",
	                "app/iife/end.js"
                ],
            "names": {
                "main": "app.js"
            }
        },
        "vendor": {
            "files": [
					"js/vendor/modernizr/modernizr.js",
					"js/vendor/jquery/jquery.js",
					"js/vendor/fastclick/fastclick.js"
                ],
            "names": {
                "main": "vendor.js"
            }
        }
    },
    "lib": {
        "tasks": [
	            "lib:clean",
	            "lib:js"
		]
    }
};
