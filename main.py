from flask import Flask, request, jsonify
from flask_cors import CORS
from nlp.intent_classifier import classify_intent
from query.executor import execute_query
from groq import Groq
import os

app = Flask(__name__)
CORS(app)

groq_client = Groq(api_key=os.environ.get("GROQ_API_KEY"))

def translate_uk_to_en(text: str) -> str:
    response = groq_client.chat.completions.create(
        model="llama-3.3-70b-versatile",
        messages=[
            {"role": "system", "content": "You are a translator. Translate the following Ukrainian text to English. Return ONLY the translated text, nothing else."},
            {"role": "user", "content": text}
        ]
    )
    return response.choices[0].message.content.strip()

def translate_result_to_uk(result: dict) -> dict:
    import json
    
    # Convert entire result to JSON string and translate in one call
    result_str = json.dumps(result, ensure_ascii=False)
    
    response = groq_client.chat.completions.create(
        model="llama-3.3-70b-versatile",
        messages=[
            {
                "role": "system", 
                "content": """You are a translator. You will receive a JSON object. 
                Translate ALL string values to Ukrainian. 
                Keep all keys in English exactly as they are.
                Keep the JSON structure exactly the same.
                Do NOT translate: URLs, code, technical identifiers, numbers, commit hashes.
                Return ONLY the translated JSON, no explanation, no markdown."""
            },
            {"role": "user", "content": result_str}
        ]
    )
    
    translated_str = response.choices[0].message.content.strip()
    # Clean markdown if present
    translated_str = translated_str.replace("```json", "").replace("```", "").strip()
    
    try:
        return json.loads(translated_str)
    except:
        # If parsing fails return original
        return result

@app.route("/query", methods=["POST"])
def query():
    data = request.json
    raw_query = data.get("query", "")
    lang = data.get("lang", "EN")

    if not raw_query:
        return jsonify({"error": "No query provided"}), 400

    # Part 2 - translate Ukrainian to English
    if lang == "UK":
        english_query = translate_uk_to_en(raw_query)
        print(f"[TRANSLATION] UK→EN: {raw_query} → {english_query}")
    else:
        english_query = raw_query

    # Part 3 - NLP Layer
    intent_result = classify_intent(english_query)
    print(f"[NLP] Intent: {intent_result['intent']}")

    # Part 4 - Query Execution
    query_result = execute_query(intent_result)

    # Part 6 - translate output back to Ukrainian
    if lang == "UK":
        print("[TRANSLATION] Translating output to Ukrainian...")
        query_result = translate_result_to_uk(query_result)

    return jsonify(query_result)

@app.route("/health", methods=["GET"])
def health():
    return jsonify({"status": "ok"})

if __name__ == "__main__":
    app.run(debug=True, port=5001)