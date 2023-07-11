### Instruction

class Sample2():
    def __init__(self):
        pass


    def compute_lcm(self, x, y):
        lcm = (x*y)//self.compute_gcd(x, y)
        return lcm

# Generate 5 unit tests based on the PyTest module
# Generate code that properly initializes classes and its functions when calling class functions

### Response


class Testcompute_lcm:
	def test_compute_lcm_1(self):
		assert(Sample2().compute_lcm(2,4) == 2)

	def test_compute_lcm_2(self):
		assert(Sample2().compute_lcm(4,6) == 12)

	def test_compute_lcm_3(self):
		assert(Sample2().compute_lcm(10,20) == 20)

	def test_compute_lcm_4(self):
		assert(Sample2().compute_lcm(20,10) == 20)