// ============================================================
// Arcade Tracker — Settings Service
// Stores the Google Sheet URL in a simple JSON file on disk.
// This is the ONLY thing persisted — no database.
// ============================================================
import fs from 'fs';
import path from 'path';
import type { AppSettings } from '../types/index.js';

const SETTINGS_FILE = process.env.VERCEL
  ? path.join('/tmp', 'settings.json')
  : path.resolve('./settings.json');

const DEFAULT_SETTINGS: AppSettings = {
  google_sheet_url: process.env.GOOGLE_SHEET_URL || '',
};

export function getSettings(): AppSettings {
  const envUrl = process.env.GOOGLE_SHEET_URL;
  try {
    if (fs.existsSync(SETTINGS_FILE)) {
      const raw = fs.readFileSync(SETTINGS_FILE, 'utf-8');
      const parsed = JSON.parse(raw);
      return {
        ...DEFAULT_SETTINGS,
        ...parsed,
        google_sheet_url: parsed.google_sheet_url || envUrl || '',
      };
    }
  } catch {
    // Fall through to default
  }
  return { ...DEFAULT_SETTINGS, google_sheet_url: envUrl || '' };
}

export function saveSettings(settings: Partial<AppSettings>): AppSettings {
  const current = getSettings();
  const updated = { ...current, ...settings };
  try {
    fs.writeFileSync(SETTINGS_FILE, JSON.stringify(updated, null, 2), 'utf-8');
  } catch (err) {
    console.warn(`[WARN] Could not persist settings to file: ${err instanceof Error ? err.message : err}`);
  }
  return updated;
}
