import nest_asyncio
import uvicorn
from fastapi import FastAPI
from pydantic import BaseModel
import torch

from ModelClass import UTModel
from FileFormatter import FileParser

import time
import os
import re
import json
import configparser
import ast

config = configparser.ConfigParser()
config.read('config.ini')
model_path = config.get('ModelPath', 'modelPath')
memoryMap = eval(config.get('ModelSetting', 'memoryMap'))

# print(eval(memoryMap))

class Message(BaseModel):
    code: str
    fileData:str

class Code(BaseModel):
    file_data: str
    file_name: str
    dir_path: str
    import_path: str

# model_path = "../Models/codegen-2B-mono" 
device = torch.device('cuda')
# memoryMap = {0: "10GB", 1: "10GB", 2: "10GB", 3: "10GB"}
# print(type(memoryMap))

# Toggling of models at runtime
if 'codegen' in model_path.lower():
    model_type = 'codegen'
elif 'starcoder' in model_path.lower():
    model_type = 'starcoder'
elif 'replit' in model_path.lower():
    model_type = 'replit'

model_start = time.perf_counter()
model = UTModel(model_path, device , memoryMap, model_type)
model_fin = time.perf_counter()
print(f"Model started in: {model_fin-model_start}")

app = FastAPI()

@app.post('/')
async def root(message: Message):
    time_start = time.perf_counter()
    output = model.generate_test_function(message)
    time_stop = time.perf_counter()
    print("Output generated in: ", time_stop-time_start)
    return output

# This post request handling the generation of test cases for the entire directory that the active text editor is in at the current moment
# The unit tests are then written to a folder of the respective folder of the current active text editor on the client side
@app.post('/directory_test')
async def file_parser(parse_content: Code):
    # This variable represents the string storing the entire source code of the file
    content =  parse_content.file_data
    # This variable represents the string containing the folder which the current files are in
    folder_name = parse_content.dir_path.split("/")[-1]
    # This variable represents the string containing the filename of the current file
    cur_file_name = parse_content.file_name.split('.')[0]
    # This is the relative import path with respect to the Tests folder
    relative_import_path = parse_content.import_path
    # Converting the relative import path from a path-like string to the Python absolute import format
    import_list = relative_import_path.split('/')
    import_list[-1] = import_list[-1].split('.')[0]
    relative_import_path = '.'.join(import_list[1:])

    # Parsing the code string into JSON metadata
    file_parser = FileParser(content, folder_name, cur_file_name)
    json_obj = file_parser.json_file_writer()

    # Formatting the prompts
    prompts = file_parser.json_to_prompt(json.loads(json_obj), relative_import_path) 

    # Passing the prompts into the model for generation of test cases 
    start_time = time.perf_counter()
    prompt_arr = model.directory_generate_test(prompts, folder_name)
    stop_time = time.perf_counter()

    print("Output generated in: ", stop_time - start_time)
        
    return json_obj, folder_name, cur_file_name, prompt_arr, relative_import_path

@app.post("/test")
async def test(message: Message):
    print(message.code)
    print(message.fileData)
    return "Hello World", "john", [1,2,3,4]

nest_asyncio.apply()
uvicorn.run(app, host="0.0.0.0", port=8000) 

