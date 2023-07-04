import ast
import json
import os
import textwrap

# This function extracts code that are not children of functions, classes or class functions
class UnhandledExtractor(ast.NodeVisitor):
    def __init__(self, code_string):
        self.code_string = code_string
        self.unhandled_code = []
        self.nesting_level = 0
    
    def visit_ClassDef(self, node):
        self.nesting_level += 1
        self.generic_visit(node)
        self.nesting_level -= 1
    
    def visit_FunctionDef(self, node):
        self.nesting_level += 1
        self.generic_visit(node)
        self.nesting_level -= 1

    def generic_visit(self, node):
        if self.nesting_level == 0 and not isinstance(node, (ast.FunctionDef, ast.ClassDef)):
            code_segment = ast.get_source_segment(self.code_string, node)
            self.unhandled_code.append(code_segment)

# This class extracts the class name, inheritance, class functions, non-class functions and their associated definitions and code body
class FunctionVisitor(ast.NodeVisitor):
    def __init__(self, code_string):
        self.code_string = code_string
        self.class_functions = {}
        self.non_class_functions = {}
        self.import_statements = []
        self.current_class = None

    def visit_ClassDef(self, node):
        self.current_class = node.name
        inheritance = []
        
        # Retrieving the comments associated with a class
        class_comments = []
        lines = self.code_string.split('\n')
        for i in range(node.lineno - 2, -1, -1):
            line = lines[i].strip()
            if line.startswith('#'):
                class_comments.append("# " + line[1:].strip())
            else:
                break
        # Flipping the comments array
        class_comments = class_comments[::-1]
        
        for base in node.bases:
            if isinstance(base, ast.Name):
                inheritance.append(base.id)
            elif isinstance(base, ast.Attribute):
                inheritance.append('.'.join([base.value.id, base.attr]))

        self.class_functions[self.current_class] = {
            'inheritance': inheritance,
            'comments': class_comments,
            # 'Class Definition': ast.get_source_segment(self.code_string, node)
            'functions': []
        }
        self.generic_visit(node)
        self.current_class = None

    def visit_FunctionDef(self, node):
        if isinstance(node, ast.FunctionDef):
            function_body = ast.get_source_segment(self.code_string, node).strip()
            function_comments = []
            lines = self.code_string.split('\n')
            for i in range(node.lineno - 2, -1, -1):
                line = lines[i].strip()
                if line.startswith('#'):
                    function_comments.append("# " + line[1:].strip())
                else:
                    break
            # Flipping the comments array
            function_comments = function_comments[::-1]   
            

            if self.current_class is not None:
                parsed_comments = '\n'.join(function_comments)
                self.class_functions[self.current_class]['functions'].append({
                    'name': node.name,
                    'body': f"{parsed_comments}\n" + function_body,
                    'comments': function_comments
                })
            else:
                parse_comments = '\n'.join(function_comments)
                self.non_class_functions[node.name] = f"{parse_comments}\n" + function_body

        self.generic_visit(node)

    def visit_Import(self, node):
        for alias in node.names:
            self.import_statements.append(f"import {alias.name}")

    def visit_ImportFrom(self, node):
        module_name = node.module if node.module else ""
        for alias in node.names:
            import_statement = f"from {module_name} import {alias.name}"
            self.import_statements.append(import_statement)
    
# This class handles the parsing of the code that is passed into it.
# Main functions include converting source code into its JSON metadata file
# Converting the JSON metadata file into the prompt to be fed into the model
class FileParser:
    def __init__(self, content, folder_name, cur_file_name):
        self.content = content
        self.folder_name = folder_name
        self.cur_file_name = cur_file_name

    def json_parser(self, code_string):
        # Parse the code and visit the function definitions
        tree = ast.parse(code_string)
        visitor = FunctionVisitor(code_string)
        visitor.visit(tree)

        # Extracting code that is not a child of a class, class function or non-class function
        # unhandled_extractor = UnhandledExtractor(code_string)
        # unhandled_extractor.visit(tree)

        # Print the extracted class inheritance and function bodies
        class_functions = visitor.class_functions
        non_class_functions = visitor.non_class_functions

        # Store the extracted information in a dictionary
        function_bodies = {}
        function_bodies['Class Functions'] = class_functions
        function_bodies['Non Class Functions'] = non_class_functions
        function_bodies['Import Statements'] = visitor.import_statements
        # function_bodies['Unhandled Code'] = unhandled_extractor.unhandled_code

        # Save the information as JSON
        jsonObj = json.dumps(function_bodies, indent=4)

        return jsonObj
        
    def json_file_writer(self):
        # Folder creation for the current active directories test cases and JSON data files
        json_folder_path = f"./json_data/{self.folder_name}"
        tests_folder_path = f"./generated_tests/{self.folder_name}"

        if not os.path.exists(json_folder_path):
            os.makedirs(json_folder_path)
        
        # Parses the file into a JSON file containing the data about the source code file
        # The data is then written into a json file
        json_obj = self.json_parser(self.content)
        json_file_path = f"{json_folder_path}/{self.cur_file_name}_json.json"
        
        with open(json_file_path, "w") as f:
            f.write(json_obj)
        
        # Creation of tests folder and error handling
        if not os.path.exists(tests_folder_path):
            os.makedirs(tests_folder_path)
        
        return json_obj

    def json_to_prompt(self, json_obj, relative_import_path):
        # An array to store all generated prompts
        prompt_arr = []

        # ===== Formation of the prompt to pass into the model =====
        # Formatting for class functions    
        # Extracting the class names
        class_name_arr = json_obj["Class Functions"].keys()
        
        # Extracting the inheritance of the class names
        for name in class_name_arr:
            inheritance = json_obj["Class Functions"][name]['inheritance']
            functions = json_obj["Class Functions"][name]['functions']
            
            # This is the formatted inheritance string in the event that there are multiple inheritance variables
            inheritance_string = ', '.join(inheritance)

            non_init_function = []
            for f in functions:
                # Extracting the __init__ function 
                if '__init__' in f['body']:
                    init_function = f['body']
                    init_function = init_function.replace('        ', '    ')
                    init_function = textwrap.indent(init_function, '    ')  

                # Storing all functions that are not an __init__ function in an array
                elif '__init__' not in f['body']:
                    non_init_function.append([f['name'], f['body']])

            for f in non_init_function:
                # Formatting for the class function by moving it 1 indent to the right
                function_body = f[1].replace('        ', '    ')
                function_body = textwrap.indent(function_body, '    ')
                
                # Fixing indent problems in the init functions
                # lines = init_function.split('\n')

                # Formatting the import statements
                imports = '\n'.join(json_obj['Import Statements'])

                # String containing some natural language context to help users define requirements to the model
                nl_context = "# Generate 5 unit tests based on the PyTest module\n# Generate code that properly initializes classes and its functions when calling class functions"

                relative_import_path = f"from {relative_import_path} import *"

                # Forming the prompts
                if init_function:
                    prompt = f"### Instruction\n{imports}\nclass {name}({inheritance_string}):{init_function}\n\n{function_body}\n\n{nl_context}\n\n### Response\n{imports}\n\nclass Test{f[0]}:\n\tdef test_{f[0]}_1(self):"
                else:
                    prompt = f"### Instruction\n{imports}\nclass {name}({inheritance_string}):\n{function_body}\n\n{nl_context}\n\n### Response\n{imports}\n\nclass Test{f[0]}:\n\tdef test_{f[0]}_1(self):" 
                # Storing the prompts with the class name: name, f[0]: function name and the prompt
                prompt_arr.append([name , f[0], prompt])
                
        
        # Formatting for non-class functions
        non_class_fname = json_obj["Non Class Functions"].keys()

        for name in non_class_fname:
            non_class_fbody = json_obj["Non Class Functions"][name]

            # String containing some natural language context to help users define requirements to the model
            nl_context = "# Generate 5 unit tests based on the PyTest module"
            # Formatting the import statements
            imports = '\n'.join(json_obj['Import Statements'])
            prompt = f"### Instruction {imports}\n\n{non_class_fbody}\n\n{nl_context}\n\n### Response\n{imports}\n\nclass Test{name}:\n\tdef test_{name}_1():"

            prompt_arr.append([None, name, prompt])
        
        return prompt_arr


