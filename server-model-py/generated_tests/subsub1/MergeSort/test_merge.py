### Instruction

class MergeSort():
    def __init__(self):
        pass


    def merge(self, left, right):
        if len(left) == 0:
            return right

        if len(right) == 0:
            return left

        result = []
        index_left = index_right = 0

        while len(result) < len(left) + len(right):
            if left[index_left] <= right[index_right]:
            else:
            result.append(right[index_right])
            index_right += 1

            if index_right == len(right):
            result += left[index_left:]
            break

            if index_left == len(left):
            result += right[index_right:]
            break
        return result

# Generate 5 unit tests based on the PyTest module
# Generate code that properly initializes classes and its functions when calling class functions

### Response


class Testmerge:
	def test_merge_1(self):
		assert MergeSort().merge([1,2,3,4,5], [6,7,8,9,10]) == [1,2,3,4,5,6,7,8,9,10]

	def test_merge_2(self):
		assert MergeSort().merge([1,2,3,4,5], [6,7,8,9,10]) == [1,2,3,4,5,6,7,8,9,10]