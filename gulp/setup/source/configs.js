// Dynamic configuration files (load via json-file to modify later).
var $internal = require("./gulp/setup/exports/internal.json");
var $pkg = json.read($paths.config_pkg);

// Get individual plugin settings.
var APP = jsonc.parse(fs.readFileSync($paths.config_app).toString());
var BUNDLES = json.read($paths.config_bundles);
var PRETTIER = require($paths.config_prettier);

// Setup exports.
var QUESTIONS = require($paths.gulp_setup_questions);
var TEMPLATES = require($paths.gulp_setup_templates);
var JSCONFIGS = require($paths.gulp_setup_jsconfigs);
