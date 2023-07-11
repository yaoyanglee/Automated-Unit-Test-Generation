### Instruction

class subfolder2():
    def __init__(self):
        pass


    def sub(self, a, b):
        '''
        Here are some edge cases: 
        1. Subtraction of 2 negative numbers
        2. Subtraction of 1 negative and 1 postve number
        3. Subtraction of 0 with a positive or negative number
        '''
        return a - b

# Generate 5 unit tests based on the PyTest module
# Generate code that properly initializes classes and its functions when calling class functions

### Response


class Testsub:
	def test_sub_1(self):
		assert subfolder2().sub(1, 1) == 0
	def test_sub_2(self):
		assert subfolder2().sub(-1, 1) == -2
	def test_sub_3(self):
		assert subfolder2().sub(1, -1) == 2
	def test_sub_4(self):
		assert subfolder2().sub(-1, -1) == 0
	def test_sub_5(self):
		assert subfolder2().sub(0, 1) == 0