const core = require("@actions/core");
const github = require("@actions/github");

try {
    console.log("Running action");
} catch (error) {
    core.setFailed(error.message);
}