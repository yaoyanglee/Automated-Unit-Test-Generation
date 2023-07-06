// The module 'vscode' contains the VS Code extensibility API
// Import the module and reference it with the alias vscode in your code below
import * as vscode from 'vscode';
import axios from "axios";

import * as fs from 'fs';
import * as path from 'path';



function getRootDirectory() {
	let workspaceFolders =  vscode.workspace.workspaceFolders;
	if(!workspaceFolders) {
		vscode.window.showInformationMessage("No workspace or folder is opened");
		return;
	}
	return workspaceFolders[0].uri.fsPath;
}

// This function aims to replicate the folder structure of the source code
function replicateFolderStructure(sourceDir:string, destinationDir:string) {
	
	if(!fs.existsSync(destinationDir)) {
		fs.mkdirSync(destinationDir, {recursive:true});
	}

	// const files = fs.readdirSync(sourceDir, {withFileTypes:true});

	// for(const file of files) {
	// 	const sourcePath = path.join(sourceDir, file.name);
	// 	const destinationPath = path.join(destinationDir, file.name);
	// }
}

// This function reads all files in the directory. It reads the current and subfolders as well
async function readAllFilesinDirectory(directory: string, testDirectory:string) {
	const entries = await fs.promises.readdir(directory, {withFileTypes:true});
	const fileNames: string [] = [];
		for (const file of entries) {
			const filePath = path.join(directory, file.name);
			const stats = fs.statSync(filePath);

			if(stats.isFile()) {
				fileNames.push(file.name);		
			}
		}
	const totalFiles = fileNames.length;
	let processedFiles = 0;
	
	const folderPath = path.basename(directory);
	await vscode.window.withProgress({
		location: vscode.ProgressLocation.Notification,
		title: `Generating unit tests for "${folderPath}"`,
		cancellable: true
	}, async (progress:any): Promise<void> => {
		const processFile = async (entry: fs.Dirent): Promise<void> => {
			const file = entry.name;
			const filePath = path.join(directory, file);
			const stats = await fs.promises.stat(filePath);

			if(stats.isDirectory()) {
				readAllFilesinDirectory(filePath, testDirectory);
			}
			else {
				const data = await fs.promises.readFile(filePath, 'utf-8');
				const importStatement = path.join(directory, file);
				const relativeImportPath = path.relative(testDirectory, importStatement);
				const fileName = file.split('.')[0];
				const testFilePath = `${testDirectory}/test_${fileName}.py` 

				try{
					const response = await axios.post("http://127.0.0.1:8000/directory_test", {file_data: data, file_name: file, dir_path: directory, import_path: relativeImportPath}, {headers: {"Content-Type": "application/json"}})
					
					const jsonFolderPath = `${testDirectory}/json_data/${response.data[1]}`; 

					if(!fs.existsSync(jsonFolderPath)) {
						fs.mkdirSync(jsonFolderPath, {recursive: true});
					}

					fs.writeFileSync(`${jsonFolderPath}/${response.data[2]}.json`, response.data[0]);
	
					// Array is structured in classname, function name and prompt
					const promptArr = response.data[3];
					
					console.log(file);
					for (const element of promptArr) {
						// Separating the Response from the instruction
						let promptSplitArr = element[2].split("### Response")
						let responseStr = promptSplitArr.slice(1)[0].trim().split("###")[0];
						responseStr = responseStr + "\n\n";

						fs.appendFile(testFilePath,  responseStr, err => {	
							if(err) {
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
				const progressPercentage = (processedFiles/totalFiles) * 100;
				progress.report({increment: progressPercentage, message: `Test for ${file} complete`});
			}
		};
		 
		for (const entry of entries) {
			await processFile(entry);
		}

		if(processedFiles == totalFiles) {
			progress.report({increment: 100, message: "Process Complete"});
			const dirName = path.basename(directory);
			vscode.window.showInformationMessage(`Tests for files in ${dirName} generated`, {modal:true});
		}		
	})

	
	// fs.readdir(directory, async (err, files) => {
	// 	if(err) {
	// 		console.error(err);
	// 		return;
	// 	}
		
	// 	const fileNames: string [] = [];
	// 	for (const file of files) {
	// 		const filePath = path.join(directory, file);
	// 		const stats = fs.statSync(filePath);

	// 		if(stats.isFile()) {
	// 			fileNames.push(file);		
	// 		}
	// 	}

	// 	let totalLength = fileNames.length;
	// 	let parentDirName = path.basename(path.dirname(path.join(directory, fileNames[0]))); 
	// 	console.log(fileNames);

	// 	await vscode.window.withProgress({
	// 		location: vscode.ProgressLocation.Window,
	// 		title: `Generating tests for ${parentDirName}`,
	// 		cancellable: true
	// 	}, (progress:any):any => {
	// 		files.forEach((file) => {
	// 			let processedFiles = 0;
	// 			progress.report({increment: 0});

	// 			const filePath = path.join(directory, file);
	// 			fs.stat(filePath, (err, stats) => {
	// 				if(err) {
	// 					console.error(err);
	// 					return;
	// 				}
	
	// 				if(stats.isDirectory()) {
	// 					readAllFilesinDirectory(filePath, testDirectory);
	// 				}
	// 				else {
	// 					fs.readFile(filePath, 'utf-8', (err, data) => {
	// 						if(err) {
	// 							console.error(err);
	// 							return;
	// 						}
	// 						const importStatement = path.join(directory, file);
	// 						let relativeImportPath = path.relative(testDirectory, importStatement);
	// 						let fileName = file.split('.')[0];
	// 						let testFilePath = `${testDirectory}/test_${fileName}.py`
	
	// 						// Making a POST request to the server to format the files
	// 						// Need to add this URL into the config json
	// 						axios.post("http://127.0.0.1:8000/directory_test", {file_data: data, file_name: file, dir_path: directory, import_path: relativeImportPath}, {headers: {"Content-Type": "application/json"}}).then(function (response) {
	// 							let parentDirPath = path.dirname(__dirname);
	// 							let jsonFolderPath = `${testDirectory}/json_data/${response.data[1]}`;
	// 							let testsFolderPath = `${testDirectory}/${response.data[1]}`;
	
	// 							if(!fs.existsSync(jsonFolderPath)) {
	// 								fs.mkdirSync(jsonFolderPath, {recursive: true});
	// 							}
	// 							// if(!fs.existsSync(testsFolderPath)) {
	// 							// 	fs.mkdirSync(testsFolderPath, {recursive: true});
	// 							// }	
								
	// 							// Writing the JSON object into a file
	// 							fs.writeFileSync(`${jsonFolderPath}/${response.data[2]}.json`, response.data[0]);
	
	// 							// Array is structured in classname, function name and prompt
	// 							const promptArr = response.data[3];
								
	// 							console.log(file);
	// 							for (const element of promptArr) {
	// 								// Separating the Response from the instruction
	// 								let promptSplitArr = element[2].split("### Response")
	// 								let responseStr = promptSplitArr.slice(1)[0].trim().split("###")[0];
	// 								responseStr = responseStr + "\n\n";
	
	// 								fs.appendFile(testFilePath,  responseStr, err => {	
	// 									if(err) {
	// 										console.error(err);
	// 										return;
	// 									}
	// 									console.log('Content appended successfully');
	// 								});
	// 							}
								
	// 							// Writing the imports to the start of the file
	// 							let parsedRelativeImport = response.data[4];
	// 							parsedRelativeImport = `from ${parsedRelativeImport} import *`;
	// 							fs.readFile(testFilePath, 'utf-8', (err, existingContent) => {
	// 								if(err) {
	// 									console.error('An error has occured while reading the file to write the import statements');
	// 									return;
	// 								}
									
	// 								const updatedContent = parsedRelativeImport + "\n\n" + existingContent;
	
	// 								fs.writeFile(testFilePath, updatedContent, (err) => {
	// 									if(err) {
	// 										console.error("Error writing the import statements to the file");
	// 										return;
	// 									}
	// 								})
	// 							})

	// 							processedFiles++;
	// 							progress.report({increment: processedFiles/totalLength *100, message:`Test for ${file} complete`});
	// 						})
	// 						console.log("This is just after the post");
	// 					})
	// 				}
	// 			})
	// 		})
	// 		// vscode.window.showInformationMessage("Test generation complete", {modal:true});
	// 	})	
	// })
}

async function readFilesInDirectory(directoryPath: string, testDirectory:string) {
	const entries = fs.readdirSync(directoryPath, {withFileTypes:true});
	const fileNames: string [] = [];
	for (const file of entries) {
		const filePath = path.join(directoryPath, file.name);
		const stats = fs.statSync(filePath);

		if(stats.isFile()) {
			fileNames.push(file.name);		
		}
	}
	let entryLength = fileNames.length;
	
	const folderName = path.basename(directoryPath);
	await vscode.window.withProgress({
		location: vscode.ProgressLocation.Notification,
		title: `Generating unit tests for "${folderName}"`,
		cancellable: false
	}, async (progress: any) => {
		progress.report({increment: 0});

		for (const entry of entries) {
			const fullPath = path.join(directoryPath, entry.name);
			if(entry.isFile()) {
				try {
					const data = await fs.promises.readFile(fullPath, "utf-8");

					
					const importStatement = path.join(directoryPath, entry.name)
					let relativeImportPath = path.relative(testDirectory, importStatement);
					let fileName = entry.name.split('.')[0];
					let testFilePath = `${testDirectory}/test_${fileName}.py`
	
					// This is the logic where we pass the info back to the server for parsing the file and running the code body into the models
					// let response = await axios.post("http://127.0.0.1:8000/directory_test", {file_data: data, file_name: entry.name, dir_path: directoryPath, import_path: relativeImportPath}, {headers: {"Content-Type": "application/json"}}).then(function (response) {
						
					// })

					let response = await axios.post("http://127.0.0.1:8000/directory_test", {file_data: data, file_name: entry.name, dir_path: directoryPath, import_path: relativeImportPath}, {headers: {"Content-Type": "application/json"}})

					// Creating a folder for storing the json object returned from the server
					let parentDirPath = path.dirname(__dirname);
					let jsonFolderPath = `${testDirectory}/json_data/${response.data[1]}`;
					let testsFolderPath = `${parentDirPath}/generated_tests/${response.data[response.data[1]]}`;
		
					if(!fs.existsSync(jsonFolderPath)) {
						fs.mkdirSync(jsonFolderPath, {recursive: true});
					}	

					// Writing the parsed JSON object into a file within the correct folder
					// const jsonString = JSON.stringify(response.data[0], null, 2);
					fs.writeFileSync(`${jsonFolderPath}/${response.data[2]}`, response.data[0]);

					const promptArr = response.data[3]

					for (const element of promptArr) {
						// Separating the Response from the instruction
						let promptSplitArr = element[2].split("### Response")
						let responseStr = promptSplitArr.slice(1)[0].trim().split("###")[0];
						responseStr = responseStr + "\n\n";

						fs.appendFile(testFilePath,  responseStr, err => {	
							if(err) {
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
						if(err) {
							console.error('An error has occured while reading the file to write the import statements');
							return;
						}
						
						const updatedContent = parsedRelativeImport + "\n\n" + existingContent;

						fs.writeFile(testFilePath, updatedContent, (err) => {
							if(err) {
								console.error("Error writing the import statements to the file");
								return;
							}
						})
					})
					progress.report({increment: 1/entryLength * 100, message:`Test for ${entry.name} complete`});
				}
				catch (err) {
					console.log(err);
				}
			}
		}

		vscode.window.showInformationMessage("Test generation complete", {modal: true});
	})
}

// This method is called when your extension is activated
// Your extension is activated the very first time the command is executed
export function activate(context: vscode.ExtensionContext) {

	// Use the console to output diagnostic information (console.log) and errors (console.error)
	// This line of code will only be executed once when your extension is activated
	console.log('Congratulations, your extension "automatic-code-documentation" is now active!');

	// This command generates unit tests for the current file that is selected
	let curFileTest = vscode.commands.registerCommand('automatic-code-documentation.curFileTest', (uri: vscode.Uri) => {
		console.log(uri.fsPath);
	})

	// This command is for generating unit tests for all sub folders within the current folder
	let allDirsTest = vscode.commands.registerCommand('automatic-code-documentation.allDirsTest', async (uri: vscode.Uri) => {
		const currentFolderPath = uri.fsPath;
		// Setting the root directory and test directories
		const rootDir = getRootDirectory()
		console.log(rootDir);
		const testDir = `${rootDir}/Tests`;
		const folderName = path.basename(currentFolderPath);

		// Replicating the folder structure first
		replicateFolderStructure(currentFolderPath, testDir);
		readAllFilesinDirectory(currentFolderPath, testDir);
	})

	// This function aims to retrieve all files in the current directory of the active file
	// It then generates the unit tests for all files in the current folder. The sub folders within the current folder will not be explored
	let currentDirTest = vscode.commands.registerCommand('automatic-code-documentation.currentDirTest', async (uri: vscode.Uri) => {
		const currentFolderPath = uri.fsPath;
		// Setting the root directory and test directories
		const rootDir = getRootDirectory()
		console.log(rootDir);
		const testDir = `${rootDir}/Tests`;

		replicateFolderStructure(currentFolderPath, testDir);
		readFilesInDirectory(currentFolderPath, testDir);
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
		axios.post("http://127.0.0.1:8	000", {code: code, fileData: fileData}, {headers: {"Content-Type": "application/json"}}).then(function(response) {
			try {
				// Specifying the unit test parent folder
				const test_dir = '/home/lyaoyang/Desktop/VS-Extension/extension-js/pytest-test-folder'

				// Writing to file
				fs.writeFileSync(path.join(test_dir, './test.py'), response.data, {flag:'w'});

				const content = fs.readFileSync(path.join(test_dir, './test.py'), 'utf-8');
				console.log(content);


				vscode.window.showInformationMessage("Unit Tests Generated");
			} catch (err) {
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

// This method is called when your extension is 	deactivated
export function deactivate() {}
