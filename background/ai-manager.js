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
    const availability = {
      promptAPI: 'ai' in self && 'languageModel' in self.ai,
      summarizer: 'ai' in self && 'summarizer' in self.ai,
      writer: 'ai' in self && 'writer' in self.ai,
      translator: 'ai' in self && 'translator' in self.ai,
      proofreader: 'ai' in self && 'rewriter' in self.ai
    };

    // Check detailed availability for each API
    if (availability.summarizer) {
      try {
        const summarizerAvailability = await self.ai.summarizer.capabilities();
        availability.summarizerReady = summarizerAvailability.available === 'readily';
      } catch (e) {
        availability.summarizerReady = false;
      }
    }

    if (availability.writer) {
      try {
        const writerAvailability = await self.ai.writer.capabilities();
        availability.writerReady = writerAvailability.available === 'readily';
      } catch (e) {
        availability.writerReady = false;
      }
    }

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

  // Summarize text using Summarizer API
  async summarize(text, options = {}) {
    if (!this.summarizer) {
      throw new Error('Summarizer API not initialized');
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
      console.error('Summarization error:', error);
      throw error;
    }
  }

  // Extract action items using Writer API
  async extractActionItems(text) {
    if (!this.writer) {
      throw new Error('Writer API not initialized');
    }

    try {
      const prompt = `From the following meeting transcript, extract all action items, decisions, and follow-up tasks. Format as a markdown checklist:\n\n${text}`;

      const actionItems = await this.writer.write(prompt, {
        context: 'Extract actionable tasks from meeting notes'
      });

      return actionItems;
    } catch (error) {
      console.error('Action item extraction error:', error);
      throw error;
    }
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
