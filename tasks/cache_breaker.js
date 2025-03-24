"use strict";

const cb = require("cache-breaker");

module.exports = function (grunt) {

    grunt.registerMultiTask("cachebreaker", "Rewrite links with timestamps or hashes", function () {

        const options = this.options();

        if (!options.match) {
            return grunt.fail.warn("You must provide the 'match' option");
        }

        this.files.forEach((f) => {

            if (!f.src.length) {
                return grunt.fail.warn("No source files were found.");
            }

            f.src.forEach((filepath) => {
                let dest = filepath;

                if (f.dest && f.dest !== "src") {
                    dest = f.dest;
                }

                let input = grunt.file.read(filepath);

                if (options.replacement === "md5") {
                    options.match.forEach((item) => {
                        if (typeof item === "string") {
                            input = cb.breakCache(input, item, options);
                        } else {
                            const clone = structuredClone(options);
                            Object.keys(item).forEach(function (key) {
                                clone.src = {
                                    path: item[key]
                                };
                                input = cb.breakCache(input, key, clone);
                            });
                        }
                    });
                } else {
                    input = cb.breakCache(input, options.match, options);
                }

                if (input.length) {
                    grunt.log.ok("Cache broken in: " + filepath.cyan);
                    grunt.file.write(dest, input);
                } else {
                    return grunt.fail.warn("No changes were made.");
                }
            });
        });
    });
};
