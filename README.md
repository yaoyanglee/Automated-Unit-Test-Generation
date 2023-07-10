# Automated unit test generation with Large Language Models (LLMs)
This repo contains the code to generate unit tests with open source LLMs. Currently it supports CodeGen and replit-CodeInstruct. StarCoder is supported but it requires a larger amount of GPU RAM for usability.

# Installation

## Installing NodeJS


## Installing Python Packages
0. (Optional) Creating a virtual environment

    You are advised to work with the repo in a virtual environment, as some modules might return errors. I used virtualenv for creating and managing virtual environments, but you can use any other libraries.

    ```
    pip install virtualenv
    ```
    ```
    virtualenv your_environment_name 
    ```

    Activate the environment:

    (Linux)
    ```
    source your_environment_name/bin/activate
    ```

    (Windows)
    ```
    your_environment_name\Scripts\activate
    ``` 

1. Installing requirements

    **Working in an online environment**

    All requirements for this repo are found in the `requirements.txt` file. Install them with
    ```
    pip install -r requirements.txt
    ```

    **Working in an offline environment**

    For working with the requirements offline, you can install the wheels into a directory of choice. Before installing them in the offline environment. Move the `requirements.txt` folder into the folder for the wheels before downloading the wheels. 

    ```
    mkdir wheels_folder_name
    ```

    Enter the wheels folder and install the wheels from `requirements.txt`

    ```
    cd wheels_folder_name
    pip download -r requirements.txt
    ```

    The wheels are now downloaded and you can install the requirements in an offline environment. Transfer the wheels folder to your offline machine.   

    Then enter the folder and download the wheels from `requirments.txt` 
    ```
    pip install -r requirements.txt
    ```

    If there are any missing modules, repeat the steps above but pip install the specific modules instead.

2. Installing models from HuggingFace

    All models used are the pretrained models taken from HuggingFace. Install them to a directory of choice on the local device for usage offline. 

    In `config.ini` specify the path to the folder that the respective models are stored in. 

    ([CodeGen](https://huggingface.co/docs/transformers/model_doc/codegen))
    ```
    from transformers import AutoTokenizer, AutoModelForCausalLM

    model = AutoModelForCausalLM.from_pretrained("Salesforce/codegen-2B-mono").save_pretrained(path_to_model)
    ```

    ([StarCoder](https://huggingface.co/bigcode/starcoder))
    ```
    from transformers import AutoTokenizer, AutoModelForCausalLM

    model = AutoModelForCausalLM.from_pretrained("bigcode/starcoder").save_pretrained(path_to_model)
    ```

    ([Replit-CodeInstruct](https://huggingface.co/teknium/Replit-v2-CodeInstruct-3B))

    Follow the link above to HuggingFace repo. From there, navigate to the *Files and Versions* section, and download all the files there excluding `.gitatttrbutes` and `README.md`. 

    You might have to copy the folder and paste it into the same directory as the server file, if you get a HuggingFace error. Even after specifying the path to the Replit-CodeInstrct folder. 

# Running the application

## Starting the server
Activate the virtual environment before starting the server. Navigate to `server-model-py` and run
```
python server.py
```
The server will initialize the model and its tokenizer, before listening for requests. The server is now ready to receive calls to it from the extension.

## Installing the VS Code extension
Ensure that you have node installed on your machine by running
```
node -v
```
A version number `v18.16.0` should be returned. If not check your npm installation.

Go to the folder containing your extension and run 
```
vsce package
```
This will generate a `.VSIX` file. You can now right click on the `.VSIX` file to install the extension anywhere.
