# Setup

Run the following commands to setup the project.

```bash
# one after another...

$ yarn install # Install node modules.
$ gulp --silent --gulpfile gulpfile.setup.js init # Follow on-screen prompt questions.

# or as one line...

$ yarn install && gulp --silent --gulpfile gulpfile.setup.js init
```

**Note**: `$ gulp --silent --gulpfile gulpfile.setup.js init` fill the template placeholders with the provided answers, ready project files, create initial project commit, _and_ do other things like remove the setup files.

Once complete run `$ gulp` to watch project files for any changes. 

Available project Gulp commands and their documentation can be found [here](/docs/commands.md).
