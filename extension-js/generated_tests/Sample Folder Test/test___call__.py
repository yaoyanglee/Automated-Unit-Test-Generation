

class BubbleSort():
	
        # BubbleSort Algorithm Implementation 

        # arr: Unordered list
        # output: Return list in ascending order
        # time complexity: O(n2)

        # Example:
        # >>> sort = BubbleSort()
        # >>> sort([4,2,6,5,9,8])
        # [2,4,5,6,8,9]
        
        # """

        print("Bubble Sort Algorithmm is Initialized")


	def __call__(self, arr):
	        n = len(arr)
	        for i in range(n):
	            already_sorted = True
	            for j in range(n - i - 1):
	                if arr[j] > arr[j+1]:
	                    arr[j], arr[j+1] = arr[j+1], arr[j]

	            if already_sorted:
	                break

	        return arr

# Generate 5 unit tests based on the PyTest module

def test___call___1():
    assert sort([4,2,6,5,9,8]) == [2,4,5,6,8,9]

def test___call___2():
    assert sort([4,2,6,5,9,8]) == [2,4,5,6,8,9]
