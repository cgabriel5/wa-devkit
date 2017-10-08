// // Clear internal configuration keys.
// gulp.task("clear", function(done) {
//     // run yargs
//     var _args = yargs.usage("Usage: $0 --names [string]")
//         .option("names", {
//             alias: "n",
//             demandOption: true,
//             describe: "Name(s) of files to clear.",
//             type: "string"
//         })
//         .coerce("names", function(value) {
//             return value.replace("gulpstatus", "gulppid")
//                 .split(" ");
//         })
//         .example("$0 --names=\"gulpstatus gulpports\"", "Clear pid and ports keys.")
//         .example("$0 --names=\"gulpstatus\"", "Clear pid key.")
//         .example("$0 --names gulpports", "Clear ports key.")
//         .argv;
//     // get provided parameters
//     var names = _args.n || _args.names;
//     // loop over provided arguments array
//     for (var i = 0, l = names.length; i < l; i++) {
//         var key = names[i].replace("gulp", "");
//         // using the flag "w+" will create the file if it does not exists. if
//         // it does exists it will truncate the current file. in effect clearing
//         // if out. which is what is needed.
//         config_internal.set(key, null);
//         // reset name if needed
//         if (key === "pid") key = "status";
//         log(key, "cleared.");
//     }
//     config_internal.write(function() {
//         done();
//     }, null, json_format);
// });
