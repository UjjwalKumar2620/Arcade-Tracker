// ============================================================
// Arcade Tracker — App with Routing
// ============================================================
import React, { Suspense } from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import Sidebar from './components/layout/Sidebar';
import { LoadingSpinner } from './components/ui';
import { GameCursorEffect } from './components/ui/GameCursorEffect';
import HomePage from './pages/HomePage';
import DashboardPage from './pages/DashboardPage';
import ParticipantsPage from './pages/ParticipantsPage';
import ParticipantDetailPage from './pages/ParticipantDetailPage';
import AnalyticsPage from './pages/AnalyticsPage';

export default function App() {
  return (
    <BrowserRouter>
      <div className="min-h-screen bg-dots">
        <GameCursorEffect />
        <Sidebar>
          <Suspense fallback={<LoadingSpinner size="lg" />}>
            <Routes>
              <Route path="/" element={<HomePage />} />
              <Route path="/dashboard" element={<DashboardPage />} />
              <Route path="/participants" element={<ParticipantsPage />} />
              <Route path="/participants/:rowIndex" element={<ParticipantDetailPage />} />
              <Route path="/analytics" element={<AnalyticsPage />} />
            </Routes>
          </Suspense>
        </Sidebar>
      </div>
    </BrowserRouter>
  );
}

