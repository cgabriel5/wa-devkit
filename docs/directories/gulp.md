# Gulp Directory

**Note**: Directory structure can be modified to ones liking. However, the paths in `./configs/gulp/bundles.json` must also match the made changes.

### Tree

```bash
gulp/
├── assets/
│   ├── img/
│   │   └── node-notifier/
│   │       ├── error_256.png
│   │       ├── gulp.png
│   │       ├── sources.txt
│   │       └── success_256.png
│   └── utils/
│       └── utils.js
└── source/
    ├── favicon.js
    ├── functions.js
    ├── helpers.js
    ├── help.js
    ├── init.js
    ├── make.js
    ├── paths.js
    ├── requires.js
    ├── task-dist.js
    ├── task-lib.js
    ├── tasks-css.js
    ├── tasks-html.js
    ├── tasks-images.js
    ├── tasks-js.js
    ├── tasks-markdown.js
    ├── tasks-watch.js
    └── vars.js
```

### Explanation

- `gulp/assets/` assets needed for `gulpfile.js`.
- `gulp/source/` source files that build `./gulpfile.js`.
