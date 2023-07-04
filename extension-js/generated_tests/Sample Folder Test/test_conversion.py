

class Sample1():
	

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
	                temp = data[i] - 10
	                data.remove(data[i])
	                temp += 65
        
	        return data

# Generate 5 unit tests based on the PyTest module

def test_conversion_1():
	assert conversion(1, 2) == [1]

def test_conversion_2():
	assert conversion(10, 2) == [0, 1, 2, 4, 8]

def test_conversion_3():
	assert conversion(10, 3) == [0, 1, 2, 3, 4, 5, 6, 7, 8, 9]

def test_conversion_4():
	assert conversion(10, 4) == [0, 1, 2, 3, 4, 5, 6, 7, 8, 9]

