// The readystatechange event is fired when the readyState attribute of a
// document has changed.
// [https://developer.mozilla.org/en-US/docs/Web/Events/readystatechange]
document.onreadystatechange = function() {
	"use strict";

	// [https://developer.mozilla.org/en-US/docs/Web/API/Document/readyState]

	// Loading: The document still loading.

	// Complete: The document and all sub-resources have finished loading
	//  (same as the window.onload event).
	//
	// Essentially the following:
	// window.addEventListener("load", function() {...
	// [https://developer.mozilla.org/en-US/docs/Web/Events/load]

	// Interactive: The document has finished loading & parsed but
	// sub-resources such as images, stylesheets, and frames are still
	// loading.
	//
	// Essentially the following:
	// document.addEventListener("DOMContentLoaded",...
	// [https://developer.mozilla.org/en-US/docs/Web/Events/DOMContentLoaded]

	// Document loaded and parsed but still loading sub-resources. User
	// is able to interact with page, however.
	if (document.readyState == "interactive") {
		// App logic...
	}

	// Or.

	// All resources have loaded (document + subresources).
	if (document.readyState == "complete") {
		// App logic...
	}

	// Explanation with images:
	// [https://varvy.com/performance/document-ready-state.html]
};
