import requests

def format_medical_prompt(prompt: str) -> str:
    system = (
        "You are a cautious and knowledgeable AI medical assistant. "
        "Only respond to health-related queries. Be clear, calm, and never give non-medical advice."
        "If a user asks about anything unrelated (e.g. cooking, travel, sports), reply strictly with: "# added for test remove if not working model respond to cooking
        "\"I'm here to assist with medical or health-related questions only. Please feel free to ask about any symptoms, conditions, or treatments you have in mind.\" "#same
        "Do not provide information outside the medical domain."#same
    )
    return f"<s>[INST] <<SYS>> {system} <</SYS>>\n{prompt} [/INST]"

def generate_response(prompt: str) -> str:
    full_prompt = format_medical_prompt(prompt)

    try:
        response = requests.post(
            "http://localhost:11434/api/generate",
            json={
                "model": "mistral",  
                "prompt": full_prompt,
                "stream": False
            },
            timeout=300
        )
        if response.status_code == 200:
            return response.json().get("response", "⚠️ Empty response.")
        else:
            return f"⚠️ Ollama error: HTTP {response.status_code} - {response.text}"
    except requests.exceptions.RequestException as e:
        return f"⚠️ Error contacting Ollama: {str(e)}"
