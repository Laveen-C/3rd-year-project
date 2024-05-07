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
        return jsonify({"isValid": True, "message": input_value})
    else:
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
        if count < 0:
            return f'Unmatched ")" at position {pos}'
    if count > 0:
        return f'Unmatched "("'
    return True


@app.route("/api/simple", methods=["POST"])
def simple_repairing():
    data = request.get_json()
    dyckDict = data.get("display", "")
    dyckWord = ""
    for item in dyckDict:
        dyckWord += item["char"]
    moves = simple(dyckWord)
    return jsonify({"moves": moves})


# Describes one simple re-pairing algorithm, where we always pair up from the leftmost opening bracket
def simple(word):
    temp = [["x", "y"] for i in range(len(word))]
    steps = []
    pointer = -1  # Points at the current index being viewed

    for i in range(len(word)):
        # If we see '(', add new pair with this char's index and set pointer to this pair
        # If we see ')', add char's index to current pair the pointer is at, and set pointer to the closest pair on it's left in the array NOT matched to any ')'
        if word[i] == "(":
            steps.append([i])
            pointer = len(steps) - 1
        elif word[i] == ")":
            steps[pointer].append(i)
            while True:
                if len(steps[pointer]) == 2:
                    pointer -= 1
                break
    return steps


@app.route("/api/bruteForce", methods=["POST"])
def bruteForce():
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


@app.route("/api/nonSimple", methods=["POST"])
def nonSimple():
    data = request.get_json()
    moves = ["test OK"]
    print("TESTING")
    return jsonify({"moves": moves})


if __name__ == "__main__":
    app.run(debug=True, port=8080)

# OLD CODE BELOW

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

def simple(word): #Describes one simple re-pairing algorithm, where we always pair up from the leftmost opening bracket
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
    
    return steps

# @app.route('/api/simple', methods=['POST'])
# def simple_repairing(word):
#     return

"""

# END OF OLD CODE
