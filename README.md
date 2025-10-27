# Meeting Intelligence - AI Meeting Assistant

<div align="center">

![Chrome Built-in AI](https://img.shields.io/badge/Chrome-Built--in_AI-4285F4?style=for-the-badge&logo=google-chrome&logoColor=white)
![Gemini Nano](https://img.shields.io/badge/Gemini-Nano-8E75FF?style=for-the-badge&logo=google&logoColor=white)
![Manifest V3](https://img.shields.io/badge/Manifest-V3-34A853?style=for-the-badge)

**AI-powered meeting transcription, summarization, and action item extraction using Chrome's built-in Gemini Nano**

[Features](#features) • [Installation](#installation) • [Usage](#usage) • [APIs Used](#apis-used) • [Privacy](#privacy)

</div>

---

## 🎯 Problem Statement

In today's remote-first world, professionals attend countless video meetings daily, but valuable information often gets lost:

- **Context Loss**: Key decisions and discussions fade from memory
- **Action Item Tracking**: Tasks mentioned verbally are forgotten
- **Language Barriers**: International teams struggle with real-time comprehension
- **Meeting Fatigue**: No easy way to review what was discussed
- **Privacy Concerns**: Cloud-based solutions expose sensitive meeting content

**Meeting Intelligence** solves these problems with **privacy-first, on-device AI** that works offline and keeps your sensitive discussions local.

---

## ✨ Features

### 🎙️ **Live Meeting Transcription**
- Real-time audio capture from browser tabs
- Accurate speech-to-text using Prompt API with multimodal audio input
- Timestamped transcripts for easy reference
- Works with Google Meet, Zoom, Teams, and more

### 📝 **Smart Summarization**
- Generate concise meeting summaries in multiple formats:
  - **Key Points**: Bullet-point highlights
  - **TL;DR**: Quick one-paragraph summary
  - **Headline**: Single-line meeting summary
- Powered by Summarizer API with Gemini Nano

### ✅ **Action Item Extraction**
- Automatically identify tasks, decisions, and follow-ups
- Formatted as markdown checklists
- Ready to copy to your task manager
- Uses Writer API for intelligent extraction

### 🌐 **Multilingual Support**
- Translate transcripts to your preferred language
- Support for Spanish, Japanese, and more
- Perfect for international teams
- Powered by Translator API

### 🖊️ **Grammar & Proofreading**
- Polish meeting notes before sharing
- Correct grammar and spelling errors
- Maintain professional quality
- Uses Proofreader/Rewriter API

### 💾 **Local Storage & History**
- Browse past meetings
- Search through transcripts
- Export/import meeting data
- Everything stored locally in your browser

### 🔒 **Privacy-First Design**
- **All processing happens on your device**
- No data sent to external servers
- Works completely offline
- Sensitive meeting content never leaves your machine

### ☁️ **Hybrid Cloud Sync** (Optional)
- Opt-in Firebase integration for team sharing
- Share sanitized summaries with your team
- Control what gets synced to the cloud

---

## 🚀 Installation

### Prerequisites

1. **Chrome Browser** (version 138 or later)
   - Windows 10/11, macOS 13+, Linux, or ChromeOS (Chromebook Plus)

2. **Hardware Requirements**:
   - **22 GB free disk space** (for Gemini Nano model)
   - **GPU with 4+ GB VRAM** (or CPU with 16 GB RAM, 4+ cores)
   - Unmetered internet connection (for initial model download)

3. **Enable Chrome Built-in AI** (Early Preview Program):
   - Go to `chrome://flags/#optimization-guide-on-device-model`
   - Select **"Enabled BypassPerfRequirement"**
   - Go to `chrome://flags/#prompt-api-for-gemini-nano`
   - Select **"Enabled"**
   - Go to `chrome://flags/#prompt-api-for-gemini-nano-multimodal-input`
   - Select **"Enabled"**
   - Go to `chrome://flags/#summarization-api-for-gemini-nano`
   - Select **"Enabled"**
   - Go to `chrome://flags/#writer-api-for-gemini-nano`
   - Select **"Enabled"**
   - Go to `chrome://flags/#rewriter-api-for-gemini-nano`
   - Select **"Enabled"**
   - Go to `chrome://flags/#translation-api`
   - Select **"Enabled"**
   - **Restart Chrome**

### Install Extension

#### Option 1: Load Unpacked (Development)

1. Clone or download this repository
2. Open Chrome and navigate to `chrome://extensions/`
3. Enable **"Developer mode"** (toggle in top-right)
4. Click **"Load unpacked"**
5. Select the `meeting-intelligence-extension` folder
6. The extension icon should appear in your toolbar

#### Option 2: Chrome Web Store (Coming Soon)

The extension will be submitted to the Chrome Web Store after the hackathon.

### First Launch

1. Click the extension icon to open the popup
2. Click **"Open Meeting Panel"** to open the side panel
3. Wait for AI models to download (this happens automatically on first use)
4. Check the status banner - when all APIs are ready, you're good to go!

---

## 📖 Usage

### Basic Workflow

1. **Start a Meeting**:
   - Join your video meeting (Google Meet, Zoom, Teams, etc.)
   - Click the extension icon and open the side panel
   - Click **"Start Recording"** to begin transcription

2. **During the Meeting**:
   - Watch live transcript appear in real-time
   - Transcription happens automatically with timestamps
   - Give your meeting a title (optional)

3. **After the Meeting**:
   - Click **"Stop Recording"** to end transcription
   - Meeting is automatically saved to history

4. **Generate Insights**:
   - Switch to **"Summary"** tab and click **"Generate"**
   - Choose summary type (Key Points, TL;DR, or Headline)
   - Switch to **"Action Items"** tab and click **"Generate"**
   - Review extracted tasks and decisions

5. **Share & Export**:
   - Click **"Copy"** buttons to copy content
   - Use **"Translate"** to convert to another language
   - Export all meetings as JSON for backup

### Tips & Tricks

- **Grant Tab Capture Permission**: When starting recording, Chrome will ask for permission to capture tab audio
- **Clear Audio**: For best transcription, ensure good audio quality in your meetings
- **Organize with Titles**: Give meetings descriptive titles for easy searching
- **Regular Exports**: Export your meeting history periodically for backup
- **Offline Support**: Everything works offline after initial model download

---

## 🔧 APIs Used

This extension showcases **all major Chrome Built-in AI APIs**:

| API | Purpose | Usage in Extension |
|-----|---------|-------------------|
| **Prompt API** (Multimodal) | Audio transcription | Convert meeting audio to text in real-time |
| **Summarizer API** | Text summarization | Generate meeting summaries (key points, TL;DR, headlines) |
| **Writer API** | Content generation | Extract and format action items from transcripts |
| **Translator API** | Language translation | Translate transcripts to different languages |
| **Proofreader API** (Rewriter) | Grammar correction | Polish meeting notes before sharing |

### Why Built-in AI?

✅ **Privacy**: All processing on-device, no data leaves your machine
✅ **Speed**: Near-instant responses with local inference
✅ **Cost**: No API fees or quotas
✅ **Offline**: Works without internet connection
✅ **Reliability**: No network latency or server downtime


## 🔐 Privacy & Security

### Data Handling

- **Transcripts**: Stored locally in `chrome.storage.local`
- **AI Processing**: All happens on your device via Gemini Nano
- **Network**: No external API calls for core features
- **Audio**: Captured from tab, never uploaded anywhere
- **Cloud Sync**: Completely optional, opt-in only

### What Data Is Stored?

```javascript
{
  id: "unique-meeting-id",
  title: "Meeting title",
  transcript: "Full meeting transcript",
  summary: "Generated summary",
  actionItems: "Extracted action items",
  createdAt: timestamp,
  updatedAt: timestamp
}
```

### Permissions Explained

| Permission | Why Needed |
|-----------|------------|
| `storage` | Save meetings and settings locally |
| `tabCapture` | Capture audio from meeting tabs |
| `sidePanel` | Display persistent side panel UI |
| `offscreen` | Handle audio processing in background |

**No remote servers. No tracking. No analytics.**

---

## 🛠️ Technical Architecture

```
┌─────────────────────────────────────────┐
│     Chrome Extension (Manifest V3)       │
├─────────────────────────────────────────┤
│  UI Layer:                               │
│  - Side Panel (main interface)           │
│  - Popup (quick access)                  │
│  - Content Script (meeting detection)    │
├─────────────────────────────────────────┤
│  Service Worker (Background):           │
│  - AI Manager (API orchestration)       │
│  - Audio Capture Service                │
│  - Storage Manager                       │
├─────────────────────────────────────────┤
│  Chrome Built-in AI APIs:               │
│  - Prompt API (audio transcription)     │
│  - Summarizer API (summaries)           │
│  - Writer API (action items)            │
│  - Translator API (i18n)                │
│  - Proofreader API (grammar)            │
└─────────────────────────────────────────┘
```

### Key Technologies

- **Manifest V3**: Modern Chrome extension architecture
- **ES6 Modules**: Clean, modular JavaScript
- **Chrome Built-in AI**: Gemini Nano powered APIs
- **Service Workers**: Persistent background processing
- **Chrome Storage API**: Local data persistence

---

## 📊 Performance

- **Transcription Latency**: ~1-2 seconds per 5-second audio chunk
- **Summary Generation**: ~2-3 seconds for typical meeting
- **Action Item Extraction**: ~2-4 seconds
- **Storage**: ~1MB per hour of meeting (transcript + metadata)
- **Model Size**: 22 GB (one-time download, shared across all apps)

---

## 🚧 Future Enhancements

- [ ] Speaker diarization (identify different speakers)
- [ ] Integration with calendar apps
- [ ] Automatic meeting detection and recording
- [ ] PDF export of meeting notes
- [ ] Slack/Teams integration for sharing
- [ ] Voice commands for hands-free control
- [ ] Mobile companion app
- [ ] Custom vocabulary for technical terms

---

## 🤝 Contributing

This project was built for the **Google Chrome Built-in AI Challenge 2025**. After the hackathon, we welcome contributions!

---

## 📄 License

MIT License - see [LICENSE](LICENSE) file for details

---

## 🙏 Acknowledgments

- **Google Chrome Team** for pioneering built-in AI APIs
- **Gemini Nano** for powering on-device intelligence
- **Chrome Built-in AI Challenge 2025** for the inspiration

---

## 📞 Contact & Support

- **Issues**: [GitHub Issues](https://github.com/yourusername/meeting-intelligence/issues)
- **Feedback**: Submit via hackathon feedback form
- **Twitter**: [@kajaobinna@gmail.com](https://twitter.com/xenacode)

---

<div align="center">

**Built with ❤️ using Chrome's Built-in AI**

*Submitted to Google Chrome Built-in AI Challenge 2025*

</div>
