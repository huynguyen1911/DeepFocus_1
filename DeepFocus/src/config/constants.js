// App constants
export const APP_NAME = "DeepFocus";
export const APP_VERSION = "1.0.0";

// Pomodoro constants
export const POMODORO_TIME = 25 * 60; // 25 minutes in seconds
export const SHORT_BREAK_TIME = 5 * 60; // 5 minutes in seconds
export const LONG_BREAK_TIME = 15 * 60; // 15 minutes in seconds

// Storage keys
export const STORAGE_KEYS = {
  SETTINGS: "@deepfocus_settings",
  STATS: "@deepfocus_stats",
  THEME: "@deepfocus_theme",
};

// Timer states
export const TIMER_STATES = {
  IDLE: "idle",
  RUNNING: "running",
  PAUSED: "paused",
  COMPLETED: "completed",
};

// Session types
export const SESSION_TYPES = {
  POMODORO: "pomodoro",
  SHORT_BREAK: "short_break",
  LONG_BREAK: "long_break",
};
