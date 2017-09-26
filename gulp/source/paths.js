// paths::BASES
var __PATHS_BASE = "./";
var __PATHS_DIRNAME = __dirname;
var __PATHS_CWD = process.cwd();
var __PATHS_HOMEDIR = ""; // "assets/";
// paths:DISTRIBUTION
var __PATHS_DIST_HOME = "dist/";
var __PATHS_DIST_LIB = "dist/lib/";
var __PATHS_DIST_HTML = "dist/html/";
var __PATHS_DIST_CSS = "dist/css/";
var __PATHS_DIST_CSS_LIBS = "dist/css/libs/";
var __PATHS_DIST_CSS_LIBS_FILE_SOURCE = `${__PATHS_HOMEDIR}css/libs/**`;
var __PATHS_DIST_JS = "dist/js/";
var __PATHS_DIST_JS_LIBS = "dist/js/libs/";
var __PATHS_DIST_JS_LIBS_FILE_SOURCE = `${__PATHS_HOMEDIR}js/libs/**`;
var __PATHS_DIST_IMG = "dist/img/";
// paths: library (only for apptype=library)
var __PATHS_LIB_HOME = "lib/";
// paths:HTML
var __PATHS_HTML_SOURCE = `${__PATHS_HOMEDIR}html/source/`;
var __PATHS_HTML_REGEXP_SOURCE = `${__PATHS_HOMEDIR}html/source/regexp/`;
// paths:CSS
var __PATHS_CSS_SOURCE = `${__PATHS_HOMEDIR}css/source/`;
var __PATHS_CSS_THIRDPARTY = `${__PATHS_HOMEDIR}css/libs/`;
var __PATHS_CSS_BUNDLES = `${__PATHS_HOMEDIR}css/bundles/`;
var __PATHS_USERS_CSS_FILE = "styles.css";
// paths::PURIFY_CSS
var __PATHS_PURE_FILE = `${__PATHS_HOMEDIR}css/pure.css`;
var __PATHS_PURE_FILE_NAME = "pure.css";
var __PATHS_PURIFY_JS_SOURCE_FILES = `${__PATHS_HOMEDIR}js/bundles/*.js`;
var __PATHS_PURE_SOURCE = "source/";
var __PATHS_PURE_CSS = `${__PATHS_HOMEDIR}css/`;
// paths:JS
var __PATHS_JS_SOURCE = `${__PATHS_HOMEDIR}js/source/`;
var __PATHS_JS_THIRDPARTY = `${__PATHS_HOMEDIR}js/libs/`;
var __PATHS_JS_BUNDLES = `${__PATHS_HOMEDIR}js/bundles/`;
// paths:IMG
var __PATHS_IMG_SOURCE = `${__PATHS_HOMEDIR}img/**/*`;
// paths:GULP
var __PATHS_GULP_HOME = `${__PATHS_HOMEDIR}gulp/`;
var __PATHS_GULP_SOURCE = `${__PATHS_HOMEDIR}gulp/source/`;
var __PATHS_GULPDIR = `./${__PATHS_HOMEDIR}gulp/`;
var __PATHS_GULP_UTILS = `./${__PATHS_HOMEDIR}gulp/assets/utils/utils.js`;
var __PATHS_GULP_FILE_NAME = "gulpfile.js";
// paths:MARKDOWN
var __PATHS_MARKDOWN_PREVIEW = `${__PATHS_HOMEDIR}markdown/preview/`;
var __PATHS_MARKDOWN_SOURCE = `${__PATHS_HOMEDIR}markdown/source/`;
// paths:CONFIG_FILES
var __PATHS_CONFIG_USER = `./${__PATHS_HOMEDIR}gulp/assets/config/user.json`;
var __PATHS_CONFIG_INTERNAL = `./${__PATHS_HOMEDIR}gulp/assets/config/.hidden-internal.json`;
// paths:FAVICONS
// file where the favicon markups are stored
var __PATHS_FAVICON_DATA_FILE = `./${__PATHS_HOMEDIR}gulp/assets/favicon/favicondata.json`;
var __PATHS_FAVICON_DEST = `${__PATHS_HOMEDIR}favicon/`;
var __PATHS_FAVICON_MASTER_PIC = `./${__PATHS_HOMEDIR}img/logo/leaf-900.png`;
var __PATHS_FAVICON_ROOT_ICO = `./${__PATHS_HOMEDIR}favicon/favicon.ico`;
var __PATHS_FAVICON_ROOT_PNG = `./${__PATHS_HOMEDIR}favicon/apple-touch-icon.png`;
var __PATHS_FAVICON_ROOT_CONFIG = `./${__PATHS_HOMEDIR}favicon/browserconfig.xml`;
var __PATHS_FAVICON_ROOT_MANIFEST = `./${__PATHS_HOMEDIR}favicon/manifest.json`;
var __PATHS_FAVICON_HTML = `./${__PATHS_HOMEDIR}html/source/head/favicon.html`;
var __PATHS_FAVICON_HTML_DEST = `./${__PATHS_HOMEDIR}html/source/head/`;
// paths:OTHER
var __PATHS_GITHEAD = ".git/HEAD";
var __PATHS_README = "README.md";
var __PATHS_README_HTML = "README.html";
var __PATHS_ALLFILES = "**/*.*";
var __PATHS_FILES_BEAUTIFY = "**/*.{html,css,js,json}";
var __PATHS_FILES_BEAUTIFY_EXCLUDE = "!**/*.min.*";
var __PATHS_FILES_MIN = "**/*.min.*";
var __PATHS_FILES_TEST = "!test*";
var __PATHS_NOT_NODE_MODULES = "!node_modules/**";
