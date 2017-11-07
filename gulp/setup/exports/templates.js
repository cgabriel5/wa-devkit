"use strict";

exports.templates = {
    "repository.url": "git+https://github.com/{{#git_id}}/{{#repo_name}}.git",
    author: "{{#fullname}} <{{#email}}> (https://github.com/{{#git_id}})",
    "bugs.url": "https://github.com/{{#git_id}}/{{#repo_name}}/issues",
    homepage: "https://github.com/{{#git_id}}/{{#repo_name}}#readme"
};
