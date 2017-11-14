// get and fill in path placeholders
var $paths = expand_paths(
	jsonc.parse(
		fs.readFileSync(`./configs/paths.cm.json`).toString(),
		null,
		true
	)
);
