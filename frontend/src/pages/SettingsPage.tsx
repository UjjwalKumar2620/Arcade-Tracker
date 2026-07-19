// ============================================================
// Arcade Tracker — Admin Panel & Settings Page
// Protected with Admin credentials (Ujjwal Kumar)
// ============================================================
import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import {
  Shield, Link2, CheckCircle, AlertCircle, Save,
  RefreshCw, HelpCircle, Lock, LogOut, User, KeyRound,
} from 'lucide-react';
import { fetchSettings, updateSettings, refreshData } from '../lib/api';
import { PageHeader, LoadingSpinner, GlassCard } from '../components/ui';

const ADMIN_USERNAME = 'Ujjwal Kumar';
const ADMIN_PASSWORD = 'ARCADEFACILITATOR2026UJJANSH';
const AUTH_KEY = 'arcade_admin_auth_session';

export default function SettingsPage() {
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(() => {
    return sessionStorage.getItem(AUTH_KEY) === 'true';
  });

  // Auth form states
  const [usernameInput, setUsernameInput] = useState('');
  const [passwordInput, setPasswordInput] = useState('');
  const [authError, setAuthError] = useState<string | null>(null);

  // Settings states
  const [sheetUrl, setSheetUrl] = useState('');
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [testing, setTesting] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  useEffect(() => {
    if (isAuthenticated) {
      loadSettings();
    }
  }, [isAuthenticated]);

  async function loadSettings() {
    try {
      setLoading(true);
      const res = await fetchSettings();
      const data = res.data as { google_sheet_url?: string } | undefined;
      if (data?.google_sheet_url) {
        setSheetUrl(data.google_sheet_url);
      }
    } catch {
      // Fail gracefully
    } finally {
      setLoading(false);
    }
  }

  function handleLogin(e: React.FormEvent) {
    e.preventDefault();
    setAuthError(null);

    if (usernameInput.trim() === ADMIN_USERNAME && passwordInput.trim() === ADMIN_PASSWORD) {
      sessionStorage.setItem(AUTH_KEY, 'true');
      setIsAuthenticated(true);
      setUsernameInput('');
      setPasswordInput('');
    } else {
      setAuthError('Invalid username or password. Access denied.');
    }
  }

  function handleLogout() {
    sessionStorage.removeItem(AUTH_KEY);
    setIsAuthenticated(false);
    setMessage(null);
  }

  async function handleSave(e: React.FormEvent) {
    e.preventDefault();
    if (!sheetUrl.trim()) {
      setMessage({ type: 'error', text: 'Please enter a valid Google Sheet URL' });
      return;
    }

    try {
      setSaving(true);
      setMessage(null);
      await updateSettings({ google_sheet_url: sheetUrl.trim() });

      // Auto test/refresh after saving
      const refreshRes = await refreshData();
      setMessage({
        type: 'success',
        text: `Settings saved successfully! ${refreshRes.message || 'Data connected to Google Sheet.'}`,
      });
    } catch (err) {
      setMessage({
        type: 'error',
        text: err instanceof Error ? err.message : 'Failed to connect to Google Sheet. Check permissions.',
      });
    } finally {
      setSaving(false);
    }
  }

  async function handleTestConnection() {
    try {
      setTesting(true);
      setMessage(null);
      await updateSettings({ google_sheet_url: sheetUrl.trim() });
      const refreshRes = await refreshData();
      setMessage({
        type: 'success',
        text: `Connection successful! ${refreshRes.message || 'Successfully fetched sheet.'}`,
      });
    } catch (err) {
      setMessage({
        type: 'error',
        text: err instanceof Error ? err.message : 'Connection test failed. Ensure the sheet is shared with your Service Account.',
      });
    } finally {
      setTesting(false);
    }
  }

  // ── 1. Unauthenticated State: Show Admin Login Screen ─────
  if (!isAuthenticated) {
    return (
      <div className="p-6 lg:p-8 flex items-center justify-center min-h-[80vh]">
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="w-full max-w-md"
        >
          <GlassCard hover={false} className="p-6 sm:p-8 space-y-6">
            <div className="text-center space-y-2">
              <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-[#4285F4] to-[#34A853] mx-auto flex items-center justify-center text-white shadow-lg">
                <Shield size={28} />
              </div>
              <h2 className="text-2xl font-bold text-[#E8EAED]">Admin Panel Login</h2>
              <p className="text-xs text-[#9AA0A6]">
                Restricted area. Please enter your administrator credentials to continue.
              </p>
            </div>

            {authError && (
              <motion.div
                initial={{ opacity: 0, y: -5 }}
                animate={{ opacity: 1, y: 0 }}
                className="flex items-center gap-2 p-3 rounded-xl bg-[rgba(234,67,53,0.15)] border border-[rgba(234,67,53,0.3)] text-[#EE675C] text-xs font-medium"
              >
                <AlertCircle size={16} />
                <span>{authError}</span>
              </motion.div>
            )}

            <form onSubmit={handleLogin} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-[#9AA0A6] uppercase mb-1.5">
                  Username
                </label>
                <div className="relative">
                  <User size={18} className="absolute left-3.5 top-3 text-[#5F6368]" />
                  <input
                    type="text"
                    required
                    value={usernameInput}
                    onChange={(e) => setUsernameInput(e.target.value)}
                    placeholder="Enter admin username"
                    className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-[rgba(255,255,255,0.05)] border border-[rgba(255,255,255,0.1)] text-[#E8EAED] placeholder-[#5F6368] focus:outline-none focus:border-[#4285F4] text-sm"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-[#9AA0A6] uppercase mb-1.5">
                  Password
                </label>
                <div className="relative">
                  <KeyRound size={18} className="absolute left-3.5 top-3 text-[#5F6368]" />
                  <input
                    type="password"
                    required
                    value={passwordInput}
                    onChange={(e) => setPasswordInput(e.target.value)}
                    placeholder="Enter admin password"
                    className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-[rgba(255,255,255,0.05)] border border-[rgba(255,255,255,0.1)] text-[#E8EAED] placeholder-[#5F6368] focus:outline-none focus:border-[#4285F4] text-sm"
                  />
                </div>
              </div>

              <button
                type="submit"
                className="w-full py-3 rounded-xl bg-gradient-to-r from-[#4285F4] to-[#669DF6] text-white text-sm font-semibold hover:shadow-lg hover:shadow-[#4285F4]/25 transition-all flex items-center justify-center gap-2"
              >
                <Lock size={16} /> Log In to Admin Panel
              </button>
            </form>
          </GlassCard>
        </motion.div>
      </div>
    );
  }

  // ── 2. Authenticated State: Show Admin Panel ──────────────
  if (loading) return <LoadingSpinner size="lg" />;

  return (
    <div className="p-6 lg:p-8 space-y-6 max-w-4xl">
      <PageHeader
        title="Admin Panel"
        description="Configure your Google Sheet data source (Sole Source of Truth)"
        actions={
          <button
            onClick={handleLogout}
            className="flex items-center gap-2 px-4 py-2 rounded-xl bg-[rgba(234,67,53,0.15)] text-[#EE675C] border border-[rgba(234,67,53,0.3)] text-sm font-medium hover:bg-[rgba(234,67,53,0.25)] transition-all"
          >
            <LogOut size={16} /> Log Out
          </button>
        }
      />

      {message && (
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className={`flex items-center gap-3 p-4 rounded-xl text-sm ${
            message.type === 'success'
              ? 'bg-[rgba(52,168,83,0.15)] border border-[rgba(52,168,83,0.3)] text-[#5BB974]'
              : 'bg-[rgba(234,67,53,0.15)] border border-[rgba(234,67,53,0.3)] text-[#EE675C]'
          }`}
        >
          {message.type === 'success' ? <CheckCircle size={18} /> : <AlertCircle size={18} />}
          <span>{message.text}</span>
        </motion.div>
      )}

      {/* Sheet URL Configuration Form */}
      <GlassCard hover={false} className="space-y-6">
        <div>
          <h3 className="text-lg font-semibold text-[#E8EAED] flex items-center gap-2">
            <Link2 size={20} className="text-[#4285F4]" /> Google Sheet Data Source
          </h3>
          <p className="text-xs text-[#9AA0A6] mt-1">
            The Google team updates this Google Sheet daily. Paste the full URL here once.
          </p>
        </div>

        <form onSubmit={handleSave} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-[#9AA0A6] uppercase mb-2">
              Google Sheet Shareable URL
            </label>
            <input
              type="url"
              required
              value={sheetUrl}
              onChange={(e) => setSheetUrl(e.target.value)}
              placeholder="https://docs.google.com/spreadsheets/d/1BxiMVs0XRA5nFMdKvBdBZjgmUUqptlbs74OgvE2upms/edit"
              className="w-full px-4 py-3 rounded-xl bg-[rgba(255,255,255,0.05)] border border-[rgba(255,255,255,0.1)] text-[#E8EAED] placeholder-[#5F6368] focus:outline-none focus:border-[#4285F4] transition-all text-sm font-mono"
            />
          </div>

          <div className="flex flex-wrap items-center gap-3 pt-2">
            <button
              type="submit"
              disabled={saving || testing}
              className="flex items-center gap-2 px-6 py-3 rounded-xl bg-gradient-to-r from-[#4285F4] to-[#669DF6] text-white text-sm font-medium hover:shadow-lg hover:shadow-[#4285F4]/20 transition-all disabled:opacity-50"
            >
              <Save size={16} />
              {saving ? 'Saving...' : 'Save & Sync Now'}
            </button>

            <button
              type="button"
              onClick={handleTestConnection}
              disabled={saving || testing || !sheetUrl.trim()}
              className="flex items-center gap-2 px-6 py-3 rounded-xl glass-subtle text-[#E8EAED] text-sm font-medium hover:bg-[rgba(255,255,255,0.08)] transition-all disabled:opacity-50"
            >
              <RefreshCw size={16} className={testing ? 'animate-spin' : ''} />
              {testing ? 'Testing Connection...' : 'Test Connection'}
            </button>
          </div>
        </form>
      </GlassCard>

      {/* Setup Guide */}
      <GlassCard hover={false} className="space-y-4">
        <h3 className="text-lg font-semibold text-[#E8EAED] flex items-center gap-2">
          <HelpCircle size={20} className="text-[#FBBC04]" /> Setup & Access Guide
        </h3>

        <div className="space-y-3 text-sm text-[#9AA0A6]">
          <div className="p-3.5 rounded-xl bg-[rgba(255,255,255,0.03)] border border-[rgba(255,255,255,0.05)] space-y-1">
            <p className="font-semibold text-[#E8EAED] flex items-center gap-2">
              <span className="w-5 h-5 rounded-full bg-[#4285F4] text-white text-xs flex items-center justify-center font-bold">1</span>
              Google Service Account Credentials
            </p>
            <p className="text-xs pl-7">
              Ensure your Service Account JSON file is placed at <code className="text-[#8AB4F8]">backend/credentials.json</code>.
            </p>
          </div>

          <div className="p-3.5 rounded-xl bg-[rgba(255,255,255,0.03)] border border-[rgba(255,255,255,0.05)] space-y-1">
            <p className="font-semibold text-[#E8EAED] flex items-center gap-2">
              <span className="w-5 h-5 rounded-full bg-[#34A853] text-white text-xs flex items-center justify-center font-bold">2</span>
              Share the Google Sheet
            </p>
            <p className="text-xs pl-7">
              Open your Google Sheet → Click <strong>Share</strong> → Add your Service Account email address (<code className="text-[#8AB4F8]">client_email</code> in credentials.json) as a <strong>Viewer</strong>.
            </p>
          </div>

          <div className="p-3.5 rounded-xl bg-[rgba(255,255,255,0.03)] border border-[rgba(255,255,255,0.05)] space-y-1">
            <p className="font-semibold text-[#E8EAED] flex items-center gap-2">
              <span className="w-5 h-5 rounded-full bg-[#FBBC04] text-black text-xs flex items-center justify-center font-bold">3</span>
              Automatic 60-Second Cache
            </p>
            <p className="text-xs pl-7">
              Fetched data is cached in memory for 60 seconds to avoid hitting Google Sheets API rate limits. Clicking <strong>Refresh Data</strong> or <strong>Sync Now</strong> bypasses the cache immediately.
            </p>
          </div>
        </div>
      </GlassCard>
    </div>
  );
}
