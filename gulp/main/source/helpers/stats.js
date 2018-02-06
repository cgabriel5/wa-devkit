/**
 * Print a table containing project file type breakdown.
 *
 * • Depending on project size, task might take time to run.
 *
 * $ gulp stats
 *     Print file type breakdown.
 */
gulp.task("stats", function(done) {
	var Table = require("cli-table2");

	// Run yargs.
	var __flags = yargs.option("all", {
		type: "boolean"
	}).argv;

	// Get flag value.
	var all = __flags.all;

	// Get all files excluding: node_modules/, .git/, and img/.
	var files = [
		// If the --all flag is provided use all the file types else
		// only use the common web file types.
		$paths["files_" + (all ? "code" : "common")],
		bangify($paths.img_source),
		bangify(globall($paths.node_modules_name)),
		bangify(globall($paths.git))
	];

	var file_count = 0;
	var extensions = {};

	// Get needed files.
	pump(
		[
			gulp.src(files, {
				dot: true,
				read: false
			}),
			$.fn(function(file) {
				// Get the extension type.
				var ext = path
					.extname(file.path)
					.toLowerCase()
					.slice(1);

				// Exclude any extension-less files.
				if (!ext) {
					return;
				}

				var ext_count = extensions[ext];

				file_count++;

				if (ext_count === undefined) {
					// Does not exist, so start extension count.
					extensions[ext] = 1;
				} else {
					// Already exists just increment the value.
					extensions[ext] = ++ext_count;
				}
			})
		],
		function() {
			// Instantiate.
			var table = new Table({
				head: ["Extensions", `Count (${file_count})`, "% Of Project"],
				style: { head: ["green"] }
			});

			// Add data to table.
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

			// Sort table descendingly.
			table.sort(function(a, b) {
				return b[2] - a[2];
			});

			print(table.toString());

			done();
		}
	);
});
