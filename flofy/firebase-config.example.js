// Firebase Configuration - Example file
// Copy this to firebase-config.js and replace with your actual credentials
import { initializeApp } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-app.js";
import {
  getFirestore,
  doc,
  setDoc,
  getDoc,
  onSnapshot,
  updateDoc,
  arrayUnion,
  serverTimestamp,
} from "https://www.gstatic.com/firebasejs/10.7.1/firebase-firestore.js";

const firebaseConfig = {
  apiKey: "your_api_key_here",
  authDomain: "your_project.firebaseapp.com",
  projectId: "your_project_id",
  storageBucket: "your_project.firebasestorage.app",
  messagingSenderId: "your_sender_id",
  appId: "your_app_id",
  measurementId: "your_measurement_id",
};

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

// Storage abstraction layer
class StorageManager {
  constructor() {
    this.isOnline = navigator.onLine;
    this.pendingSync = [];

    // Listen to online/offline events
    window.addEventListener("online", () => {
      this.isOnline = true;
      this.syncPendingData();
    });

    window.addEventListener("offline", () => {
      this.isOnline = false;
    });
  }

  // Main storage interface - maintains current functionality
  async setItem(key, value) {
    // Always save to localStorage first (maintains current sync)
    localStorage.setItem(key, value);

    // Try to sync to Firebase if online
    if (this.isOnline) {
      try {
        await this.syncToFirebase(key, value);
      } catch (error) {
        console.log("Firebase sync failed, stored locally:", error);
        this.addToPendingSync(key, value);
      }
    } else {
      this.addToPendingSync(key, value);
    }
  }

  async getItem(key) {
    // Always return from localStorage first (maintains current sync)
    const localValue = localStorage.getItem(key);

    // Try to get latest from Firebase in background
    if (this.isOnline) {
      try {
        const firebaseValue = await this.getFromFirebase(key);
        if (firebaseValue && firebaseValue !== localValue) {
          // Update localStorage with Firebase data
          localStorage.setItem(key, firebaseValue);
          return firebaseValue;
        }
      } catch (error) {
        console.log("Firebase read failed, using local data:", error);
      }
    }

    return localValue;
  }

  async syncToFirebase(key, value) {
    const userId = this.getUserId();
    const docRef = doc(db, "users", userId);

    await updateDoc(docRef, {
      [`storage.${key}`]: value,
      lastUpdated: serverTimestamp(),
    });
  }

  async getFromFirebase(key) {
    const userId = this.getUserId();
    const docRef = doc(db, "users", userId);
    const docSnap = await getDoc(docRef);

    if (docSnap.exists()) {
      const data = docSnap.data();
      return data.storage?.[key];
    }
    return null;
  }

  addToPendingSync(key, value) {
    this.pendingSync.push({ key, value, timestamp: Date.now() });
  }

  async syncPendingData() {
    while (this.pendingSync.length > 0 && this.isOnline) {
      const { key, value } = this.pendingSync.shift();
      try {
        await this.syncToFirebase(key, value);
      } catch (error) {
        console.log("Pending sync failed:", error);
        break;
      }
    }
  }

  getUserId() {
    return localStorage.getItem("userId") || "anonymous";
  }

  // Initialize user document
  async initializeUser() {
    const userId = this.getUserId();
    const docRef = doc(db, "users", userId);

    try {
      const docSnap = await getDoc(docRef);
      if (!docSnap.exists()) {
        await setDoc(docRef, {
          storage: {},
          createdAt: serverTimestamp(),
          lastUpdated: serverTimestamp(),
        });
      }
    } catch (error) {
      console.log("Firebase user initialization failed:", error);
    }
  }

  // Real-time sync for conversations (optional enhancement)
  setupRealtimeSync(callback) {
    const userId = this.getUserId();
    const docRef = doc(db, "users", userId);

    return onSnapshot(docRef, (doc) => {
      if (doc.exists()) {
        const data = doc.data();
        callback(data.storage || {});
      }
    });
  }
}

// Global storage manager instance
window.storageManager = new StorageManager();

// Backward compatibility wrapper
window.enhancedLocalStorage = {
  setItem: (key, value) => window.storageManager.setItem(key, value),
  getItem: (key) => window.storageManager.getItem(key),
};
