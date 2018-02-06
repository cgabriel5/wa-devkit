<p align="center"><img src="/docs/brand/img/leaf-216.png?raw=true" alt="wa-devkit logo-leaf" width="8%"></p>
<p align="center"><img src="/docs/brand/img/text.png?raw=true" alt="wa-devkit logo-text" width="40%"></p>
<p align="center"><code>wa-devkit</code> (WebApplication-DevelopmentKit) is a simple, easy-to-use, modular<br>boilerplate solution made for building web-applications or JavaScript libraries.</p>
<h1></h1>

### Quick Start
1. Clone repo &mdash; `$ git clone https://github.com/cgabriel5/wa-devkit.git "my_app_name"`
2. [Setup](/docs/setup.md) boilerplate to get up and running:
	- First install dependencies... &mdash; `$ yarn install`
	- ...then start setup prompt. &mdash; `$ gulp -f gulpfile-setup.js init`
3. Get acquainted with the provided Gulp [commands](/docs/commands.md).
4. Look over all other [documentation](/docs/).
5. Start developing!

### Features

- Painless project terminal setup via ([`gulpfile-setup.js`](/gulpfile-setup.js)).
	- Don't worry about having multiple `gulpfiles`. Setup will leave a single file called `gulpfile.js`.
	- Easily generate your project's [`LICENSE.txt`](/LICENSE.txt) during setup. ([supported licenses](https://github.com/sdgluck/create-license/tree/master/licenses))
	- Programmatically makes project's initial commit on setup completion. Establishing project birth! :)
- Boilerplate provides the project structure to get up and running.
	- Modify project as needed.
- Fleshed out [`gulpfile.js`](/gulpfile-main.js) file.
	- Contains tasks that handle file concatenation, minification, beautification, etc.
	- Easily convert `.md` (`markdown`) files to their `.html` counterparts for previewing.
	- Create project favicons via [`RealFaviconGenerator`](https://realfavicongenerator.net/).
	- File reload via [`BrowserSync`](https://www.browsersync.io/).
		- Auto-detects free ports to use.
		- Auto-closes opened tabs when Gulp terminal process ends.
	- Search project files via the custom Gulp `files` task.
- Conveniently includes the following front-end libraries:
	- [`font-awesome`](http://fontawesome.io/)
	- [`sanitize.css`](https://jonathantneal.github.io/sanitize.css/) &mdash; Uses [`sanitize.css`](https://jonathantneal.github.io/sanitize.css/) by default.
	- [`normalize.css`](http://necolas.github.io/normalize.css/) &mdash; Easily switch to [`normalize.css`](http://necolas.github.io/normalize.css/) if desired.
	- [`modernizr.js`](https://modernizr.com/) &mdash; Support for building a custom build.
	- [`fastclick.js`](https://labs.ft.com/fastclick/)
	- [`jquery.js`](https://jquery.com/)
	- *Don't* need a pre-installed library? Simply [remove](/docs/vendor.md#remove) what you don't need.
	- Need to add something else? [Add](/docs/vendor.md#add) what you do need.
- Considerable amount of project documentation via inline comments, project's [`docs/`](/docs/) section, and terminal documentation provided by the custom Gulp [help command](/docs/commands.md): `$ gulp help`.

### Dependencies

- Project uses:
	- [`NodeJS`](https://nodejs.org/en/) &mdash; An open source, cross-platform server framework.
	- [`Gulp`](https://gulpjs.com/) &mdash; Automates painful or time-consuming development tasks.
	- [`Yarn`](https://yarnpkg.com/en/) &mdash; Fast, reliable, and secure dependency management.
	- [`Git`](https://git-scm.com/) &mdash; Distributed version control system.
	- [`Growl`](https://github.com/tj/node-growl/) &mdash; Unobtrusive notification system for NodeJS.
	- *Make sure they are installed.*

### Documentation

All project documentation can be found under the [`docs/`](/docs/) directory.

### Contributing

Contributions are welcome! Found a bug, feel like documentation is lacking/confusing and needs an update, have performance/feature suggestions or simply found a typo? Let me know! :)

See how to contribute [here](/CONTRIBUTING.md).

### License

This project uses the [MIT License](/LICENSE.txt).
