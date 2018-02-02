// Dynamic configuration files (load via json-file to modify later).
var $internal = require("./gulp/setup/exports/internal.json");
var $pkg = json.read($paths.config_pkg);

// Get individual plugin settings.
var $app = jsonc.parse(fs.readFileSync($paths.config_app).toString());
var $ap = require($paths.config_autoprefixer);
var $bundles = json.read($paths.config_bundles);
var $jsbeautify = require($paths.config_jsbeautify);
var $perfectionist = require($paths.config_perfectionist);
var $prettier = require($paths.config_prettier);

// Setup exports.
var $questions = require($paths.gulp_setup_questions);
var $templates = require($paths.gulp_setup_templates);
var $jsconfigs = require($paths.gulp_setup_jsconfigs);
