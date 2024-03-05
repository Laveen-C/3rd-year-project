def dyck_to_tree(word): # Converts any Dyck word into a representation of a binary tree
    stack = []
    nodes = []
    x = 0
    trees = []

    for char in word:
        if char == "(":
            x += 1
            node = {"nodeNo" : str(x), "children": []}
            if stack:
                stack[-1]["children"].append(node)
            else:
                trees.append(node)
            stack.append(node)
            nodes.append(node)
        elif char == ")":
            stack.pop()
    return trees

# print(dyck_to_tree("(()())"))

def simple_repairing(word): #Describes one simple re-pairing algorithm, where we always pair up from the leftmost opening bracket
    temp = [["x","y"] for i in range(len(word))]
    steps = []
    pos = 0

    for i in range(len(word)):
        if word[i] == "(":
            temp[pos][0] = i
            pos += 1
        elif word[i] == ")":
            temp[pos - 1][1] = i
            steps.append(temp.pop(pos - 1))
            pos -= 1
    
    width = 0
    repWord = word
    
    print(repWord)

    for step in steps:
        stepWidth = 0
        prevSymbol = 0 # 0 for gap, 1 for character
        # Do the step
        repWord = repWord[:step[0]] + " " + repWord[step[0] + 1: step[1]] + " " + repWord[step[1] + 1:]

        # Checking first character to see if it's gap or bracket
        if repWord[0] == " ":
            prevSymbol = 0
        else:
            prevSymbol = 1
            stepWidth = 1
        # Calculate the number of non-empty segments after doing this step
        for char in repWord:
            if char != " " and prevSymbol == 0:
                stepWidth += 1
                prevSymbol = 1
            elif char == " " and prevSymbol == 1:
                prevSymbol = 0
        if stepWidth >= width:
            width = stepWidth
        print(repWord)

    print("Result: " + str(steps))
    print("Width via simple re-pairing: " + str(width))

simple_repairing("((())())")


















# def repair(word, steps): #Re-pair a Dyck word given a sequence of steps
#     return


def brute_force(word):
    # Basic idea: Number all brackets 1,..., n on opening and closing. Pair n-n, ... 2-2 and 1-1. 
    # Then pair n-
    width = len(word)
    return



def find_pairs(dyck_word):
    pairs = []
    stack = []

    for i, c in enumerate(dyck_word):
        if c == '(':
            stack.append(i)
        else:
            if stack:
                pairs.append((stack.pop(), i))

    return pairs
 # print(find_pairs("(())()"))

def brute_force_repair(dyck_word, width=0, current_width=0):
    if not dyck_word:
        return current_width

    pairs = find_pairs(dyck_word)

    if not pairs:
        return width

    for pair in pairs:
        left, right = pair
        new_dyck_word = dyck_word[:left] + '_' + dyck_word[left + 1:right] + '_' + dyck_word[right + 1:]
        new_width = len([seg for seg in new_dyck_word.split('_') if seg])
        current_width = max(current_width, new_width)
        width = brute_force_repair(new_dyck_word, width, current_width)

    return width


# dyck_word = "(())()"
# width = brute_force_repair(dyck_word)
# print(f"The maximum width for Dyck word {dyck_word} is: {width}")
