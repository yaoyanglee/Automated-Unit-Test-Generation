

class Sample2():
	


	def compute_lcm(self, x, y):
	        lcm = (x*y)//self.compute_gcd(x, y)
	        return lcm

# Generate 5 unit tests based on the PyTest module

def test_compute_lcm_1():
	assert compute_lcm(1, 1) == 1

def test_compute_lcm_2():
	assert compute_lcm(2, 4) == 8

def test_compute_lcm_3():
	assert compute_lcm(10, 5) == 10

def test_compute_lcm_4():
	assert compute_lcm(20, 10) == 200

def test_compute_lcm_5():
	assert compute_lcm(20, 20) == 400
