// HTML injection variable object.
var html_injection = {
	css_bundle_app:
		$paths.css_bundles + get(bundle_css, "source.names.main", ""),
	css_bundle_vendor:
		$paths.css_bundles + get(bundle_css, "vendor.names.main", ""),
	js_bundle_app: $paths.js_bundles + get(bundle_js, "source.names.main", ""),
	js_bundle_vendor:
		$paths.js_bundles + get(bundle_js, "vendor.names.main", "")
};
