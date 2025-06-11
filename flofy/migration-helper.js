// Migration Helper - For existing localStorage data to Firebase
class MigrationHelper {
  constructor() {
    this.migrated = false;
  }

  async migrateExistingData() {
    if (this.migrated || !window.storageAdapter) return;

    try {
      console.log("Starting data migration to Firebase...");

      // Get all localStorage keys that contain chat data
      const keysToMigrate = [];
      for (let i = 0; i < localStorage.length; i++) {
        const key = localStorage.key(i);
        if (
          key &&
          (key.includes("chatHistory_") ||
            key.includes("chatSummary_") ||
            key === "crm_conversations" ||
            key === "flofy_conversations")
        ) {
          keysToMigrate.push(key);
        }
      }

      console.log(
        `Found ${keysToMigrate.length} keys to migrate:`,
        keysToMigrate
      );

      // Migrate each key
      for (const key of keysToMigrate) {
        const value = localStorage.getItem(key);
        if (value) {
          await window.storageAdapter.setItem(key, value);
          console.log(`Migrated: ${key}`);
        }
      }

      // Mark migration as complete
      this.migrated = true;
      localStorage.setItem("firebase_migration_complete", "true");
      console.log("Data migration completed successfully");
    } catch (error) {
      console.error("Migration failed:", error);
    }
  }

  async checkMigrationStatus() {
    const migrationComplete = localStorage.getItem(
      "firebase_migration_complete"
    );
    if (migrationComplete === "true") {
      this.migrated = true;
      return true;
    }
    return false;
  }

  async initializeMigration() {
    await this.checkMigrationStatus();

    if (!this.migrated && window.storageAdapter) {
      // Wait a bit for storageAdapter to initialize
      setTimeout(() => {
        this.migrateExistingData();
      }, 2000);
    }
  }
}

// Global migration helper instance
window.migrationHelper = new MigrationHelper();

// Auto-initialize when DOM is ready
document.addEventListener("DOMContentLoaded", () => {
  window.migrationHelper.initializeMigration();
});
