from flask import Flask, jsonify
from flask_cors import CORS

app = Flask(__name__)
cors = CORS(app, origins = '*')


# # BACKEND TEST CODE
# @app.route('/api/test', methods=['GET'])
# def test_route():
#     return jsonify(
#         {
#             'test': 'Hello from Flask!'
#         }
#     )

def is_dyck_word(s):
    count = 0
    for char in s:
        if char == '(':
            count += 1
        elif char == ')':
            count -= 1
            if count < 0:
                return False
    return count == 0

@app.route('/api/validate', methods=['POST'])
def validate_input():
    data = request.get_json()
    input_value = data.get('input', '')

    if is_dyck_word(input_value):
        return jsonify({'isValid': True, 'message': input_value})
    else:
        return jsonify({'isValid': False, 'message': 'INVALID INPUT'})

if __name__ == '__main__':
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

@app.route('/api/simple', methods=['POST'])
def simple_repairing():
    data = request.get_json()
    dyckWord = data.get('input', '')
    steps = simple(dyckWord)
    return jsonify({"steps" : steps})

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
