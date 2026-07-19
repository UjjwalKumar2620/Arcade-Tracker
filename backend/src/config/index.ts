// ============================================================
// Arcade Tracker — Backend Configuration
// Zero-database architecture. Google Sheets = sole data source.
// ============================================================
import dotenv from 'dotenv';
dotenv.config();

export const config = {
  port: parseInt(process.env.PORT || '3001', 10),
  nodeEnv: process.env.NODE_ENV || 'development',
  isProduction: process.env.NODE_ENV === 'production',

  frontend: {
    url: process.env.FRONTEND_URL || 'http://localhost:5173',
  },

  // Path to Google Service Account credentials JSON file
  google: {
    credentialsPath: process.env.GOOGLE_CREDENTIALS_PATH || './credentials.json',
  },

  // In-memory cache TTL (milliseconds)
  cache: {
    ttlMs: parseInt(process.env.CACHE_TTL_MS || '60000', 10), // 60 seconds
  },
} as const;
