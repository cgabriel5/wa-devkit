"use strict";

exports.questions = {
    properties: {
        apptype: {
            description: "Setting up webapp or library",
            type: "string",
            pattern: /^(webapp|library)$/i,
            default: "webapp",
            message: "Enter 'webapp' or 'library'.",
            required: true
        },
        name: {
            description: "Application name",
            type: "string",
            default: "my-app"
        },
        version: {
            description: "Version? (format #.#.#)",
            type: "string",
            pattern: /^\d+.\d+.\d+$/,
            default: "0.0.1"
        },
        description: {
            description: "Application description",
            type: "string",
            default: "The next big thing."
        },
        fullname: {
            description: "Fullname",
            type: "string",
            default: "John Doe"
        },
        email: {
            description: "Email",
            type: "string",
            default: "johndoe@example.com"
        },
        git_id: {
            description: "GitHub username",
            type: "string",
            default: "johndoe23",
            required: true
        },
        repo_name: {
            description: "Repository name",
            type: "string",
            default: "my-app",
            required: true
        },
        private: {
            description: "Keep private",
            type: "string",
            pattern: /^(y(es)?|no?)$/i,
            message: "Enter 'yes' or 'no'.",
            default: "yes",
            before: function(value) {
                return (value.charAt(0) === "y");
            }
        },
        year: {
            description: "License year",
            type: "number",
            pattern: /^20\d\d$/i,
            default: new Date()
                .getFullYear()
        }
    }
};
