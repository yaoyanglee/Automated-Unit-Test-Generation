import argparse
import requests
from pydantic import BaseModel, Json, Field
from tqdm import tqdm
import time

import json
import os

from ModelClass import UTModel
from FileFormatter import FileParser

class Code(BaseModel):
    file_data: str
    file_name: str
    dir_path: str
    import_path: str

parser = argparse.ArgumentParser()
parser.add_argument('--dir_under_test', type=str, required=True)
parser.add_argument('--tests_dir', type=str, required=True)
args = parser.parse_args()

folder_path = "./sample_folder"
def read_files(url, cli_args):
    # Create tests folder if it does not exist
    if not os.path.exists(cli_args.tests_dir):
        os.makedirs(cli_args.tests_dir)

    file_arr = []

    for root, directories, files in os.walk(cli_args.dir_under_test):
        file_arr.extend(files)
        
    for root, directories, files in os.walk(cli_args.dir_under_test):
        pbar = tqdm(files, desc="Generating unit tests")
        for file_name in pbar:
            pbar.set_description(f"Generating tests for {file_name}", refresh=True)
            file_path = os.path.join(root, file_name)
            with open(file_path, 'r') as file:
                test_file_path = f"{cli_args.tests_dir}/test_{file_name.split('.')[0]}.py"

                content = file.read()
                relative_path = os.path.relpath(file_path, cli_args.tests_dir)
                request_body = Code(file_data=content, file_name=file_name, dir_path=cli_args.dir_under_test, import_path=relative_path)
                response = requests.post(f"{url}/directory_test", json=dict(request_body)).content
                response = json.loads(response.decode())
                prompt_arr = response[3]

                for element in prompt_arr:
                    cleaned_output = element[2].split("### Response") 
                    cleaned_output = cleaned_output[1:][0].strip().split("###")[0] + "\n\n"

                    with open(test_file_path, 'a+') as f:
                        f.write(cleaned_output)

                import_statement = f"from {response[4]} import *" 
                with open(test_file_path, 'r') as f:
                    current_content = f.read()

                with open(test_file_path, 'w') as f:
                    f.write(import_statement + "\n\n")
                    f.write(current_content)

    print("Test generation complete")                 
                

read_files("http://127.0.0.1:8000", args)


# /home/lyaoyang/Desktop/Extension-testing/sample_folder_test
# /home/lyaoyang/Desktop/Extension-testing/sample_folder_test/subfolder2
# /home/lyaoyang/Desktop/Extension-testing/sample_folder_test/subfolder2/subsub1
# /home/lyaoyang/Desktop/Extension-testing/Tests




