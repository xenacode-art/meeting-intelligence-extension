// Storage Manager - Handles chrome.storage operations
export class StorageManager {
  constructor() {
    this.STORAGE_KEYS = {
      MEETINGS: 'meetings',
      SETTINGS: 'settings',
      CURRENT_MEETING: 'currentMeeting'
    };
  }

  // Save a meeting
  async saveMeeting(meeting) {
    try {
      const meetings = await this.getMeetings();

      // Add metadata
      const meetingWithMetadata = {
        ...meeting,
        id: meeting.id || this.generateId(),
        createdAt: meeting.createdAt || Date.now(),
        updatedAt: Date.now()
      };

      // Add to meetings array
      meetings.unshift(meetingWithMetadata);

      // Keep only last 100 meetings
      const trimmedMeetings = meetings.slice(0, 100);

      await chrome.storage.local.set({
        [this.STORAGE_KEYS.MEETINGS]: trimmedMeetings
      });

      return meetingWithMetadata;
    } catch (error) {
      console.error('Error saving meeting:', error);
      throw error;
    }
  }

  // Get all meetings
  async getMeetings() {
    try {
      const result = await chrome.storage.local.get(this.STORAGE_KEYS.MEETINGS);
      return result[this.STORAGE_KEYS.MEETINGS] || [];
    } catch (error) {
      console.error('Error getting meetings:', error);
      return [];
    }
  }

  // Get meeting by ID
  async getMeeting(meetingId) {
    try {
      const meetings = await this.getMeetings();
      return meetings.find(m => m.id === meetingId);
    } catch (error) {
      console.error('Error getting meeting:', error);
      return null;
    }
  }

  // Update meeting
  async updateMeeting(meetingId, updates) {
    try {
      const meetings = await this.getMeetings();
      const index = meetings.findIndex(m => m.id === meetingId);

      if (index === -1) {
        throw new Error('Meeting not found');
      }

      meetings[index] = {
        ...meetings[index],
        ...updates,
        updatedAt: Date.now()
      };

      await chrome.storage.local.set({
        [this.STORAGE_KEYS.MEETINGS]: meetings
      });

      return meetings[index];
    } catch (error) {
      console.error('Error updating meeting:', error);
      throw error;
    }
  }

  // Delete meeting
  async deleteMeeting(meetingId) {
    try {
      const meetings = await this.getMeetings();
      const filteredMeetings = meetings.filter(m => m.id !== meetingId);

      await chrome.storage.local.set({
        [this.STORAGE_KEYS.MEETINGS]: filteredMeetings
      });

      return true;
    } catch (error) {
      console.error('Error deleting meeting:', error);
      throw error;
    }
  }

  // Save settings
  async saveSettings(settings) {
    try {
      const currentSettings = await this.getSettings();
      const updatedSettings = {
        ...currentSettings,
        ...settings
      };

      await chrome.storage.local.set({
        [this.STORAGE_KEYS.SETTINGS]: updatedSettings
      });

      return updatedSettings;
    } catch (error) {
      console.error('Error saving settings:', error);
      throw error;
    }
  }

  // Get settings
  async getSettings() {
    try {
      const result = await chrome.storage.local.get(this.STORAGE_KEYS.SETTINGS);
      return result[this.STORAGE_KEYS.SETTINGS] || {
        autoTranscribe: true,
        defaultLanguage: 'en',
        summaryType: 'key-points',
        enableTranslation: false,
        autoSave: true
      };
    } catch (error) {
      console.error('Error getting settings:', error);
      return {};
    }
  }

  // Save current meeting (in progress)
  async saveCurrentMeeting(meeting) {
    try {
      await chrome.storage.local.set({
        [this.STORAGE_KEYS.CURRENT_MEETING]: meeting
      });
    } catch (error) {
      console.error('Error saving current meeting:', error);
      throw error;
    }
  }

  // Get current meeting
  async getCurrentMeeting() {
    try {
      const result = await chrome.storage.local.get(this.STORAGE_KEYS.CURRENT_MEETING);
      return result[this.STORAGE_KEYS.CURRENT_MEETING];
    } catch (error) {
      console.error('Error getting current meeting:', error);
      return null;
    }
  }

  // Clear current meeting
  async clearCurrentMeeting() {
    try {
      await chrome.storage.local.remove(this.STORAGE_KEYS.CURRENT_MEETING);
    } catch (error) {
      console.error('Error clearing current meeting:', error);
    }
  }

  // Export meetings as JSON
  async exportMeetings() {
    try {
      const meetings = await this.getMeetings();
      return JSON.stringify(meetings, null, 2);
    } catch (error) {
      console.error('Error exporting meetings:', error);
      throw error;
    }
  }

  // Import meetings from JSON
  async importMeetings(jsonString) {
    try {
      const importedMeetings = JSON.parse(jsonString);
      const existingMeetings = await this.getMeetings();

      // Merge meetings, avoiding duplicates
      const mergedMeetings = [...importedMeetings, ...existingMeetings];
      const uniqueMeetings = Array.from(
        new Map(mergedMeetings.map(m => [m.id, m])).values()
      );

      await chrome.storage.local.set({
        [this.STORAGE_KEYS.MEETINGS]: uniqueMeetings
      });

      return uniqueMeetings.length;
    } catch (error) {
      console.error('Error importing meetings:', error);
      throw error;
    }
  }

  // Get storage usage
  async getStorageUsage() {
    try {
      const bytesInUse = await chrome.storage.local.getBytesInUse();
      const quota = chrome.storage.local.QUOTA_BYTES;

      return {
        used: bytesInUse,
        total: quota,
        percentage: (bytesInUse / quota) * 100
      };
    } catch (error) {
      console.error('Error getting storage usage:', error);
      return null;
    }
  }

  // Generate unique ID
  generateId() {
    return `meeting_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  // Search meetings
  async searchMeetings(query) {
    try {
      const meetings = await this.getMeetings();
      const lowerQuery = query.toLowerCase();

      return meetings.filter(meeting => {
        return (
          meeting.title?.toLowerCase().includes(lowerQuery) ||
          meeting.transcript?.toLowerCase().includes(lowerQuery) ||
          meeting.summary?.toLowerCase().includes(lowerQuery)
        );
      });
    } catch (error) {
      console.error('Error searching meetings:', error);
      return [];
    }
  }
}
