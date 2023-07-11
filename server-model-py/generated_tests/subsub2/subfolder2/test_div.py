### Instruction

class subfolder2():
    def __init__(self):
        pass


    def div(self, a, b):
        '''
        Here are some edge cases: 
        1. Divide by zero error: 1/0 will give an error
        2. 0 divided by 1 should always give 0
        3. Divsion of positive by negative numbers should return negative numbers
        4. Divsion of negative by negative numbers should return positive numbers
        '''
        return a / b

# Generate 5 unit tests based on the PyTest module
# Generate code that properly initializes classes and its functions when calling class functions

### Response


class Testdiv:
	def test_div_1(self):
		assert subfolder2().div(1, 1) == 1
	def test_div_2(self):
		assert subfolder2().div(1, 0) == 0
	def test_div_3(self):
		assert subfolder2().div(0, 1) == 0
	def test_div_4(self):
		assert subfolder2().div(0, 0) == 0
	def test_div_5(self):
		assert subfolder2().div(1, -1) == -1