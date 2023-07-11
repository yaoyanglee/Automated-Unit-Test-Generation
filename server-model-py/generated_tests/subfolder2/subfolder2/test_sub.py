### Instruction

class subfolder2():
    def __init__(self):
        pass


    def sub(self, a, b):
        return a - b

# Generate 5 unit tests based on the PyTest module
# Generate code that properly initializes classes and its functions when calling class functions

### Response


class Testsub:
	def test_sub_1(self):
		assert subfolder2().sub(1, 1) == 0

	def test_sub_2(self):
		assert subfolder2().sub(2, 1) == 1

	def test_sub_3(self):
		assert subfolder2().sub(3, 1) == 2

	def test_sub_4(self):
		assert subfolder2().sub(4, 1) == 3

	def test_sub_5(self):
		assert subfolder2().sub(5, 1) == 4

### Response