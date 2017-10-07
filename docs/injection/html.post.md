# Pre HTML Injection

If needed, the project can inject contents from a file to where ever specified from within your HTML files. The goal is to inject raw unmodified text into your HTML files.

### Syntax

```
$:pre{<file_name>}
```

### Usage

Works the same way as [`$:post{}`](/html.post.md/) injection. However, the contents will get affected by things like, beautification, minification, etc..


