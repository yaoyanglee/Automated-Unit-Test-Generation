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
    // 	if(file.isDirectory()) {
    // 		replicateFolderStructure(sourcePath, destinationPath);
    // 	}
    // }
}
// This function reads all files in the directory. It reads the current and subfolders as well
function readAllFilesinDirectory(directory, testDirectory) {
    vscode.window.withProgress({
        location: vscode.ProgressLocation.Notification,
        title: "Generating unit tests",
        cancellable: true
    }, (progress) => {
        fs.readdir(directory, (err, files) => {
            if (err) {
                console.error(err);
                return;
            }
            let filesLength = files.length;
            files.forEach((file) => {
                const filePath = path.join(directory, file);
                fs.stat(filePath, (err, stats) => {
                    if (err) {
                        console.error(err);
                        return;
                    }
                    if (stats.isDirectory()) {
                        readAllFilesinDirectory(filePath, testDirectory);
                    }
                    else {
                        fs.readFile(filePath, 'utf-8', (err, data) => {
                            if (err) {
                                console.error(err);
                                return;
                            }
                            const importStatement = path.join(directory, file);
                            let relativeImportPath = path.relative(testDirectory, importStatement);
                            let fileName = file.split('.')[0];
                            let testFilePath = `${testDirectory}/test_${fileName}.py`;
                            // Making a POST request to the server to format the files
                            // Need to add this URL into the config json
                            axios_1.default.post("http://127.0.0.1:8000/directory_test", { file_data: data, file_name: file, dir_path: directory, import_path: relativeImportPath }, { headers: { "Content-Type": "application/json" } }).then(function (response) {
                                let parentDirPath = path.dirname(__dirname);
                                let jsonFolderPath = `${testDirectory}/json_data/${response.data[1]}`;
                                let testsFolderPath = `${testDirectory}/${response.data[1]}`;
                                if (!fs.existsSync(jsonFolderPath)) {
                                    fs.mkdirSync(jsonFolderPath, { recursive: true });
                                }
                                // if(!fs.existsSync(testsFolderPath)) {
                                // 	fs.mkdirSync(testsFolderPath, {recursive: true});
                                // }	
                                // Writing the JSON object into a file
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
                                progress.report({ increment: 100, message: `Test for ${file} complete` });
                                // vscode.window.showInformationMessage(`Unit tests for ${response.data[1]} generated`);
                            });
                        });
                    }
                });
            });
        });
    });
    // fs.readdir(directory, (err, files) => {
    // 	if(err) {
    // 		console.error(err);
    // 		return;
    // 	}
    // 	files.forEach((file) => {
    // 		const filePath = path.join(directory, file);
    // 		fs.stat(filePath, (err, stats) => {
    // 			if(err) {
    // 				console.error(err);
    // 				return;
    // 			}
    // 			if(stats.isDirectory()) {
    // 				readAllFilesinDirectory(filePath, testDirectory);
    // 			}
    // 			else {
    // 				fs.readFile(filePath, 'utf-8', (err, data) => {
    // 					if(err) {
    // 						console.error(err);
    // 						return;
    // 					}
    // 					const importStatement = path.join(directory, file);
    // 					let relativeImportPath = path.relative(testDirectory, importStatement);
    // 					let fileName = file.split('.')[0];
    // 					let testFilePath = `${testDirectory}/test_${fileName}.py`
    // 					// Making a POST request to the server to format the files
    // 					// Need to add this URL into the config json
    // 					axios.post("http://127.0.0.1:8000/directory_test", {file_data: data, file_name: file, dir_path: directory, import_path: relativeImportPath}, {headers: {"Content-Type": "application/json"}}).then(function (response) {
    // 						let parentDirPath = path.dirname(__dirname);
    // 						let jsonFolderPath = `${testDirectory}/json_data/${response.data[1]}`;
    // 						let testsFolderPath = `${testDirectory}/${response.data[1]}`;
    // 						if(!fs.existsSync(jsonFolderPath)) {
    // 							fs.mkdirSync(jsonFolderPath, {recursive: true});
    // 						}
    // 						// if(!fs.existsSync(testsFolderPath)) {
    // 						// 	fs.mkdirSync(testsFolderPath, {recursive: true});
    // 						// }	
    // 						// Writing the JSON object into a file
    // 						fs.writeFileSync(`${jsonFolderPath}/${response.data[2]}.json`, response.data[0]);
    // 						// Array is structured in classname, function name and prompt
    // 						const promptArr = response.data[3];
    // 						console.log(file);
    // 						for (const element of promptArr) {
    // 							// Separating the Response from the instruction
    // 							let promptSplitArr = element[2].split("### Response")
    // 							let responseStr = promptSplitArr.slice(1)[0].trim().split("###")[0];
    // 							responseStr = responseStr + "\n\n";
    // 							fs.appendFile(testFilePath,  responseStr, err => {	
    // 								if(err) {
    // 									console.error(err);
    // 									return;
    // 								}
    // 								console.log('Content appended successfully');
    // 							});
    // 						}
    // 						// Writing the imports to the start of the file
    // 						let parsedRelativeImport = response.data[4];
    // 						parsedRelativeImport = `from ${parsedRelativeImport} import *`;
    // 						fs.readFile(testFilePath, 'utf-8', (err, existingContent) => {
    // 							if(err) {
    // 								console.error('An error has occured while reading the file to write the import statements');
    // 								return;
    // 							}
    // 							const updatedContent = parsedRelativeImport + "\n\n" + existingContent;
    // 							fs.writeFile(testFilePath, updatedContent, (err) => {
    // 								if(err) {
    // 									console.error("Error writing the import statements to the file");
    // 									return;
    // 								}
    // 							})
    // 						})
    // 						vscode.window.showInformationMessage(`Unit tests for ${response.data[1]} generated`);
    // 					})
    // 				})
    // 			}
    // 		})
    // 	})
    // })
}
async function readFilesInDirectory(directoryPath, testDirectory) {
    const entries = fs.readdirSync(directoryPath, { withFileTypes: true });
    let entryLength = entries.length;
    vscode.window.withProgress({
        location: vscode.ProgressLocation.Notification,
        title: "Generating unit tests",
        cancellable: true
    }, (progress) => {
        progress.report({ increment: 0 });
        entries.forEach((entry) => {
            const fullPath = path.join(directoryPath, entry.name);
            if (entry.isFile()) {
                fs.readFile(fullPath, 'utf-8', (err, data) => {
                    if (err) {
                        vscode.window.showErrorMessage(`Failed to read file: ${err}`);
                        return;
                    }
                    const importStatement = path.join(directoryPath, entry.name);
                    let relativeImportPath = path.relative(testDirectory, importStatement);
                    let fileName = entry.name.split('.')[0];
                    let testFilePath = `${testDirectory}/test_${fileName}.py`;
                    // This is the logic where we pass the info back to the server for parsing the file and running the code body into the models
                    axios_1.default.post("http://127.0.0.1:8000/directory_test", { file_data: data, file_name: entry.name, dir_path: directoryPath, import_path: relativeImportPath }, { headers: { "Content-Type": "application/json" } }).then(function (response) {
                        // Creating a folder for storing the json object returned from the server
                        let parentDirPath = path.dirname(__dirname);
                        let jsonFolderPath = `${testDirectory}/json_data/${response.data[1]}`;
                        let testsFolderPath = `${parentDirPath}/generated_tests/${response.data[response.data[1]]}`;
                        if (!fs.existsSync(jsonFolderPath)) {
                            fs.mkdirSync(jsonFolderPath, { recursive: true });
                        }
                        // if(!fs.existsSync(testsFolderPath)) {
                        // 	fs.mkdirSync(testsFolderPath, {recursive: true});
                        // }	
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
                    });
                });
            }
        });
    });
    // entries.forEach((entry) => {
    // 	const fullPath = path.join(directoryPath, entry.name);
    // 	if(entry.isFile()) {
    // 		fs.readFile(fullPath, 'utf-8', (err, data) => {
    // 			if(err) {
    // 				vscode.window.showErrorMessage(`Failed to read file: ${err}`);
    // 				return;
    // 			}
    // 			const importStatement = path.join(directoryPath, entry.name)
    // 			let relativeImportPath = path.relative(testDirectory, importStatement);
    // 			let fileName = entry.name.split('.')[0];
    // 			let testFilePath = `${testDirectory}/test_${fileName}.py`
    // 			// This is the logic where we pass the info back to the server for parsing the file and running the code body into the models
    // 			axios.post("http://127.0.0.1:8000/directory_test", {file_data: data, file_name: entry.name, dir_path: directoryPath, import_path: relativeImportPath}, {headers: {"Content-Type": "application/json"}}).then(function (response) {
    // 				// Creating a folder for storing the json object returned from the server
    // 				let parentDirPath = path.dirname(__dirname);
    // 				let jsonFolderPath = `${testDirectory}/json_data/${response.data[1]}`;
    // 				let testsFolderPath = `${parentDirPath}/generated_tests/${response.data[response.data[1]]}`;
    // 				if(!fs.existsSync(jsonFolderPath)) {
    // 					fs.mkdirSync(jsonFolderPath, {recursive: true});
    // 				}
    // 				// if(!fs.existsSync(testsFolderPath)) {
    // 				// 	fs.mkdirSync(testsFolderPath, {recursive: true});
    // 				// }	
    // 				// Writing the parsed JSON object into a file within the correct folder
    // 				// const jsonString = JSON.stringify(response.data[0], null, 2);
    // 				fs.writeFileSync(`${jsonFolderPath}/${response.data[2]}`, response.data[0]);
    // 				const promptArr = response.data[3]
    // 				for (const element of promptArr) {
    // 					// Separating the Response from the instruction
    // 					let promptSplitArr = element[2].split("### Response")
    // 					let responseStr = promptSplitArr.slice(1)[0].trim().split("###")[0];
    // 					responseStr = responseStr + "\n\n";
    // 					fs.appendFile(testFilePath,  responseStr, err => {	
    // 						if(err) {
    // 							console.error(err);
    // 							return;
    // 						}
    // 						console.log('Content appended successfully');
    // 					});
    // 				}
    // 				// Writing the imports to the start of the file
    // 				let parsedRelativeImport = response.data[4];
    // 				parsedRelativeImport = `from ${parsedRelativeImport} import *`;
    // 				fs.readFile(testFilePath, 'utf-8', (err, existingContent) => {
    // 					if(err) {
    // 						console.error('An error has occured while reading the file to write the import statements');
    // 						return;
    // 					}
    // 					const updatedContent = parsedRelativeImport + "\n\n" + existingContent;
    // 					fs.writeFile(testFilePath, updatedContent, (err) => {
    // 						if(err) {
    // 							console.error("Error writing the import statements to the file");
    // 							return;
    // 						}
    // 					})
    // 				})
    // 			})
    // 		});
    // 	} 
    // })
}
// This method is called when your extension is activated
// Your extension is activated the very first time the command is executed
function activate(context) {
    // Use the console to output diagnostic information (console.log) and errors (console.error)
    // This line of code will only be executed once when your extension is activated
    console.log('Congratulations, your extension "automatic-code-documentation" is now active!');
    // This command generates unit tests for the current file that is selected
    let curFileTest = vscode.commands.registerCommand('automatic-code-documentation.curFileTest', (uri) => {
        console.log(uri.fsPath);
    });
    // This command is for generating unit tests for all sub folders within the current folder
    let allDirsTest = vscode.commands.registerCommand('automatic-code-documentation.allDirsTest', (uri) => {
        const currentFolderPath = uri.fsPath;
        // Setting the root directory and test directories
        const rootDir = getRootDirectory();
        console.log(rootDir);
        const testDir = `${rootDir}/Tests`;
        // Replicating the folder structure first
        replicateFolderStructure(currentFolderPath, testDir);
        // Calling the function to read files
        readAllFilesinDirectory(currentFolderPath, testDir);
        // vscode.window.withProgress({
        // 	location: vscode.ProgressLocation.Window,
        // 	title: `Generating unit tests for ${currentFolderPath}`,
        // 	cancellable: true
        // }, (progress, token) => {
        // 	token.onCancellationRequested(() => {
        // 		console.log("User canceled the test generation");
        // 	})
        // 	const p = new Promise<void>(resolve => {
        // 		resolve();
        // 	})
        // 	return p;
        // })
        // vscode.window.showInformationMessage("Unit tests generating");
        // const currentFolderPath = uri.fsPath;
        // // Setting the root directory and test directories
        // const rootDir = getRootDirectory()
        // console.log(rootDir);
        // const testDir = `${rootDir}/Tests`;
        // // Replicating the folder structure first
        // replicateFolderStructure(currentFolderPath, testDir);
        // // Calling the function to read files
        // readAllFilesinDirectory;
        // readAllFilesinDirectory(currentFolderPath, testDir);
    });
    // This function aims to retrieve all files in the current directory of the active file
    // It then generates the unit tests for all files in the current folder. The sub folders within the current folder will not be explored
    let currentDirTest = vscode.commands.registerCommand('automatic-code-documentation.currentDirTest', async (uri) => {
        const currentFolderPath = uri.fsPath;
        // Setting the root directory and test directories
        const rootDir = getRootDirectory();
        console.log(rootDir);
        const testDir = `${rootDir}/Tests`;
        replicateFolderStructure(currentFolderPath, testDir);
        readFilesInDirectory(currentFolderPath, testDir);
        // vscode.window.withProgress({
        // 	location: vscode.ProgressLocation.Notification,
        // 	title: "Generating unit tests for the current directory",
        // }, async (progress, token) => {
        // 	token.onCancellationRequested(() => {
        // 		console.log("User cancelled the process");
        // 	})
        // 	// Creating the parent test folder
        // 	replicateFolderStructure(currentFolderPath, testDir);
        // 	const p = new Promise<void>(async resolve => {
        // 		await readFilesInDirectory(currentFolderPath, testDir);
        // 		resolve();
        // 	})
        // 	return p;
        // })
    });
    // The command has been defined in the package.json file
    // Now provide the implementation of the command with registerCommand
    // The commandId parameter must match the command field in package.json
    let disposable = vscode.commands.registerCommand('automatic-code-documentation.helloWorld', () => {
        // The code you place here will be executed every time your command is executed
        // Check to make sure the user has the text editor open
        const editor = vscode.window.activeTextEditor;
        if (!editor) {
            return;
        }
        const document = editor.document;
        const selection = editor.selection;
        // Get the code that the user has selected
        let code = document.getText(selection);
        let fileData = document.getText();
        // Pre-processing to pass the code to CodeBERT in the form it expects
        // Basically replacing all the tabs with one whitespace, and converting to lower case
        code = code.split(/[\s]+/).join(' ').toLowerCase();
        // Sending user's selected code to backend via post request
        // response data is the generated code and it is written into the tests folder
        axios_1.default.post("http://127.0.0.1:8	000", { code: code, fileData: fileData }, { headers: { "Content-Type": "application/json" } }).then(function (response) {
            try {
                // Specifying the unit test parent folder
                const test_dir = '/home/lyaoyang/Desktop/VS-Extension/extension-js/pytest-test-folder';
                // Writing to file
                fs.writeFileSync(path.join(test_dir, './test.py'), response.data, { flag: 'w' });
                const content = fs.readFileSync(path.join(test_dir, './test.py'), 'utf-8');
                console.log(content);
                vscode.window.showInformationMessage("Unit Tests Generated");
            }
            catch (err) {
                // vscode.window.showInformationMessage(err);
                console.log(err);
            }
        }, (error) => {
            console.log(error);
        });
    });
    context.subscriptions.push(disposable);
    context.subscriptions.push(currentDirTest);
    context.subscriptions.push(allDirsTest);
    context.subscriptions.push(curFileTest);
}
exports.activate = activate;
// This method is called when your extension is 	deactivated
function deactivate() { }
exports.deactivate = deactivate;
//# sourceMappingURL=extension.js.map