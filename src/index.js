const core = require("@actions/core");
const exec = require('@actions/exec');
const github = require("@actions/github");
const io = require('@actions/io');
const tc = require("@actions/tool-cache");

const os = require('os');

///
/// Download Distribution Tool
///
async function downloadDistributionTool () {

    try {
        console.log("Running action");
        core.debug('debug message');
        core.warning('warning message');
        core.info('info message');
    
        core.info(`Process Platform: ${process.platform}`);
    
        const homedir = os.homedir();
        core.info(`homedir: ${homedir}`);
        //await io.mkdirP('path/to/make');
    
        if (process.platform === 'win32') {
            core.info('attempting download of win dist tool');
            
            const destPath = `${homedir}\\disttool\\`;

            const distributionToolPath = await tc.downloadTool(' https://developer.elgato.com/documentation/stream-deck/distributiontool/DistributionToolWindows.zip');
            const distributionToolExtractedFolder = await tc.extractZip(distributionToolPath, destPath);

            //await exec.exec('DistributionTool.exe /?');
            //await exec.exec(`${destPath}DistributionTool.exe /?`);

            let myOutput = '';
            let myError = '';

            const options = {};
            options.listeners = {
                stdout: (data) => {
                    myOutput += data.toString();
                },
                stderr: (data) => {
                    myError += data.toString();
                }
            };
            options.cwd = destPath; //`${homedir}\disttool\\`;

            //await exec.exec('cmd', ['/k', 'DistributionTool.exe', '/?'], options);
            await exec.exec('cmd', ['/c', 'DistributionTool.exe', '/?'], options);
            core.info(`myOutput: ${myOutput}`);
            core.info(`myError: ${myError}`);
        }
        else if (process.platform === 'darwin') {
            core.info('attempting download of mac dist tool');
    
            const distributionToolPath = await tc.downloadTool('https://developer.elgato.com/documentation/stream-deck/distributiontool/DistributionToolMac.zip');
            const distributionToolExtractedFolder = await tc.extractXar(distributionToolPath, `${homedir}/disttool`);
        }
        else {
            // Linux?
            core.warning("is this linux? Isn't a tool to support this platform");
        }
    
    } catch (error) {
        core.error(`Error ${error}, action may still succeed though`);
        core.setFailed(error.message);
    }

}
/// RUN

async function run () {
    core.info('run started');

    try {

        const plugin_path = core.getInput("plugin_path");
        core.info(`plugin_path: ${plugin_path}`);
        
        await downloadDistributionTool()
    } catch (error) {
        core.setFailed(error.message)
    }

    core.info('run finished');
}

run()