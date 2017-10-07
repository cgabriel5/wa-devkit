# CSS Directory

**Note**: Directory structure can be modified to ones liking. However, the paths in `./configs/gulp/bundles.json` must also match the made changes.

### Tree

```bash
css/
├── assets/
│   └── fonts/
│       └── font-awesome/
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

### Explanation

- `css/assets/` where all vendor or another CSS specific assets go. 
- `css/bundles/` where Gulp made bundled files will be placed.
	- `app.css` source bundled CSS file.
	- `vendor.css` vendor bundled CSS file.
- `css/source/` where your project CSS files should go.
	- `helpers.css` helper CSS file
	- `styles.css` app specific CSS file.
	- Files will build `css/bundles/app.css`.
- `css/vendor/` where vendor CSS files should go.
	- Files will build `css/bundles/vendor.css`.
