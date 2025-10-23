// Side Panel JavaScript - Main UI Logic

class MeetingIntelligenceUI {
  constructor() {
    this.currentMeeting = null;
    this.isRecording = false;
    this.transcript = '';
    this.meetings = [];

    this.init();
  }

  async init() {
    await this.loadMeetings();
    this.setupEventListeners();
    await this.checkAPIStatus();
    this.setupMessageListener();
  }

  setupEventListeners() {
    // Demo mode
    document.getElementById('loadSampleBtn').addEventListener('click', () => this.loadSampleTranscript());

    // Recording controls
    document.getElementById('startRecordingBtn').addEventListener('click', () => this.startRecording());
    document.getElementById('stopRecordingBtn').addEventListener('click', () => this.stopRecording());

    // Tabs
    document.querySelectorAll('.tab').forEach(tab => {
      tab.addEventListener('click', (e) => this.switchTab(e.target.dataset.tab));
    });

    // Summary actions
    document.getElementById('generateSummaryBtn').addEventListener('click', () => this.generateSummary());
    document.getElementById('copySummaryBtn').addEventListener('click', () => this.copyContent('summary'));

    // Action items
    document.getElementById('generateActionsBtn').addEventListener('click', () => this.generateActions());
    document.getElementById('copyActionsBtn').addEventListener('click', () => this.copyContent('actions'));

    // Transcript actions
    document.getElementById('copyTranscriptBtn').addEventListener('click', () => this.copyContent('transcript'));
    document.getElementById('translateTranscriptBtn').addEventListener('click', () => this.translateTranscript());

    // Settings
    document.getElementById('settingsBtn').addEventListener('click', () => this.openSettings());
    document.getElementById('closeSettingsBtn').addEventListener('click', () => this.closeSettings());

    // Export/Import
    document.getElementById('exportBtn').addEventListener('click', () => this.exportMeetings());
    document.getElementById('importBtn').addEventListener('click', () => document.getElementById('importFile').click());
    document.getElementById('importFile').addEventListener('change', (e) => this.importMeetings(e));

    // History
    document.getElementById('clearHistoryBtn').addEventListener('click', () => this.clearHistory());
  }

  setupMessageListener() {
    // Listen for messages from background script
    chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
      if (message.type === 'TRANSCRIPT_CHUNK') {
        this.addTranscriptChunk(message.transcript, message.timestamp);
      }
      sendResponse({ received: true });
    });
  }

  async checkAPIStatus() {
    try {
      const response = await chrome.runtime.sendMessage({
        type: 'CHECK_API_AVAILABILITY'
      });

      if (response.success) {
        this.updateAPIStatus(response.availability);
      }
    } catch (error) {
      console.error('Error checking API status:', error);
      this.showStatus('Failed to check AI API availability', 'error');
    }
  }

  updateAPIStatus(availability) {
    const statusBanner = document.getElementById('apiStatus');
    const statusText = statusBanner.querySelector('.status-text');

    if (!availability.promptAPI || !availability.summarizer || !availability.writer) {
      statusBanner.classList.remove('hidden');
      statusText.textContent = 'Some AI APIs are not available. Please enable Chrome Built-in AI features.';
      statusBanner.className = 'status-banner error';
    } else if (!availability.summarizerReady || !availability.writerReady) {
      statusBanner.classList.remove('hidden');
      statusText.textContent = 'AI models are downloading. This may take a few minutes...';
      statusBanner.className = 'status-banner';
    } else {
      statusBanner.classList.add('hidden');
    }
  }

  async startRecording() {
    try {
      // Get all tabs and find the most recent non-chrome page
      const tabs = await chrome.tabs.query({ currentWindow: true });

      // Filter out chrome:// and extension pages, sort by lastAccessed
      const validTabs = tabs
        .filter(t => t.url &&
                     !t.url.startsWith('chrome://') &&
                     !t.url.startsWith('chrome-extension://') &&
                     !t.url.startsWith('edge://'))
        .sort((a, b) => (b.lastAccessed || 0) - (a.lastAccessed || 0));

      if (validTabs.length === 0) {
        this.showStatus('No valid tabs found. Please open YouTube or any website in a new tab first.', 'error');
        return;
      }

      const tab = validTabs[0]; // Most recently accessed valid tab

      console.log('Starting recording for tab:', tab.id, tab.url, tab.title);

      // First, send message to content script on that tab to "invoke" the extension
      try {
        await chrome.tabs.sendMessage(tab.id, { type: 'PREPARE_RECORDING' });
      } catch (e) {
        console.log('Content script not ready, continuing anyway:', e);
      }

      // Start recording via background script
      const response = await chrome.runtime.sendMessage({
        type: 'START_RECORDING',
        data: { tabId: tab.id, audioSource: 'tab' }
      });

      if (response.success) {
        this.isRecording = true;
        this.transcript = '';
        this.currentMeeting = {
          title: document.getElementById('meetingTitle').value || `Meeting ${new Date().toLocaleString()}`,
          startTime: Date.now(),
          transcript: '',
          summary: '',
          actionItems: ''
        };

        this.updateRecordingUI(true);
        this.showStatus('Recording started for: ' + tab.title, 'success');
      } else {
        this.showStatus('Failed to start recording: ' + (response.error || 'Unknown error'), 'error');
      }
    } catch (error) {
      console.error('Error starting recording:', error);
      this.showStatus('Failed to start recording: ' + error.message, 'error');
    }
  }

  async stopRecording() {
    try {
      const response = await chrome.runtime.sendMessage({
        type: 'STOP_RECORDING'
      });

      if (response.success) {
        this.isRecording = false;
        this.updateRecordingUI(false);

        // Save meeting
        if (this.currentMeeting) {
          this.currentMeeting.endTime = Date.now();
          this.currentMeeting.transcript = this.transcript;
          await this.saveMeeting(this.currentMeeting);
        }

        this.showStatus('Recording stopped and saved', 'success');
      }
    } catch (error) {
      console.error('Error stopping recording:', error);
      this.showStatus('Failed to stop recording', 'error');
    }
  }

  updateRecordingUI(isRecording) {
    const statusIndicator = document.getElementById('recordingStatus');
    const startBtn = document.getElementById('startRecordingBtn');
    const stopBtn = document.getElementById('stopRecordingBtn');

    if (isRecording) {
      statusIndicator.classList.add('recording');
      statusIndicator.querySelector('.status-label').textContent = 'Recording';
      startBtn.classList.add('hidden');
      stopBtn.classList.remove('hidden');
    } else {
      statusIndicator.classList.remove('recording');
      statusIndicator.classList.add('ready');
      statusIndicator.querySelector('.status-label').textContent = 'Ready';
      startBtn.classList.remove('hidden');
      stopBtn.classList.add('hidden');
    }
  }

  addTranscriptChunk(text, timestamp) {
    this.transcript += text + ' ';

    const transcriptContent = document.getElementById('transcriptContent');
    const placeholder = transcriptContent.querySelector('.placeholder');

    if (placeholder) {
      placeholder.remove();
    }

    // Add new chunk with timestamp
    const chunk = document.createElement('p');
    const time = new Date(timestamp).toLocaleTimeString();
    chunk.innerHTML = `<strong>[${time}]</strong> ${text}`;
    transcriptContent.appendChild(chunk);

    // Auto-scroll
    transcriptContent.scrollTop = transcriptContent.scrollHeight;

    // Update current meeting
    if (this.currentMeeting) {
      this.currentMeeting.transcript = this.transcript;
    }
  }

  async generateSummary() {
    if (!this.transcript) {
      this.showStatus('No transcript available', 'error');
      return;
    }

    try {
      const summaryType = document.getElementById('summaryType').value;
      const summaryContent = document.getElementById('summaryContent');

      summaryContent.innerHTML = '<p class="placeholder">Generating summary...</p>';

      const response = await chrome.runtime.sendMessage({
        type: 'SUMMARIZE_TEXT',
        text: this.transcript,
        options: { type: summaryType }
      });

      if (response.success) {
        summaryContent.innerHTML = `<div class="summary-text">${this.formatMarkdown(response.summary)}</div>`;

        if (this.currentMeeting) {
          this.currentMeeting.summary = response.summary;
        }
      }
    } catch (error) {
      console.error('Error generating summary:', error);
      this.showStatus('Failed to generate summary', 'error');
    }
  }

  async generateActions() {
    if (!this.transcript) {
      this.showStatus('No transcript available', 'error');
      return;
    }

    try {
      const actionsContent = document.getElementById('actionsContent');
      actionsContent.innerHTML = '<p class="placeholder">Extracting action items...</p>';

      const response = await chrome.runtime.sendMessage({
        type: 'EXTRACT_ACTION_ITEMS',
        text: this.transcript
      });

      if (response.success) {
        actionsContent.innerHTML = `<div class="actions-text">${this.formatMarkdown(response.actionItems)}</div>`;

        if (this.currentMeeting) {
          this.currentMeeting.actionItems = response.actionItems;
        }
      }
    } catch (error) {
      console.error('Error extracting action items:', error);
      this.showStatus('Failed to extract action items', 'error');
    }
  }

  async translateTranscript() {
    if (!this.transcript) {
      this.showStatus('No transcript available', 'error');
      return;
    }

    const targetLanguage = prompt('Enter target language code (e.g., es for Spanish, ja for Japanese):');
    if (!targetLanguage) return;

    try {
      this.showStatus('Translating...', 'info');

      const response = await chrome.runtime.sendMessage({
        type: 'TRANSLATE_TEXT',
        text: this.transcript,
        targetLanguage
      });

      if (response.success) {
        const transcriptContent = document.getElementById('transcriptContent');
        transcriptContent.innerHTML = `<div class="translated-text"><em>Translated to ${targetLanguage}:</em><br><br>${response.translation}</div>`;
        this.showStatus('Translation complete', 'success');
      }
    } catch (error) {
      console.error('Error translating:', error);
      this.showStatus('Translation failed', 'error');
    }
  }

  async copyContent(type) {
    let content = '';

    switch (type) {
      case 'transcript':
        content = this.transcript;
        break;
      case 'summary':
        content = document.getElementById('summaryContent').innerText;
        break;
      case 'actions':
        content = document.getElementById('actionsContent').innerText;
        break;
    }

    try {
      await navigator.clipboard.writeText(content);
      this.showStatus('Copied to clipboard', 'success');
    } catch (error) {
      console.error('Error copying:', error);
      this.showStatus('Failed to copy', 'error');
    }
  }

  switchTab(tabName) {
    // Update tab buttons
    document.querySelectorAll('.tab').forEach(tab => {
      tab.classList.toggle('active', tab.dataset.tab === tabName);
    });

    // Update tab panes
    document.querySelectorAll('.tab-pane').forEach(pane => {
      pane.classList.remove('active');
    });

    document.getElementById(`${tabName}Tab`).classList.add('active');
  }

  async saveMeeting(meeting) {
    try {
      await chrome.runtime.sendMessage({
        type: 'SAVE_MEETING',
        meeting
      });

      await this.loadMeetings();
    } catch (error) {
      console.error('Error saving meeting:', error);
    }
  }

  async loadMeetings() {
    try {
      const response = await chrome.runtime.sendMessage({
        type: 'GET_MEETINGS'
      });

      if (response.success) {
        this.meetings = response.meetings;
        this.renderMeetings();
      }
    } catch (error) {
      console.error('Error loading meetings:', error);
    }
  }

  renderMeetings() {
    const meetingsList = document.getElementById('meetingsList');

    if (this.meetings.length === 0) {
      meetingsList.innerHTML = '<p class="placeholder">No meetings yet</p>';
      return;
    }

    meetingsList.innerHTML = this.meetings.map(meeting => `
      <div class="meeting-card" data-id="${meeting.id}">
        <div class="meeting-card-header">
          <div class="meeting-card-title">${meeting.title}</div>
          <div class="meeting-card-date">${new Date(meeting.createdAt).toLocaleDateString()}</div>
        </div>
        <div class="meeting-card-preview">${meeting.summary || meeting.transcript?.substring(0, 100) + '...' || 'No content'}</div>
      </div>
    `).join('');

    // Add click handlers
    meetingsList.querySelectorAll('.meeting-card').forEach(card => {
      card.addEventListener('click', () => this.loadMeeting(card.dataset.id));
    });
  }

  loadMeeting(meetingId) {
    const meeting = this.meetings.find(m => m.id === meetingId);
    if (!meeting) return;

    this.transcript = meeting.transcript || '';
    this.currentMeeting = meeting;

    // Populate UI
    document.getElementById('meetingTitle').value = meeting.title;
    document.getElementById('transcriptContent').innerHTML = `<p>${meeting.transcript}</p>`;

    if (meeting.summary) {
      document.getElementById('summaryContent').innerHTML = `<div class="summary-text">${this.formatMarkdown(meeting.summary)}</div>`;
    }

    if (meeting.actionItems) {
      document.getElementById('actionsContent').innerHTML = `<div class="actions-text">${this.formatMarkdown(meeting.actionItems)}</div>`;
    }

    this.showStatus('Meeting loaded', 'success');
  }

  async clearHistory() {
    if (!confirm('Are you sure you want to clear all meeting history?')) return;

    try {
      for (const meeting of this.meetings) {
        await chrome.runtime.sendMessage({
          type: 'DELETE_MEETING',
          meetingId: meeting.id
        });
      }

      this.meetings = [];
      this.renderMeetings();
      this.showStatus('History cleared', 'success');
    } catch (error) {
      console.error('Error clearing history:', error);
      this.showStatus('Failed to clear history', 'error');
    }
  }

  async exportMeetings() {
    try {
      const dataStr = JSON.stringify(this.meetings, null, 2);
      const dataBlob = new Blob([dataStr], { type: 'application/json' });
      const url = URL.createObjectURL(dataBlob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `meetings-export-${Date.now()}.json`;
      link.click();
      this.showStatus('Meetings exported', 'success');
    } catch (error) {
      console.error('Error exporting:', error);
      this.showStatus('Export failed', 'error');
    }
  }

  async importMeetings(event) {
    const file = event.target.files[0];
    if (!file) return;

    try {
      const text = await file.text();
      const meetings = JSON.parse(text);

      for (const meeting of meetings) {
        await this.saveMeeting(meeting);
      }

      this.showStatus('Meetings imported', 'success');
    } catch (error) {
      console.error('Error importing:', error);
      this.showStatus('Import failed', 'error');
    }
  }

  openSettings() {
    document.getElementById('settingsModal').classList.remove('hidden');
  }

  closeSettings() {
    document.getElementById('settingsModal').classList.add('hidden');
  }

  showStatus(message, type = 'info') {
    const statusBanner = document.getElementById('apiStatus');
    const statusText = statusBanner.querySelector('.status-text');

    statusText.textContent = message;
    statusBanner.className = `status-banner ${type}`;
    statusBanner.classList.remove('hidden');

    setTimeout(() => {
      if (type !== 'error') {
        statusBanner.classList.add('hidden');
      }
    }, 3000);
  }

  formatMarkdown(text) {
    // Simple markdown formatting
    return text
      .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
      .replace(/\*(.*?)\*/g, '<em>$1</em>')
      .replace(/\n/g, '<br>')
      .replace(/^- (.+)/gm, '<li>$1</li>')
      .replace(/(<li>.*<\/li>)/s, '<ul>$1</ul>');
  }

  loadSampleTranscript() {
    const sampleTranscript = `Meeting started at 2:00 PM on January 23rd, 2025.

John opened the meeting discussing Q1 budget priorities. He emphasized we need to finalize all numbers by Friday, January 26th, to meet the board deadline.

Sarah mentioned the financial reports are nearly complete. She committed to sending them to the team by Wednesday morning. The reports will include detailed breakdowns of marketing spend and ROI metrics.

The team then discussed the new marketing campaign. After reviewing several options, everyone agreed to focus primarily on social media advertising, particularly LinkedIn and Instagram. Mike volunteered to create mockups for the new landing page by end of week.

Jane raised important concerns about the aggressive timeline. She suggested we might need to bring in additional design resources to meet all deliverables. The team acknowledged this and agreed to revisit resource allocation.

Next steps: Schedule a follow-up meeting next Monday, January 29th at 10:00 AM to review progress on all action items. John will send calendar invites.

Meeting adjourned at 3:15 PM.`;

    // Load into transcript
    this.transcript = sampleTranscript;

    const transcriptContent = document.getElementById('transcriptContent');
    transcriptContent.innerHTML = `<p style="white-space: pre-wrap;">${sampleTranscript}</p>`;

    // Create mock meeting
    this.currentMeeting = {
      title: 'Sample Meeting - Q1 Budget Planning',
      startTime: Date.now(),
      transcript: sampleTranscript,
      summary: '',
      actionItems: ''
    };

    this.showStatus('Sample transcript loaded! Try generating a summary or extracting action items.', 'success');
  }
}

// Initialize UI when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
  new MeetingIntelligenceUI();
});
