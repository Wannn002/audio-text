import os
import json
import tempfile
import speech_recognition as sr
from flask import Flask, render_template, request, jsonify, send_file
from werkzeug.utils import secure_filename
from datetime import timedelta
from pydub import AudioSegment

app = Flask(__name__)
app.config['MAX_CONTENT_LENGTH'] = 100 * 1024 * 1024  # 100MB max file size
app.config['UPLOAD_FOLDER'] = tempfile.gettempdir()
ALLOWED_EXTENSIONS = {'mp3', 'wav', 'm4a'}

def allowed_file(filename):
    return '.' in filename and filename.rsplit('.', 1)[1].lower() in ALLOWED_EXTENSIONS

def transcribe_audio_file(audio_path, language='en'):
    recognizer = sr.Recognizer()
    
    # Convert audio file to WAV format if it's not already
    if not audio_path.lower().endswith('.wav'):
        audio = AudioSegment.from_file(audio_path)
        wav_path = os.path.splitext(audio_path)[0] + '.wav'
        audio.export(wav_path, format='wav')
        audio_path = wav_path
    
    with sr.AudioFile(audio_path) as source:
        # Listen for the data (load audio to memory)
        audio_data = recognizer.record(source)
        
        try:
            # Recognize (convert from speech to text)
            text = recognizer.recognize_google(audio_data, language=language)
            return {
                'text': text,
                'segments': [{'start': 0, 'end': len(text.split()) * 0.5, 'text': text}],
                'language': language
            }
        except sr.UnknownValueError:
            return {'error': 'Google Speech Recognition could not understand the audio'}
        except sr.RequestError as e:
            return {'error': f'Could not request results from Google Speech Recognition service; {e}'}

@app.route('/')
def index():
    return render_template('index.html')

@app.route('/transcribe', methods=['POST'])
def transcribe_audio():
    if 'file' not in request.files:
        return jsonify({'error': 'No file part'}), 400
    
    file = request.files['file']
    if file.filename == '':
        return jsonify({'error': 'No selected file'}), 400
    
    language = request.form.get('language', 'en')
    
    if file and allowed_file(file.filename):
        filename = secure_filename(file.filename)
        temp_path = os.path.join(app.config['UPLOAD_FOLDER'], filename)
        file.save(temp_path)
        
        try:
            # Transcribe the audio file
            result = transcribe_audio_file(temp_path, language=language)
            
            # Clean up the temporary file
            if os.path.exists(temp_path):
                os.unlink(temp_path)
            
            # Check if there was an error during transcription
            if 'error' in result:
                return jsonify({'error': result['error']}), 500
                
            return jsonify(result)
            
        except Exception as e:
            return jsonify({'error': str(e)}), 500
    
    return jsonify({'error': 'File type not allowed'}), 400

@app.route('/download', methods=['POST'])
def download_transcript():
    data = request.json
    if not data or 'text' not in data:
        return jsonify({'error': 'No text provided'}), 400
    
    # Create a temporary file
    with tempfile.NamedTemporaryFile(mode='w', delete=False, suffix='.txt') as temp_file:
        # Write the transcript with timestamps
        if 'segments' in data:
            for segment in data['segments']:
                start = str(timedelta(seconds=round(segment['start'])))
                end = str(timedelta(seconds=round(segment['end'])))
                temp_file.write(f'[{start} --> {end}] {segment["text"]}\n\n')
        else:
            temp_file.write(data['text'])
        
        temp_path = temp_file.name
    
    return send_file(
        temp_path,
        as_attachment=True,
        download_name='transcript.txt',
        mimetype='text/plain'
    )

if __name__ == '__main__':
    os.makedirs(app.config['UPLOAD_FOLDER'], exist_ok=True)
    app.run(debug=True, port=5000)
