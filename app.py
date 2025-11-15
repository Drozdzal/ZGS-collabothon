from flask import Flask, request, jsonify
import os, base64, random, string
from transcibe import create_openai_client, transcribe_audio
from zgs_backend import PaymentProcessingAgent

app = Flask(__name__)
client = create_openai_client()
agent = PaymentProcessingAgent()

UPLOAD_FOLDER = "uploads/"
os.makedirs(UPLOAD_FOLDER, exist_ok=True)

@app.route('/upload-image', methods=['POST'])
def upload_base64():
    data = request.get_json()
    if not data or "image_base64" not in data:
        return jsonify({"error": "data content missing or image not in data"}), 400

    base_img = data["image_base64"]
    random_filename = ''.join(random.choices(string.ascii_letters + string.digits, k=16)) + ".png"

    try:
        image_bytes = base64.b64decode(base_img)
        with open(UPLOAD_FOLDER + random_filename, "wb") as f:
            f.write(image_bytes)
        result = agent.process_request(
            fr"Extract payment information from the bill image at 'C:\Users\Mateusz\Desktop\ZGS-collabothon\uploads\{random_filename}' and give me the formatted payment details"
        )
        return jsonify({"status" : "OK", "result" : result}), 200
    except Exception:
        return jsonify({"error": "Base64 decoding failed"}), 400

    # Here you may process image

@app.route("/upload-audio", methods=["POST"])
def upload_audio_base64():
    data = request.get_json()

    if not data or "audio" not in data:
        return jsonify({"error": "Missing 'audio' in JSON"}), 400

    audio_bytes = data["audio"]

    try:
        text = transcribe_audio(client, audio_bytes)
        result = agent.process_request(user_input=text)
        return jsonify({"status": "OK", "result" : result}), 200

    except Exception:
        return jsonify({"error": "Transcription failed."}), 400

if __name__ == '__main__':
    app.run(debug=True, port=2137)