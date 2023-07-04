


def mergeSort(self, arr):
    if len(arr) < 2:
        return arr

    midpoint = len(arr) // 2

    return merge(left=mergeSort(arr[:midpoint]),
                 right=mergeSort(arr[midpoint:]))

def test_mergeSort_1():
    arr = [1, 2, 3, 4, 5]
    sorted_arr = mergeSort(arr)
    print(sorted_arr)

def test_mergeSort_2():
    arr = [1, 2, 3, 4, 5]
    sorted_arr = mergeSort(arr)
    print(sorted_arr)