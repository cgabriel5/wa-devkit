# Project Structure

**Note**: Directory structure can be modified to ones liking. Files can be broken up and modularized in any way or not at all. Whatever changes are made the paths in `./configs/gulp/bundles.json` _must_ also match the new file structure.

##### Table of Contents

- [html/](#html-directory)
- [css/](#css-directory)
- [img/](#img-directory)
- [gulp/](#gulp-directory)
- [configs/](#configs-directory)
- [markdown/](#markdown-directory)
- [favicon/](#favicon-directory)
- [root/](#root-directory)

<a name="html-directory"></a>
## HTML Directory

<a name="html-default-tree"></a>
### Default Tree

```bash
html/
├── injection/
│   └── hello_world.txt
└── source/
    ├── body/
    │   ├── content.html
    │   ├── end.html
    │   ├── js.html
    │   └── start.html
    ├── head/
    │   ├── css.html
    │   ├── end.html
    │   ├── favicon.html
    │   ├── js.html
    │   ├── meta.html
    │   └── start.html
    └── index/
        ├── end.html
        └── top.html
```

<a name="html-break-down"></a>
### Break-Down

- `html/source/` where your project HTML files should go.
	- Files will build `./index.html`.
- `html/injection/` where your HTML injection files should go.
	- More information on HTML content injection can be found [here](./injection.md).

<a name="css-directory"></a>
## CSS Directory

<a name="css-default-tree"></a>
### Default Tree

```bash
css/
├── assets/
│   └── fonts/
│       └── font-awesome/
│           └── ...font-awesome files
├── bundles/
│   ├── app.css
│   └── vendor.css
├── source/
│   ├── helpers.css
│   └── styles.css
└── vendor/
    ├── font-awesome/
    │   └── css/
    │       └── font-awesome.css
    ├── normalize.css/
    │   └── normalize.css
    └── sanitize.css/
        └── sanitize.css
```

<a name="css-break-down"></a>
### Break-Down

- `css/assets/` where all vendor and vendor specific assets go. 
- `css/bundles/` where Gulp made bundled files will be placed.
	- `app.css` source bundled CSS file.
	- `vendor.css` vendor bundled CSS file.
- `css/source/` where your project CSS files should go.
	- `helpers.css` helper CSS file.
	- `styles.css` app specific CSS file.
	- Files will build `./css/bundles/app.css`.
- `css/vendor/` where vendor CSS files should go.
	- Files will build `./css/bundles/vendor.css`.

<a name="js-directory"></a>
## JS Directory

<a name="javascript-default-tree"></a>
### Default Tree

```bash
js/
├── bundles/
│   ├── app.js
│   └── libs.js
├── source/
│   ├── app/
│   │   ├── iife/
│   │   │   ├── end.js
│   │   │   └── top.js
│   │   └── __init__.js
│   └── modules/
│       ├── core.js
│       ├── events.js
│       ├── globals.js
│       ├── $$.js
│       ├── libs.js
│       ├── main.js
│       └── utils.js
└── vendor/
	├── fastclick/
	│   └── lib/
	│       └── fastclick.js
	├── jquery/
	│   └── dist/
	│       ├── core.js
	│       ├── jquery.js
	│       ├── jquery.min.js
	│       ├── jquery.slim.js
	│       └── jquery.slim.min.js
	└── modernizr/
		└── modernizr.js
```

<a name="javascript-break-down"></a>
### Break-Down

- `js/bundles/` where Gulp made bundled files will be placed.
	- `app.js` source bundled JS file.
	- `vendor.js` vendor bundled JS file.
- `js/source/` where your project JS files should go.
	- Files will build `./js/bundles/app.js`.
- `js/vendor/` where vendor JS files should go.
	- Files will build `./js/bundles/vendor.js`.

<a name="img-directory"></a>
## Img Directory

<a name="img-default-tree"></a>
### Default Tree

```bash
img/
└── README.md
```

<a name="img-break-down"></a>
### Break-Down

- `img/` directory contains a `README.md` placeholder and is otherwise empty.

<a name="gulp-directory"></a>
## Gulp Directory

<a name="gulp-default-tree"></a>
### Default Tree

```bash
gulp/
├── assets/
│   ├── img/
│   │   └── node-notifier/
│   │       ├── error_256.png
│   │       ├── gulp.png
│   │       ├── README.md
│   │       └── success_256.png
│   └── utils/
│       └── utils.js
└── source/
    ├── functions.js
    ├── helpers/
    │   ├── clear.js
    │   ├── dependency.js
    │   ├── favicon.js
    │   ├── files.js
    │   ├── help.js
    │   ├── instance.js
    │   ├── make.js
    │   ├── modernizr.js
    │   ├── open.js
    │   ├── pretty.js
    │   ├── purify.js
    │   └── tohtml.js
    ├── injection.js
    ├── paths.js
    ├── requires.js
    ├── tasks/
    │   ├── css.js
    │   ├── dist.js
    │   ├── html.js
    │   ├── images.js
    │   ├── init.js
    │   ├── js.js
    │   ├── lib.js
    │   └── watch.js
    └── vars.js
```

<a name="gulp-break-down"></a>
### Break-Down

- `gulp/assets/` assets needed for `gulpfile.js`.
- `gulp/source/` source files that build `./gulpfile.js`.

<a name="configs-directory"></a>
## Configs Directory

<a name="configs-default-tree"></a>
### Default Tree

```bash
configs/
├── app.json
├── favicondata.json
├── gulp/
│   ├── bundles.json
│   └── plugins.json
├── .hidden-internal.json
├── jsbeautify.json
└── modernizr.json
```

<a name="configs-break-down"></a>
### Break-Down

- `configs/gulp/` `gulpfile.js` specific configuration files.
- `configs/` project configuration files.

<a name="markdown-directory"></a>
## Markdown Directory

<a name="markdown-default-tree"></a>
### Default Tree

```bash
markdown/
├── assets/
│   └── css/
│       ├── github-markdown.css
│       └── prism-github.css
└── previews/
```

<a name="markdown-break-down"></a>
### Break-Down

- `markdown/assets/` assets needed the Gulp `tohtml` task which converts `.md` files to `.html`.
- `markdown/previews/` tohtml file conversions will get placed here, simply open the file in your browser to view it.

<a name="favicon-directory"></a>
## Favicon Directory

<a name="favicon-default-tree"></a>
### Default Tree

```bash
favicon/
└── ...favicon image files
```

<a name="favicon-break-down"></a>
### Break-Down

- `favicon/` favicons are generated via [`gulp-real-favicon`](https://github.com/RealFaviconGenerator/gulp-real-favicon) and placed in this folder.

<a name="root-directory"></a>
## Root Directory

<a name="root-default-tree"></a>
### Default Tree

```bash
./
├── apple-touch-icon.png
├── browserconfig.xml
├── CONTRIBUTING.md
├── .editorconfig
├── favicon.ico
├── .gitattributes
├── .gitignore
├── gulpfile.main.js
├── gulpfile.setup.js
├── index.html
├── LICENSE.txt
├── manifest.json
├── package.json
├── README.md
└── yarn.lock
```

<a name="root-break-down"></a>
### Break-Down

- `./` list of `root` files.
- `./` root files are self explanatory.
