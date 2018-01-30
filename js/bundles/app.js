// IIFE start
(function(window) {
	"use strict";

	/**
	 * This IIFE is used to initialize all the project modules found in
	 * ./js/source/modules. Essentially, it will loop over all modules and
	 * invoke them based on the mode (complete|interactive) provided. When
	 * a mode is not provided it will default to "complete". For information
	 * about what mode to use see below.
	 */
	(function() {
		// add to global scope for ease of use
		// use global app var or create it if not present
		var app = window.app || (window.app = {}),
			counter = {
				complete: 0,
				interactive: 0
			},
			queue = {
				complete: [],
				interactive: []
			};

		// add a module to load
		app.module = function(module_name, fn, mode) {
			// determine what array the module needs to be added to.
			// default to complete when nothing is provided.
			var type =
				!mode || mode === "complete" ? "complete" : "interactive";
			// add the module to the queue
			queue[type].push([module_name, fn]);
		};

		// app module invoker
		var invoke = function(mode) {
			// get the queued array
			var modules = queue[mode];
			// if no modules, return
			if (!modules.length) return;
			// run the modules one after another
			// get the first module
			load(modules, counter[mode], mode);
		};

		var load = function(modules, count, mode) {
			// get the current module + its information
			var module = modules[count];
			// if no module exists all modules have loaded
			if (!module) return;
			// get the module information
			var module_name = module[0],
				fn = module[1];
			// run the module and the load() function
			(function() {
				// add the module name to the app
				app[module_name] = app[module_name] || {};
				// call the module and run it
				fn.call(app, app, module_name);
				// increase the counter
				counter[mode]++;
				// run the load function again
				load(modules, counter[mode], mode);
			})();
		};

		// cleanup the app variable
		var cleanup = function() {
			// remove unneeded properties once
			// the app has loaded
			delete app.module;
			delete app.invoke;
		};

		// [https://developer.mozilla.org/en-US/docs/Web/Events/readystatechange]
		// the readystatechange event is fired when the readyState attribute of a
		// document has changed
		document.onreadystatechange = function() {
			// [https://developer.mozilla.org/en-US/docs/Web/API/Document/readyState]

			// [LOADING]:
			// loading => the document still loading.

			// [COMPLETE]:
			// complete => the document and all sub-resources have finished
			// loading (same as the window.onload event).
			//
			// Essentially the following...
			// window.addEventListener("load", function() {...
			// [https://developer.mozilla.org/en-US/docs/Web/Events/load]

			// [INTERACTIVE]:
			// interactive => the document has finished loading & parsed but
			// sub-resources such as images, stylesheets and frames are still
			// loading.
			//
			// Essentially the following...
			// document.addEventListener("DOMContentLoaded",...
			// [https://developer.mozilla.org/en-US/docs/Web/Events/DOMContentLoaded]

			// document loaded and parsed but still loading sub-resources,
			// but user is able to interact with page.
			if (document.readyState === "interactive") {
				// invoke the modules set to mode interactive
				invoke("interactive");
			}

			// all resources have loaded (document + subresources)
			if (document.readyState === "complete") {
				// invoke the modules set to mode complete
				invoke("complete");
				// cleanup app var once everything is loaded
				cleanup();
			}

			// explanation with images:
			// [https://varvy.com/performance/document-ready-state.html]
		};
	})();

	app.module(
		"libs",
		function(modules, name) {
			// init FastClickJS
			if ("addEventListener" in document) {
				FastClick.attach(document.body);
			}
		},
		"interactive"
	);

	app.module(
		"globals",
		function(modules, name) {
			// app logic...
		},
		"complete",
		"module handles global app variables"
	);

	app.module(
		"utils",
		function(modules, name) {
			// app logic...
		},
		"complete",
		"module handles app function utilities"
	);

	app.module(
		"$$",
		function(modules, name) {
			// app logic...
		},
		"complete",
		"module handles getting needed elements"
	);

	app.module(
		"core",
		function(modules, name) {
			// app logic...
		},
		"complete",
		"module handles core app functions"
	);

	app.module(
		"events",
		function(modules, name) {
			// app logic...
		},
		"complete",
		"module handles app event handlers"
	);

	app.module(
		"main",
		function(modules, name) {
			// app logic...
			console.log("My app has loaded!");
		},
		"complete",
		"main app module. where the apps logic should me placed"
	);

	// IIFE end
})(window);
