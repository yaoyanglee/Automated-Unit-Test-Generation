# Automated unit test generation with Large Language Models (LLMs)
This repo contains the code to generate unit tests with open source LLMs. Currently it supports CodeGen and replit-CodeInstruct. StarCoder is supported but it requires a larger amount of GPU RAM for usability.

# Installation
1. Installing requirements

All requirements for this repo are found in the `requirements.txt` file.
```
pip install -r requirements.txt
```
Will install all requirements. 

2. Installing models from HuggingFace

All models used are the pretrained models taken from HuggingFace. Simple install them to a directory of choice on the local device for usage offline. 
