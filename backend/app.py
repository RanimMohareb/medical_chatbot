from flask import Flask, request, jsonify
from flask_cors import CORS
from flask_jwt_extended import JWTManager, create_access_token
from dotenv import load_dotenv
import os
from grad_runner import predict, initialize_model
from db import save_chat, get_chat_history, create_user, authenticate_user, clear_chat_history

from sentence_transformers import SentenceTransformer, util

embedder = SentenceTransformer("multi-qa-MiniLM-L6-cos-v1")

def compute_metrics(model_answer, nhs_text):
    # Semantic similarity
    emb_pred = embedder.encode(model_answer, convert_to_tensor=True)
    emb_truth = embedder.encode(nhs_text, convert_to_tensor=True)
    cos_sim = util.cos_sim(emb_pred, emb_truth).item()

    # Token-level F1
    def f1_token(pred, truth):
        from collections import Counter
        pred_tokens = pred.lower().split()
        truth_tokens = truth.lower().split()
        common = Counter(pred_tokens) & Counter(truth_tokens)
        num_same = sum(common.values())
        if num_same == 0:
            return 0.0
        precision = num_same / len(pred_tokens)
        recall = num_same / len(truth_tokens)
        f1 = 2 * precision * recall / (precision + recall)
        return f1

    f1 = f1_token(model_answer, nhs_text)

    return cos_sim, f1

# Load environment variables from .env file
load_dotenv()

app = Flask(__name__)
CORS(app)

# Secure JWT secret key from environment
app.config["JWT_SECRET_KEY"] = os.getenv("JWT_SECRET_KEY")
jwt = JWTManager(app)

# ------------------- CHAT ROUTE -------------------
@app.route("/api/chat", methods=["POST"])
def chat():
    data = request.get_json()
    prompt = data.get("prompt", "")
    username = data.get("username", "default_user")  # Optional username support

    if not prompt:
        return jsonify({"error": "Prompt is required"}), 400

    response, nhs_docs_used  = predict(prompt)
    
    # Grab first retrieved doc (could loop over all)
    nhs_text = nhs_docs_used[0]["text"] if nhs_docs_used else ""

    cos_sim, f1 = compute_metrics(response, nhs_text)

    print(f"✅ Accuracy for this response:")
    print(f"   Cosine Similarity: {cos_sim:.3f}")
    print(f"   F1 Overlap: {f1:.3f}")

    save_chat(username, prompt, response)

  #  return jsonify({"response": response})
    return jsonify({
        "response": response,
        "cosine_similarity": cos_sim,
        "f1_overlap": f1
    })


# ------------------- HISTORY ROUTE -------------------
@app.route("/api/history", methods=["POST"])
def history():
    data = request.get_json()
    username = data.get("username", "")

    if not username:
        return jsonify({"error": "Username is required"}), 400

    history = get_chat_history(username)

    formatted = [
        {
            "prompt": chat.get("prompt"),
            "response": chat.get("response"),
            "timestamp": chat.get("timestamp")
        }
        for chat in history
    ]

    return jsonify({"history": formatted})

# ------------------- CLEAR HISTORY ROUTE -------------------
@app.route("/api/clear_history", methods=["POST"])
def clear_history():
    data = request.get_json()
    username = data.get("username", "")

    if not username:
        return jsonify({"error": "Username is required"}), 400

    clear_chat_history(username)
    return jsonify({"message": "Chat history cleared successfully."})

# ------------------- REGISTER ROUTE -------------------
@app.route("/api/auth/register", methods=["POST"])
def register():
    data = request.get_json()
    name = data.get("name")
    email = data.get("email")
    password = data.get("password")
    dob = data.get("dob")
    gender = data.get("gender")

    if not all([name, email, password, dob, gender]):
        return jsonify({"message": "All fields are required"}), 400

    success, result = create_user(name, email, password, dob, gender)
    if not success:
        return jsonify({"message": result}), 409

    token = create_access_token(identity=email)
    return jsonify({
        "message": "User registered",
        "token": token,
        "user": {
            "name": name,
            "email": email,
            "dob": dob,
            "gender": gender
        }
    })

# ------------------- LOGIN ROUTE -------------------
@app.route("/api/auth/login", methods=["POST"])
def login():
    data = request.get_json()
    email = data.get("email")
    password = data.get("password")

    success, user = authenticate_user(email, password)
    if not success:
        return jsonify({"message": user}), 401

    token = create_access_token(identity=email)
    return jsonify({"message": "Login successful", "token": token, "user": {"name": user["name"], "email": user["email"]}})

# ------------------- MAIN -------------------
if __name__ == "__main__":
    # Optional: eagerly initialize the model at startup
    initialize_model()

    # Run with debug OFF to avoid double-loading models
    app.run(port=5000, debug=True)
