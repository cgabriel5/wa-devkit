// https://developer.mozilla.org/en-US/docs/Web/Events/readystatechange
// the readystatechange event is fired when the readyState attribute of a
// document has changed
document.onreadystatechange = function() {
	"use strict";

	/* [functions.utils] */
	// https://developer.mozilla.org/en-US/docs/Web/API/Document/readyState
	// loading === document still loading
	// complete === document and all sub-resources have finished loading.
	// same as the window.onload event
	// interactive === document has finished loading & parsed but but
	// sub-resources such as images, stylesheets and frames are still loading
	// **Note: interactive === document.addEventListener("DOMContentLoaded",...
	// **Note: complete    === window.addEventListener("load", function() {...
	// [DOMContentLoaded](https://developer.mozilla.org/en-US/docs/Web/Events/DOMContentLoaded)
	// [load](https://developer.mozilla.org/en-US/docs/Web/Events/load)
	// document loaded and parsed. however, still loading subresources
	// user is able to interact with page.
	if (document.readyState == "interactive") {
		// app logic...
	}

	// or...

	// all resources have loaded (document + subresources)
	if (document.readyState == "complete") {
		// app logic...
	}

	// good explanation with images:
	// https://varvy.com/performance/document-ready-state.html
};
