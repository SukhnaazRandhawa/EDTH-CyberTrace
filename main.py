# main.py

from flask import Flask, request, jsonify
from flask_cors import CORS
from nlp.intent_classifier import classify_intent
from query.executor import execute_query

app = Flask(__name__)
CORS(app)

@app.route("/query", methods=["POST"])
def query():
    data = request.json
    english_query = data.get("query", "")
    
    if not english_query:
        return jsonify({"error": "No query provided"}), 400
    
    # Part 3 - NLP Layer
    intent_result = classify_intent(english_query)
    
    # Part 4 - Query Execution
    query_result = execute_query(intent_result)
    
    return jsonify(query_result)

@app.route("/health", methods=["GET"])
def health():
    return jsonify({"status": "ok"})

if __name__ == "__main__":
    app.run(debug=True, port=5001)