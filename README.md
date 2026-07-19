# 🏆 Google Cloud Arcade Progress Tracker v3.0

> **Architecture Update**: Complete zero-database architecture. **Google Sheets** is the single live source of truth.

---

## 🌟 Key Features

- **Zero Database Persistence**: Participant data is fetched **live** directly from Google Sheets API v4. No local database, no SQL, no sync tables, no data rot.
- **Service Account Security**: Backend uses Google Service Account credentials (`credentials.json`) to safely read sheet data. No API keys are exposed to the frontend.
- **In-Memory 60s Cache**: Minimizes API rate limits with an automatic 60-second in-memory TTL buffer.
- **Instant Refresh**: Clicking "Refresh Data" on the dashboard bypasses cache and pulls fresh row data immediately.
- **Full Analytical Breakdown**:
  - Dashboard overview (Total participants, Skill badges, Arcade games, GEAR badges, Verification status)
  - Interactive table with live searching, filtering (GEAR, Verification), sorting, and pagination
  - Participant detail page with full breakdown (skill badges list, arcade games list, profiles, status)
  - Analytics page with 6 live generated charts
  - Settings page for single Google Sheet URL configuration

---

## 🚀 Getting Started

### 1. Requirements
- Node.js v18+
- Google Cloud Service Account JSON file (`credentials.json`)

### 2. Service Account Setup
1. Go to [Google Cloud Console](https://console.cloud.google.com/) → IAM & Admin → Service Accounts.
2. Create a Service Account and download its JSON key.
3. Save the key file as `backend/credentials.json`.
4. Share your Google Sheet with the `client_email` listed inside `credentials.json` (grant **Viewer** access).

### 3. Install & Run

```bash
# Terminal 1: Backend (runs on http://localhost:3001)
cd backend
npm install
npm run dev

# Terminal 2: Frontend (runs on http://localhost:5173)
cd frontend
npm install
npm run dev
```

### 4. Configure Google Sheet URL
Open `http://localhost:5173/settings` and paste your Google Sheet URL. Click **Save & Sync Now**.

---

## 🛠️ Tech Stack

- **Frontend**: React 18, TypeScript, TailwindCSS, Framer Motion, Lucide Icons
- **Backend**: Node.js, Express, `googleapis` (v4), `google-auth-library`
- **Database**: **NONE** (Google Sheets API v4 live stream)
