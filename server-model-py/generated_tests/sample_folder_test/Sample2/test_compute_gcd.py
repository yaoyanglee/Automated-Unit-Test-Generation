### Instruction

class Sample2():
    def __init__(self):
        pass


    def compute_gcd(self, x, y):
        while(y):
            x, y = y, x % y

        return x

# Generate 5 unit tests based on the PyTest module
# Generate code that properly initializes classes and its functions when calling class functions

### Response


class Testcompute_gcd:
	def test_compute_gcd_1(self):
		assert(Sample2().compute_gcd(2, 4) == 2)

	def test_compute_gcd_2(self):
		assert(Sample2().compute_gcd(4, 2) == 2)

	def test_compute_gcd_3(self):
		assert(Sample2().compute_gcd(4, 4) == 1)

	def test_compute_gcd_4(self):
		assert(Sample2().compute_gcd(4, 5) == 1)