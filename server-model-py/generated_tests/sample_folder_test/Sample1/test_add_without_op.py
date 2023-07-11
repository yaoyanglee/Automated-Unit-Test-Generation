### Instruction

class Sample1():
    def __init__(self):
        pass


    def add_without_op(self, a, b):
        while b!= 0:
            carry = a & b
            a = a ^ b
            b = carry << 1
    
        return a

# Generate 5 unit tests based on the PyTest module
# Generate code that properly initializes classes and its functions when calling class functions

### Response


class Testadd_without_op:
	def test_add_without_op_1(self):
		assert Sample1().add_without_op(1, 2) == 3
	def test_add_without_op_2(self):
		assert Sample1().add_without_op(2, 1) == 3
	def test_add_without_op_3(self):
		assert Sample1().add_without_op(3, 2) == 5
	def test_add_without_op_4(self):
		assert Sample1().add_without_op(4, 3) == 7