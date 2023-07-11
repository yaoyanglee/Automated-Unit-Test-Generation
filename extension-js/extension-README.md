# Extension Documentation

## Helpers

### getRootDirectory()
This function retrieves the root folder of the current workspace. In essence, the parent folder of all current folders in the workspace. 

This used for determining the absolute file path when writing the import paths to the files containing the functions under test.

### replicateFolderStructure()
This creates the folder structure for storing the generated tests. Uncommenting the code will make the program replicate the folder structure of the directory under test, and the test files will be stored in the same hierarchy as in the directory under test.

## Main Functions

### readAllFilesinDirectory()
**Inputs**
directory (str): The path to the directory under test .
testDirectory (str): The path to where the user wants to generate the `Tests\` folder.

<!-- Add hyperlink to the server page -->
This function begins by reading all files and folders in the directory under test. For each file, it would extract its text and pass it to the server for parsing and test generation. For each folder, the function would recursively enter the folder to perform the same operation. 

It uses the VSCode Extension APIs' [withProgress](https://code.visualstudio.com/api/references/vscode-api) function to track the test generation status of each folder and subfolder. A notice will be shown when the tests for each folder/subfolder is complete.

### readFilesinDirectory()



