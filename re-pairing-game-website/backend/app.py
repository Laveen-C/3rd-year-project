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
def check_pypy():
    return f"Running on {platform.python_implementation()}"


@app.route("/api/validate", methods=["POST"])
def validate_input():
    data = request.get_json()
    input_value = data.get("input", "")
    result = is_dyck_word(input_value)

    if result == True:
        print("valid string")
        return jsonify({"isValid": True, "message": input_value})
    else:
        print("invalid string")
        return jsonify({"isValid": False, "message": f"INVALID INPUT: {result}"})


def is_dyck_word(s):
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


# Start of manual re-pairing


# End of manual re-pairing


@app.route("/api/simple", methods=["POST"])
def simple_repairing():
    data = request.get_json()
    dyckDict = data.get("display", "")
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


@app.route("/api/nonSimple", methods=["POST"])
def nonSimple():
    data = request.get_json()
    moves = ["test OK"]
    print("TESTING")
    return jsonify({"moves": moves})


@app.route("/api/greedy", methods=["POST"])
def greedy():
    data = request.get_json()
    moves = ["test OK"]
    print("TESTING")
    return jsonify({"moves": moves})


@app.route("/api/bruteForce", methods=["POST"])
def bruteForce():
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
        newWidth = moveWidth(currentWord, currentWidth, move)
        newWord = (
            currentWord[: move[0]]
            + "_"
            + currentWord[move[0] + 1 : move[1]]
            + "_"
            + currentWord[move[1] + 1 :]
        )
        if newWidth > maxWidth:
            maxWidth = newWidth
        currentMove = [move, newWidth, currentWord]
        movesDisplay.append(currentMove)
        currentWidth = newWidth
        currentWord = newWord
    return movesDisplay, maxWidth


@app.route("/api/moveWidth", methods=["POST"])
def moveWidth(word, current, move):
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
