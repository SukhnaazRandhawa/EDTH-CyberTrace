# nlp/intent_classifier.py

import os
import json
from groq import Groq

client = Groq(api_key=os.environ.get("GROQ_API_KEY"))

SYSTEM_PROMPT = """
You are a cyber threat analyst assistant. Your job is to understand a user's 
question about cyber attacks and extract structured information from it.

You must respond ONLY with a JSON object in this exact format:
{
    "intent": "search_attacks" | "get_playbook" | "find_by_technique" | "find_by_tool" | "find_by_category",
    "filters": {
        "attack_name": "string or null",
        "attack_type": "string or null",
        "technique_code": "string or null",
        "tool_name": "string or null",
        "category": "string or null",
        "keyword": "string or null"
    },
    "limit": 10
}

No explanation, no markdown, no backticks, just the raw JSON object.
"""

def classify_intent(english_query: str) -> dict:
    response = client.chat.completions.create(
        model="llama-3.3-70b-versatile",
        messages=[
            {"role": "system", "content": SYSTEM_PROMPT},
            {"role": "user", "content": english_query}
        ]
    )
    response_text = response.choices[0].message.content.strip()
    return json.loads(response_text)


if __name__ == "__main__":
    test_queries = [
        "Show me all phishing attacks",
        "Give me the full playbook for SQL injection",
        "What attacks use technique T1078?",
        "Which attacks use Metasploit?",
    ]
    
    for query in test_queries:
        print(f"\nQuery: {query}")
        result = classify_intent(query)
        print(f"Intent: {result}")