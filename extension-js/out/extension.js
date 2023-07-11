"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.deactivate = exports.activate = void 0;
// The module 'vscode' contains the VS Code extensibility API
// Import the module and reference it with the alias vscode in your code below
const vscode = require("vscode");
const axios_1 = require("axios");
const fs = require("fs");
const path = require("path");
function getRootDirectory() {
    let workspaceFolders = vscode.workspace.workspaceFolders;
    if (!workspaceFolders) {
        vscode.window.showInformationMessage("No workspace or folder is opened");
        return;
    }
    return workspaceFolders[0].uri.fsPath;
}
// This function aims to replicate the folder structure of the source code
function replicateFolderStructure(sourceDir, destinationDir) {
    if (!fs.existsSync(destinationDir)) {
        fs.mkdirSync(destinationDir, { recursive: true });
    }
    // const files = fs.readdirSync(sourceDir, {withFileTypes:true});
    // for(const file of files) {
    // 	const sourcePath = path.join(sourceDir, file.name);
    // 	const destinationPath = path.join(destinationDir, file.name);
    // }
}
// This function reads all files in the directory. It reads the current and subfolders as well
async function readAllFilesinDirectory(directory, testDirectory) {
    const entries = await fs.promises.readdir(directory, { withFileTypes: true });
    const fileNames = [];
    for (const file of entries) {
        const filePath = path.join(directory, file.name);
        const stats = fs.statSync(filePath);
        if (stats.isFile()) {
            fileNames.push(file.name);
        }
    }
    const totalFiles = fileNames.length;
    let processedFiles = 0;
    const folderPath = path.basename(directory);
    await vscode.window.withProgress({
        location: vscode.ProgressLocation.Notification,
        title: `Generating unit tests for "${folderPath}"`,
        cancellable: false
    }, async (progress) => {
        const processFile = async (entry) => {
            const file = entry.name;
            const filePath = path.join(directory, file);
            const stats = await fs.promises.stat(filePath);
            if (stats.isDirectory()) {
                readAllFilesinDirectory(filePath, testDirectory);
            }
            else {
                const data = await fs.promises.readFile(filePath, 'utf-8');
                const importStatement = path.join(directory, file);
                const relativeImportPath = path.relative(testDirectory, importStatement);
                const fileName = file.split('.')[0];
                const testFilePath = `${testDirectory}/test_${fileName}.py`;
                try {
                    const response = await axios_1.default.post("http://127.0.0.1:8000/directory_test", { file_data: data, file_name: file, dir_path: directory, import_path: relativeImportPath }, { headers: { "Content-Type": "application/json" } });
                    const jsonFolderPath = `${testDirectory}/json_data/${response.data[1]}`;
                    if (!fs.existsSync(jsonFolderPath)) {
                        fs.mkdirSync(jsonFolderPath, { recursive: true });
                    }
                    fs.writeFileSync(`${jsonFolderPath}/${response.data[2]}.json`, response.data[0]);
                    // Array is structured in classname, function name and prompt
                    const promptArr = response.data[3];
                    console.log(file);
                    for (const element of promptArr) {
                        // Separating the Response from the instruction
                        let promptSplitArr = element[2].split("### Response");
                        let responseStr = promptSplitArr.slice(1)[0].trim().split("###")[0];
                        responseStr = responseStr + "\n\n";
                        fs.appendFile(testFilePath, responseStr, err => {
                            if (err) {
                                console.error(err);
                                return;
                            }
                            console.log('Content appended successfully');
                        });
                    }
                    // Writing the imports to the start of the file
                    let parsedRelativeImport = response.data[4];
                    parsedRelativeImport = `from ${parsedRelativeImport} import *`;
                    const existingContent = await fs.promises.readFile(testFilePath, 'utf-8');
                    const updatedContent = parsedRelativeImport + "\n\n" + existingContent;
                    await fs.promises.writeFile(testFilePath, updatedContent);
                }
                catch (err) {
                    console.log(err);
                }
                processedFiles++;
                progress.report({ increment: 1 / totalFiles * 100, message: `Test for ${file} complete` });
            }
        };
        for (const entry of entries) {
            await processFile(entry);
        }
        if (processedFiles == totalFiles) {
            progress.report({ increment: 100, message: "Process Complete" });
            const dirName = path.basename(directory);
            vscode.window.showInformationMessage(`Tests for files in ${dirName} generated`, { modal: true });
        }
    });
}
async function readFilesInDirectory(directoryPath, testDirectory) {
    const entries = fs.readdirSync(directoryPath, { withFileTypes: true });
    const fileNames = [];
    for (const file of entries) {
        const filePath = path.join(directoryPath, file.name);
        const stats = fs.statSync(filePath);
        if (stats.isFile()) {
            fileNames.push(file.name);
        }
    }
    let entryLength = fileNames.length;
    console.log(entryLength);
    const folderName = path.basename(directoryPath);
    await vscode.window.withProgress({
        location: vscode.ProgressLocation.Notification,
        title: `Generating unit tests for "${folderName}"`,
        cancellable: false
    }, async (progress) => {
        progress.report({ increment: 0 });
        for (const entry of entries) {
            const fullPath = path.join(directoryPath, entry.name);
            if (entry.isFile()) {
                try {
                    const data = await fs.promises.readFile(fullPath, "utf-8");
                    const importStatement = path.join(directoryPath, entry.name);
                    let relativeImportPath = path.relative(testDirectory, importStatement);
                    let fileName = entry.name.split('.')[0];
                    let testFilePath = `${testDirectory}/test_${fileName}.py`;
                    // This is the logic where we pass the info back to the server for parsing the file and running the code body into the models
                    // let response = await axios.post("http://127.0.0.1:8000/directory_test", {file_data: data, file_name: entry.name, dir_path: directoryPath, import_path: relativeImportPath}, {headers: {"Content-Type": "application/json"}}).then(function (response) {
                    // })
                    let response = await axios_1.default.post("http://127.0.0.1:8000/directory_test", { file_data: data, file_name: entry.name, dir_path: directoryPath, import_path: relativeImportPath }, { headers: { "Content-Type": "application/json" } });
                    // Creating a folder for storing the json object returned from the server
                    let parentDirPath = path.dirname(__dirname);
                    let jsonFolderPath = `${testDirectory}/json_data/${response.data[1]}`;
                    let testsFolderPath = `${parentDirPath}/generated_tests/${response.data[response.data[1]]}`;
                    if (!fs.existsSync(jsonFolderPath)) {
                        fs.mkdirSync(jsonFolderPath, { recursive: true });
                    }
                    // Writing the parsed JSON object into a file within the correct folder
                    // const jsonString = JSON.stringify(response.data[0], null, 2);
                    fs.writeFileSync(`${jsonFolderPath}/${response.data[2]}`, response.data[0]);
                    const promptArr = response.data[3];
                    for (const element of promptArr) {
                        // Separating the Response from the instruction
                        let promptSplitArr = element[2].split("### Response");
                        let responseStr = promptSplitArr.slice(1)[0].trim().split("###")[0];
                        responseStr = responseStr + "\n\n";
                        fs.appendFile(testFilePath, responseStr, err => {
                            if (err) {
                                console.error(err);
                                return;
                            }
                            console.log('Content appended successfully');
                        });
                    }
                    // Writing the imports to the start of the file
                    let parsedRelativeImport = response.data[4];
                    parsedRelativeImport = `from ${parsedRelativeImport} import *`;
                    fs.readFile(testFilePath, 'utf-8', (err, existingContent) => {
                        if (err) {
                            console.error('An error has occured while reading the file to write the import statements');
                            return;
                        }
                        const updatedContent = parsedRelativeImport + "\n\n" + existingContent;
                        fs.writeFile(testFilePath, updatedContent, (err) => {
                            if (err) {
                                console.error("Error writing the import statements to the file");
                                return;
                            }
                        });
                    });
                    progress.report({ increment: 1 / entryLength * 100, message: `Test for ${entry.name} complete` });
                }
                catch (err) {
                    console.log(err);
                }
            }
        }
        vscode.window.showInformationMessage("Test generation complete", { modal: true });
    });
}
// This method is called when your extension is activated
// Your extension is activated the very first time the command is executed
function activate(context) {
    // Use the console to output diagnostic information (console.log) and errors (console.error)
    // This line of code will only be executed once when your extension is activated
    console.log('Congratulations, your extension "automatic-code-documentation" is now active!');
    // This command is for generating unit tests for all sub folders within the current folder
    let allDirsTest = vscode.commands.registerCommand('automatic-unit-test-generation.allDirsTest', async (uri) => {
        const currentFolderPath = uri.fsPath;
        // Setting the root directory and test directories
        const rootDir = getRootDirectory();
        const testDir = `${rootDir}/Tests`;
        const folderName = path.basename(currentFolderPath);
        // Replicating the folder structure first
        replicateFolderStructure(currentFolderPath, testDir);
        readAllFilesinDirectory(currentFolderPath, testDir);
    });
    // This function aims to retrieve all files in the current directory of the active file
    // It then generates the unit tests for all files in the current folder. The sub folders within the current folder will not be explored
    let currentDirTest = vscode.commands.registerCommand('automatic-unit-test-generation.currentDirTest', async (uri) => {
        const currentFolderPath = uri.fsPath;
        // Setting the root directory and test directories
        const rootDir = getRootDirectory();
        console.log(rootDir);
        const testDir = `${rootDir}/Tests`;
        replicateFolderStructure(currentFolderPath, testDir);
        readFilesInDirectory(currentFolderPath, testDir);
    });
    context.subscriptions.push(currentDirTest);
    context.subscriptions.push(allDirsTest);
}
exports.activate = activate;
// This method is called when your extension is 	deactivated
function deactivate() { }
exports.deactivate = deactivate;
//# sourceMappingURL=extension.js.map