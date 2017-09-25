// init HTML files + minify
gulp.task("task-html", function(done) {
    // RegExp used for $:pre/post{filename/$var} HTML file-content/$variable injection
    var r_pre = regexp_html.pre;
    var r_post = regexp_html.post;
    pump([gulp.src(bundles.html.source.files, {
            cwd: __PATHS_HTML_SOURCE
        }),
        concat(bundles.html.source.name),
        replace(new RegExp(r_pre.p, r_pre.f), html_replace_fn(html_injection_vars)),
        beautify(opts_bt),
        replace(new RegExp(r_post.p, r_post.f), html_replace_fn(html_injection_vars)),
        gulp.dest(__PATHS_BASE),
        minify_html(),
        gulp.dest(__PATHS_DIST_HOME),
        bs.stream()
    ], done);
});
