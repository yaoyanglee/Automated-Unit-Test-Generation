from transformers import AutoTokenizer, AutoModelForCausalLM
import torch
import accelerate

device = torch.device('cuda')
# device_ids = [0,1,2,3]
max_memory_mapping = {0: "10GB", 1: "10GB", 2: "10GB", 3: "10GB"}

modelPath = "../Models/Replit-CodeInstruct"
tokenizer = AutoTokenizer.from_pretrained("../Models/codegen-2B-mono")
model = AutoModelForCausalLM.from_pretrained("../Models/codegen-2B-mono", device_map="auto", max_memory=max_memory_mapping)
# tokenizer = AutoTokenizer.from_pretrained(modelPath, trust_remote_code=True)
# model = AutoModelForCausalLM.from_pretrained(
#     modelPath,
#     torch_dtype=torch.bfloat16,
#     trust_remote_code=True
# )
# model.to('cuda')

text = '''
### Instruction

# Code to test
class BubbleSort:
    def __init__(self):
        print("Bubble Sort Algorithmm is Initialized")
    
    def __call__(self, arr):
        n = len(arr)
        for i in range(n):
            already_sorted = True
            for j in range(n - i - 1):
                if arr[j] > arr[j+1]:
                    arr[j], arr[j+1] = arr[j+1], arr[j]

            if already_sorted:
                break

        return arr

# List out possible edge cases to the BubbleSort algorithm above
# Return under the response answers in the format
### Instruction
    class Addition:
        def __init__(self):
            pass
        
        def sum(a, b):
            return a + b

### Response
Possible edge cases
1. Sum of 2 negative numbers
2. Sum of 1 positive and 1 negative number

### Instruction
class Division:
    def __init__(self):
        pass
    
    def div(a, b):
        return a / b

### Response
Possible edge cases
1. Divide by 0 error
2. Division of 2 negative numbers return positive numbers
3. Division of positive and negative numbers return negative numbers
4. 0 divided by any number returns 0

### Response

'''

input_ids = tokenizer(text, return_tensors='pt').input_ids
input_ids = input_ids.to(device)

generated_ids = model.generate(input_ids, max_new_tokens=256)
generated_code = tokenizer.decode(generated_ids[0], skip_special_tokens=True)

# inputs = tokenizer.encode(text, return_tensors='pt').to("cuda")
# outputs = model.generate(inputs, max_new_tokens=512, do_sample=True, use_cache=True, temperature=0.2, top_p=0.9, eos_token_id= tokenizer.eos_token_id)
# generated_code = tokenizer.decode(outputs[0], skip_special_tokens=True, clean_up_tokenization_space=False)

print(generated_code)

print("Generation Complete")