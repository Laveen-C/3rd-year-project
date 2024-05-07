from flask import Flask, jsonify, request
from flask_cors import CORS
import platform

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

@app.route('/check') #Verifies flask is running on pypy (for bruteforce efficiency)
def check_pypy():
    return f"Running on {platform.python_implementation()}"

def is_dyck_word(s):
    count = 0
    pos = 0
    s = str(s)
    for char in s:
        pos += 1
        if char == '(':
            count += 1
        elif char == ')':
            count -= 1
        else: #Not a bracket
            return 'Input contains non-bracket character'
        if count < 0:
            return f'Unmatched ")" at position {pos}'
    if count > 0:
        return f'Unmatched "("'
    return True

@app.route('/api/validate', methods=['POST'])
def validate_input():
    data = request.get_json()
    input_value = data.get('input', '')
    result = is_dyck_word(input_value)

    if result == True:
        return jsonify({'isValid': True, 'message': input_value})
    else:
        return jsonify({'isValid': False, 'message': f'INVALID INPUT: {result}'})

@app.route('/api/simple', methods=['POST'])
def simple_repairing():
    data = request.get_json()
    dyckDict = data.get('display', '')
    dyckWord = ''
    for item in dyckDict:
        dyckWord += item['char']
    steps = simple(dyckWord)
    print(steps)
    return jsonify({"steps" : steps})

def simple(word): #Describes one simple re-pairing algorithm, where we always pair up from the leftmost opening bracket
    temp = [["x","y"] for i in range(len(word))]
    steps = []
    index = -1 #Index of the pair of brackets

    for i in range(len(word)):
        # if word[i] == "(":
        #     temp[pos][0] = i
        #     pos += 1
        # elif word[i] == ")":
        #     temp[pos - 1][1] = i
        #     steps.append(temp.pop(pos - 1))
        #     pos -= 1
        if word[i] == "(":
            index += 1
            steps.append([i])
        elif word[i] == ")":
            steps[index].append[i]

    
    return steps

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
