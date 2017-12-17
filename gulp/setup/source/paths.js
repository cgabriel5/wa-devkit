// get and fill in path placeholders
var $paths = expand_paths(
	Object.assign(require("./gulp/setup/exports/paths.js"), {
		// add in the following paths
		dirname: __dirname,
		filename: __filename,
		cwd: process.cwd(),
		// store the project folder name
		rootdir: path.basename(process.cwd())
	})
);
