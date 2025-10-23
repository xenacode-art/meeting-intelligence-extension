// Content Script - Injected into web pages

console.log('Meeting Intelligence Extension loaded');

// Listen for messages from background script
chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  if (message.type === 'INJECT_UI') {
    // Could inject floating UI on meeting platforms
    console.log('Inject UI message received');
  }

  sendResponse({ received: true });
});

// Detect meeting platforms (Google Meet, Zoom, Teams, etc.)
const meetingPlatforms = {
  'meet.google.com': 'Google Meet',
  'zoom.us': 'Zoom',
  'teams.microsoft.com': 'Microsoft Teams',
  'whereby.com': 'Whereby',
  'webex.com': 'Webex'
};

const currentDomain = window.location.hostname;
const platform = Object.keys(meetingPlatforms).find(domain => currentDomain.includes(domain));

if (platform) {
  console.log(`Meeting platform detected: ${meetingPlatforms[platform]}`);

  // Notify background script
  chrome.runtime.sendMessage({
    type: 'MEETING_PLATFORM_DETECTED',
    platform: meetingPlatforms[platform],
    url: window.location.href
  });

  // Could add platform-specific integrations here
  // For example, detect when a meeting starts/ends
}

// Export for use in other scripts
window.meetingIntelligence = {
  platform,
  isActive: true
};
