// Check for browser support
if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
    alert('Your browser does not support audio recording. Please use a different browser.');
}

document.addEventListener('DOMContentLoaded', function () {
    const recordBtn = document.getElementById('start-recording-btn');
    const stopBtn = document.getElementById('stop-recording-btn');
    const statusMessage = document.getElementById('status-message');
    const transcriptionOutput = document.getElementById('transcription-output');
    const uploadAudioBtn = document.getElementById('upload-audio-btn');
    const audioFileUpload = document.getElementById('audio-file-upload');
    const uploadedTranscriptionOutput = document.getElementById('uploaded-transcription-output');
    const convertTextBtn = document.getElementById('convert-text-btn');
    const textToSpeak = document.getElementById('text-to-speak');
    const recordingIndicator = document.getElementById('recording-indicator'); // The blinking recording indicator

    let mediaRecorder;
    let audioChunks = [];

    // Start recording
    recordBtn.addEventListener('click', function () {
        statusMessage.textContent = 'Recording...';
        recordBtn.disabled = true;
        stopBtn.disabled = false;
        audioChunks = [];

        // Show blinking recording symbol
        recordingIndicator.style.display = 'flex';

        navigator.mediaDevices.getUserMedia({ audio: true })
            .then(function (stream) {
                mediaRecorder = new MediaRecorder(stream);
                mediaRecorder.start();

                mediaRecorder.ondataavailable = function (event) {
                    audioChunks.push(event.data);
                };

                mediaRecorder.onstop = function () {
                    const audioBlob = new Blob(audioChunks, { type: 'audio/wav' });

                    // Hide blinking recording symbol
                    recordingIndicator.style.display = 'none';

                    // Transcribe the audio using your backend
                    fetch('/audio-to-text', {
                        method: 'POST',
                        body: audioBlob,
                        headers: {
                            'Content-Type': 'audio/wav'
                        }
                    })
                    .then(response => response.json())
                    .then(data => {
                        transcriptionOutput.value = data.transcription || 'No transcription available';
                    })
                    .catch(error => {
                        console.error('Error during transcription:', error);
                        statusMessage.textContent = 'Transcription error';
                    });
                };
            })
            .catch(function (err) {
                console.error('Error accessing microphone: ', err);
                statusMessage.textContent = 'Error accessing microphone';
                recordBtn.disabled = false;
                stopBtn.disabled = true;
                recordingIndicator.style.display = 'none'; // Hide the indicator if there's an error
            });
    });

    // Stop recording
    stopBtn.addEventListener('click', function () {
        statusMessage.textContent = 'Not recording...';
        recordBtn.disabled = false;
        stopBtn.disabled = true;
        mediaRecorder.stop();

        // Hide blinking recording symbol when stopped
        recordingIndicator.style.display = 'none';
    });

    // Upload audio file
    uploadAudioBtn.addEventListener('click', function () {
        const audioFile = audioFileUpload.files[0]; // Get the uploaded audio file
        if (audioFile) {
            const reader = new FileReader();
            reader.onload = function(event) {
                const audioBlob = new Blob([event.target.result], { type: audioFile.type }); // Create a Blob from the uploaded file

                // Transcribe the audio using your backend
                fetch('/audio-to-text', {
                    method: 'POST',
                    body: audioBlob,
                    headers: {
                        'Content-Type': audioFile.type 
                    }
                })
                .then(response => response.json())
                .then(data => {
                    uploadedTranscriptionOutput.value = data.transcription || 'No transcription available'; // Display the transcription
                })
                .catch(error => {
                    console.error('Error during transcription:', error);
                    statusMessage.textContent = 'Transcription error';
                });
            };
            reader.readAsArrayBuffer(audioFile); // Read the file as an ArrayBuffer
        } else {
            alert('Please select an audio file to upload.');
        }
    });

    // Text-to-Speech Conversion
    convertTextBtn.addEventListener('click', function () {
        const text = textToSpeak.value;
        if (text) {
            const utterance = new SpeechSynthesisUtterance(text);
            window.speechSynthesis.speak(utterance); // Speak the text
        } else {
            alert('Please enter some text to convert to speech.');
        }
    });
});
