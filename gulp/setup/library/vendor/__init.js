/**
 * This IIFE is used to initialize the used vendor libraries and should
 * always be last in the js.vendor.files array found in
 * ./configs/bundles.json.
 *
 * Add any code necessary to initialize the used vendor libraries here.
 */
(function() {
	// Initialize FastClickJS: [https://github.com/ftlabs/fastclick#usage]
	if ("addEventListener" in document) {
		document.addEventListener(
			"DOMContentLoaded",
			function() {
				FastClick.attach(document.body);
			},
			false
		);
	}
})();
