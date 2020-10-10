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
            core.info(`distributionToolExtractedFolder: ${distributionToolExtractedFolder}`);

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
            //options.cwd = destPath; //`${homedir}\\disttool\\`;

            //await exec.exec('cmd', ['/k', 'DistributionTool.exe', '/?'], options);
            //await exec.exec('cmd', ['/c', 'DistributionTool.exe', '/?'], options);
            //core.info(`myOutput: ${myOutput}`);
            //core.info(`myError: ${myError}`);
                      
            // Create an output folder
            //await exec.exec('cmd', ['/c', 'mkdir', 'output'], options);
            const outputPath = `${homedir}\\output\\`;
            await io.mkdirP(outputPath);
            
            // // Home Folder
            // core.info('HOME');
            // options.cwd = homedir;
            // await exec.exec('cmd', ['/c', 'dir'], options);
            // core.info(`myOutput: ${myOutput}`);
            // core.info(`myError: ${myError}`);

            // // Distribution Tool Folder
            // core.info('DISTTOOL');
            // options.cwd = destPath;
            // await exec.exec('cmd', ['/c', 'dir'], options);
            // core.info(`myOutput: ${myOutput}`);
            // core.info(`myError: ${myError}`);

            const plugin_path = core.getInput("plugin_path"); // src\com.elgato.counter.sdPlugin
            // TODO: swap \ for / depending on OS.
            // /work/ - Checkout puts in this folder.
            //DistributionTool.exe -b -i com.elgato.counter.sdPlugin -o output
            //DistributionTool.exe -b -i "..\work\src\com.elgato.counter.sdPlugin" -o "..\output"
            options.cwd = destPath;
            await exec.exec('cmd', ['/c', 'DistributionTool.exe', '-b', '-i', `${process.env.GITHUB_WORKSPACE}\\${plugin_path}`, '-o', '..\\output'], options);
            core.info(`myOutput: ${myOutput}`);
            core.info(`myError: ${myError}`);
            
            //Environment variables
            //https://docs.github.com/en/free-pro-team@latest/actions/reference/environment-variables
            //GITHUB_WORKSPACE
            //The GitHub workspace directory path.
            //The workspace directory is a copy of your repository if your workflow uses the actions/checkout action.
            //If you don't use the actions/checkout action, the directory will be empty. For example, /home/runner/work/my-repo-name/my-repo-name.

            // // Output Folder
            // core.info('OUTPUT');
            // options.cwd = outputPath;
            // await exec.exec('cmd', ['/c', 'dir'], options);
            // core.info(`myOutput: ${myOutput}`);
            // core.info(`myError: ${myError}`);

            var file = plugin_path.split("\\");
            var fileArray = file[1].split(".");
            fileArray.pop();
            const pluginName = fileArray.join(".");
            core.info(`pluginName: ${pluginName}`);

            const pluginOutputPath = `${outputPath}\\${pluginName}.streamDeckPlugin`;
            // C:\Users\runneradmin\output\com.elgato.counter.streamDeckPlugin
            core.setOutput("plugin_output_path", pluginOutputPath);
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

        core.info(`GITHUB_WORKSPACE: ${process.env.GITHUB_WORKSPACE}`);
        
        await downloadDistributionTool()
    } catch (error) {
        core.setFailed(error.message)
    }

    core.info('run finished');
}

run()