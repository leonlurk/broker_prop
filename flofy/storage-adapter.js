// Storage Adapter - Transition localStorage to Firebase gradually
class StorageAdapter {
  constructor() {
    this.useFirebase = false;
    this.initialized = false;
  }

  async initialize() {
    if (this.initialized) return;

    try {
      // Check if Firebase is available and configured
      if (window.storageManager && firebaseConfig.apiKey !== "your-api-key") {
        await window.storageManager.initializeUser();
        this.useFirebase = true;
        console.log("Firebase storage initialized");
      }
    } catch (error) {
      console.log("Firebase not available, using localStorage only:", error);
    }

    this.initialized = true;
  }

  async setItem(key, value) {
    await this.initialize();

    if (this.useFirebase) {
      return await window.storageManager.setItem(key, value);
    } else {
      return localStorage.setItem(key, value);
    }
  }

  async getItem(key) {
    await this.initialize();

    if (this.useFirebase) {
      return await window.storageManager.getItem(key);
    } else {
      return localStorage.getItem(key);
    }
  }

  removeItem(key) {
    localStorage.removeItem(key);
    // Firebase cleanup could be added here if needed
  }

  // Specific methods for the chatbot system
  async saveChatHistory(userId, history) {
    const key = `chatHistory_${userId}`;
    return await this.setItem(key, JSON.stringify(history));
  }

  async loadChatHistory(userId) {
    const key = `chatHistory_${userId}`;
    const data = await this.getItem(key);
    return data ? JSON.parse(data) : null;
  }

  async saveChatSummary(userId, summary) {
    const key = `chatSummary_${userId}`;
    return await this.setItem(key, summary);
  }

  async loadChatSummary(userId) {
    const key = `chatSummary_${userId}`;
    return await this.getItem(key);
  }

  async saveCRMConversations(conversations) {
    return await this.setItem(
      "crm_conversations",
      JSON.stringify(conversations)
    );
  }

  async loadCRMConversations() {
    const data = await this.getItem("crm_conversations");
    return data ? JSON.parse(data) : null;
  }

  async saveFlofyConversations(data) {
    return await this.setItem("flofy_conversations", JSON.stringify(data));
  }

  async loadFlofyConversations() {
    const data = await this.getItem("flofy_conversations");
    return data ? JSON.parse(data) : null;
  }
}

// Global storage adapter instance
window.storageAdapter = new StorageAdapter();
