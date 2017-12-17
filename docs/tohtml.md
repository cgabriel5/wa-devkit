# Markdown To HTML (tohtml)

`Markdown` files can be converted to their `HTML` counterparts by using the Gulp `tohtml` task. Converted files are stored under `markdown/previews/`. The folder is ignored via `.gitignore`, does not need to be manually created as its created when non existent, and can be safely deleted. To learn more about the `tohtml` task run `$ gulp help --filter "tohtml"`.

### Example

In the following example [`./README.md`](/README.md) is converted to `README.html` and stored under `markdown/previews/README.html`.

```
$ gulp tohtml --file "README.md"
```

Once created the file can be manually opened in a browser or be opened by using the Gulp `open` task.

```
$ gulp open --file "markdown/previews/tohtml.html"
```
