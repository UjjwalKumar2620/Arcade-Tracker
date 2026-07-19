// ============================================================
// Arcade Tracker — Settings Routes
// Only stores the Google Sheet URL. No API key in frontend.
// ============================================================
import { Router, Request, Response } from 'express';
import { getSettings, saveSettings } from '../services/settings.service.js';
import { clearCache } from '../services/cache.service.js';

const router = Router();

/**
 * GET /api/settings — Get current settings (just the sheet URL)
 */
router.get('/', (_req: Request, res: Response): void => {
  const settings = getSettings();
  res.json({ success: true, data: settings });
});

/**
 * PUT /api/settings — Update settings
 */
router.put('/', (req: Request, res: Response): void => {
  try {
    const { google_sheet_url } = req.body;

    if (google_sheet_url !== undefined) {
      const updated = saveSettings({ google_sheet_url });
      clearCache(); // Clear cache so next request fetches from new URL
      res.json({ success: true, data: updated, message: 'Settings saved successfully' });
    } else {
      res.status(400).json({ success: false, error: 'google_sheet_url is required' });
    }
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error instanceof Error ? error.message : 'Failed to save settings',
    });
  }
});

export default router;
