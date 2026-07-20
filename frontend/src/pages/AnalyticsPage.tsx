// ============================================================
// Arcade Tracker — Analytics Page
// Dynamic analytics generated on-the-fly from live Google Sheet data.
// ============================================================
import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import {
  BarChart3, Award, Gamepad2, Shield, TrendingUp,
  RefreshCw, CheckCircle2, AlertCircle, PieChart, Trophy,
} from 'lucide-react';
import { fetchChartData, refreshData } from '../lib/api';
import { PageHeader, LoadingSpinner, GlassCard, PointSystemInfoCard } from '../components/ui';
import type { ChartDataPoint } from '../types';

interface ChartSectionProps {
  title: string;
  subtitle: string;
  icon: React.ReactNode;
  data: ChartDataPoint[];
  type: 'bar' | 'pie' | 'horizontal';
}

function ChartCard({ title, subtitle, icon, data, type }: ChartSectionProps) {
  const maxVal = Math.max(...data.map(d => d.value), 1);
  const totalVal = data.reduce((s, d) => s + d.value, 0);

  return (
    <GlassCard hover={false} className="space-y-4">
      <div>
        <h3 className="text-lg font-semibold text-[#E8EAED] flex items-center gap-2">
          {icon}
          {title}
        </h3>
        <p className="text-xs text-[#9AA0A6] mt-0.5">{subtitle}</p>
      </div>

      {data.length === 0 ? (
        <p className="text-sm text-[#5F6368] py-8 text-center">No data available.</p>
      ) : type === 'horizontal' ? (
        <div className="space-y-3 pt-2">
          {data.map((item, i) => (
            <div key={i} className="space-y-1">
              <div className="flex justify-between text-xs font-medium">
                <span className="text-[#E8EAED] truncate max-w-[200px]">{item.label}</span>
                <span className="text-[#FBBC04] font-bold">{item.value} Pts</span>
              </div>
              <div className="h-3 bg-[rgba(255,255,255,0.06)] rounded-full overflow-hidden">
                <motion.div
                  initial={{ width: 0 }}
                  animate={{ width: `${(item.value / maxVal) * 100}%` }}
                  transition={{ duration: 0.8, delay: i * 0.05 }}
                  className="h-full rounded-full"
                  style={{ backgroundColor: item.color || '#4285F4' }}
                />
              </div>
            </div>
          ))}
        </div>
      ) : type === 'bar' ? (
        <div className="flex items-end justify-around gap-2 pt-6 pb-2 h-52">
          {data.map((item, i) => {
            const heightPct = Math.max((item.value / maxVal) * 100, 5);
            return (
              <div key={i} className="flex flex-col items-center flex-1 h-full justify-end group">
                <span className="text-xs font-semibold text-[#E8EAED] mb-2 opacity-80 group-hover:opacity-100">{item.value}</span>
                <motion.div
                  initial={{ height: 0 }}
                  animate={{ height: `${heightPct}%` }}
                  transition={{ duration: 0.8, delay: i * 0.05 }}
                  className="w-full rounded-t-lg transition-transform group-hover:scale-105"
                  style={{ backgroundColor: item.color || '#4285F4' }}
                />
                <span className="text-[11px] text-[#9AA0A6] mt-2 truncate w-full text-center">{item.label}</span>
              </div>
            );
          })}
        </div>
      ) : (
        /* Donut / Pie Summary representation */
        <div className="space-y-3 pt-2">
          {data.map((item, i) => {
            const pct = totalVal > 0 ? Math.round((item.value / totalVal) * 100) : 0;
            return (
              <div key={i} className="p-3 rounded-xl bg-[rgba(255,255,255,0.03)] flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-3 h-3 rounded-full flex-shrink-0" style={{ backgroundColor: item.color || '#4285F4' }} />
                  <span className="text-sm font-medium text-[#E8EAED]">{item.label}</span>
                </div>
                <div className="text-right">
                  <span className="text-sm font-bold text-[#E8EAED] mr-2">{item.value}</span>
                  <span className="text-xs text-[#9AA0A6]">({pct}%)</span>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </GlassCard>
  );
}

export default function AnalyticsPage() {
  const [charts, setCharts] = useState<{
    badgeDistribution: ChartDataPoint[];
    gameCompletion: ChartDataPoint[];
    milestones: ChartDataPoint[];
    gear: ChartDataPoint[];
    verification: ChartDataPoint[];
    topPerformers: ChartDataPoint[];
  }>({
    badgeDistribution: [],
    gameCompletion: [],
    milestones: [],
    gear: [],
    verification: [],
    topPerformers: [],
  });

  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => { loadAllCharts(); }, []);

  async function loadAllCharts() {
    try {
      setLoading(true);
      setError(null);
      const [bd, gc, md, gr, vs, tp] = await Promise.all([
        fetchChartData('badge-distribution'),
        fetchChartData('game-completion'),
        fetchChartData('milestone-distribution'),
        fetchChartData('gear-completion'),
        fetchChartData('verification-status'),
        fetchChartData('top-performers'),
      ]);

      setCharts({
        badgeDistribution: bd.data as ChartDataPoint[],
        gameCompletion: gc.data as ChartDataPoint[],
        milestones: md.data as ChartDataPoint[],
        gear: gr.data as ChartDataPoint[],
        verification: vs.data as ChartDataPoint[],
        topPerformers: tp.data as ChartDataPoint[],
      });
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load analytics');
    } finally {
      setLoading(false);
    }
  }

  async function handleRefresh() {
    try {
      setRefreshing(true);
      await refreshData();
      await loadAllCharts();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Refresh failed');
    } finally {
      setRefreshing(false);
    }
  }

  if (loading) return <LoadingSpinner size="lg" />;

  return (
    <div className="p-6 lg:p-8 space-y-6">
      <PageHeader
        title="Analytics & Charts"
        description="Real-time analytical insights derived directly from your Google Sheet"
        actions={
          <button
            onClick={handleRefresh}
            disabled={refreshing}
            className="flex items-center gap-2 px-4 py-2.5 rounded-xl glass-subtle text-[#E8EAED] text-sm font-medium hover:bg-[rgba(255,255,255,0.08)] transition-all disabled:opacity-50"
          >
            <RefreshCw size={16} className={refreshing ? 'animate-spin' : ''} />
            {refreshing ? 'Refreshing...' : 'Refresh Charts'}
          </button>
        }
      />

      {/* Point System Information Card */}
      <PointSystemInfoCard />

      {error ? (
        <div className="glass-card p-8 text-center text-[#EE675C]">{error}</div>
      ) : (
        <div className="grid md:grid-cols-2 gap-6">
          {/* Skill Badge Distribution */}
          <ChartCard
            title="Skill Badges Distribution"
            subtitle="Number of participants by completed skill badge ranges"
            icon={<Award size={20} className="text-[#FBBC04]" />}
            data={charts.badgeDistribution}
            type="bar"
          />

          {/* Arcade Games Completion */}
          <ChartCard
            title="Arcade Games Completed"
            subtitle="Number of participants by completed arcade games"
            icon={<Gamepad2 size={20} className="text-[#EA4335]" />}
            data={charts.gameCompletion}
            type="bar"
          />

          {/* Milestones Distribution */}
          <ChartCard
            title="Milestone Distribution"
            subtitle="Breakdown of participants by earned milestone level"
            icon={<TrendingUp size={20} className="text-[#4285F4]" />}
            data={charts.milestones}
            type="horizontal"
          />

          {/* Top Performers */}
          <ChartCard
            title="Leaderboard Top 10 (Total Points)"
            subtitle="Participants ranked by Total Points = Arcade Games + ⌊Skill Badges ÷ 2⌋"
            icon={<Trophy size={20} className="text-[#FBBC04]" />}
            data={charts.topPerformers}
            type="horizontal"
          />

          {/* GEAR Status */}
          <ChartCard
            title="GEAR Badge Completion"
            subtitle="Status of GEAR digital badges across all participants"
            icon={<Shield size={20} className="text-[#34A853]" />}
            data={charts.gear}
            type="pie"
          />

          {/* Verification Status */}
          <ChartCard
            title="AI Agent Verification Status"
            subtitle="Verified vs pending participant accounts"
            icon={<CheckCircle2 size={20} className="text-[#34A853]" />}
            data={charts.verification}
            type="pie"
          />
        </div>
      )}
    </div>
  );
}
