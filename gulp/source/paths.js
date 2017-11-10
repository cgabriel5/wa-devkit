//  get the paths
var __paths__ = jsonc.parse(
	fs.readFileSync(`./configs/paths.cm.json`).toString(),
	null,
	true
);

// path placeholders substitutes. these paths will also get added to the
// paths object after substitution down below.
var __paths_subs__ = {
	// paths::BASES
	del: "/",
	base: "./",
	base_dot: ".",
	dirname: __dirname,
	cwd: process.cwd(),
	homedir: "" // "assets/"
};

// recursively replace all the placeholders
for (var key in __paths__) {
	if (__paths__.hasOwnProperty(key)) {
		var __path = __paths__[key];
		// find all the placeholders
		while (/\$\{.*?\}/g.test(__path)) {
			__path = __path.replace(/\$\{.*?\}/g, function(match) {
				var replacement =
					__paths_subs__[match.replace(/^\$\{|\}$/g, "")];
				return replacement !== undefined ? replacement : undefined;
			});
		}
		// reset the substituted string back in the __paths__ object
		__paths__[key] = __path;
	}
}

// add the subs to the paths object
for (var key in __paths_subs__) {
	if (__paths_subs__.hasOwnProperty(key)) {
		__paths__[key] = __paths_subs__[key];
	}
}
