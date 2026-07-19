// ============================================================
// Arcade Tracker — Participants Page
// Dynamic table with live data from Google Sheets API.
// Includes search, filters, sorting, and pagination.
// ============================================================
import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import {
  Users, Search, ChevronLeft, ChevronRight,
  ExternalLink, ArrowUpDown, ShieldCheck, ShieldAlert,
  Award, Gamepad2, Eye, RefreshCw, Filter,
} from 'lucide-react';
import { fetchParticipants, refreshData } from '../lib/api';
import { PageHeader, LoadingSpinner, EmptyState, ProgressBar, StatusBadge, PointSystemInfoCard } from '../components/ui';
import type { Participant } from '../types';

export default function ParticipantsPage() {
  const [participants, setParticipants] = useState<Participant[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Filters & Pagination state
  const [search, setSearch] = useState('');
  const [gearFilter, setGearFilter] = useState('all');
  const [verificationFilter, setVerificationFilter] = useState('all');
  const [sortBy, setSortBy] = useState('rank_overall');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('asc');
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalCount, setTotalCount] = useState(0);

  useEffect(() => {
    loadParticipants();
  }, [search, gearFilter, verificationFilter, sortBy, sortOrder, page]);

  async function loadParticipants() {
    try {
      setLoading(true);
      setError(null);
      const params: Record<string, string> = {
        page: page.toString(),
        pageSize: '25',
        sortBy,
        sortOrder,
      };
      if (search) params.search = search;
      if (gearFilter !== 'all') params.gear = gearFilter;
      if (verificationFilter !== 'all') params.verification = verificationFilter;

      const res = await fetchParticipants(params);
      setParticipants(res.data as Participant[]);
      if (res.meta) {
        setTotalPages(res.meta.totalPages as number || 1);
        setTotalCount(res.meta.total as number || 0);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch participants');
    } finally {
      setLoading(false);
    }
  }

  async function handleRefresh() {
    try {
      setRefreshing(true);
      await refreshData();
      await loadParticipants();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Refresh failed');
    } finally {
      setRefreshing(false);
    }
  }

  function handleSort(column: string) {
    if (sortBy === column) {
      setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
    } else {
      setSortBy(column);
      setSortOrder(column === 'name' || column === 'rank_overall' ? 'asc' : 'desc');
    }
    setPage(1);
  }

  return (
    <div className="p-6 lg:p-8 space-y-6">
      <PageHeader
        title="Participants"
        description={`Showing live Arcade progress for ${totalCount} registered participants`}
        actions={
          <button
            onClick={handleRefresh}
            disabled={refreshing}
            className="flex items-center gap-2 px-4 py-2.5 rounded-xl glass-subtle text-[#E8EAED] text-sm font-medium hover:bg-[rgba(255,255,255,0.08)] transition-all disabled:opacity-50"
          >
            <RefreshCw size={16} className={refreshing ? 'animate-spin' : ''} />
            {refreshing ? 'Refreshing...' : 'Refresh'}
          </button>
        }
      />

      {/* Point System Information Card */}
      <PointSystemInfoCard />

      {/* Controls Bar */}
      <div className="glass-card p-4 flex flex-col md:flex-row items-stretch md:items-center justify-between gap-4">
        {/* Search */}
        <div className="relative flex-1">
          <Search size={18} className="absolute left-3.5 top-3.5 text-[#5F6368]" />
          <input
            type="text"
            placeholder="Search by name or email..."
            value={search}
            onChange={(e) => { setSearch(e.target.value); setPage(1); }}
            className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-[rgba(255,255,255,0.05)] border border-[rgba(255,255,255,0.1)] text-[#E8EAED] placeholder-[#5F6368] focus:outline-none focus:border-[#4285F4] transition-all text-sm"
          />
        </div>

        {/* Filters */}
        <div className="flex flex-wrap items-center gap-3">
          <div className="flex items-center gap-2">
            <Filter size={16} className="text-[#9AA0A6]" />
            <select
              value={gearFilter}
              onChange={(e) => { setGearFilter(e.target.value); setPage(1); }}
              className="px-3 py-2.5 rounded-xl bg-[rgba(255,255,255,0.05)] border border-[rgba(255,255,255,0.1)] text-[#E8EAED] text-sm focus:outline-none focus:border-[#4285F4]"
            >
              <option value="all">GEAR Status: All</option>
              <option value="true">GEAR: Earned</option>
              <option value="false">GEAR: Pending</option>
            </select>
          </div>

          <select
            value={verificationFilter}
            onChange={(e) => { setVerificationFilter(e.target.value); setPage(1); }}
            className="px-3 py-2.5 rounded-xl bg-[rgba(255,255,255,0.05)] border border-[rgba(255,255,255,0.1)] text-[#E8EAED] text-sm focus:outline-none focus:border-[#4285F4]"
          >
            <option value="all">Verification: All</option>
            <option value="verified">Verified</option>
            <option value="pending">Pending</option>
          </select>
        </div>
      </div>

      {/* Table */}
      {loading ? (
        <LoadingSpinner size="lg" />
      ) : error ? (
        <div className="glass-card p-8 text-center text-[#EE675C]">{error}</div>
      ) : participants.length === 0 ? (
        <EmptyState
          icon={<Users size={36} className="text-[#5F6368]" />}
          title="No participants found"
          description={search ? `No results for "${search}". Try adjusting your query.` : 'No participants available in the Google Sheet.'}
        />
      ) : (
        <div className="glass-card overflow-hidden p-0">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm text-[#E8EAED]">
              <thead className="bg-[rgba(255,255,255,0.03)] border-b border-[rgba(255,255,255,0.08)] text-[#9AA0A6] uppercase text-xs">
                <tr>
                  <th className="py-4 px-4 font-semibold cursor-pointer" onClick={() => handleSort('rank_overall')}>
                    <div className="flex items-center gap-1">Rank <ArrowUpDown size={12} /></div>
                  </th>
                  <th className="py-4 px-4 font-semibold cursor-pointer" onClick={() => handleSort('name')}>
                    <div className="flex items-center gap-1">Participant <ArrowUpDown size={12} /></div>
                  </th>
                  <th className="py-4 px-4 font-semibold cursor-pointer" onClick={() => handleSort('total_points')}>
                    <div className="flex items-center gap-1 text-[#FBBC04]">Total Points <ArrowUpDown size={12} /></div>
                  </th>
                  <th className="py-4 px-4 font-semibold cursor-pointer" onClick={() => handleSort('skill_badges')}>
                    <div className="flex items-center gap-1">Skill Badges <ArrowUpDown size={12} /></div>
                  </th>
                  <th className="py-4 px-4 font-semibold cursor-pointer" onClick={() => handleSort('arcade_games_completed')}>
                    <div className="flex items-center gap-1">Arcade Games <ArrowUpDown size={12} /></div>
                  </th>
                  <th className="py-4 px-4 font-semibold cursor-pointer" onClick={() => handleSort('completion_percentage')}>
                    <div className="flex items-center gap-1">Completion <ArrowUpDown size={12} /></div>
                  </th>
                  <th className="py-4 px-4 font-semibold">GEAR Status</th>
                  <th className="py-4 px-4 font-semibold">Verification</th>
                  <th className="py-4 px-4 font-semibold text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[rgba(255,255,255,0.05)]">
                {participants.map((p) => (
                  <tr key={p.row_index} className="hover:bg-[rgba(255,255,255,0.03)] transition-colors">
                    <td className="py-4 px-4 font-bold">
                      <span className={`inline-flex items-center justify-center w-7 h-7 rounded-lg text-xs ${
                        p.rank_overall === 1 ? 'bg-gradient-to-br from-[#FFD700] to-[#FFA500] text-black font-extrabold' :
                        p.rank_overall === 2 ? 'bg-gradient-to-br from-[#C0C0C0] to-[#A0A0A0] text-black font-extrabold' :
                        p.rank_overall === 3 ? 'bg-gradient-to-br from-[#CD7F32] to-[#8B4513] text-white font-extrabold' :
                        'text-[#9AA0A6]'
                      }`}>
                        #{p.rank_overall}
                      </span>
                    </td>
                    <td className="py-4 px-4">
                      <div>
                        <div className="font-semibold text-[#E8EAED]">{p.name}</div>
                        <div className="text-xs text-[#9AA0A6]">{p.email}</div>
                      </div>
                    </td>
                    <td className="py-4 px-4">
                      <span className="px-3 py-1 rounded-lg bg-[rgba(251,188,4,0.12)] text-[#FBBC04] font-bold text-sm inline-block">
                        {p.total_points} Pts
                      </span>
                    </td>
                    <td className="py-4 px-4">
                      <div className="flex items-center gap-1.5 font-medium">
                        <Award size={16} className="text-[#FBBC04]" />
                        <span>{p.skill_badges}</span>
                      </div>
                    </td>
                    <td className="py-4 px-4">
                      <div className="flex items-center gap-1.5 font-medium">
                        <Gamepad2 size={16} className="text-[#EA4335]" />
                        <span>{p.arcade_games_completed}</span>
                      </div>
                    </td>
                    <td className="py-4 px-4 min-w-[140px]">
                      <ProgressBar value={p.completion_percentage} showPercentage size="sm" />
                    </td>
                    <td className="py-4 px-4">
                      <StatusBadge active={p.digital_badge} label={p.digital_badge ? 'GEAR Earned' : 'Pending'} type="gear" />
                    </td>
                    <td className="py-4 px-4">
                      <span className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-medium ${
                        (p.verification_status || '').toLowerCase().includes('verifi') || (p.verification_status || '').toLowerCase() === 'yes'
                          ? 'bg-[rgba(52,168,83,0.15)] text-[#5BB974]'
                          : 'bg-[rgba(251,188,4,0.15)] text-[#FDD663]'
                      }`}>
                        {(p.verification_status || '').toLowerCase().includes('verifi') || (p.verification_status || '').toLowerCase() === 'yes' ? (
                          <><ShieldCheck size={12} /> Verified</>
                        ) : (
                          <><ShieldAlert size={12} /> Pending</>
                        )}
                      </span>
                    </td>
                    <td className="py-4 px-4 text-right">
                      <div className="flex items-center justify-end gap-2">
                        {p.google_skills_profile && (
                          <a
                            href={p.google_skills_profile}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="p-2 rounded-lg text-[#9AA0A6] hover:text-[#8AB4F8] hover:bg-[rgba(255,255,255,0.05)] transition-colors"
                            title="View Skills Boost Profile"
                          >
                            <ExternalLink size={16} />
                          </a>
                        )}
                        <Link
                          to={`/participants/${p.row_index}`}
                          className="p-2 rounded-lg text-[#9AA0A6] hover:text-[#E8EAED] hover:bg-[rgba(255,255,255,0.05)] transition-colors"
                          title="View Details"
                        >
                          <Eye size={16} />
                        </Link>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Pagination */}
          <div className="p-4 border-t border-[rgba(255,255,255,0.08)] flex items-center justify-between text-xs text-[#9AA0A6]">
            <div>
              Showing page <span className="font-semibold text-[#E8EAED]">{page}</span> of{' '}
              <span className="font-semibold text-[#E8EAED]">{totalPages}</span> ({totalCount} items)
            </div>
            <div className="flex items-center gap-2">
              <button
                onClick={() => setPage(p => Math.max(1, p - 1))}
                disabled={page === 1}
                className="p-2 rounded-lg glass-subtle text-[#E8EAED] hover:bg-[rgba(255,255,255,0.08)] disabled:opacity-40 transition-colors"
              >
                <ChevronLeft size={16} />
              </button>
              <button
                onClick={() => setPage(p => Math.min(totalPages, p + 1))}
                disabled={page === totalPages}
                className="p-2 rounded-lg glass-subtle text-[#E8EAED] hover:bg-[rgba(255,255,255,0.08)] disabled:opacity-40 transition-colors"
              >
                <ChevronRight size={16} />
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
