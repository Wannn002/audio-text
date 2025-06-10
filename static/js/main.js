document.addEventListener('DOMContentLoaded', function() {
    // DOM Elements
    const dropArea = document.getElementById('dropArea');
    const fileInput = document.getElementById('fileInput');
    const browseBtn = document.getElementById('browseBtn');
    const transcribeBtn = document.getElementById('transcribeBtn');
    const downloadBtn = document.getElementById('downloadBtn');
    const resultContainer = document.getElementById('resultContainer');
    const resultContent = document.getElementById('resultContent');
    const loadingElement = document.getElementById('loading');
    const languageSelect = document.getElementById('language');
    const fileInfo = document.getElementById('fileInfo');
    
    let selectedFile = null;
    let transcriptionResult = null;

    // Prevent default drag behaviors
    ['dragenter', 'dragover', 'dragleave', 'drop'].forEach(eventName => {
        dropArea.addEventListener(eventName, preventDefaults, false);
        document.body.addEventListener(eventName, preventDefaults, false);
    });

    // Highlight drop area when item is dragged over it
    ['dragenter', 'dragover'].forEach(eventName => {
        dropArea.addEventListener(eventName, highlight, false);
    });

    ['dragleave', 'drop'].forEach(eventName => {
        dropArea.addEventListener(eventName, unhighlight, false);
    });

    // Handle dropped files
    dropArea.addEventListener('drop', handleDrop, false);
    
    // Open file dialog when browse button is clicked
    browseBtn.addEventListener('click', () => {
        fileInput.click();
    });
    
    // Handle file selection
    fileInput.addEventListener('change', handleFiles);
    
    // Transcribe button click handler
    transcribeBtn.addEventListener('click', transcribeAudio);
    
    // Download button click handler
    downloadBtn.addEventListener('click', downloadTranscript);

    function preventDefaults(e) {
        e.preventDefault();
        e.stopPropagation();
    }

    function highlight() {
        dropArea.classList.add('dragover');
    }

    function unhighlight() {
        dropArea.classList.remove('dragover');
    }

    function handleDrop(e) {
        const dt = e.dataTransfer;
        const files = dt.files;
        handleFiles({ target: { files } });
    }

    function handleFiles(e) {
        const files = e.target.files;
        if (files.length > 0) {
            selectedFile = files[0];
            fileInfo.textContent = `Selected: ${selectedFile.name} (${formatFileSize(selectedFile.size)})`;
            transcribeBtn.disabled = false;
        } else {
            selectedFile = null;
            fileInfo.textContent = 'Supports: MP3, WAV, M4A (Max 100MB)';
            transcribeBtn.disabled = true;
        }
    }

    async function transcribeAudio() {
        if (!selectedFile) return;
        
        // Show loading state
        loadingElement.style.display = 'flex';
        resultContainer.style.display = 'none';
        
        const formData = new FormData();
        formData.append('file', selectedFile);
        formData.append('language', languageSelect.value);
        
        try {
            const response = await fetch('/transcribe', {
                method: 'POST',
                body: formData
            });
            
            if (!response.ok) {
                throw new Error('Transcription failed');
            }
            
            const data = await response.json();
            transcriptionResult = data;
            
            // Display the transcription
            displayTranscription(data);
            
            // Show result container
            resultContainer.style.display = 'block';
            
        } catch (error) {
            console.error('Error:', error);
            alert('An error occurred during transcription. Please try again.');
        } finally {
            // Hide loading state
            loadingElement.style.display = 'none';
        }
    }
    
    function displayTranscription(data) {
        if (!data || !data.segments) {
            resultContent.textContent = 'No transcription available.';
            return;
        }
        
        // Clear previous content
        resultContent.innerHTML = '';
        
        // Create a document fragment for better performance
        const fragment = document.createDocumentFragment();
        
        data.segments.forEach(segment => {
            // Create segment container
            const segmentElement = document.createElement('div');
            segmentElement.className = 'segment';
            
            // Add timestamp
            const timestamp = document.createElement('div');
            timestamp.className = 'timestamp';
            timestamp.textContent = formatTime(segment.start) + ' - ' + formatTime(segment.end);
            
            // Add text with word timestamps
            const textElement = document.createElement('div');
            textElement.className = 'segment-text';
            
            if (segment.words && segment.words.length > 0) {
                // Add words with timestamps if available
                segment.words.forEach((word, index) => {
                    const wordSpan = document.createElement('span');
                    wordSpan.className = 'word-timestamp';
                    wordSpan.textContent = word.word + ' ';
                    wordSpan.dataset.start = word.start;
                    wordSpan.dataset.end = word.end;
                    
                    // Add click event to seek to word
                    wordSpan.addEventListener('click', function() {
                        // Remove active class from all words
                        document.querySelectorAll('.word-timestamp').forEach(el => {
                            el.classList.remove('active');
                        });
                        // Add active class to clicked word
                        this.classList.add('active');
                    });
                    
                    textElement.appendChild(wordSpan);
                });
            } else {
                // Fallback to plain text if no word timestamps
                textElement.textContent = segment.text;
            }
            
            // Append elements to segment
            segmentElement.appendChild(timestamp);
            segmentElement.appendChild(textElement);
            
            // Add to fragment
            fragment.appendChild(segmentElement);
        });
        
        // Append all to result content
        resultContent.appendChild(fragment);
    }
    
    async function downloadTranscript() {
        if (!transcriptionResult) return;
        
        try {
            const response = await fetch('/download', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(transcriptionResult)
            });
            
            if (!response.ok) {
                throw new Error('Download failed');
            }
            
            // Create a download link and trigger download
            const blob = await response.blob();
            const url = window.URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = 'transcript.txt';
            document.body.appendChild(a);
            a.click();
            window.URL.revokeObjectURL(url);
            document.body.removeChild(a);
            
        } catch (error) {
            console.error('Error downloading transcript:', error);
            alert('Failed to download transcript. Please try again.');
        }
    }
    
    // Helper functions
    function formatTime(seconds) {
        const date = new Date(0);
        date.setSeconds(seconds);
        return date.toISOString().substr(11, 8);
    }
    
    function formatFileSize(bytes) {
        if (bytes === 0) return '0 Bytes';
        const k = 1024;
        const sizes = ['Bytes', 'KB', 'MB', 'GB'];
        const i = Math.floor(Math.log(bytes) / Math.log(k));
        return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
    }
});
