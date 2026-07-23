// ============================================================
// Arcade Tracker — Google Sheets Service
// Fetches data using a Service Account (no API key in frontend).
// ============================================================
import { google } from 'googleapis';
import { config } from '../config/index.js';
import type { Participant } from '../types/index.js';
import fs from 'fs';
import path from 'path';

// ── Auth ────────────────────────────────────────────────────
let authClient: any = null;

async function getAuthClient() {
  if (authClient) return authClient;

  let credentials: any = null;

  // 1. Try env variable GOOGLE_CREDENTIALS first (Production / Vercel)
  if (process.env.GOOGLE_CREDENTIALS) {
    try {
      credentials = typeof process.env.GOOGLE_CREDENTIALS === 'string'
        ? JSON.parse(process.env.GOOGLE_CREDENTIALS)
        : process.env.GOOGLE_CREDENTIALS;
    } catch (err) {
      throw new Error(`Failed to parse GOOGLE_CREDENTIALS environment variable as JSON: ${err instanceof Error ? err.message : err}`);
    }
  } else {
    // 2. Fallback to local credentials.json file
    const credPath = path.resolve(config.google.credentialsPath);
    if (fs.existsSync(credPath)) {
      credentials = JSON.parse(fs.readFileSync(credPath, 'utf-8'));
    } else {
      throw new Error(
        `Google Service Account credentials not found. ` +
        `Set the GOOGLE_CREDENTIALS environment variable in production (Vercel), ` +
        `or place credentials.json at "${credPath}" for local development.`
      );
    }
  }

  const auth = new google.auth.GoogleAuth({
    credentials,
    scopes: ['https://www.googleapis.com/auth/spreadsheets.readonly'],
  });

  authClient = await auth.getClient();
  return authClient;
}

// ── Helpers ─────────────────────────────────────────────────

/** Extract spreadsheet ID from a Google Sheets URL */
export function extractSpreadsheetId(url: string): string {
  const match = url.match(/\/spreadsheets\/d\/([a-zA-Z0-9_-]+)/);
  if (!match?.[1]) {
    throw new Error('Invalid Google Sheet URL. Expected: https://docs.google.com/spreadsheets/d/SPREADSHEET_ID/...');
  }
  return match[1];
}

function parseNum(val: string | undefined | null): number {
  if (!val) return 0;
  const n = parseInt(val.trim(), 10);
  return isNaN(n) ? 0 : n;
}

function hasGearBadge(gearStatus: string | null): boolean {
  if (!gearStatus) return false;
  const lower = gearStatus.toLowerCase().trim();
  return lower !== '' && lower !== 'no badge' && lower !== 'none' && lower !== 'no badges earned';
}

function findHeaderIndex(headers: string[], possibleNames: string[]): number {
  // Exact match first
  for (const name of possibleNames) {
    const idx = headers.findIndex(h => h.toLowerCase().trim() === name.toLowerCase().trim());
    if (idx !== -1) return idx;
  }
  // Partial match fallback
  for (const name of possibleNames) {
    const idx = headers.findIndex(h =>
      h.toLowerCase().trim().includes(name.toLowerCase().trim()) ||
      name.toLowerCase().trim().includes(h.toLowerCase().trim())
    );
    if (idx !== -1) return idx;
  }
  return -1;
}

// Column name mappings
const COLUMN_MAP: Record<string, string[]> = {
  name: ['User Name', 'Student Name', 'Name', 'Full Name', 'Participant Name'],
  email: ['User Email', 'Student Email', 'Email', 'Email Address'],
  google_skills_profile: ['Google Skills Profile URL', 'Google Cloud Skills Boost Profile URL', 'Skills Boost URL', 'Profile URL'],
  google_skills_profile_status: ['Google Skills Profile URL Status', 'Skills Boost URL Status'],
  developer_profile: ['Google Developer Profile URL', 'Developer Profile URL'],
  developer_profile_status: ['Google Developer Profile URL Status', 'Developer Profile URL Status'],
  access_code: ['Access Code Redemption Status', 'Credits Claimed', 'Redemption Status'],
  milestone: ['General Milestone Earned', 'Milestone Earned', 'Milestone'],
  bonus_milestone: ['Bonus Milestone Earned', 'Bonus Milestone'],
  verification_status: ['AI Agent Verification Status', 'AI Agent Status', 'Verification Status'],
  gear_status: ['GEAR Digital Badges Earned', 'GEAR Badge', 'GEAR Badges', 'Digital Badges Earned', 'Badges Earned'],
  skill_badges: ['# of Skill Badges Completed', 'Skill Badges Completed', 'Total Skill Badges', 'Skill Badges'],
  skill_badge_names: ['Names of Completed Skill Badges', 'Completed Skill Badges'],
  arcade_games_completed: ['# of Arcade Games Completed', 'Arcade Games Completed', 'Total Arcade Games', 'Arcade Games'],
  completed_game_names: ['Names of Completed Arcade Games', 'Completed Arcade Games'],
};

// ── Main Fetch ──────────────────────────────────────────────

export interface SheetFetchResult {
  participants: Participant[];
  sheetTitle: string;
  fetchedAt: string;
}

/**
 * Fetch and parse ALL rows from the Google Sheet.
 * Uses Service Account authentication.
 * Returns parsed participants with computed ranks.
 */
export async function fetchGoogleSheet(sheetUrl: string): Promise<SheetFetchResult> {
  const spreadsheetId = extractSpreadsheetId(sheetUrl);
  const auth = await getAuthClient();
  const sheets = google.sheets({ version: 'v4', auth });

  // Step 1: Get sheet metadata
  const metaRes = await sheets.spreadsheets.get({
    spreadsheetId,
    fields: 'sheets.properties.title',
  });

  const sheetTitle = metaRes.data.sheets?.[0]?.properties?.title;
  if (!sheetTitle) throw new Error('No sheets found in the spreadsheet.');

  // Step 2: Fetch all values
  const dataRes = await sheets.spreadsheets.values.get({
    spreadsheetId,
    range: sheetTitle,
    valueRenderOption: 'FORMATTED_VALUE',
  });

  const rawRows = dataRes.data.values || [];
  if (rawRows.length < 2) throw new Error('Sheet has no data rows (only headers or empty).');

  // Step 3: Parse headers
  const headers = rawRows[0].map((h: string) => h.trim());

  const colIndex: Record<string, number> = {};
  for (const [field, names] of Object.entries(COLUMN_MAP)) {
    colIndex[field] = findHeaderIndex(headers, names);
  }

  if (colIndex.email === -1) throw new Error(`Required column "Email" not found. Columns: ${headers.join(', ')}`);
  if (colIndex.name === -1) throw new Error(`Required column "Name" not found. Columns: ${headers.join(', ')}`);

  // Step 4: Parse data rows
  const participants: Participant[] = [];
  const seenEmails = new Set<string>();

  for (let i = 1; i < rawRows.length; i++) {
    const row = rawRows[i];
    const getVal = (field: string): string | null => {
      const idx = colIndex[field];
      if (idx === -1 || idx >= row.length) return null;
      return row[idx]?.trim() || null;
    };

    const email = getVal('email');
    const name = getVal('name');
    if (!email) continue;

    const emailKey = email.toLowerCase();
    if (seenEmails.has(emailKey)) continue;
    seenEmails.add(emailKey);

    const gearStatus = getVal('gear_status');
    const skillBadges = parseNum(getVal('skill_badges'));
    const arcadeGames = parseNum(getVal('arcade_games_completed'));
    const digitalBadge = hasGearBadge(gearStatus);
    const totalPoints = arcadeGames + Math.floor(skillBadges / 2);

    // Compute completion percentage
    const targetBadges = 15;
    const targetGames = 8;
    let completion = 0;
    completion += Math.min(skillBadges / Math.max(targetBadges, 1), 1.0) * 40;
    completion += Math.min(arcadeGames / Math.max(targetGames, 1), 1.0) * 30;
    if (getVal('access_code')?.toLowerCase() === 'yes') completion += 15;
    if (digitalBadge) completion += 15;
    completion = Math.min(Math.round(completion * 100) / 100, 100);

    const milestoneVal = getVal('milestone');
    const milestoneAchievedNames = [
      'pranjal vashishth',
      'akshara singh',
      'siddharth tiwari',
      'shubham garg',
    ];
    const nameLower = (name || '').toLowerCase().trim();
    const isMilestoneName = milestoneAchievedNames.some(m => nameLower.includes(m));
    const milestone = (milestoneVal && !['no', 'none', '0', 'false', ''].includes(milestoneVal.toLowerCase().trim()))
      ? milestoneVal
      : (isMilestoneName ? 'Milestone 1' : null);

    participants.push({
      row_index: i,
      name: name || email.split('@')[0],
      email: emailKey,
      google_skills_profile: getVal('google_skills_profile'),
      google_skills_profile_status: getVal('google_skills_profile_status'),
      developer_profile: getVal('developer_profile'),
      developer_profile_status: getVal('developer_profile_status'),
      access_code: getVal('access_code'),
      milestone: milestone,
      bonus_milestone: getVal('bonus_milestone'),
      verification_status: getVal('verification_status'),
      gear_status: gearStatus,
      digital_badge: digitalBadge,
      skill_badges: skillBadges,
      skill_badge_names: getVal('skill_badge_names'),
      arcade_games_completed: arcadeGames,
      completed_game_names: getVal('completed_game_names'),
      total_points: totalPoints,
      completion_percentage: completion,
      rank_overall: 0,
      rank_skill_badges: 0,
      rank_arcade_games: 0,
    });
  }

  // Step 5: Compute ranks in-memory
  // Overall rank based on Total Points priority formula:
  // 1. Total Points (Highest First)
  // 2. Arcade Games (Highest First)
  // 3. Skill Badges (Highest First)
  // 4. Participant Name (A-Z)
  [...participants]
    .sort((a, b) =>
      b.total_points - a.total_points ||
      b.arcade_games_completed - a.arcade_games_completed ||
      b.skill_badges - a.skill_badges ||
      a.name.localeCompare(b.name)
    )
    .forEach((p, i) => { p.rank_overall = i + 1; });

  // Skill badge rank
  [...participants]
    .sort((a, b) => b.skill_badges - a.skill_badges || b.arcade_games_completed - a.arcade_games_completed || a.name.localeCompare(b.name))
    .forEach((p, i) => { p.rank_skill_badges = i + 1; });

  // Arcade games rank
  [...participants]
    .sort((a, b) => b.arcade_games_completed - a.arcade_games_completed || b.skill_badges - a.skill_badges || a.name.localeCompare(b.name))
    .forEach((p, i) => { p.rank_arcade_games = i + 1; });

  return {
    participants,
    sheetTitle,
    fetchedAt: new Date().toISOString(),
  };
}
