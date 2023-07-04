


def merge(self, left, right):
    if len(left) == 0:
        return right

    if len(right) == 0:
        return left

    result = []
    index_left = index_right = 0

    while len(result) < len(left) + len(right):
        if left[index_left] <= right[index_right]:
            result.append(left[index_left])
            index_left += 1
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

def test_merge_1():
    left = [1, 3, 5, 7, 9]
    right = [2, 4, 6, 8]
    result = merge(left, right)
    assert result == [1, 2, 3, 4, 5, 6, 7, 8, 9]

def test_merge_2():
    left = []
    right = [2, 4, 6, 8]
    result = merge(left, right)
    assert result == [2, 4, 6, 8]

def test_merge_3():
    left = []
    right = []
    result = merge(left, right)
    assert result == []