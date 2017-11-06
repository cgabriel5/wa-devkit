// paths::BASES
var __PATHS_BASE = "./";
var __PATHS_BASE_DOT = ".";
var __PATHS_CWD = process.cwd();
var __PATHS_HOMEDIR = ""; // "assets/";

// paths:JS
var __PATHS_JS_HOME = `./${__PATHS_HOMEDIR}js/`;
var __PATHS_JS_SOURCE = `./${__PATHS_HOMEDIR}js/source/`;
var __PATHS_JS_OPTIONS_DYNAMIC;

// paths:GULP
var __PATHS_GULP_UTILS = `./${__PATHS_HOMEDIR}gulp/assets/utils/utils.js`;
var __PATHS_GULP_SETUP_QUESTIONS = `./${__PATHS_HOMEDIR}gulp/setup/exports/questions.js`;
var __PATHS_GULP_SETUP_TEMPLATES = `./${__PATHS_HOMEDIR}gulp/setup/exports/templates.js`;
var __PATHS_GULP_SETUP_JSCONFIGS = `./${__PATHS_HOMEDIR}gulp/setup/exports/jsconfigs.js`;
var __PATHS_GULP_SETUP_SOURCE = `./${__PATHS_HOMEDIR}gulp/setup/source/`;
var __PATHS_GULP_SETUP_README_TEMPLATE = `./${__PATHS_HOMEDIR}gulp/setup/templates/README.md`;
var __PATHS_GULP_SETUP_LICENSE_TEMPLATE = `./${__PATHS_HOMEDIR}gulp/setup/templates/LICENSE.txt`;
var __PATHS_GULP_FILE_NAME = "gulpfile.js";
var __PATHS_GULP_FILE_SETUP = "gulpfile.setup.js";
var __PATHS_GULP_SETUP = `./${__PATHS_HOMEDIR}gulp/setup/`;
var __PATHS_GULP_FILE_MAIN = "gulpfile.main.js";

// paths:MARKDOWN
var __PATHS_MARKDOWN_PREVIEW = `${__PATHS_HOMEDIR}markdown/preview/`;
var __PATHS_MARKDOWN_SOURCE = `${__PATHS_HOMEDIR}markdown/source/`;

// paths:CONFIG_FILES
var __PATHS_CONFIG_GULP_BUNDLES = `./${__PATHS_HOMEDIR}configs/gulp/bundles.json`;
var __PATHS_CONFIG_GULP_PLUGINS = `./${__PATHS_HOMEDIR}configs/gulp/plugins.json`;
var __PATHS_CONFIG_JSBEAUTIFY = `./${__PATHS_HOMEDIR}configs/jsbeautify.json`;
var __PATHS_CONFIG_INTERNAL = `./${__PATHS_HOMEDIR}configs/.hidden-internal.json`;
var __PATHS_CONFIG_CSSCOMB = `./${__PATHS_HOMEDIR}configs/csscomb.json`;
var __PATHS_CONFIG_APP = `./${__PATHS_HOMEDIR}configs/app.json`;
var __PATHS_CONFIG_PKG = `./${__PATHS_HOMEDIR}package.json`;

// paths:OTHER
var __PATHS_GIT = ".git/";
var __PATHS_README = "README.md";
var __PATHS_LICENSE = "LICENSE.txt";
var __PATHS_HTML_HEADMETA = "html/source/head/meta.html";
var __PATHS_FILES_BEAUTIFY = "**/*.{html,css,js,json}";
var __PATHS_FILES_BEAUTIFY_EXCLUDE_MIN = "!**/*.min.*";
// exclude all vendor files from any directory
var __PATHS_NOT_VENDOR = "!**/vendor/**";
var __PATHS_NODE_MODULES_NAME = "node_modules/";
