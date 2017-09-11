// init HTML files + minify
gulp.task("task-html", function(done) {
    // regexp used for pre and post HTML variable injection
    var r_pre = regexp_html.pre;
    var r_post = regexp_html.post;
    var r_func = function(match) {
        var filename = "html/source/regexp/" + match.replace(/\$\:(pre|post)\{|\}$/g, "") + ".text";
        // check that file exists before opening/reading...
        // return undefined when file does not exist...else return its contents
        return (!fe.sync(filename)) ? "undefined" : fs.readFileSync(filename)
            .toString();
    };
    pump([gulp.src(bundle_html.core, {
            cwd: "html/source/"
        }),
        concat("index.html"),
        replace(new RegExp(r_pre.p, r_pre.f), r_func),
        beautify(options_beautify),
        replace(new RegExp(r_post.p, r_post.f), r_func),
        gulp.dest(BASE),
        minify_html(),
        gulp.dest("dist/"),
        bs.stream()
    ], done);
});
