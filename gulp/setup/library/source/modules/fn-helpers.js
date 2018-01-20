// =============================== Helper Functions

/**
 * Generates a simple ID containing letters and numbers.
 *
 * @param {number} length - The length the ID should be. Max length is
 *     22 characters.
 * @return {string} - The newly generated ID.
 *
 * @link [http://stackoverflow.com/a/38622545]
 */
function id(length) {
	return Math.random()
		.toString(36)
		.substr(2, length);
}

/**
 * Returns index of given value in provided array.
 *
 * @param {array} array - The array to check against.
 * @param {integer} value - The value to check.
 * @return {integer} Returns the index value. -1 if not in array.
 */
function index(array, value) {
	return array.indexOf(value);
}

/**
 * Checks if the given value is in provided array or string.
 *
 * @param {array|string} iterable - The array or string to check against.
 * @param {any} value - The value to check.
 * @return {boolean} Boolean, true means iterable includes value.
 *
 * @link [https://www.joezimjs.com/javascript/great-mystery-of-the-tilde/]
 * @link [https://stackoverflow.com/a/12299717]
 */
function includes(iterable, value) {
	return Boolean(-~index(iterable, value));
}

/**
 * Checks if the provided index exists.
 *
 * @param {number} index - The index (number) to check.
 * @return {boolean} False if -1. Otherwise, true.
 */
function indexed(index) {
	return Boolean(-~index);
}

/**
 * Makes an Array from an array like object (ALO). ALO must have a length
 *     property for it to work.
 *
 * @param {alo} alo - The ALO.
 * @return {array} The created array.
 */
function to_array(alo) {
	var true_array = [];
	// loop through ALO and pushing items into true_array
	for (var i = 0, l = alo.length; i < l; i++) true_array.push(alo[i]);
	return true_array;
}

/**
 * Returns the data type of the provided object.
 *
 * @param {any} object - The object to check.
 * @return {string} The data type of the checked object.
 */
var dtype = function(object) {
	// will always return something like "[object {type}]"
	return Object.prototype.toString
		.call(object)
		.replace(/(\[object |\])/g, "")
		.toLowerCase();
};

/**
 * Check if the provided object is of the provided data types.
 *
 * @param {any} object - The object to check.
 * @param {string} types - The allowed data type the object may be.
 * @return {boolean} Boolean indicating whether the object is of the
 *     allowed data types.
 */
dtype.is = function(object, types) {
	// get the object type
	var type = this(object);
	// prepare the types
	types = "|" + types.toLowerCase().trim() + "|";
	// check if the object's type is in the list
	return Boolean(-~types.indexOf("|" + type + "|"));
};

/**
 * Check if the provided object is not of the provided data types.
 *
 * @param {any} object - The object to check.
 * @param {string} types - The prohibited data types.
 * @return {boolean} Boolean indicating whether the object is not of the
 *     allowed data types.
 */
dtype.isnot = function(object, types) {
	// return the inverse of the is method
	return !this.is(object, types);
};

/**
 * A class wrapper. Creates a class based on provided object containing
 *     class constructor__ and methods__. If class needs to extend another,
 *     provide it under the extend__ property.
 *
 * @param {object} cobject - The class object containing three properties:
 *     constructor__, methods__, and extend__.
 *     • constructor__ {function} The class constructor
 *     • methods__ {object} Object containing class methods.
 *     • extend__  {boolean|object} Set to false if does not need to
 *     extend. Otherwise, provide the class to extend.
 * @return {function} Returns class constructor.
 */
function class__(cobject) {
	// cache class data
	var constructor = cobject.constructor__,
		methods = cobject.methods__,
		parent = cobject.extend__;
	// extend if parent class provided
	if (parent) {
		constructor.prototype = Object.create(parent.prototype);
		constructor.prototype.constructor = constructor;
	}
	// cache prototype
	var prototype = constructor.prototype;
	// add class methods to prototype
	for (var method in methods) {
		if (methods.hasOwnProperty(method)) {
			prototype[method] = methods[method];
		}
	}
	return constructor;
}
