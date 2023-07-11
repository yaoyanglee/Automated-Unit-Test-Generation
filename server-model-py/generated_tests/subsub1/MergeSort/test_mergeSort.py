### Instruction

class MergeSort():
    def __init__(self):
        pass


    def mergeSort(self, arr):
        if len(arr) < 2:
            return arr

        midpoint = len(arr) // 2

        return merge(left=mergeSort(arr[:midpoint]),
                right=mergeSort(arr[midpoint:]))

# Generate 5 unit tests based on the PyTest module
# Generate code that properly initializes classes and its functions when calling class functions

### Response


class TestmergeSort:
	def test_mergeSort_1(self):
		arr = [1,2,3,4,5]
		sorted_arr = [1,2,3,4,5]
		assert(mergeSort(arr) == sorted_arr)

	def test_mergeSort_2(self):
		arr = [5,4,3,2,1]
		sorted_arr = [1,2,3,4,5]
		assert(mergeSort(arr) == sorted_arr)