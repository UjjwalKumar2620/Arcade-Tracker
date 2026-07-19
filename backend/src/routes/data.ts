// ============================================================
// Arcade Tracker — Data Routes
// Single endpoint that fetches live data from Google Sheets.
// Uses 60-second cache. No database.
// ============================================================
import { Router, Request, Response } from 'express';
import { fetchGoogleSheet } from '../services/sheets.service.js';
import { getCached, setCache, clearCache, getCacheAgeSeconds } from '../services/cache.service.js';
import { computeStats, computeChartData } from '../services/analytics.service.js';
import { getSettings } from '../services/settings.service.js';
import type { Participant } from '../types/index.js';

const router = Router();

/**
 * Core function: get participants (from cache or fresh fetch).
 */
async function getParticipants(): Promise<{
  participants: Participant[];
  sheetTitle: string;
  fetchedAt: string;
  fromCache: boolean;
  cacheAgeSeconds: number;
}> {
  const settings = getSettings();
  if (!settings.google_sheet_url) {
    throw new Error('Google Sheet URL not configured. Go to Settings to set it up.');
  }

  // Check cache first
  const cached = getCached();
  if (cached) {
    return {
      participants: cached.data.participants,
      sheetTitle: cached.data.sheetTitle,
      fetchedAt: cached.data.fetchedAt,
      fromCache: true,
      cacheAgeSeconds: Math.round(cached.ageMs / 1000),
    };
  }

  // Fetch fresh data from Google Sheets
  const result = await fetchGoogleSheet(settings.google_sheet_url);
  setCache(result);

  return {
    participants: result.participants,
    sheetTitle: result.sheetTitle,
    fetchedAt: result.fetchedAt,
    fromCache: false,
    cacheAgeSeconds: 0,
  };
}

/**
 * GET /api/data — Full dashboard data (stats + participants)
 */
router.get('/', async (_req: Request, res: Response): Promise<void> => {
  try {
    const { participants, sheetTitle, fetchedAt, fromCache, cacheAgeSeconds } = await getParticipants();
    const stats = computeStats(participants, fromCache, cacheAgeSeconds, fetchedAt);

    res.json({
      success: true,
      data: {
        participants,
        stats,
        sheet_title: sheetTitle,
        fetched_at: fetchedAt,
        from_cache: fromCache,
      },
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error instanceof Error ? error.message : 'Failed to fetch data',
    });
  }
});

/**
 * GET /api/data/stats — Dashboard stats only (no participant list)
 */
router.get('/stats', async (_req: Request, res: Response): Promise<void> => {
  try {
    const { participants, fetchedAt, fromCache, cacheAgeSeconds } = await getParticipants();
    const stats = computeStats(participants, fromCache, cacheAgeSeconds, fetchedAt);

    res.json({ success: true, data: stats });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error instanceof Error ? error.message : 'Failed to fetch stats',
    });
  }
});

/**
 * GET /api/data/participants — Participants with search, sort, filter, pagination
 */
router.get('/participants', async (req: Request, res: Response): Promise<void> => {
  try {
    const { participants, fromCache, cacheAgeSeconds } = await getParticipants();

    const search = (req.query.search as string || '').toLowerCase();
    const sortBy = (req.query.sortBy as string) || 'rank_overall';
    const sortOrder = req.query.sortOrder === 'desc' ? 'desc' : 'asc';
    const page = parseInt(req.query.page as string) || 1;
    const pageSize = Math.min(parseInt(req.query.pageSize as string) || 25, 100);
    const gearFilter = req.query.gear as string;
    const milestoneFilter = req.query.milestone as string;
    const verificationFilter = req.query.verification as string;

    // Filter
    let filtered = [...participants];

    if (search) {
      filtered = filtered.filter(p =>
        p.name.toLowerCase().includes(search) ||
        p.email.toLowerCase().includes(search)
      );
    }

    if (gearFilter === 'true') {
      filtered = filtered.filter(p => p.digital_badge);
    } else if (gearFilter === 'false') {
      filtered = filtered.filter(p => !p.digital_badge);
    }

    if (milestoneFilter && milestoneFilter !== 'all') {
      filtered = filtered.filter(p => p.milestone === milestoneFilter);
    }

    if (verificationFilter && verificationFilter !== 'all') {
      filtered = filtered.filter(p =>
        (p.verification_status || '').toLowerCase().includes(verificationFilter.toLowerCase())
      );
    }

    // Sort
    const sortKey = sortBy as keyof Participant;
    filtered.sort((a, b) => {
      const aVal = a[sortKey] ?? '';
      const bVal = b[sortKey] ?? '';
      if (typeof aVal === 'number' && typeof bVal === 'number') {
        return sortOrder === 'asc' ? aVal - bVal : bVal - aVal;
      }
      return sortOrder === 'asc'
        ? String(aVal).localeCompare(String(bVal))
        : String(bVal).localeCompare(String(aVal));
    });

    // Paginate
    const total = filtered.length;
    const totalPages = Math.ceil(total / pageSize);
    const offset = (page - 1) * pageSize;
    const paginated = filtered.slice(offset, offset + pageSize);

    res.json({
      success: true,
      data: paginated,
      meta: { total, page, pageSize, totalPages, from_cache: fromCache, cache_age_seconds: cacheAgeSeconds },
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error instanceof Error ? error.message : 'Failed to fetch participants',
    });
  }
});

/**
 * GET /api/data/participants/:rowIndex — Single participant by row_index
 */
router.get('/participants/:rowIndex', async (req: Request, res: Response): Promise<void> => {
  try {
    const { participants } = await getParticipants();
    const rowIndex = parseInt(req.params.rowIndex as string, 10);
    const participant = participants.find(p => p.row_index === rowIndex);

    if (!participant) {
      res.status(404).json({ success: false, error: 'Participant not found' });
      return;
    }

    res.json({ success: true, data: participant });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error instanceof Error ? error.message : 'Failed to fetch participant',
    });
  }
});

/**
 * GET /api/data/charts/:type — Chart data
 */
router.get('/charts/:type', async (req: Request, res: Response): Promise<void> => {
  try {
    const { participants } = await getParticipants();
    const chartType = req.params.type as string;
    const data = computeChartData(participants, chartType);

    res.json({ success: true, data });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error instanceof Error ? error.message : 'Failed to generate chart data',
    });
  }
});

/**
 * POST /api/data/refresh — Force-refresh (clear cache)
 */
router.post('/refresh', async (_req: Request, res: Response): Promise<void> => {
  try {
    clearCache();
    const { participants, fetchedAt } = await getParticipants();
    const stats = computeStats(participants, false, 0, fetchedAt);

    res.json({
      success: true,
      data: stats,
      message: `✅ Refreshed: ${participants.length} participants loaded from Google Sheet`,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error instanceof Error ? error.message : 'Refresh failed',
    });
  }
});

export default router;
