# JS Directory

**Note**: Directory structure can be modified to ones liking. However, the paths in `./configs/gulp/bundles.json` must also match the made changes.

### Tree

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

### Explanation

- `js/bundles/` where Gulp made bundled files will be placed.
	- `app.js` source bundled JS file.
	- `vendor.js` vendor bundled JS file.
- `js/source/` where your project JS files should go.
	- Files will build `./js/bundles/app.js`.
- `js/vendor/` where vendor JS files should go.
	- Files will build `./js/bundles/vendor.js`.
