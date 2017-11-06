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
 * @param  {String} type [The optional extension type to check against.]
 * @return {String|Boolean}      [The file's extension or boolean indicating compare result.]
 */
function ext(file, type) {
    // when no file exists return an empty string
    if (!file) return "";

    // get the file extname
    var extname = path.extname(file.path)
        .toLowerCase();

    // simply return the extname when no type is
    // provided to check against.
    if (!type) return extname;

    // else when a type is provided check against it
    return (extname.slice(1) === type.toLowerCase());
}

// check for the usual file types
ext.ishtml = function(file) {
    return ext(file, "html");
};
ext.iscss = function(file) {
    return ext(file, "css");
};
ext.isjs = function(file) {
    return ext(file, "js");
};
ext.isjson = function(file) {
    return ext(file, "json");
};
