# Automated unit test generation with Large Language Models (LLMs)
This repo contains the code to generate unit tests with open source LLMs. Currently it supports CodeGen and replit-CodeInstruct. StarCoder is supported but it requires a larger amount of GPU RAM for usability.

# Installation
0. (Optional) Creating a virtual environment

You are advised to work with the repo in a virtual environment, as some modules might return errors. I used virutalenv for creating and managing virtual environments, but you can use any other libraries.

```console
pip install virtualenv
```

```
virtualenv your_environment_name 
```

Activate the environment

(Linux)
```
source your_environment_name/bin/activate
```

(Windows)
```
your_environment_name\Scripts\activate
``` 

1. Installing requirements

All requirements for this repo are found in the `requirements.txt` file. Install them with
```
pip install -r requirements.txt
```

2. Installing models from HuggingFace

All models used are the pretrained models taken from HuggingFace. Simple install them to a directory of choice on the local device for usage offline. 
