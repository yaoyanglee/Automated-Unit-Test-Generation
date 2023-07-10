# Automated unit test generation with Large Language Models (LLMs)
This repo contains the code to generate unit tests with open source LLMs. Currently it supports CodeGen and replit-CodeInstruct. StarCoder is supported but it requires a larger amount of GPU RAM for usability.

# Installation
0. (Optional) Creating a virtual environment

You are advised to work with the repo in a virtual environment, as some modules might return errors. I used virutalenv for creating and managing virtual environments, but you can use any other libraries.

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

The wheels are now downloaded and you can install the requirements in an offline environment. Transfer the 

Then enter the folder and download the wheels from `requirments.txt` 
```
pip install -r requirements.txt
```


2. Installing models from HuggingFace

All models used are the pretrained models taken from HuggingFace. Simple install them to a directory of choice on the local device for usage offline. 
