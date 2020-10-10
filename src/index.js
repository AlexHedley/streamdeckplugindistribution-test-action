const core = require("@actions/core");
const github = require("@actions/github");

try {
    console.log("Running action");
    core.debug('debug message');
    core.warning('warning message');
    core.info('info message')
} catch (error) {
    core.error(`Error ${error}, action may still succeed though`);
    core.setFailed(error.message);
}