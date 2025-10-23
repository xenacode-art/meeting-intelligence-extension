# Meeting Intelligence - Setup & Testing Guide

This guide will help you set up and test the Meeting Intelligence Extension for the Chrome Built-in AI Challenge 2025.

---

## 🔧 Prerequisites Setup

### 1. Chrome Browser Setup

**Required Version**: Chrome 138 or later (Chrome Dev/Canary recommended for latest AI features)

Download Chrome Canary: https://www.google.com/chrome/canary/

### 2. Enable Chrome Built-in AI Flags

Open Chrome and enable these flags (required for AI APIs):

1. **Gemini Nano Model**:
   ```
   chrome://flags/#optimization-guide-on-device-model
   → Set to "Enabled BypassPerfRequirement"
   ```

2. **Prompt API** (for audio transcription):
   ```
   chrome://flags/#prompt-api-for-gemini-nano
   → Set to "Enabled"
   ```

3. **Prompt API Multimodal** (for audio input):
   ```
   chrome://flags/#prompt-api-for-gemini-nano-multimodal-input
   → Set to "Enabled"
   ```

4. **Summarizer API**:
   ```
   chrome://flags/#summarization-api-for-gemini-nano
   → Set to "Enabled"
   ```

5. **Writer API**:
   ```
   chrome://flags/#writer-api-for-gemini-nano
   → Set to "Enabled"
   ```

6. **Rewriter API** (Proofreader):
   ```
   chrome://flags/#rewriter-api-for-gemini-nano
   → Set to "Enabled"
   ```

7. **Translator API**:
   ```
   chrome://flags/#translation-api
   → Set to "Enabled"
   ```

8. **Side Panel API**:
   ```
   chrome://flags/#side-panel-api
   → Set to "Enabled"
   ```

**Important**: After enabling all flags, click **"Relaunch"** to restart Chrome.

### 3. Verify AI Model Download

1. Open Chrome DevTools Console (F12)
2. Run this command:
   ```javascript
   await ai.languageModel.capabilities()
   ```
3. If you see `available: "readily"`, the model is downloaded
4. If you see `available: "after-download"`, the model will download on first use (~22GB, takes 10-30 minutes)

---

## 📦 Installation

### Step 1: Clone/Download the Extension

```bash
# If you have git
git clone https://github.com/yourusername/meeting-intelligence-extension.git

# Or download and extract the ZIP file
```

### Step 2: Load Extension in Chrome

1. Open Chrome and go to: `chrome://extensions/`
2. Enable **"Developer mode"** (toggle in top-right corner)
3. Click **"Load unpacked"**
4. Navigate to and select the `meeting-intelligence-extension` folder
5. The extension should appear in your extensions list

### Step 3: Pin Extension to Toolbar

1. Click the puzzle icon (🧩) in Chrome toolbar
2. Find "Meeting Intelligence - AI Meeting Assistant"
3. Click the pin icon to keep it visible

---

## ✅ Testing the Extension

### Test 1: Check API Availability

1. Click the extension icon in toolbar
2. Popup should show: "✓ All AI features ready"
3. If you see "⚠ Some AI features unavailable":
   - Check that all flags are enabled
   - Wait for model to download
   - Check DevTools Console for errors

### Test 2: Open Side Panel

1. Click **"Open Meeting Panel"** in popup
2. Side panel should open on the right side
3. You should see:
   - Header with "Meeting Intelligence"
   - Recording controls
   - Tabs for Transcript, Summary, Action Items
   - Recent Meetings section

### Test 3: Test Audio Transcription

**Option A: Use a Real Meeting**

1. Join a Google Meet/Zoom/Teams meeting
2. Open the extension side panel
3. Click **"Start Recording"**
4. Chrome will ask for tab capture permission - **Allow**
5. Speak or let others speak in the meeting
6. Watch transcript appear in real-time (updates every 5 seconds)
7. Click **"Stop Recording"** when done

**Option B: Use a YouTube Video**

1. Open a YouTube video with clear speech (e.g., TED Talk)
2. Open the extension side panel
3. Click **"Start Recording"**
4. Play the video
5. Transcript should appear in the Transcript tab
6. Stop recording after 30-60 seconds

### Test 4: Generate Summary

1. After recording (or with existing transcript), click the **"Summary"** tab
2. Select summary type: "Key Points", "TL;DR", or "Headline"
3. Click **"Generate"** button
4. Wait 2-5 seconds
5. Summary should appear in the content area
6. Try different summary types to see variations

### Test 5: Extract Action Items

1. Record or load a meeting that mentions tasks (e.g., "John will send the report by Friday")
2. Click the **"Action Items"** tab
3. Click **"Generate"** button
4. Wait 2-5 seconds
5. Action items should appear as a formatted list/checklist

### Test 6: Translation

1. With a transcript available, go to **"Transcript"** tab
2. Click **"🌐 Translate"** button
3. Enter a language code when prompted:
   - `es` for Spanish
   - `ja` for Japanese
   - `fr` for French
4. Translated text should appear

### Test 7: Copy to Clipboard

1. Click any **"📋 Copy"** button
2. Paste into a text editor (Ctrl+V / Cmd+V)
3. Content should be copied correctly

### Test 8: Meeting History

1. Record and save a few meetings
2. Scroll down to **"Recent Meetings"** section
3. Click on a past meeting card
4. Meeting should load with transcript, summary, and action items

### Test 9: Export/Import

1. Click the settings icon (gear) in header
2. Click **"Export Meetings"**
3. JSON file should download
4. Click **"Import Meetings"** and select the downloaded file
5. Meetings should be imported successfully

---

## 🐛 Troubleshooting

### Problem: "AI APIs not available" error

**Solutions**:
- Verify all Chrome flags are enabled
- Restart Chrome completely
- Check Chrome version (must be 138+)
- Try Chrome Canary for latest features
- Check `chrome://components/` for "Optimization Guide On Device Model" status

### Problem: No audio captured / blank transcript

**Solutions**:
- Grant tab capture permission when prompted
- Ensure the tab has audio playing
- Check browser console for errors (F12)
- Try a different tab/website with audio
- Verify microphone/audio is working in the meeting

### Problem: Model download stuck/slow

**Solutions**:
- Ensure you have 22GB+ free disk space
- Use unmetered WiFi connection
- Check download progress in DevTools:
  ```javascript
  ai.languageModel.create({
    monitor(m) {
      m.addEventListener("downloadprogress", e => {
        console.log(`Downloaded ${e.loaded * 100}%`);
      });
    }
  });
  ```

### Problem: Extension not loading

**Solutions**:
- Check for errors in `chrome://extensions/`
- Click "Errors" button if shown
- Ensure all files are present in the extension folder
- Try removing and re-adding the extension

### Problem: Summary/Action Items not generating

**Solutions**:
- Ensure you have a transcript first
- Check DevTools console for API errors
- Verify Writer/Summarizer APIs are enabled in flags
- Try with a longer transcript (at least 100 words)

---

## 🧪 Demo Script for Video

Here's a suggested script for creating your demo video:

### Scene 1: Introduction (0:00-0:20)

> "Hi! I'm [Your Name], and I'm excited to show you Meeting Intelligence - an AI-powered meeting assistant built with Chrome's new Built-in AI APIs."

*Show extension icon in Chrome toolbar*

### Scene 2: The Problem (0:20-0:40)

> "We've all experienced this: attending countless meetings, losing track of decisions, forgetting action items, and struggling to remember what was discussed."

*Show a messy notepad with incomplete notes*

### Scene 3: The Solution (0:40-1:00)

> "Meeting Intelligence solves this with privacy-first, on-device AI. Everything runs locally using Chrome's Gemini Nano - no cloud, no cost, no privacy concerns."

*Click extension icon, show popup*

### Scene 4: Demo - Recording (1:00-1:30)

> "Let me show you how it works. I'm joining a Google Meet call, and I'll click 'Start Recording' to begin transcription."

*Start recording, show live transcript appearing*

> "As people speak, the transcript appears in real-time, all processed on my device using the Prompt API's new multimodal audio capabilities."

### Scene 5: Demo - Summarization (1:30-2:00)

> "After the meeting, I can generate a smart summary. I'll click 'Generate' in the Summary tab..."

*Show summary being generated*

> "...and instantly get key points from the entire meeting, powered by the Summarizer API."

### Scene 6: Demo - Action Items (2:00-2:20)

> "Even better, it can extract action items automatically using the Writer API."

*Show action items being generated*

> "Now I have a clear list of who needs to do what."

### Scene 7: Extra Features (2:20-2:40)

> "I can translate transcripts for international teams using the Translator API, copy content to share, and browse my entire meeting history - all stored locally and privately."

*Show translation and history features*

### Scene 8: Conclusion (2:40-3:00)

> "Meeting Intelligence uses all five Chrome Built-in AI APIs - Prompt, Summarizer, Writer, Translator, and Proofreader - to make meetings productive again. And it's completely free, private, and works offline. Thanks for watching!"

*Show extension icon and GitHub repo*

---

## 📸 Screenshots to Capture

For your submission, capture these screenshots:

1. **Main interface** - Side panel with all tabs visible
2. **Live transcription** - Transcript tab with text appearing
3. **Summary generation** - Summary tab with generated summary
4. **Action items** - Action items tab with extracted tasks
5. **Meeting history** - History section with saved meetings
6. **Settings modal** - Settings panel open
7. **Popup** - Extension popup with quick actions
8. **API status** - Status banner showing all APIs ready

---

## 📝 Submission Checklist

Before submitting to the hackathon:

- [ ] All Chrome flags enabled and verified
- [ ] Extension loads without errors
- [ ] All 5+ AI APIs working
- [ ] Demo video recorded (<3 minutes)
- [ ] Demo video uploaded to YouTube/Vimeo
- [ ] README.md complete with API descriptions
- [ ] LICENSE file added (open source required)
- [ ] GitHub repository created and public
- [ ] All code commented and clean
- [ ] Test with real meeting scenarios
- [ ] Screenshots captured
- [ ] Feedback form completed (for bonus prize)

---

## 🎥 Video Recording Tips

1. **Use a screen recorder**:
   - OBS Studio (free, cross-platform)
   - Loom (easy, web-based)
   - QuickTime (Mac)

2. **Record in 1080p or higher**

3. **Show the extension in action**:
   - Real meeting or YouTube video with speech
   - Real-time transcription
   - All major features

4. **Keep it under 3 minutes** (hackathon requirement)

5. **Include clear audio narration**

6. **Add captions if possible**

---

## 💡 Tips for Judges

When evaluating this extension, judges should note:

1. **Multi-API Usage**: Uses all 5 major Chrome Built-in AI APIs
2. **Multimodal Innovation**: Leverages new audio input capability
3. **Real-World Value**: Solves genuine meeting productivity problem
4. **Privacy-First**: All processing on-device
5. **Hybrid Architecture**: Optional cloud sync (Firebase integration ready)
6. **Polished UX**: Modern, intuitive interface
7. **Offline Support**: Works without internet after model download
8. **Extensibility**: Platform detection for future meeting integrations

---

## 📚 Additional Resources

- **Chrome Built-in AI Docs**: https://developer.chrome.com/docs/ai
- **Prompt API**: https://developer.chrome.com/docs/ai/prompt-api
- **Summarizer API**: https://developer.chrome.com/docs/ai/summarizer-api
- **Writer API**: https://developer.chrome.com/docs/ai/writer-api
- **Early Preview Program**: Sign up at Chrome for Developers

---

## 🤝 Support

If you encounter issues during testing:

1. Check this guide's Troubleshooting section
2. Review Chrome DevTools Console for errors
3. Open an issue on GitHub
4. Check Chrome Built-in AI documentation

---

**Happy Testing! Good luck with the hackathon! 🚀**
