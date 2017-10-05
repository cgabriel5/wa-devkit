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
