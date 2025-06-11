export const CONFIG = {
  GEMINI_API_KEY: "AIzaSyAR8-do--xXdS225R3zCJ2MIb-N1ijdMDc",
  GEMINI_API_URL:
    "https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent",
  MAX_RESPONSE_LENGTH: 200,
  MAX_SUMMARY_LENGTH: 2000,
  COMPANY_NAME: "Flofy",
};

// Global variable for direct access
window.GEMINI_API_KEY = CONFIG.GEMINI_API_KEY;
