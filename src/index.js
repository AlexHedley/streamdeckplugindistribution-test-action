const core = require("@actions/core");
const exec = require('@actions/exec');
const github = require("@actions/github");
const io = require('@actions/io');
const tc = require("@actions/tool-cache");

const os = require('os');

//const cachedFileName = "DistributionTool.exe";
const executableFileName = "DistributionTool";
const version = '1.0.0';

const homedir = os.homedir();
core.info(`homedir: ${homedir}`);
//await io.mkdirP('path/to/make');

let destPath = '';
let toolName = '';

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

        if (process.platform === 'win32') {
            core.info('attempting download of win dist tool');

            destPath = `${homedir}\\disttool\\`;

            const distributionToolPath = await tc.downloadTool(' https://developer.elgato.com/documentation/stream-deck/distributiontool/DistributionToolWindows.zip');
            const distributionToolExtractedFolder = await tc.extractZip(distributionToolPath, destPath);
            core.info(`distributionToolExtractedFolder: ${distributionToolExtractedFolder}`);

            const executableFileNameWin = "DistributionTool.exe";
            toolName = executableFileNameWin;

            // Cache
            const cachedPath = await tc.cacheFile(`${distributionToolExtractedFolder}${executableFileNameWin}`, executableFileNameWin, executableFileName, version);
            core.info(`cachedPath: ${cachedPath}`);
        }
        else if (process.platform === 'darwin') {
            core.info('attempting download of mac dist tool');
    
            destPath = `${homedir}/disttool/`;
            
            const distributionToolPath = await tc.downloadTool('https://developer.elgato.com/documentation/stream-deck/distributiontool/DistributionToolMac.zip');
            const distributionToolExtractedFolder = await tc.extractXar(distributionToolPath, `${homedir}/disttool`);
            
            toolName = executableFileName;

            // Cache
            const cachedPath = await tc.cacheFile(`${distributionToolExtractedFolder}${executableFileName}`, executableFileName, executableFileName, version);
            core.info(`cachedPath: ${cachedPath}`);
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

//
// Get Exe Name For Platform
//
function getExeNameForPlatform () {
    let exeName = '';

    if (process.platform === 'win32') {
        exeName = 'DistributionTool.exe';
    } else if (process.platform === 'darwin') {
        exeName = 'DistributionTool'
    } else {
        exeName = '';
    }

    return exeName;
}

//
// List Directory
//
async function listDir(directory) {
    //C:\hostedtoolcache\windows\DistributionTool\1.0.0\x64

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
    // Home Folder
    core.info(`directory: ${directory}`);
    options.cwd = directory;
    
    await exec.exec('cmd', ['/c', 'dir'], options);
    core.info(`myOutput: ${myOutput}`);
    core.info(`myError: ${myError}`);
}

/// RUN

async function run () {
    core.info('run started');

    try {

        const plugin_path = core.getInput("plugin_path"); // src\com.elgato.counter.sdPlugin
        core.info(`plugin_path: ${plugin_path}`);

        core.info(`GITHUB_WORKSPACE: ${process.env.GITHUB_WORKSPACE}`);
        
        var exeName = getExeNameForPlatform();

        //await listDir('C:\\hostedtoolcache\\windows\\DistributionTool\\1.0.0\\x64\\');

        let toolPath = await tc.find(exeName, version);
        core.info(`toolPath: ${toolPath}`);

		if (!toolPath) {
            core.info('Download');
            await downloadDistributionTool();
		}
        else {
            core.info('Use from Cache');
            destPath = toolPath; //?
        }

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

        // Create an output folder
        //await exec.exec('cmd', ['/c', 'mkdir', 'output'], options);
        const outputPath = `${homedir}\\output\\`;
        await io.mkdirP(outputPath);
        
        options.cwd = destPath;
        await exec.exec('cmd', ['/c', toolName, '-b', '-i', `${process.env.GITHUB_WORKSPACE}\\${plugin_path}`, '-o', '..\\output'], options);
        core.info(`myOutput: ${myOutput}`);
        core.info(`myError: ${myError}`);
        
        var file = plugin_path.split("\\");
        var fileArray = file[1].split(".");
        fileArray.pop();
        const pluginName = fileArray.join(".");
        core.info(`pluginName: ${pluginName}`);

        const pluginOutputPath = `${outputPath}${pluginName}.streamDeckPlugin`;
        // C:\Users\runneradmin\output\com.elgato.counter.streamDeckPlugin
        core.setOutput("plugin_output_path", pluginOutputPath);

    } catch (error) {
        core.setFailed(error.message)
    }

    core.info('run finished');
}

run()