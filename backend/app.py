from flask import Flask, request, jsonify
from flask_cors import CORS
import tempfile
import whisper

app = Flask(__name__)
CORS(app)

model = whisper.load_model("base")

@app.route('/api/transcribe', methods=['POST'])
def transcribe():
    if 'audio' not in request.files:
        return jsonify({'error': 'No audio file provided'}), 400

    print("Received audio file")
    audio_file = request.files['audio']

    with tempfile.NamedTemporaryFile(delete=False, suffix=".mp3") as temp_audio:
        audio_file.save(temp_audio.name)
        audio_path = temp_audio.name

    try:
        audio = whisper.load_audio(audio_path)
        audio = whisper.pad_or_trim(audio)
        mel = whisper.log_mel_spectrogram(audio).to(model.device)

        # detect the spoken language
        _, probs = model.detect_language(mel)
        print(f"Detected language: {max(probs, key=probs.get)}")

        options = whisper.DecodingOptions()
        result = whisper.decode(model, mel, options)

        print(f"Decoded text: {result.text}")
        
        return jsonify({'text': result.text})

    except Exception as e:
        return jsonify({'error': str(e)}), 500

if __name__ == '__main__':
    app.run(debug=True)