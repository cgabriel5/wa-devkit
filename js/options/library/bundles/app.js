// IIFE start
(function(window) {
    "use strict";
    var library = (function() {
        // =============================== Helper Functions
        /**
         * @description [Generates a simple ID containing letters and numbers.]
         * @param  {Number} length [The length the ID should be. Max length is 22 characters]
         * @return {String}        [The newly generated ID.]
         * @source {http://stackoverflow.com/a/38622545}
         */
        function id(length) {
            return Math.random()
                .toString(36)
                .substr(2, length);
        }
        /**
         * @description [Returns index of given value in provided array.]
         * @param  {Array}    array [The array to check against.]
         * @param  {Integer}  value [The value to check.]
         * @return {Integer}        [Returns the index value. -1 if not in array.]
         */
        function index(array, value) {
            return array.indexOf(value);
        }
        /**
         * @description [Checks if the given value is in provided array or string.]
         * @param  {Array|String}   iterable [The array or string to check against.]
         * @param  {Any}            value    [The value to check.]
         * @return {Boolean}                 [description]
         * @source [https://www.joezimjs.com/javascript/great-mystery-of-the-tilde/]
         * @source [http://stackoverflow.com/questions/12299665/what-does-a-tilde-do-
         * when-it-precedes-an-expression/12299717#12299717]
         */
        function includes(iterable, value) {
            return -~index(iterable, value);
        }
        /**
         * @description [Checks if the provided index exists.]
         * @param  {Number} index [The index (number) to check.]
         * @return {Boolean}       [False if -1. Otherwise, true.]
         */
        function indexed(index) {
            return -~index ? true : false;
        }
        /**
         * @description [Makes an Array from an array like object (ALO). ALO must have a length property
         *               for it to work.]
         * @param  {ALO} alo [The ALO.]
         * @return {Array}   [The created array.]
         */
        function to_array(alo) {
            // vars
            var true_array = [];
            // loop through ALO and pushing items into true_array
            for (var i = 0, l = alo.length; i < l; i++) true_array.push(alo[i]);
            return true_array;
        }
        /**
         * @description [Returns the data type of the provided object.]
         * @param  {Any} object [The object to check.]
         * @return {String}    [The data type of the checked object.]
         */
        var dtype = function(object) {
            // will always return something like "[object {type}]"
            return Object.prototype.toString.call(object)
                .replace(/(\[object |\])/g, "")
                .toLowerCase();
        };
        /**
         * @description [Check if the provided object is of the provided data types.]
         * @param  {Any} object [The object to check.]
         * @param  {String}  types  [The allowed data type the object may be.]
         * @return {Boolean}        [Boolean indicating whether the object is of the
         *                           allowed data types.]
         */
        dtype.is = function(object, types) {
            // get the object type
            var type = this(object);
            // prepare the types
            types = "|" + types.toLowerCase()
                .trim() + "|";
            // check if the object's type is in the list
            return Boolean(-~types.indexOf("|" + type + "|"));
        };
        /**
         * @description [Check if the provided object is not of the provided data types.]
         * @param  {Any} object [The object to check.]
         * @param  {String}  types  [The prohibited data types.]
         * @return {Boolean}        [Boolean indicating whether the object is not of the
         *                           allowed data types.]
         */
        dtype.isnot = function(object, types) {
            // return the inverse of the is method
            return !this.is(object, types);
        };
        /**
         * @description [A class wrapper. Creates a class based on provided object containing class constructor__ and methods__.
         *               If class needs to extend another, provide it under the extend__ property.]
         * @param  {Object} cobject [The class object containing three properties: constructor__, methods__, and extend__.
         *                           .constructor__ {Function}       [The class constructor]
         *                           .methods__     {Object}         [Object containing class methods.]
         *                           .extend__      {Boolean|Object} [Set to false if does not need to extend. Otherwise, provide the
         *                                                            class to extend.]
         *                           ]
         * @return {Function}         [Returns class constructor.]
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
        // =============================== Core Library Functions
        // =============================== Library Class
        var Library = class__({
            // class constructor
            constructor__: function() {
                // cache arguments object
                var args = arguments;
                // if user does not invoke library with new keyword we use it for them by
                // returning a new instance of the library with the new keyword.
                if (!(this instanceof Library)) return new Library();
            },
            // class methods
            methods__: {},
            // class to extend
            extend__: false
        });
        // return library to add to global scope later...
        return Library;
    })();
    // =============================== Global Library Functions/Methods/Vars
    // =============================== Attach Library To Global Scope
    // add to global scope for ease of use
    // use global app var or create it if not present
    var app = window.app || (window.app = {});
    // get the libs object from within the app object
    // if it does not exist create it
    var libs = app.libs || (app.libs = {});
    // add the library to the libs object
    libs.YOUR_LIB_NAME = library;
    // IIFE end
})(window);
// https://developer.mozilla.org/en-US/docs/Web/Events/readystatechange
// the readystatechange event is fired when the readyState attribute of a
// document has changed
document.onreadystatechange = function() {
    "use strict";
    /* [functions.utils] */
    // https://developer.mozilla.org/en-US/docs/Web/API/Document/readyState
    // loading === document still loading
    // complete === document and all sub-resources have finished loading.
    // same as the window.onload event
    // interactive === document has finished loading & parsed but but
    // sub-resources such as images, stylesheets and frames are still loading
    // **Note: interactive === document.addEventListener("DOMContentLoaded",...
    // **Note: complete    === window.addEventListener("load", function() {...
    // [DOMContentLoaded](https://developer.mozilla.org/en-US/docs/Web/Events/DOMContentLoaded)
    // [load](https://developer.mozilla.org/en-US/docs/Web/Events/load)
    // document loaded and parsed. however, still loading subresources
    // user is able to interact with page.
    if (document.readyState == "interactive") {
        // app logic...
    }
    // or...
    // all resources have loaded (document + subresources)
    if (document.readyState == "complete") {
        // app logic...
    }
    // good explanation with images:
    // https://varvy.com/performance/document-ready-state.html
};
