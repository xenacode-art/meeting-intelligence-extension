// Audio Capture Service - Handles tab audio capture for transcription
export class AudioCaptureService {
  constructor() {
    this.mediaStream = null;
    this.mediaRecorder = null;
    this.audioChunks = [];
    this.isRecording = false;
    this.onChunkCallback = null;
    this.chunkInterval = 5000; // Process audio every 5 seconds
  }

  // Start capturing audio from a tab
  async startCapture(tabId, audioSource = 'tab') {
    try {
      console.log('Starting audio capture for tab:', tabId);

      // Capture tab audio using tabCapture API
      this.mediaStream = await new Promise((resolve, reject) => {
        chrome.tabCapture.capture(
          {
            audio: true,
            video: false
          },
          (stream) => {
            if (chrome.runtime.lastError) {
              reject(new Error(chrome.runtime.lastError.message));
            } else if (!stream) {
              reject(new Error('Failed to capture tab audio'));
            } else {
              resolve(stream);
            }
          }
        );
      });

      // Create MediaRecorder
      this.mediaRecorder = new MediaRecorder(this.mediaStream, {
        mimeType: 'audio/webm;codecs=opus'
      });

      this.audioChunks = [];

      // Handle audio data available
      this.mediaRecorder.addEventListener('dataavailable', (event) => {
        if (event.data.size > 0) {
          this.audioChunks.push(event.data);
        }
      });

      // Handle recording stop
      this.mediaRecorder.addEventListener('stop', async () => {
        await this.processAudioChunks();
      });

      // Start recording with time slicing (get chunks every 5 seconds)
      this.mediaRecorder.start(this.chunkInterval);
      this.isRecording = true;

      console.log('Audio capture started successfully');
      return true;
    } catch (error) {
      console.error('Error starting audio capture:', error);
      throw error;
    }
  }

  // Stop capturing audio
  async stopCapture() {
    try {
      if (this.mediaRecorder && this.isRecording) {
        this.mediaRecorder.stop();
        this.isRecording = false;
      }

      if (this.mediaStream) {
        this.mediaStream.getTracks().forEach(track => track.stop());
        this.mediaStream = null;
      }

      console.log('Audio capture stopped');
      return true;
    } catch (error) {
      console.error('Error stopping audio capture:', error);
      throw error;
    }
  }

  // Process accumulated audio chunks
  async processAudioChunks() {
    if (this.audioChunks.length === 0) {
      return;
    }

    try {
      // Create blob from chunks
      const audioBlob = new Blob(this.audioChunks, { type: 'audio/webm' });

      // Call the callback with the audio blob
      if (this.onChunkCallback) {
        await this.onChunkCallback(audioBlob);
      }

      // Clear chunks for next batch
      this.audioChunks = [];
    } catch (error) {
      console.error('Error processing audio chunks:', error);
    }
  }

  // Set callback for when audio chunks are ready
  onAudioChunk(callback) {
    this.onChunkCallback = callback;
  }

  // Get recording status
  getStatus() {
    return {
      isRecording: this.isRecording,
      hasStream: !!this.mediaStream,
      chunksCollected: this.audioChunks.length
    };
  }

  // Pause recording
  pause() {
    if (this.mediaRecorder && this.isRecording) {
      this.mediaRecorder.pause();
    }
  }

  // Resume recording
  resume() {
    if (this.mediaRecorder && this.isRecording) {
      this.mediaRecorder.resume();
    }
  }
}
