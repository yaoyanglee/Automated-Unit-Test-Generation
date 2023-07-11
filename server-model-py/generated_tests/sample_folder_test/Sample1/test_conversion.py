### Instruction

class Sample1():
    def __init__(self):
        pass

    # This is conversion and how conversion is performed
    def conversion(self, value, base):
        data = []

        while value >= base:
            data.append(int(value % base))
            value = int(value / base)
    
        data.append(value)
        data.reverse()
        for i in range(0, len(data)):
            if data[i] > 9:
            temp += 65
    
        return data

# Generate 5 unit tests based on the PyTest module
# Generate code that properly initializes classes and its functions when calling class functions

### Response


class Testconversion:
	def test_conversion_1(self):
		assert conversion(1, 2) == [1, 0]
	def test_conversion_2(self):
		assert conversion(10, 2) == [0, 1, 0, 0, 0, 0, 0, 0, 0, 0]
	def test_conversion_3(self):
		assert conversion(10, 3) == [0, 1, 0, 0, 0, 0, 0, 0, 0, 0]