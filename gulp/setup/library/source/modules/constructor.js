// =============================== Library Class

var Library = class__({
	// Class constructor.
	constructor__: function() {
		// Cache arguments object.
		var args = arguments;
		// If user does not invoke library with new keyword we use it for
		// them by returning a new instance of the library with the new
		// keyword.
		if (!(this instanceof Library)) return new Library();
	},
	// Class methods.
	methods__: {},
	// Class to extend.
	extend__: false
});
