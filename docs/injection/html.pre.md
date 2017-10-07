# Post HTML Injection

If needed, the project can inject contents from a file to where ever specified from within your HTML files. The goal is to inject raw unmodified text into your HTML files.

### Syntax

```
$:post{<file_name>}
```

### Usage

Say we have some content that should maintain its structural integrity and should not be modified after prettyfication, for example.


```html
<div>
    <textarea>$:post{injection_example}</textarea>
</div>
``` 

Contents of `injection_example.text` file:

```
body {
	color: black;
}

div {
	background: green;
}
```

The code will look for a file under `html/injection/`. If found it will inject the contents of the file into its injection placeholder.

After, it will look like this:

```html
<div>
    <textarea>body {
	color: black;
}

div {
	background: green;
}</textarea>
</div>
``` 


