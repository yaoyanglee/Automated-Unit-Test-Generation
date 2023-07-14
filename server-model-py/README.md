# Server Documentation

## API Paths

There are 2 main functions in the extension. Generating tests for the current directory only and generating tests for the current and any sub-directories. But there is only 1 API path used.

### /directory_test

This is the API path that performs parsing, prompt formatting and test generation.

The source code in the file is first parsed into JSON before being formatted into a prompt to be passed into the LLM.

(Prompt Format: Class Functions)

```
### Instruction
class MyClass:
    def __init__(self, somr_args, ...):
        # Code

    def some_function(self, some_args, ...):
        # Code

# Any natural language instruction
# Generate 5 test cases based on the PyTest module

### Response
class Test_function_name:
    def test_function_name_1(self):
        # Code
```

## ModelClass

### ****init****

This function takes the model path, device, which is `torch.to('CUDA')`, memory map for inferencing on multiple GPUs amd model_type.

It then proceeds to initialize the model when it is called by the server.

## importFormatter

## file_post_processing

## directory_generate_test

## Server

## Helpers

### FunctionVisitor

Identifies class and function definitions and bodies from a source code string and stores them in a JSON object.

It inherits from the `ast.NodeVisitor` class from the Python `AST` module. Each `visit_statementtype` function is invoked when it visits a node of that statement type. For example `visit_FunctionDef` extracts the function name, body and comments when it encounters a function definition node in the AST.

This class is mainly used to parse the source code string extracted from files under test.

### FileParser

This class contains 3 functions, `json_parser`, `json_file_writer` and `json_to_prompt`.

#### Inputs

content (str): The source code string \
folder_name (str): The name of the directory under test \
cur_file_name (str): The name of the current file. Used for naming the json files of the parsed source code.

**json_parser(self, code_string)** \
Uses the `FunctionVisitor` class to convert the source code string extracted from the files into a JSON object containing class definitions, function definitions, function bodies and comments.

It returns a JSON object of the parsed source code string.

**json_file_writer(self)** \
Writes the JSON object returned by `json_parser` onto the server side for future use.

The JSON object of the source code string is returned.

**json_to_prompt(json_obj, relative_import_path)** \
Creates a prompt for each function using the JSON object of the parsed source code string. The relative import path is passed as context for code generation.

The prompt for each function is written into an array

```
[class_name, name, prompt]
```

This array is then passed into a larger array for a loop based code generation.
