

class Sample1():
	


	def add_without_op(self, a, b):
	        while b!= 0:
	            carry = a & b
	            a = a ^ b
	            b = carry << 1
    
	        return a

# Generate 5 unit tests based on the PyTest module

def test_add_without_op_1():
    assert add_without_op(1, 2) == 3

def test_add_without_op_2():
    assert add_without_op(2, 3) == 5

def test_add_without_op_3():
    assert add_without_op(3, 4) == 7

def test_add_without_op_4():
    assert add_without_op(4, 5) == 9

def test_add_without_op_5():
    assert add_without_op(5, 6) == 11
