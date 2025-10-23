// Popup JavaScript

document.getElementById('openSidePanelBtn').addEventListener('click', async () => {
  // Open side panel
  const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
  await chrome.sidePanel.open({ tabId: tab.id });
  window.close();
});

document.getElementById('quickRecordBtn').addEventListener('click', async () => {
  try {
    // Open side panel first
    const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
    await chrome.sidePanel.open({ tabId: tab.id });

    // Send message to start recording
    await chrome.runtime.sendMessage({
      type: 'START_RECORDING',
      data: { tabId: tab.id, audioSource: 'tab' }
    });

    window.close();
  } catch (error) {
    console.error('Error starting quick record:', error);
    document.getElementById('status').textContent = 'Error starting recording';
  }
});

// Check API status
chrome.runtime.sendMessage({ type: 'CHECK_API_AVAILABILITY' }, (response) => {
  if (response?.success && response.availability) {
    const statusEl = document.getElementById('status');
    const { promptAPI, summarizer, writer } = response.availability;

    if (promptAPI && summarizer && writer) {
      statusEl.textContent = '✓ All AI features ready';
      statusEl.style.background = 'rgba(52, 168, 83, 0.3)';
    } else {
      statusEl.textContent = '⚠ Some AI features unavailable';
      statusEl.style.background = 'rgba(251, 188, 4, 0.3)';
    }
  }
});
