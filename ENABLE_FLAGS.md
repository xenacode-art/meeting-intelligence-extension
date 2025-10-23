# Enable Chrome AI Flags - Quick Guide

## ✅ Step-by-Step Instructions

Copy and paste each URL into Chrome's address bar, then enable as shown:

### 1. Optimization Guide (Model Download)
```
chrome://flags/#optimization-guide-on-device-model
```
**Set to:** `Enabled BypassPerfRequirement`
✅ (You already have this one!)

---

### 2. Prompt API (Core AI)
```
chrome://flags/#prompt-api-for-gemini-nano
```
**Set to:** `Enabled`
✅ (You already have this one!)

---

### 3. Prompt API Multimodal (Audio Input) 🎙️
```
chrome://flags/#prompt-api-for-gemini-nano-multimodal-input
```
**Set to:** `Enabled`
❗ **IMPORTANT for audio transcription!**

---

### 4. Summarizer API 📝
```
chrome://flags/#summarization-api-for-gemini-nano
```
**Set to:** `Enabled`
❗ **Required for meeting summaries!**

---

### 5. Writer API ✍️
```
chrome://flags/#writer-api-for-gemini-nano
```
**Set to:** `Enabled`
❗ **Required for action items!**

---

### 6. Rewriter API (Proofreader) 🖊️
```
chrome://flags/#rewriter-api-for-gemini-nano
```
**Set to:** `Enabled`
❗ **Required for grammar correction!**

---

### 7. Translation API 🌐
```
chrome://flags/#translation-api
```
**Set to:** `Enabled`
❗ **Required for multilingual support!**

---

## 🔄 After Enabling All Flags

Click the **"Relaunch"** button at the bottom of the Chrome flags page to restart Chrome.

---

## ✅ How to Verify APIs Are Working

After restarting Chrome:

1. Open Chrome DevTools (F12)
2. Go to the Console tab
3. Paste and run these commands one by one:

```javascript
// Check Prompt API
await ai.languageModel.capabilities()
// Should show: { available: "readily" }

// Check Summarizer API
await ai.summarizer.capabilities()
// Should show: { available: "readily" }

// Check Writer API
await ai.writer.capabilities()
// Should show: { available: "readily" }

// Check Translator API
await ai.translator.capabilities()
// Should show available translators

// Check Rewriter API
await ai.rewriter.capabilities()
// Should show: { available: "readily" }
```

---

## 📊 Expected Results

When all APIs are ready, you should see:
- ✅ **promptAPI**: true
- ✅ **summarizer**: true
- ✅ **writer**: true
- ✅ **translator**: true
- ✅ **proofreader**: true

The extension's error banner will disappear!

---

## ⏱️ First-Time Model Download

**IMPORTANT**: The first time you enable these flags, Chrome needs to download the Gemini Nano model (~22 GB).

This happens automatically in the background, but can take:
- ⏱️ **10-30 minutes** on good internet
- 💾 Requires **22 GB free disk space**
- 📡 Best on **unmetered WiFi**

You can check download status:
```javascript
const session = await ai.languageModel.create({
  monitor(m) {
    m.addEventListener("downloadprogress", e => {
      console.log(`Downloaded ${e.loaded * 100}%`);
    });
  }
});
```

---

## 🚨 Troubleshooting

**If APIs still show "not available" after restarting:**

1. Wait 5-10 minutes (model might be downloading)
2. Check you have 22GB+ free disk space
3. Try Chrome Canary (latest version): https://www.google.com/chrome/canary/
4. Check Chrome version: Must be 138+ (current is 141+)

**To check Chrome version:**
```
chrome://version/
```

---

## 📱 Quick Copy-Paste List

For convenience, here are all flag URLs:

```
chrome://flags/#optimization-guide-on-device-model
chrome://flags/#prompt-api-for-gemini-nano
chrome://flags/#prompt-api-for-gemini-nano-multimodal-input
chrome://flags/#summarization-api-for-gemini-nano
chrome://flags/#writer-api-for-gemini-nano
chrome://flags/#rewriter-api-for-gemini-nano
chrome://flags/#translation-api
```

Set all to **"Enabled"** (except first one which should be **"Enabled BypassPerfRequirement"**)

Then click **"Relaunch"** at the bottom!
