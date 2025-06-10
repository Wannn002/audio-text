# Audio to Text Converter

A web application that converts audio files (MP3, WAV, M4A) to text using OpenAI's Whisper AI. The application features a modern, responsive UI and supports multiple languages.

## Features

- Upload audio files (MP3, WAV, M4A)
- Support for multiple languages
- Word-level timestamps
- Download transcript as text file
- Responsive design that works on desktop and mobile
- Drag and drop file upload
- Real-time progress indication

## Prerequisites

- Python 3.7 or higher
- FFmpeg (required by Whisper)
- Git (optional, for cloning the repository)

## Installation

1. **Clone the repository** (or download the files):
   ```bash
   git clone https://github.com/yourusername/audio-to-text-converter.git
   cd audio-to-text-converter
   ```

2. **Create a virtual environment** (recommended):
   ```bash
   python -m venv venv
   source venv/bin/activate  # On Windows: venv\Scripts\activate
   ```

3. **Install the required packages**:
   ```bash
   pip install -r requirements.txt
   ```

4. **Install FFmpeg**:
   - **Windows**: Download from [FFmpeg's official website](https://ffmpeg.org/download.html) and add it to your system PATH
   - **macOS**: `brew install ffmpeg`
   - **Linux (Debian/Ubuntu)**: `sudo apt update && sudo apt install ffmpeg`

## Usage

1. **Start the Flask development server**:
   ```bash
   python app.py
   ```

2. **Open your web browser** and navigate to:
   ```
   http://localhost:5000
   ```

3. **Upload an audio file** by either:
   - Dragging and dropping the file onto the upload area, or
   - Clicking "Browse Files" and selecting the file

4. **Select the audio language** from the dropdown menu

5. **Click "Transcribe Audio"** to start the transcription process

6. **View the transcription** and use the "Download as TXT" button to save the transcript

## Supported Languages

- English (en)
- Khmer (km)
- Chinese (zh)
- Japanese (ja)
- Korean (ko)
- French (fr)
- Spanish (es)
- German (de)

## How It Works

The application uses:
- **Frontend**: HTML5, CSS3, and JavaScript for a responsive user interface
- **Backend**: Python with Flask to handle file uploads and API requests
- **AI Model**: OpenAI's Whisper for speech recognition and transcription

## Troubleshooting

- **Slow transcription**: The first run may take longer as it downloads the Whisper model
- **Installation issues**: Ensure you have all prerequisites installed, especially FFmpeg
- **File size limit**: The maximum file size is set to 100MB by default

## License

This project is open source and available under the [MIT License](LICENSE).

## Acknowledgments

- [OpenAI Whisper](https://openai.com/research/whisper)
- [Flask](https://flask.palletsprojects.com/)
- [Font Awesome](https://fontawesome.com/)
- [Google Fonts](https://fonts.google.com/)
