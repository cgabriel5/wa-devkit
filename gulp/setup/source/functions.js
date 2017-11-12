/**
 * @description [Add a bang to the start of the string.]
 * @param  {String} string [The string to add the bang to.]
 * @return {String}        [The new string with bang added.]
 */
function bangify(string) {
	return "!" + (string || "");
}

/**
 * @description [Appends the ** pattern to string.]
 * @param  {String} string [The string to add pattern to.]
 * @return {String}        [The new string with added pattern.]
 */
function globall(string) {
	return (string || "") + "**";
}

/**
 * @description [Returns the provided file's extension or checks it against the provided extension type.]
 * @param  {Object} file [The Gulp file object.]
 * @param  {Array} types [The optional extension type(s) to check against.]
 * @return {String|Boolean}      [The file's extension or boolean indicating compare result.]
 */
function ext(file, types) {
	// when no file exists return an empty string
	if (!file) return "";

	// get the file extname
	var extname = path
		.extname(file.path)
		.toLowerCase()
		.replace(/^\./, "");

	// simply return the extname when no type is
	// provided to check against.
	if (!types) return extname;

	// else when a type is provided check against it
	return Boolean(-~types.indexOf(extname));
}

// check for the usual file types
ext.ishtml = function(file) {
	return ext(file, ["html"]);
};
ext.iscss = function(file) {
	return ext(file, ["css"]);
};
ext.isjs = function(file) {
	return ext(file, ["js"]);
};
ext.isjson = function(file) {
	return ext(file, ["json"]);
};

/**
 * @description  [Recursively fill-in the placeholders in each path contained
 *               in the provided paths object.]
 * @param  {Object} $paths [Object containing the paths.]
 * @return {Object}           [The object with paths filled-in.]
 */
function expand_paths($paths) {
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

	var replacer = function(match) {
		var replacement = __paths_subs__[match.replace(/^\$\{|\}$/g, "")];
		return replacement !== undefined ? replacement : undefined;
	};
	// recursively replace all the placeholders
	for (var key in $paths) {
		if ($paths.hasOwnProperty(key)) {
			var __path = $paths[key];

			// find all the placeholders
			while (/\$\{.*?\}/g.test(__path)) {
				__path = __path.replace(/\$\{.*?\}/g, replacer);
			}
			// reset the substituted string back in the $paths object
			$paths[key] = __path;
		}
	}

	// add the subs to the paths object
	for (var key in __paths_subs__) {
		if (__paths_subs__.hasOwnProperty(key)) {
			$paths[key] = __paths_subs__[key];
		}
	}

	// filled-in paths
	return $paths;
}
