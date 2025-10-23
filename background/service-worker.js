// Service Worker - Background Script for Meeting Intelligence Extension
import { AIManager } from './ai-manager.js';
import { StorageManager } from './storage-manager.js';
import { AudioCaptureService } from './audio-capture.js';

// Initialize managers
const aiManager = new AIManager();
const storageManager = new StorageManager();
const audioCaptureService = new AudioCaptureService();

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
  await audioCaptureService.startCapture(tabId, audioSource);

  // Set up audio chunk processing
  audioCaptureService.onAudioChunk(async (audioBlob) => {
    // Transcribe chunk
    const transcript = await aiManager.transcribeAudio(audioBlob);

    // Send to UI
    chrome.runtime.sendMessage({
      type: 'TRANSCRIPT_CHUNK',
      transcript,
      timestamp: Date.now()
    });
  });
}

async function handleStopRecording() {
  await audioCaptureService.stopCapture();
}

// Handle side panel opening
chrome.sidePanel.setPanelBehavior({ openPanelOnActionClick: true });

console.log('Meeting Intelligence Extension service worker loaded');
