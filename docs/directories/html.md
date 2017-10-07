# HTML Directory

**Note**: Directory structure can be modified to ones liking. However, the paths in `./configs/gulp/bundles.json` must also match the made changes.

### Tree

```bash
html/
├── regexp/
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

### Explanation

- `css/source/` where your project HTML files should go.
	- Files will build `./index.html`.
- `css/regexp/` where your HTML injection files should go.
	- More information on HTML file injection can be found here.
