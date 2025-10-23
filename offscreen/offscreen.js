// Offscreen document for audio capture
// Service workers can't use tabCapture, so we use an offscreen document

let mediaRecorder = null;
let audioStream = null;

// Listen for messages from service worker
chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  console.log('Offscreen received message:', message.type);

  if (message.type === 'START_CAPTURE') {
    startCapture(message.streamId)
      .then(() => sendResponse({ success: true }))
      .catch(error => sendResponse({ success: false, error: error.message }));
    return true; // Keep channel open for async response
  }

  if (message.type === 'STOP_CAPTURE') {
    stopCapture()
      .then(() => sendResponse({ success: true }))
      .catch(error => sendResponse({ success: false, error: error.message }));
    return true;
  }
});

async function startCapture(streamId) {
  try {
    console.log('Starting audio capture with streamId:', streamId);

    // Get the stream from the streamId
    audioStream = await navigator.mediaDevices.getUserMedia({
      audio: {
        mandatory: {
          chromeMediaSource: 'tab',
          chromeMediaSourceId: streamId
        }
      }
    });

    console.log('Audio stream obtained:', audioStream);

    // Create MediaRecorder
    mediaRecorder = new MediaRecorder(audioStream, {
      mimeType: 'audio/webm;codecs=opus'
    });

    // Handle data available
    mediaRecorder.addEventListener('dataavailable', async (event) => {
      if (event.data.size > 0) {
        console.log('Audio chunk available:', event.data.size, 'bytes');

        // Convert blob to base64 to send to service worker
        const reader = new FileReader();
        reader.onloadend = () => {
          const base64Audio = reader.result.split(',')[1];

          // Send audio chunk to service worker
          chrome.runtime.sendMessage({
            type: 'AUDIO_CHUNK',
            audio: base64Audio,
            timestamp: Date.now()
          });
        };
        reader.readAsDataURL(event.data);
      }
    });

    // Start recording (get chunks every 5 seconds)
    mediaRecorder.start(5000);
    console.log('MediaRecorder started');

    return true;
  } catch (error) {
    console.error('Error starting capture:', error);
    throw error;
  }
}

async function stopCapture() {
  try {
    console.log('Stopping audio capture');

    if (mediaRecorder && mediaRecorder.state !== 'inactive') {
      mediaRecorder.stop();
    }

    if (audioStream) {
      audioStream.getTracks().forEach(track => track.stop());
      audioStream = null;
    }

    mediaRecorder = null;
    console.log('Audio capture stopped');

    return true;
  } catch (error) {
    console.error('Error stopping capture:', error);
    throw error;
  }
}

console.log('Offscreen document loaded and ready');
