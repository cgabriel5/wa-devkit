// [https://developer.mozilla.org/en-US/docs/Web/Events/readystatechange]
// the readystatechange event is fired when the readyState attribute of a
// document has changed
document.onreadystatechange = function() {
	"use strict";

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
	if (document.readyState == "interactive") {
		// app logic...
	}

	// or...

	// all resources have loaded (document + subresources)
	if (document.readyState == "complete") {
		// app logic...
	}

	// explanation with images:
	// [https://varvy.com/performance/document-ready-state.html]
};
