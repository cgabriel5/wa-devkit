# Modules

⚠ &mdash; _This only pertains to_ `webapp` _projects._

### What is a module?

A module is just a way to modularize ones app. [`./js/source/modules/`](/js/source/modules/) contains a set of default modules. Simply add needed modules, or delete the ones that are not necessary. The goal is to keep code modular for better maintainability. 

### Adding/removing a module

- Create the file and place it in [`./js/source/modules/`](/js/source/modules/). Then make sure to add the file's path to the `js.source.files` array in `./configs/bundles/json`.
- To remove a module delete the file from [`./js/source/modules/`](/js/source/modules/) and remove the file path from the `js.source.files` array in `./configs/bundles/json` as well.

### Structure

A module has the following structure:

```js
app.module(
	"MODULE_NAME",
	function(modules, name) { // MODULE_FUNCTION
		// app logic...
	},
	"MODULE_MODE",
	"MODULE_DESCRIPTION"
);
```

- `MODULE_NAME`: The name of the module.
- `MODULE_FUNCTION`: The app's logic.
	- `modules`: List of all modules to be able to access other module's exported code.
	- `name`: Name of current module.
- `MODULE_MODE`: The mode in which the module should load (`complete`|`interactive`).
- `MODULE_DESCRIPTION`: An optional description of what the module is for.

### Example

Here is the [`./js/source/modules/libs.js`](/js/source/modules/libs.js) module. 

**Note**: From within the function's body one is able to access other module's exports as needed.

```js
app.module(
	"utils",
	function(modules, name) {
		// app logic...
	},
	"complete",
	"module handles app function utilities"
);
```
