/**
 * task: stats
 * Prints table containing project file type breakdown.
 *
 *
 * Notes
 *
 * • Depending on the project size, this task might take a while to run.
 *
 * Usage
 *
 * $ gulp stats
 *     Print a table containing project files type information.
 */
gulp.task("stats", function(done) {
	var Table = require("cli-table2");

	var task = this;
	// get all files excluding the following: node_modules/, .git/, and img/.
	var files = [
		$paths.files_code,
		bangify($paths.img_source),
		bangify(globall($paths.node_modules_name)),
		bangify(globall($paths.git))
	];

	var file_count = 0;
	var extensions = {};

	// get needed files
	pump(
		[
			gulp.src(files, {
				dot: true,
				read: false
			}),
			$.fn(function(file) {
				// get the extension type
				var ext = path
					.extname(file.path)
					.toLowerCase()
					.slice(1);

				// exclude any extension-less files
				if (!ext) return;

				var ext_count = extensions[ext];

				file_count++;

				if (ext_count === undefined) {
					// does not exist, so start extension count
					extensions[ext] = 1;
				} else {
					// already exists just increment the value
					extensions[ext] = ++ext_count;
				}
			})
		],
		function() {
			// instantiate
			var table = new Table({
				head: ["Extensions", `Count (${file_count})`, "% Of Project"],
				style: { head: ["green"] }
			});

			// add data to table
			for (var ext in extensions) {
				if (extensions.hasOwnProperty(ext)) {
					var count = +extensions[ext];
					table.push([
						ext.toUpperCase(),
						count,
						Math.round(count / file_count * 100)
					]);
				}
			}

			table.sort(function(a, b) {
				return b[2] - a[2];
			});

			console.log(table.toString());

			done();
		}
	);
});
