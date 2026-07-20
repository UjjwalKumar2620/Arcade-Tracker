import type { AppSettings } from '../types/index.js';

export function getSettings(): AppSettings {
  return {
    google_sheet_url: process.env.GOOGLE_SHEET_URL || '',
  };
}

export function saveSettings(settings: Partial<AppSettings>): AppSettings {
  return {
    google_sheet_url:
      settings.google_sheet_url || process.env.GOOGLE_SHEET_URL || '',
  };
}