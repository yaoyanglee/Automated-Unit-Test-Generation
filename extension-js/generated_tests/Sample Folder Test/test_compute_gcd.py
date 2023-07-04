

class Sample2():
	


	def compute_gcd(self, x, y):
	        while(y):
	            x, y = y, x % y

	        return x

# Generate 5 unit tests based on the PyTest module

def test_compute_gcd_1():
	assert compute_gcd(1, 1) == 1

def test_compute_gcd_2():
	assert compute_gcd(2, 2) == 2

def test_compute_gcd_3():
	assert compute_gcd(3, 3) == 3

def test_compute_gcd_4():
	assert compute_gcd(4, 4) == 4

def test_compute_gcd_5():
	assert compute_gcd(5, 5) == 5
