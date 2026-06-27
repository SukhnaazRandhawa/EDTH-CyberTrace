# query/executor.py

import sys
import os
sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from turingdb import TuringDB

client = TuringDB(host="http://localhost:6666")
client.set_graph("attack_scenarios")

def execute_query(intent_result: dict) -> dict:
    intent = intent_result["intent"]
    filters = intent_result["filters"]
    limit = intent_result.get("limit", 10)

    if intent == "search_attacks":
        return search_attacks(filters, limit)
    elif intent == "get_playbook":
        return get_playbook(filters)
    elif intent == "find_by_technique":
        return find_by_technique(filters, limit)
    elif intent == "find_by_tool":
        return find_by_tool(filters, limit)
    elif intent == "find_by_category":
        return find_by_category(filters, limit)
    elif intent == "replay_state":
        return replay_state(filters)
    elif intent == "diff_states":
        return diff_states(filters)
    elif intent == "simulate_isolation":
        return simulate_isolation(filters)
    else:
        return {"error": f"Unknown intent: {intent}"}


def search_attacks(filters: dict, limit: int) -> dict:
    # Return all attacks, optionally filtered by exact attack_type
    attack_type = filters.get("attack_type")

    if attack_type:
        query = f"""
            MATCH (a:Attack)
            RETURN a.name, a.attack_type, a.impact
            LIMIT {limit}
        """
    else:
        query = f"MATCH (a:Attack) RETURN a.name, a.attack_type, a.impact LIMIT {limit}"

    result = client.query(query)
    return {"type": "search_attacks", "data": result.to_dict(orient="records")}


def get_playbook(filters: dict) -> dict:
    attack_name = filters.get("attack_name")
    query = f"""
        MATCH (a:Attack)-[:IN_CATEGORY]->(cat:Category)
        OPTIONAL MATCH (a)-[:USES_TOOL]->(tool:Tool)
        OPTIONAL MATCH (a)-[:USES_TECHNIQUE]->(t:MitreTechnique)
        WHERE a.name = '{attack_name}'
        RETURN a.name, a.scenario_description, a.attack_steps,
               a.detection_method, a.solution, cat.name,
               collect(tool.name) AS tools,
               collect(t.code) AS techniques
        LIMIT 1
    """
    result = client.query(query)
    return {"type": "get_playbook", "data": result.to_dict(orient="records")}


def find_by_technique(filters: dict, limit: int) -> dict:
    technique_code = filters.get("technique_code")
    query = f"""
        MATCH (a:Attack)-[:USES_TECHNIQUE]->(t:MitreTechnique {{code: '{technique_code}'}})
        RETURN a.name, a.attack_type, a.impact, t.name
        LIMIT {limit}
    """
    result = client.query(query)
    return {"type": "find_by_technique", "data": result.to_dict(orient="records")}


def find_by_tool(filters: dict, limit: int) -> dict:
    tool_name = filters.get("tool_name")
    query = f"""
        MATCH (a:Attack)-[:USES_TOOL]->(t:Tool {{name: '{tool_name}'}})
        RETURN a.name, a.attack_type, a.impact, t.name
        LIMIT {limit}
    """
    result = client.query(query)
    return {"type": "find_by_tool", "data": result.to_dict(orient="records")}


def find_by_category(filters: dict, limit: int) -> dict:
    category = filters.get("category")
    query = f"""
        MATCH (a:Attack)-[:IN_CATEGORY]->(cat:Category {{name: '{category}'}})
        RETURN a.name, a.attack_type, a.impact, cat.name
        LIMIT {limit}
    """
    result = client.query(query)
    return {"type": "find_by_category", "data": result.to_dict(orient="records")}


def replay_state(filters: dict) -> dict:
    history = client.query("CALL db.history()")
    commits = history.to_dict(orient="records")

    # Get commit hashes (strip HEAD marker)
    commit_new = commits[0]["commit"].replace("(HEAD)", "").strip()
    commit_old = commits[1]["commit"].replace("(HEAD)", "").strip()

    # Get current state
    current_result = client.query("MATCH (a:Attack) RETURN a.name, a.attack_type, a.impact LIMIT 10")
    current_data = current_result.to_dict(orient="records")

    # Time travel to past commit without reloading the graph
    client.set_graph("attack_scenarios")
    client.checkout(commit=commit_old)
    past_result = client.query("MATCH (a:Attack) RETURN a.name, a.attack_type, a.impact LIMIT 10")
    past_data = past_result.to_dict(orient="records")

    # Return to current HEAD
    client.checkout()
    client.set_graph("attack_scenarios")

    return {
        "type": "replay_state",
        "past_commit": commit_old,
        "current_commit": commit_new,
        "past_data": past_data,
        "current_data": current_data,
        "message": f"Replayed state from commit {commit_old}"
    }


def diff_states(filters: dict) -> dict:
    history = client.query("CALL db.history()")
    commits = history.to_dict(orient="records")

    commit_new = commits[0]["commit"].replace("(HEAD)", "").strip()
    commit_old = commits[1]["commit"].replace("(HEAD)", "").strip()

    # Get ALL attack names from current state
    new_result = client.query("MATCH (a:Attack) RETURN a.name, a.attack_type")
    new_names = set(new_result["a.name"].tolist())

    # Time travel to past commit
    client.set_graph("attack_scenarios")
    client.checkout(commit=commit_old)
    old_result = client.query("MATCH (a:Attack) RETURN a.name, a.attack_type")
    old_names = set(old_result["a.name"].tolist())

    # Return to HEAD
    client.checkout()
    client.set_graph("attack_scenarios")

    added = list(new_names - old_names)
    removed = list(old_names - new_names)

    return {
        "type": "diff_states",
        "commit_old": commit_old,
        "commit_new": commit_new,
        "added": added,
        "removed": removed,
        "message": f"{len(added)} new attacks detected since last snapshot"
    }


def simulate_isolation(filters: dict) -> dict:
    node = filters.get("node_to_isolate")
    result = client.query(f"""
        MATCH (a:Attack)-[:USES_TOOL]->(t:Tool {{name: '{node}'}})
        RETURN a.name, a.attack_type, a.impact
        LIMIT 5
    """)
    return {
        "type": "simulate_isolation",
        "node": node,
        "message": f"Simulating isolation of {node} — affected attacks:",
        "affected": result.to_dict(orient="records")
    }


if __name__ == "__main__":
    test_intents = [
        {"intent": "search_attacks", "filters": {"attack_type": "phishing"}, "limit": 5},
        {"intent": "find_by_technique", "filters": {"technique_code": "T1078"}, "limit": 5},
        {"intent": "find_by_tool", "filters": {"tool_name": "Metasploit"}, "limit": 5},
    ]

    for intent in test_intents:
        print(f"\nTesting intent: {intent['intent']}")
        result = execute_query(intent)
        print(f"Result: {result}")