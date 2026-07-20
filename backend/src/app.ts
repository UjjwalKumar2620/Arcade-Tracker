// ============================================================
// Arcade Tracker — Express App Entry Point
// Zero-database architecture. Google Sheets = sole data source.
// ============================================================
import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import { config } from './config/index.js';
import { errorHandler, notFoundHandler } from './middleware/errorHandler.js';
import dataRouter from './routes/data.js';
import settingsRouter from './routes/settings.js';


const app = express();

// ==================== SECURITY ====================
app.use(helmet({ crossOriginResourcePolicy: { policy: 'cross-origin' } }));
app.use(cors({
  origin: config.frontend.url,
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
}));

// ==================== PARSING & LOGGING ====================
app.use(express.json({ limit: '1mb' }));
if (!config.isProduction) {
  app.use(morgan('dev'));
}

// ==================== ROUTES ====================

// Health check
app.get('/api/health', (_req, res) => {
  res.json({
    success: true,
    message: 'Arcade Tracker API — No Database, Google Sheets Only',
    timestamp: new Date().toISOString(),
  });
});



// Data routes (all Google Sheet operations)
app.use('/api/data', dataRouter);

// Settings routes
app.use('/api/settings', settingsRouter);

// ==================== ERROR HANDLING ====================
app.use(notFoundHandler);
app.use(errorHandler);

// ==================== START ====================
if (!process.env.VERCEL) {
  app.listen(config.port, () => {
    console.log(`🚀 Arcade Tracker API running on port ${config.port}`);
    console.log(`📊 Architecture: Zero Database — Google Sheets is the sole data source`);
    console.log(`⏱️  Cache TTL: ${config.cache.ttlMs / 1000} seconds`);
  });
}

export default app;
