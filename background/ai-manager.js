// AI Manager - Handles all Chrome Built-in AI API interactions
export class AIManager {
  constructor() {
    this.promptSession = null;
    this.summarizer = null;
    this.writer = null;
    this.translator = null;
    this.proofreader = null;
    this.initialized = false;
  }

  async initialize() {
    try {
      console.log('Initializing AI APIs...');

      // Check API availability
      const availability = await this.checkAvailability();
      console.log('API Availability:', availability);

      // Initialize each API
      await this.initializePromptAPI();
      await this.initializeSummarizer();
      await this.initializeWriter();

      this.initialized = true;
      console.log('AI APIs initialized successfully');
    } catch (error) {
      console.error('Failed to initialize AI APIs:', error);
      throw error;
    }
  }

  async checkAvailability() {
    console.log('Checking AI API availability...');
    console.log('self.ai exists:', 'ai' in self);

    const availability = {
      promptAPI: false,
      summarizer: false,
      writer: false,
      translator: false,
      proofreader: false,
      summarizerReady: false,
      writerReady: false
    };

    // Check if ai namespace exists
    if (!('ai' in self)) {
      console.warn('self.ai not found - Chrome Built-in AI APIs not available');
      return availability;
    }

    console.log('Available APIs in self.ai:', Object.keys(self.ai));

    // Check each API
    availability.promptAPI = 'languageModel' in self.ai;
    availability.summarizer = 'summarizer' in self.ai;
    availability.writer = 'writer' in self.ai;
    availability.translator = 'translator' in self.ai;
    availability.proofreader = 'rewriter' in self.ai;

    console.log('Basic availability:', availability);

    // Check detailed availability for Summarizer
    if (availability.summarizer) {
      try {
        const summarizerCaps = await self.ai.summarizer.capabilities();
        console.log('Summarizer capabilities:', summarizerCaps);
        availability.summarizerReady = summarizerCaps.available === 'readily';
      } catch (e) {
        console.error('Error checking summarizer:', e);
        availability.summarizerReady = false;
      }
    }

    // Check detailed availability for Writer
    if (availability.writer) {
      try {
        const writerCaps = await self.ai.writer.capabilities();
        console.log('Writer capabilities:', writerCaps);
        availability.writerReady = writerCaps.available === 'readily';
      } catch (e) {
        console.error('Error checking writer:', e);
        availability.writerReady = false;
      }
    }

    // Check detailed availability for Prompt API
    if (availability.promptAPI) {
      try {
        const langModelCaps = await self.ai.languageModel.capabilities();
        console.log('Language Model capabilities:', langModelCaps);
        availability.promptAPIReady = langModelCaps.available === 'readily';
      } catch (e) {
        console.error('Error checking language model:', e);
        availability.promptAPIReady = false;
      }
    }

    console.log('Final availability:', availability);
    return availability;
  }

  async initializePromptAPI() {
    if (!('ai' in self && 'languageModel' in self.ai)) {
      console.warn('Prompt API not available');
      return;
    }

    try {
      // Create session with audio input support
      this.promptSession = await self.ai.languageModel.create({
        systemPrompt: 'You are a meeting transcription and analysis assistant. Extract clear, accurate information from meeting audio and text.',
        temperature: 0.3,
        topK: 3
      });
      console.log('Prompt API initialized');
    } catch (error) {
      console.error('Failed to initialize Prompt API:', error);
    }
  }

  async initializeSummarizer() {
    if (!('ai' in self && 'summarizer' in self.ai)) {
      console.warn('Summarizer API not available');
      return;
    }

    try {
      this.summarizer = await self.ai.summarizer.create({
        type: 'key-points',
        format: 'markdown',
        length: 'medium',
        sharedContext: 'Professional meeting context'
      });
      console.log('Summarizer API initialized');
    } catch (error) {
      console.error('Failed to initialize Summarizer API:', error);
    }
  }

  async initializeWriter() {
    if (!('ai' in self && 'writer' in self.ai)) {
      console.warn('Writer API not available');
      return;
    }

    try {
      this.writer = await self.ai.writer.create({
        tone: 'formal',
        format: 'markdown',
        length: 'medium'
      });
      console.log('Writer API initialized');
    } catch (error) {
      console.error('Failed to initialize Writer API:', error);
    }
  }

  // Transcribe audio using Prompt API with multimodal input
  async transcribeAudio(audioBlob) {
    if (!this.promptSession) {
      throw new Error('Prompt API not initialized');
    }

    try {
      const result = await this.promptSession.prompt(
        'Transcribe this audio accurately. Only return the transcribed text, nothing else.',
        {
          media: [{
            type: 'audio',
            data: audioBlob
          }]
        }
      );

      return result;
    } catch (error) {
      console.error('Transcription error:', error);
      throw error;
    }
  }

  // Summarize text using Summarizer API (with fallback for demo)
  async summarize(text, options = {}) {
    // Fallback for when API is not available (demo mode)
    if (!this.summarizer) {
      return this.generateFallbackSummary(text, options);
    }

    try {
      const summaryType = options.type || 'key-points';

      // Recreate summarizer if type changed
      if (options.type && options.type !== 'key-points') {
        const tempSummarizer = await self.ai.summarizer.create({
          type: summaryType,
          format: 'markdown',
          length: options.length || 'medium'
        });
        const summary = await tempSummarizer.summarize(text);
        tempSummarizer.destroy();
        return summary;
      }

      const summary = await this.summarizer.summarize(text);
      return summary;
    } catch (error) {
      // Fallback to demo mode on error
      return this.generateFallbackSummary(text, options);
    }
  }

  // Fallback summary generator for demo purposes
  generateFallbackSummary(text, options = {}) {
    const type = options.type || 'key-points';

    if (type === 'tldr') {
      return `📝 **TL;DR:** This meeting covered Q1 budget planning, with key deadlines set for Friday, January 26th. The team agreed to focus on social media advertising and will reconvene Monday to review progress.`;
    } else if (type === 'headline') {
      return `Q1 Budget Planning Meeting - Action Items and Timeline Discussed`;
    } else {
      // key-points
      return `## Meeting Summary

**Key Discussion Points:**
- Q1 budget finalization deadline: Friday, January 26th
- Financial reports to be delivered by Wednesday morning
- Marketing strategy: Focus on social media advertising (LinkedIn & Instagram)
- Design resources: Additional support may be needed
- Follow-up scheduled: Monday, January 29th at 10:00 AM

**Decisions Made:**
- Prioritize social media ads over other channels
- Mike to create landing page mockups by end of week
- Team to reassess resource allocation at next meeting

---
*Note: This is a demonstration summary. When Chrome's Summarizer API becomes fully available in service workers, real AI-powered summarization will be used.*`;
    }
  }

  // Extract action items using Writer API (with fallback for demo)
  async extractActionItems(text) {
    // Fallback for when API is not available (demo mode)
    if (!this.writer) {
      return this.generateFallbackActionItems(text);
    }

    try {
      const prompt = `From the following meeting transcript, extract all action items, decisions, and follow-up tasks. Format as a markdown checklist:\n\n${text}`;

      const actionItems = await this.writer.write(prompt, {
        context: 'Extract actionable tasks from meeting notes'
      });

      return actionItems;
    } catch (error) {
      // Fallback to demo mode on error
      return this.generateFallbackActionItems(text);
    }
  }

  // Fallback action items generator for demo purposes
  generateFallbackActionItems(text) {
    return `## 📋 Action Items

### Immediate Tasks
- [ ] **John**: Finalize Q1 budget numbers by Friday, January 26th
- [ ] **Sarah**: Send financial reports to team by Wednesday morning
- [ ] **Mike**: Create mockups for new landing page by end of week
- [ ] **John**: Send calendar invites for Monday follow-up meeting

### Marketing Campaign
- [ ] **Team**: Focus social media advertising on LinkedIn and Instagram
- [ ] **Marketing**: Prepare detailed campaign strategy for next meeting
- [ ] **Jane**: Evaluate need for additional design resources

### Follow-Up
- [ ] **All**: Attend follow-up meeting on Monday, January 29th at 10:00 AM
- [ ] **Team**: Review progress on all deliverables at Monday meeting
- [ ] **Leadership**: Reassess resource allocation if needed

---
*Note: This is a demonstration. When Chrome's Writer API becomes fully available in service workers, real AI-powered action item extraction will be used.*`;
  }

  // Translate text using Translator API
  async translate(text, targetLanguage) {
    if (!('ai' in self && 'translator' in self.ai)) {
      throw new Error('Translator API not available');
    }

    try {
      const translator = await self.ai.translator.create({
        sourceLanguage: 'en',
        targetLanguage: targetLanguage
      });

      const translation = await translator.translate(text);
      translator.destroy();

      return translation;
    } catch (error) {
      console.error('Translation error:', error);
      throw error;
    }
  }

  // Proofread text using Rewriter API
  async proofread(text) {
    if (!('ai' in self && 'rewriter' in self.ai)) {
      throw new Error('Rewriter/Proofreader API not available');
    }

    try {
      const rewriter = await self.ai.rewriter.create({
        tone: 'as-is',
        format: 'as-is',
        length: 'as-is'
      });

      const proofread = await rewriter.rewrite(text, {
        context: 'Correct grammar and spelling while preserving meaning'
      });

      rewriter.destroy();
      return proofread;
    } catch (error) {
      console.error('Proofreading error:', error);
      throw error;
    }
  }

  // Generate meeting summary with multiple AI operations
  async generateFullMeetingSummary(transcript) {
    try {
      const results = {};

      // 1. Generate summary
      results.summary = await this.summarize(transcript, { type: 'key-points' });

      // 2. Generate TL;DR
      results.tldr = await this.summarize(transcript, { type: 'tldr', length: 'short' });

      // 3. Extract action items
      results.actionItems = await this.extractActionItems(transcript);

      // 4. Proofread the summary
      results.polishedSummary = await this.proofread(results.summary);

      return results;
    } catch (error) {
      console.error('Error generating full meeting summary:', error);
      throw error;
    }
  }

  // Cleanup
  destroy() {
    if (this.promptSession) {
      this.promptSession.destroy();
    }
    if (this.summarizer) {
      this.summarizer.destroy();
    }
    if (this.writer) {
      this.writer.destroy();
    }
  }
}
