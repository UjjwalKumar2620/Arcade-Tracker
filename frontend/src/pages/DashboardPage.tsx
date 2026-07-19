// ============================================================
// Arcade Tracker — Dashboard Page
// Live data from Google Sheets. No database.
// ============================================================
import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import {
  Users, Award, Gamepad2, Shield, ShieldCheck, ShieldX,
  RefreshCw, TrendingUp, CheckCircle, AlertCircle,
  ArrowRight, BarChart3, Key, Clock, Zap, Database,
} from 'lucide-react';
import { fetchDashboardStats, refreshData } from '../lib/api';
import { StatCard, LoadingSpinner, GlassCard, PointSystemInfoCard } from '../components/ui';
import type { DashboardStats } from '../types';

export default function DashboardPage() {
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => { loadStats(); }, []);

  async function loadStats() {
    try {
      setLoading(true);
      setError(null);
      const res = await fetchDashboardStats();
      setStats(res.data as DashboardStats);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load dashboard');
    } finally {
      setLoading(false);
    }
  }

  async function handleRefresh() {
    try {
      setRefreshing(true);
      setMessage(null);
      const res = await refreshData();
      setStats(res.data as DashboardStats);
      setMessage({ type: 'success', text: res.message || 'Data refreshed from Google Sheet!' });
    } catch (err) {
      setMessage({ type: 'error', text: err instanceof Error ? err.message : 'Refresh failed' });
    } finally {
      setRefreshing(false);
    }
  }

  function formatTime(iso: string | null): string {
    if (!iso) return 'Never';
    return new Date(iso).toLocaleString('en-IN', { day: 'numeric', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' });
  }

  if (loading) return <LoadingSpinner size="lg" />;

  if (error) {
    return (
      <div className="p-6 lg:p-8">
        <div className="glass-card text-center py-16">
          <AlertCircle size={48} className="text-[#EA4335] mx-auto mb-4" />
          <h2 className="text-xl font-bold text-[#E8EAED] mb-2">Failed to load dashboard</h2>
          <p className="text-sm text-[#9AA0A6] mb-6 max-w-md mx-auto">{error}</p>
          <div className="flex gap-3 justify-center">
            <button onClick={loadStats} className="px-6 py-3 rounded-xl bg-[#4285F4] text-white font-medium hover:bg-[#5294FF] transition-colors">Retry</button>
            <Link to="/settings" className="px-6 py-3 rounded-xl glass-subtle text-[#8AB4F8] font-medium hover:bg-[rgba(255,255,255,0.05)] transition-colors">Go to Settings</Link>
          </div>
        </div>
      </div>
    );
  }

  const s = stats!;

  return (
    <div className="p-6 lg:p-8 space-y-6">
      {/* Header */}
      <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-[#E8EAED]">Dashboard</h1>
          <div className="flex items-center gap-3 mt-1">
            <p className="text-sm text-[#9AA0A6]">Google Cloud Arcade Progress Tracker</p>
            <span className={`text-xs px-2 py-0.5 rounded-full ${s.sync_status === 'fresh' ? 'bg-[rgba(52,168,83,0.15)] text-[#5BB974]' : 'bg-[rgba(66,133,244,0.15)] text-[#669DF6]'}`}>
              {s.sync_status === 'fresh' ? '● Live' : `● Cached (${s.cache_age_seconds}s ago)`}
            </span>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <div className="text-right hidden sm:block">
            <p className="text-xs text-[#5F6368]">Last Refresh</p>
            <p className="text-sm text-[#9AA0A6]">{formatTime(s.last_refresh_time)}</p>
          </div>
          <button onClick={handleRefresh} disabled={refreshing} className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-gradient-to-r from-[#4285F4] to-[#669DF6] text-white text-sm font-medium hover:shadow-lg hover:shadow-[#4285F4]/20 transition-all disabled:opacity-50">
            <RefreshCw size={16} className={refreshing ? 'animate-spin' : ''} />
            {refreshing ? 'Refreshing...' : 'Refresh Data'}
          </button>
        </div>
      </motion.div>

      {/* Message */}
      {message && (
        <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} className={`flex items-center gap-3 px-4 py-3 rounded-xl ${message.type === 'success' ? 'bg-[rgba(52,168,83,0.15)] border border-[rgba(52,168,83,0.3)] text-[#5BB974]' : 'bg-[rgba(234,67,53,0.15)] border border-[rgba(234,67,53,0.3)] text-[#EE675C]'}`}>
          {message.type === 'success' ? <CheckCircle size={18} /> : <AlertCircle size={18} />}
          <span className="text-sm">{message.text}</span>
        </motion.div>
      )}

      {/* Point System Information */}
      <PointSystemInfoCard />

      {/* Row 1: Main Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard label="Total Participants" value={s.total_participants} icon={<Users size={22} className="text-[#4285F4]" />} color="#4285F4" delay={0} />
        <StatCard label="Total Skill Badges" value={s.total_skill_badges} icon={<Award size={22} className="text-[#FBBC04]" />} color="#FBBC04" delay={0.05} />
        <StatCard label="Total Arcade Games" value={s.total_arcade_games} icon={<Gamepad2 size={22} className="text-[#EA4335]" />} color="#EA4335" delay={0.1} />
        <StatCard label="GEAR Completed" value={s.gear_badge_completed} icon={<Shield size={22} className="text-[#34A853]" />} color="#34A853" delay={0.15} />
      </div>

      {/* Row 2: Secondary Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard label="GEAR Pending" value={s.gear_badge_pending} icon={<ShieldX size={22} className="text-[#EE675C]" />} color="#EE675C" delay={0.2} />
        <StatCard label="Verified" value={s.verified_participants} icon={<ShieldCheck size={22} className="text-[#34A853]" />} color="#34A853" delay={0.25} />
        <StatCard label="Pending Verification" value={s.pending_verification} icon={<AlertCircle size={22} className="text-[#FBBC04]" />} color="#FBBC04" delay={0.3} />
        <StatCard label="Access Code Redeemed" value={s.access_code_redeemed} icon={<Key size={22} className="text-[#669DF6]" />} color="#669DF6" delay={0.35} />
      </div>

      {/* Bottom Row */}
      <div className="grid lg:grid-cols-2 gap-6">
        {/* Milestones */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.4 }}>
          <GlassCard hover={false}>
            <h3 className="text-lg font-semibold text-[#E8EAED] mb-4 flex items-center gap-2">
              <TrendingUp size={18} className="text-[#FBBC04]" /> Milestone Completion
            </h3>
            {s.milestone_completion.length === 0 ? (
              <p className="text-sm text-[#5F6368]">No data yet. Configure your Google Sheet in Settings.</p>
            ) : (
              <div className="space-y-3">
                {s.milestone_completion.map(m => (
                  <div key={m.milestone} className="flex items-center justify-between">
                    <span className="text-sm text-[#9AA0A6] truncate mr-3">{m.milestone}</span>
                    <div className="flex items-center gap-2">
                      <div className="w-24 h-2 bg-[rgba(255,255,255,0.08)] rounded-full overflow-hidden">
                        <div className="h-full rounded-full bg-gradient-to-r from-[#4285F4] to-[#34A853]" style={{ width: `${Math.min((m.count / s.total_participants) * 100, 100)}%` }} />
                      </div>
                      <span className="text-sm font-medium text-[#E8EAED] w-10 text-right">{m.count}</span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </GlassCard>
        </motion.div>

        {/* Top Performers */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.45 }}>
          <GlassCard hover={false}>
            <h3 className="text-lg font-semibold text-[#E8EAED] mb-4 flex items-center gap-2">
              <Zap size={18} className="text-[#4285F4]" /> Top Performers
            </h3>
            {s.top_performers.length === 0 ? (
              <p className="text-sm text-[#5F6368]">No data yet.</p>
            ) : (
              <div className="space-y-3">
                {s.top_performers.slice(0, 5).map((p, i) => (
                  <div key={i} className="flex items-center justify-between py-1">
                    <div className="flex items-center gap-3">
                      <span className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold ${i === 0 ? 'bg-gradient-to-br from-[#FFD700] to-[#FFA500] text-white' : i === 1 ? 'bg-gradient-to-br from-[#C0C0C0] to-[#A0A0A0] text-white' : i === 2 ? 'bg-gradient-to-br from-[#CD7F32] to-[#8B4513] text-white' : 'bg-[rgba(255,255,255,0.05)] text-[#9AA0A6]'}`}>
                        {i + 1}
                      </span>
                      <div>
                        <div className="text-sm text-[#E8EAED] font-medium truncate">{p.name}</div>
                        <div className="text-[11px] text-[#9AA0A6]">🎮 {p.arcade_games} games • ⭐ {p.skill_badges} badges</div>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="text-sm font-bold text-[#FBBC04]">{p.total_points} Pts</div>
                      <div className="text-[11px] text-[#9AA0A6]">{p.completion}%</div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </GlassCard>
        </motion.div>
      </div>

      {/* Quick Links */}
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.5 }} className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <Link to="/participants" className="glass-card flex items-center justify-between group">
          <div className="flex items-center gap-3"><Users size={20} className="text-[#4285F4]" /><span className="text-sm font-medium text-[#E8EAED]">View All Participants</span></div>
          <ArrowRight size={16} className="text-[#5F6368] group-hover:text-[#8AB4F8] transition-colors" />
        </Link>
        <Link to="/analytics" className="glass-card flex items-center justify-between group">
          <div className="flex items-center gap-3"><BarChart3 size={20} className="text-[#FBBC04]" /><span className="text-sm font-medium text-[#E8EAED]">View Analytics</span></div>
          <ArrowRight size={16} className="text-[#5F6368] group-hover:text-[#8AB4F8] transition-colors" />
        </Link>
        <Link to="/settings" className="glass-card flex items-center justify-between group">
          <div className="flex items-center gap-3"><Database size={20} className="text-[#34A853]" /><span className="text-sm font-medium text-[#E8EAED]">Configure Sheet</span></div>
          <ArrowRight size={16} className="text-[#5F6368] group-hover:text-[#8AB4F8] transition-colors" />
        </Link>
      </motion.div>
    </div>
  );
}
