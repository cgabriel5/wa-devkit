# Setup

Run the following commands to setup the project.

```bash
# one after another...

$ yarn install # Install node modules.
$ gulp --silent --gulpfile gulpfile.setup.js init # Follow on-screen prompt questions.

# or as one line...

$ yarn install && gulp --silent --gulpfile gulpfile.setup.js init
```

`$ gulp --silent --gulpfile gulpfile.setup.js init` will ready project files _and_ create the initial project commit. Once complete run `$ gulp` to watch project files for any changes. Available project Gulp commands and their documentation can be found [here](/docs/commands.md).

**Note**: Provided replies will be used to auto-fill the following files:
- [`gulp/setup/templates/README.md`](/gulp/setup/templates/README.md)
- [`gulp/setup/templates/LICENSE.txt`](/gulp/setup/templates/LICENSE.txt)
- [`package.json`](/package.json)
- [`html/source/head/meta.html`](/html/source/head/meta.html)
