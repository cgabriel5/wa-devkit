// dynamic configuration files (load via json-file to modify later)
var $internal = json.read($paths.config_internal);

// static configuration files (just need to read file)
var $settings = jsonc.parse(fs.readFileSync($paths.config_settings).toString());

// get individual plugin settings
var $app = $settings[$paths.config_app];
var $ap = $settings[$paths.config_autoprefixer];
var $browsersync = $settings[$paths.config_browsersync];
var $bundles = $settings[$paths.config_bundles];
// var $csscomb = $settings[$paths.config_csscomb];
// var $favicondata = $settings[$paths.config_favicondata];
var $findfreeport = $settings[$paths.config_findfreeport];
var $jsbeautify = $settings[$paths.config_jsbeautify];
var $json_format = $settings[$paths.config_json_format];
var $modernizr = $settings[$paths.config_modernizr];
var $open = $settings[$paths.config_open];
var $perfectionist = $settings[$paths.config_perfectionist];
var $csslint = $settings[$paths.config_csslint];
var $jshint = $settings[$paths.config_jshint];
var $htmllint = $settings[$paths.config_htmllint];
var $prettier = $settings[$paths.config_prettier];
