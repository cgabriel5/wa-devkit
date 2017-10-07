# Add Library

### JavaScript Library

The following steps show how to add a `JavaScript` third-party library:

1. Say we want to add [jQuery](https://jquery.com/). Get the library and place it in `js/libs/` as `js/libs/jquery.js`, for example.
2. In `gulp/config.json` add the file name to the `paths.bundles.js.thirdparty` array.
	- By default the array comes pre-populated like so: `["fastclick.js", "libs.init.js"]`.
	- After the change it should be: `["fastclick.js", "jquery.js", "libs.init.js"]`.

**Note**: `libs.init.js` should always be last in the array as it is meant to help initialize any third-party library. In other words, any code needed to help initialize the used libraries must go here.

**Note**: Array order is important as it indicates the order in which files will be concatenated to make the `js/libs.js` bundle.

- Therefore, `fastclick.js + jquery.js + libs.init.js = js/libs.js`.

### CSS Library

The following steps show how to add a `CSS` third-party library:

1. Say we want to add [Bulma](https://github.com/jgthms/bulma). Get the library and place it in `css/libs/` as `css/libs/bulma.css`, for example.
2. In `gulp/config.json` add the file name to the `paths.bundles.css.thirdparty` array.
	- By default the array comes pre-populated like so: `["font-awesome-4.7.0/css/font-awesome.css"]`.
	- After the change it should be: `["font-awesome-4.7.0/css/font-awesome.css", "bulma.css"]`.

**Note**: Array order is important as it indicates the order in which files will be concatenated to make the `css/libs.css` bundle.

- Therefore, `font-awesome-4.7.0/css/font-awesome.css + bulma.css = css/libs.css`.
