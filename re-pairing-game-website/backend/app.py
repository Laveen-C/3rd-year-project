from flask import Flask, jsonify, request
from flask_cors import CORS
import platform


app = Flask(__name__)
cors = CORS(app, origins="*")


# # BACKEND TEST CODE
# @app.route('/api/test', methods=['GET'])
# def test_route():
#     return jsonify(
#         {
#             'test': 'Hello from Flask!'
#         }
#     )


@app.route("/check")  # Verifies flask is running on pypy (for bruteforce efficiency)
def checkPyPy():
    return f"Running on {platform.python_implementation()}"


@app.route("/api/validate", methods=["POST"])
def validateInput():
    data = request.get_json()
    input_value = data.get("input", "")
    result = isdyck(input_value)

    if result == True:
        print("valid string")
        return jsonify({"isValid": True, "message": input_value})
    else:
        print("invalid string")
        return jsonify({"isValid": False, "message": f"INVALID INPUT: {result}"})


def isdyck(s):
    count = 0
    pos = 0
    s = str(s)
    for char in s:
        pos += 1
        if char == "(":
            count += 1
        elif char == ")":
            count -= 1
        else:  # Not a bracket
            return "Input contains non-bracket character"
        # Negative is not allowed at any point, so this has to be checked at each iteration
        if count < 0:
            return f'Unmatched ")" at position {pos}'
    # We're allowed to be positive, so can only check if something's leftover at the end!
    if count > 0:
        return f'Unmatched "("'
    return True


@app.route("/api/manualChoices", methods=["POST"])
# Every time we select a bracket, we want to restrict the choices so users cannot make bad selections
# We return the exact indices to be disabled!
def manualChoices():
    data = request.get_json()
    dyckDict = data.get("display")
    index = data.get("restrictFrom")  # Index of the bracket we clicked on
    # selected = dyckDict[index]["selected"]  # State of given index
    # chosen = data.get("chosen")  # Already selected char
    # choice = data.get("choice")  # Whether we added or removed

    word = ""
    for item in dyckDict:
        word += item["char"]

    zeros = getZeros(word)
    zero = []
    print(index)
    print(zeros)
    for prime in zeros:
        if prime[0] <= index <= prime[1]:
            zero = prime

    # Check within the prime given by zero's indices to see which brackets to disable
    bracket = word[index]  # Index is guaranteed to point at a bracket
    result = []
    for pointer in range(len(word)):
        if not (zero[0] <= pointer <= zero[1]):
            result.append(pointer)
        else:
            char = word[pointer]
            if pointer != index:  # We don't compare the chosen bracket to itself
                if char == bracket or char == "_":
                    result.append(pointer)
                elif char == ")" and pointer < index:
                    result.append(pointer)
                elif char == "(" and pointer > index:
                    result.append(pointer)
    print(result)
    return jsonify({"disable": result})


# Given a Dyck word, we calculate all indices at which a Dyck prime starts and ends
def getZeros(word):
    zeros = []
    count = 0
    for index in range(len(word)):
        # Update counter based on current pos
        if word[index] == "(":
            if count == 0:
                zeros.append([index])
            count += 1
        elif word[index] == ")":
            count -= 1
            if count == 0:
                zeros[-1].append(index)
        else:
            # We're at a gap, so we ignore it
            continue
    return zeros


@app.route("/api/simple", methods=["POST"])
def simpleRepairing():
    data = request.get_json()
    dyckDict = data.get("display")
    dyckWord = ""
    for item in dyckDict:
        dyckWord += item["char"]
    moves = simple(dyckWord)
    # After generating steps, get the widths to display for each move
    movesDisplay, maxWidth = generatemovesDisplay(dyckWord, moves)
    print(movesDisplay)
    print(maxWidth)
    return jsonify({"movesDisplay": movesDisplay})


# Describes one simple re-pairing algorithm, where we always pair up from the leftmost opening bracket
def simple(word):
    temp = [["x", "y"] for i in range(len(word))]
    moves = []
    pointer = -1  # Points at the current index being viewed

    for i in range(len(word)):
        # If we see '(', add new pair with this char's index and set pointer to this pair
        # If we see ')', add char's index to current pair the pointer is at, and set pointer to the closest pair on it's left in the array NOT matched to any ')'
        if word[i] == "(":
            moves.append([i])
            pointer = len(moves) - 1
        elif word[i] == ")":
            moves[pointer].append(i)
            while True:
                if len(moves[pointer]) == 2 and pointer != -1:
                    pointer -= 1
                else:
                    break
    return moves


@app.route("/api/greedy", methods=["POST"])
def greedy():
    # DUMMY FUNCTION, REPLACE WITH IMPORT
    data = request.get_json()
    moves = ["test OK"]
    print("TESTING")
    return jsonify({"moves": moves})


@app.route("/api/bruteForce", methods=["POST"])
def bruteForce():
    # DUMMY FUNCTION, REPLACE WITH IMPORT
    data = request.get_json()
    moves = ["test OK"]
    print("TESTING")
    return jsonify({"moves": moves})


def generatemovesDisplay(word, moves):
    """
    For a generated list of moves, we want to return a 2D array.
    Each element is a triple of the repairing move, the width after the move, and the word before the move

    We return the word before the move is made so that the front-end can simply highlight the indices from the move as red.
    """
    currentWord = word
    currentWidth = getWidth(word)
    movesDisplay = []
    maxWidth = 1
    for move in moves:
        new = newWidth(currentWord, currentWidth, move)
        newWord = (
            currentWord[: move[0]]
            + "_"
            + currentWord[move[0] + 1 : move[1]]
            + "_"
            + currentWord[move[1] + 1 :]
        )
        if new > maxWidth:
            maxWidth = new
        currentMove = [move, new, currentWord]
        movesDisplay.append(currentMove)
        currentWidth = new
        currentWord = newWord
    return movesDisplay, maxWidth


def newWidth(word, current, move):
    new = current
    # This handles the case where the move pairs outermost brackets
    word = "_" + word + "_"
    left = move[0] + 1
    right = move[1] + 1
    brackets = ["(", ")"]
    # Holds the characters outside of the chosen brackets to be paired
    A = word[left - 1]
    C = word[right + 1]

    # Pairing is adjacent
    if left + 1 == right:
        if (A in brackets) and (C in brackets):
            new += 1
        else:
            if A == C == "_":
                new -= 1
            else:
                pass
    else:
        # Characters are in between the chosen to be paired
        B1 = word[left + 1]
        B2 = word[right - 1]
        # Left bracket analysis:
        if (A in brackets) and (B1 in brackets):
            new += 1
        else:
            if A == B1 == "_":
                new -= 1
            else:
                pass
        # Right bracket analysis:
        if (C in brackets) and (B2 in brackets):
            new += 1
        else:
            if C == B2 == "_":
                new -= 1
            else:
                pass

    return new


"""
To be used in case we run a strategy from the middle of a re-pairing
If we change from gap to bracket, a new non-empty segment has begun so +1
If we change from bracket to gap, non-empty segment ended so mark this
"""


@app.route("/api/moveWidth", methods=["POST"])
def moveWidth():
    data = request.get_json()
    dyckDict = data.get("display")
    dyckWord = ""
    for item in dyckDict:
        dyckWord += item["char"]
    move = data.get("pair")
    print(f"current move: {move}")
    currentWidth = getWidth(dyckWord)
    print(f"current width: {currentWidth}")
    new = newWidth(dyckWord, currentWidth, move)
    return jsonify({"new": new})


def getWidth(word):
    width = 0
    nonEmpty = False
    brackets = ["(", ")"]
    for char in word:
        if char in brackets:
            if nonEmpty != True:
                width += 1
            nonEmpty = True
        else:
            nonEmpty = False
    return width


@app.route("/api/currentToNewWidth", methods=["POST"])
def currentToNewWidth():
    data = request.get_json()
    dyckDict = data.get("display")
    word = ""
    for item in dyckDict:
        word += item["char"]
    current = data.get("current")
    move = data.get("pair")

    new = current
    # This handles the case where the move pairs outermost brackets
    word = "_" + word + "_"
    left = move[0] + 1
    right = move[1] + 1
    brackets = ["(", ")"]
    # Holds the characters outside of the chosen brackets to be paired
    A = word[left - 1]
    C = word[right + 1]

    # Pairing is adjacent
    if left + 1 == right:
        if (A in brackets) and (C in brackets):
            new += 1
        else:
            if A == C == "_":
                new -= 1
            else:
                pass
    else:
        # Characters are in between the chosen to be paired
        B1 = word[left + 1]
        B2 = word[right - 1]
        # Left bracket analysis:
        if (A in brackets) and (B1 in brackets):
            new += 1
        else:
            if A == B1 == "_":
                new -= 1
            else:
                pass
        # Right bracket analysis:
        if (C in brackets) and (B2 in brackets):
            new += 1
        else:
            if C == B2 == "_":
                new -= 1
            else:
                pass

    return jsonify({"new": new})


# End of functions


if __name__ == "__main__":
    app.run(debug=True, port=8080)


# TREE CODE (if needed)
"""
@app.route('/api/tree', methods=['POST'])
def dyck_to_tree():
    data = request.get_json()
    dyckWord = data.get('input', '')
    trees = treeDataFromWord(dyckWord)
    return jsonify({"trees" : trees})

def treeDataFromWord(word):
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
"""
