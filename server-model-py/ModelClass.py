from transformers import AutoTokenizer, AutoModelForCausalLM
import torch
import accelerate
from pydantic import BaseModel

import os
import re
import ast
import json

class UTModel:
    def __init__(self, modelPath, device, memoryMap, model_type):
        self.modelPath = modelPath
        self.memoryMap = memoryMap
        self.device = device
        self.model_type = model_type

        if self.model_type == "replit":
            self.tokenizer = AutoTokenizer.from_pretrained(self.modelPath, trust_remote_code=True)
            self.model = AutoModelForCausalLM.from_pretrained(
                self.modelPath,
                torch_dtype=torch.bfloat16,
                trust_remote_code=True
            )
            self.model.to('cuda')
        
        else:
            self.tokenizer = AutoTokenizer.from_pretrained(self.modelPath)
            self.model = AutoModelForCausalLM.from_pretrained(self.modelPath, offload_folder="temp", device_map="auto", max_memory=self.memoryMap)

    def starcoder(self, prompt):
        inputs = self.tokenizer.encode(prompt, return_tensors='pt').to("cuda")
        outputs = self.model.generate(inputs, max_new_tokens=128)
        return self.tokenizer.decode(outputs[0])

    def codegen(self, prompt):
        input_ids = self.tokenizer(prompt, return_tensors='pt').input_ids
        input_ids = input_ids.to(self.device)
        generated_ids = self.model.generate(input_ids, max_new_tokens=128)
        generated_outputs = self.tokenizer.decode(generated_ids[0], skip_special_tokens=True)

        return generated_outputs

    def replit(self, prompt):
        inputs = self.tokenizer.encode(prompt, return_tensors='pt').to("cuda")
        outputs = self.model.generate(inputs, max_new_tokens=512, do_sample=True, use_cache=True, temperature=0.2, top_p=0.9, eos_token_id= self.tokenizer.eos_token_id)
        generated_code = self.tokenizer.decode(outputs[0], skip_special_tokens=True, clean_up_tokenization_space=False)

        return generated_code

    def importFormatter(self, method):
        requirementsArr = []
        
        strProcess = method.fileData.split("\n")

        for statements in strProcess:
            if re.search('from', statements) or re.search('import', statements):
                requirementsArr.append(statements)
            if re.search("def", statements):
                functionName = statements
            
        functionName = functionName.split(" ")
        defIndex = functionName.index("def")
        functionName = functionName[defIndex+1].split("(")[0]

        requirementsStr = '\n'.join(requirementsArr)

        pattern = r'#[^\n]*'
        requirementsStr = re.sub(pattern, '', requirementsStr)\

        return requirementsStr, functionName

    def generate_test_function(self, method, model_type):
        folderPath = "./tests"

        requirements, functionName = self.importFormatter(method)

        promptFormat = f"{requirements}\n{method.code}\n\n#Generate 5 test cases based on the pytest library\ndef test_{functionName}_1():"

        if model_type == 'starcoder':
            return self.starcoder(promptFormat)
        elif model_type == 'codegen':
            return self.codegen(promptFormat)
        

    def file_post_processing(self, output):

        # Get lines with SyntaxErrors first
        def get_lines_with_syntax_errors(code):
            lines_with_syntax_errors = []

            try:
                tree = ast.parse(code)
            except SyntaxError as e:
                error_line = e.lineno
                lines = code.split('\n')
                start_line = error_line
                end_line = error_line + len(e.text.split('\n')) - 1
                lines_with_syntax_errors.extend(lines[start_line - 1:end_line])
                print(e)

            return lines_with_syntax_errors

        def remove_code_after_first_def(code):
            lines = code.split('\n')
            modified_lines = []

            for line in reversed(lines):
                modified_lines.insert(0, line)
                if 'def' in line:
                    break

            return modified_lines

        def remove_lines_from_code(code, lines_to_remove):
            lines = code.split('\n')
            modified_lines = [line for line in lines if line not in lines_to_remove]
            modified_code = '\n'.join(modified_lines)
            return modified_code
        
        # Do a first pass to remove any syntax errors first. If there is we remove the Syntax error and repeat the process one more time and then we stop
        # If there is no syntax error on the first pass, then we return the prompt output
        # This contains the lines that have an SyntaxErrors
        syntax_error_lines = get_lines_with_syntax_errors(output)

        if syntax_error_lines:
            # Remove the syntax errors
            new_output = remove_lines_from_code(output, syntax_error_lines)
            print(output)
            print(syntax_error_lines)
            print(new_output)
            syntax_error_lines2 = get_lines_with_syntax_errors(new_output)

            if syntax_error_lines2:
                # Array containing the code in the last function of the file
                last_function_arr = remove_code_after_first_def(new_output)
                cleaned_code = remove_lines_from_code(new_output, last_function_arr)
                
                return cleaned_code
            else:
                return new_output
    
        else:
            return output


    def directory_generate_test(self, prompt_arr, folder_name):
        # ===== Passing the prompts into the model =====
        for prompt in prompt_arr:
            if self.model_type == 'starcoder':
                prompt[-1] = self.starcoder(prompt[-1])
            elif self.model_type == 'codegen':
                clean_output = self.file_post_processing(self.codegen(prompt[-1]))
                prompt[-1] = clean_output.strip()
                print(folder_name)
                print(prompt[-1])
            elif self.model_type == 'replit':
                clean_output = self.file_post_processing(self.replit(prompt[-1]))
                prompt[-1] = clean_output.strip()
                prompt[-1] = clean_output
                # prompt[-1] = self.replit(prompt[-1])
                
                # input_ids = self.tokenizer(prompt[-1], return_tensors='pt').input_ids
                # input_ids = input_ids.to(self.device)
                # generated_ids = self.model.generate(input_ids, max_length=512)
                # generated_outputs = self.tokenizer.decode(generated_ids[0], skip_special_tokens=True)
                # # print(generated_outputs)
                # prompt[-1] = generated_outputs

        # ===== Writning tests to the files =====
        # Create the files and store the generated unit tests into the associated test files
        for prompt in prompt_arr:
            if prompt[0] is not None:
                # Creating the folder to store all test cases of non class functions
                folder_path = f'./generated_tests/{folder_name}/{prompt[0]}'
                os.makedirs(folder_path, exist_ok=True)

                # Writing the unit tests into the file and storing the file in the correct class folder
                file_path = f'{folder_path}/test_{prompt[1]}.py' 
                with open(file_path, 'w') as f:
                    # f.write(generated_outputs)
                    f.write(prompt[-1])
            
            if prompt[0] is None:
                # Creating the folder to store all test cases of non class functions
                folder_path = f'./generated_tests/{folder_name}/Non-Class Functions'
                os.makedirs(folder_path, exist_ok=True)

                # Writing the unit tests into the file and storing the file in the correct class folder
                file_path = f'{folder_path}/test_{prompt[1]}.py' 
                with open(file_path, 'w') as f:
                    # f.write(generated_outputs)
                    f.write(prompt[-1]) 

        return prompt_arr    

        

    