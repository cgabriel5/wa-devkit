// =============================== Attach Library To Global Scope

// Add to global scope for ease of use. Use global app var or
// create it if not present.
var app = window.app || (window.app = {});
// Get the libs object from within the app object. If it does not exist
// create it.
var libs = app.libs || (app.libs = {});
// Add the library to the libs object.
libs.YOUR_LIB_NAME = library;
