def bruteForce():
    data = request.get_json()
    word = data.get("word")
    print("TESTING")
    return jsonify({"moves": moves})
