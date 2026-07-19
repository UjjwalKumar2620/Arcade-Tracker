// ============================================================
// Arcade Tracker — App with Routing
// ============================================================
import React, { Suspense } from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import Sidebar from './components/layout/Sidebar';
import { LoadingSpinner } from './components/ui';
import DashboardPage from './pages/DashboardPage';
import ParticipantsPage from './pages/ParticipantsPage';
import ParticipantDetailPage from './pages/ParticipantDetailPage';
import AnalyticsPage from './pages/AnalyticsPage';
import SettingsPage from './pages/SettingsPage';

export default function App() {
  return (
    <BrowserRouter>
      <div className="min-h-screen bg-dots">
        <Sidebar>
          <Suspense fallback={<LoadingSpinner size="lg" />}>
            <Routes>
              <Route path="/" element={<DashboardPage />} />
              <Route path="/participants" element={<ParticipantsPage />} />
              <Route path="/participants/:rowIndex" element={<ParticipantDetailPage />} />
              <Route path="/analytics" element={<AnalyticsPage />} />
              <Route path="/settings" element={<SettingsPage />} />
            </Routes>
          </Suspense>
        </Sidebar>
      </div>
    </BrowserRouter>
  );
}
