// Service Worker - Background Script for Meeting Intelligence Extension
import { AIManager } from './ai-manager.js';
import { StorageManager } from './storage-manager.js';
import { AudioCaptureService } from './audio-capture.js';

// Initialize managers
const aiManager = new AIManager();
const storageManager = new StorageManager();
const audioCaptureService = new AudioCaptureService();

// Helper function to setup offscreen document
async function setupOffscreenDocument() {
  const offscreenUrl = 'offscreen/offscreen.html';
  const existingContexts = await chrome.runtime.getContexts({
    contextTypes: ['OFFSCREEN_DOCUMENT'],
    documentUrls: [chrome.runtime.getURL(offscreenUrl)]
  });

  if (existingContexts.length > 0) {
    console.log('Offscreen document already exists');
    return;
  }

  console.log('Creating offscreen document');
  await chrome.offscreen.createDocument({
    url: offscreenUrl,
    reasons: ['USER_MEDIA'],
    justification: 'Recording audio from tab for meeting transcription'
  });
}

// Extension lifecycle
chrome.runtime.onInstalled.addListener(async (details) => {
  console.log('Meeting Intelligence Extension installed', details);

  // Initialize AI APIs on install
  await aiManager.initialize();

  // Create welcome notification
  if (details.reason === 'install') {
    await storageManager.saveSettings({
      autoTranscribe: true,
      defaultLanguage: 'en',
      summaryType: 'key-points',
      enableTranslation: false
    });
  }
});

// Handle messages from UI and content scripts
chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  handleMessage(message, sender, sendResponse);
  return true; // Keep message channel open for async response
});

async function handleMessage(message, sender, sendResponse) {
  try {
    switch (message.type) {
      case 'START_RECORDING':
        await handleStartRecording(message.data);
        sendResponse({ success: true });
        break;

      case 'STOP_RECORDING':
        await handleStopRecording();
        sendResponse({ success: true });
        break;

      case 'AUDIO_CHUNK':
        // Received audio chunk from offscreen document
        await handleAudioChunk(message.audio, message.timestamp);
        sendResponse({ success: true });
        break;

      case 'TRANSCRIBE_AUDIO':
        const transcript = await aiManager.transcribeAudio(message.audio);
        sendResponse({ success: true, transcript });
        break;

      case 'SUMMARIZE_TEXT':
        const summary = await aiManager.summarize(message.text, message.options);
        sendResponse({ success: true, summary });
        break;

      case 'EXTRACT_ACTION_ITEMS':
        const actionItems = await aiManager.extractActionItems(message.text);
        sendResponse({ success: true, actionItems });
        break;

      case 'TRANSLATE_TEXT':
        const translation = await aiManager.translate(message.text, message.targetLanguage);
        sendResponse({ success: true, translation });
        break;

      case 'PROOFREAD_TEXT':
        const proofread = await aiManager.proofread(message.text);
        sendResponse({ success: true, proofread });
        break;

      case 'GET_MEETINGS':
        const meetings = await storageManager.getMeetings();
        sendResponse({ success: true, meetings });
        break;

      case 'SAVE_MEETING':
        await storageManager.saveMeeting(message.meeting);
        sendResponse({ success: true });
        break;

      case 'DELETE_MEETING':
        await storageManager.deleteMeeting(message.meetingId);
        sendResponse({ success: true });
        break;

      case 'CHECK_API_AVAILABILITY':
        const availability = await aiManager.checkAvailability();
        sendResponse({ success: true, availability });
        break;

      default:
        sendResponse({ success: false, error: 'Unknown message type' });
    }
  } catch (error) {
    console.error('Error handling message:', error);
    sendResponse({ success: false, error: error.message });
  }
}

async function handleStartRecording(data) {
  const { tabId, audioSource } = data;

  try {
    console.log('Starting recording for tab:', tabId);

    // Create offscreen document if needed
    await setupOffscreenDocument();

    // Directly capture using tabCapture.capture (simpler approach)
    // The offscreen document will handle the actual stream
    const stream = await new Promise((resolve, reject) => {
      chrome.tabCapture.capture({
        audio: true,
        video: false
      }, (capturedStream) => {
        if (chrome.runtime.lastError) {
          reject(new Error(chrome.runtime.lastError.message));
        } else if (!capturedStream) {
          reject(new Error('Failed to capture stream'));
        } else {
          resolve(capturedStream);
        }
      });
    });

    console.log('Captured stream:', stream);

    // For now, just log that we got the stream
    // The actual audio processing would happen here
    // Send a mock transcript for demonstration
    setTimeout(() => {
      chrome.runtime.sendMessage({
        type: 'TRANSCRIPT_CHUNK',
        transcript: '[Audio capture working! Transcription will be available when Prompt API multimodal is fully supported in service workers]',
        timestamp: Date.now()
      });
    }, 2000);

    return true;
  } catch (error) {
    console.error('Error in handleStartRecording:', error);
    throw error;
  }
}

async function handleStopRecording() {
  try {
    console.log('Stopping recording');

    // Send stop message to offscreen document
    await chrome.runtime.sendMessage({
      type: 'STOP_CAPTURE'
    });

    return true;
  } catch (error) {
    console.error('Error in handleStopRecording:', error);
    throw error;
  }
}

async function handleAudioChunk(base64Audio, timestamp) {
  try {
    console.log('Received audio chunk at', timestamp);

    // Convert base64 to blob
    const audioBlob = base64ToBlob(base64Audio, 'audio/webm');

    // Transcribe using AI
    // Note: Multimodal audio API might not be available yet
    // For now, just send the chunk info to UI
    chrome.runtime.sendMessage({
      type: 'TRANSCRIPT_CHUNK',
      transcript: '[Audio captured - transcription pending API availability]',
      timestamp: timestamp
    });

    // TODO: When multimodal API is available, transcribe here:
    // const transcript = await aiManager.transcribeAudio(audioBlob);
    // chrome.runtime.sendMessage({
    //   type: 'TRANSCRIPT_CHUNK',
    //   transcript,
    //   timestamp
    // });

  } catch (error) {
    console.error('Error handling audio chunk:', error);
  }
}

function base64ToBlob(base64, mimeType) {
  const byteCharacters = atob(base64);
  const byteArrays = [];

  for (let offset = 0; offset < byteCharacters.length; offset += 512) {
    const slice = byteCharacters.slice(offset, offset + 512);
    const byteNumbers = new Array(slice.length);

    for (let i = 0; i < slice.length; i++) {
      byteNumbers[i] = slice.charCodeAt(i);
    }

    const byteArray = new Uint8Array(byteNumbers);
    byteArrays.push(byteArray);
  }

  return new Blob(byteArrays, { type: mimeType });
}

// Handle side panel opening
chrome.sidePanel.setPanelBehavior({ openPanelOnActionClick: true });

console.log('Meeting Intelligence Extension service worker loaded');
