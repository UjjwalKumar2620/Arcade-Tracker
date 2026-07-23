// ============================================================
// Arcade Tracker — Participant Detail Page
// View deep breakdown for a single participant (fetched live from sheet).
// ============================================================
import React, { useEffect, useState } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  ArrowLeft, Award, Gamepad2, Shield, ShieldCheck, ShieldAlert,
  ExternalLink, CheckCircle2, XCircle, Trophy, User, Key, Star,
  Check, X
} from 'lucide-react';
import { fetchParticipant } from '../lib/api';
import { GlassCard, LoadingSpinner, ProgressBar, PointSystemInfoCard } from '../components/ui';
import type { Participant } from '../types';

import { hasMilestone } from './ParticipantsPage';

export default function ParticipantDetailPage() {
  const { rowIndex } = useParams<{ rowIndex: string }>();
  const navigate = useNavigate();
  const [participant, setParticipant] = useState<Participant | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (rowIndex) loadParticipant(parseInt(rowIndex, 10));
  }, [rowIndex]);

  async function loadParticipant(idx: number) {
    try {
      setLoading(true);
      setError(null);
      const res = await fetchParticipant(idx);
      setParticipant(res.data as Participant);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Participant not found');
    } finally {
      setLoading(false);
    }
  }

  if (loading) return <LoadingSpinner size="lg" />;

  if (error || !participant) {
    return (
      <div className="p-6 lg:p-8">
        <button onClick={() => navigate('/participants')} className="flex items-center gap-2 text-[#9AA0A6] hover:text-[#E8EAED] mb-6">
          <ArrowLeft size={18} /> Back to Participants
        </button>
        <div className="glass-card text-center py-12 text-[#EE675C]">{error || 'Participant not found'}</div>
      </div>
    );
  }

  const p = participant;
  const skillBadgeList = p.skill_badge_names ? p.skill_badge_names.split(',').map(s => s.trim()).filter(Boolean) : [];
  const arcadeGameList = p.completed_game_names ? p.completed_game_names.split(',').map(s => s.trim()).filter(Boolean) : [];

  return (
    <div className="p-6 lg:p-8 space-y-6">
      {/* Back Button */}
      <button onClick={() => navigate('/participants')} className="flex items-center gap-2 text-sm text-[#9AA0A6] hover:text-[#E8EAED] transition-colors">
        <ArrowLeft size={16} /> Back to Participants
      </button>

      {/* Point System Information */}
      <PointSystemInfoCard />

      {/* Header Profile Card */}
      <GlassCard hover={false} className="p-6 sm:p-8">
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
          <div className="flex items-center gap-4">
            <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-[#4285F4] to-[#34A853] flex items-center justify-center text-white font-bold text-2xl shadow-lg">
              {p.name.charAt(0).toUpperCase()}
            </div>
            <div>
              <div className="flex items-center gap-2">
                {hasMilestone(p) && (
                  <span title="Milestone 1 Achieved" className="inline-flex items-center">
                    <Star
                      size={22}
                      className="text-[#FFB800] fill-[#FFB800] shrink-0"
                    />
                  </span>
                )}
                <h1 className="text-2xl font-bold text-[#E8EAED]">{p.name}</h1>
                {hasMilestone(p) && (
                  <span className="text-xs px-2.5 py-0.5 rounded-full bg-[rgba(255,184,0,0.15)] text-[#FFB800] border border-[rgba(255,184,0,0.3)] font-bold">
                    Milestone 1
                  </span>
                )}
              </div>
              <p className="text-sm text-[#9AA0A6]">{p.email}</p>
              <div className="flex flex-wrap items-center gap-2 mt-2">
                <span className="text-xs px-2.5 py-1 rounded-full bg-[rgba(251,188,4,0.2)] text-[#FBBC04] font-bold">
                  Total Points: {p.total_points} Pts
                </span>
                <span className="text-xs px-2.5 py-1 rounded-full bg-[rgba(66,133,244,0.15)] text-[#8AB4F8]">
                  Overall Rank #{p.rank_overall}
                </span>
                <span className="text-xs px-2.5 py-1 rounded-full bg-[rgba(251,188,4,0.15)] text-[#FDD663]">
                  Skills Rank #{p.rank_skill_badges}
                </span>
                <span className="text-xs px-2.5 py-1 rounded-full bg-[rgba(234,67,53,0.15)] text-[#EE675C]">
                  Arcade Rank #{p.rank_arcade_games}
                </span>
              </div>
            </div>
          </div>

          <div className="w-full md:w-64 space-y-3 p-4 rounded-xl bg-[rgba(255,255,255,0.03)] border border-[rgba(255,255,255,0.08)]">
            <div className="text-xs text-[#9AA0A6] space-y-1">
              <div className="flex justify-between"><span>Skill Badges:</span> <strong className="text-[#E8EAED]">{p.skill_badges}</strong></div>
              <div className="flex justify-between"><span>Arcade Games:</span> <strong className="text-[#E8EAED]">{p.arcade_games_completed}</strong></div>
              <div className="flex justify-between border-t border-[rgba(255,255,255,0.08)] pt-1 text-sm"><span className="text-[#FBBC04] font-semibold">Total Points:</span> <strong className="text-[#FBBC04]">{p.total_points} Pts</strong></div>
            </div>
            <ProgressBar value={p.completion_percentage} showPercentage size="sm" label="Completion" />
          </div>
        </div>
      </GlassCard>

      {/* Grid: 4 Breakdown Cards */}
      <div className="grid md:grid-cols-2 gap-6">
        {/* Verification & Links */}
        <GlassCard hover={false} className="space-y-4">
          <h3 className="text-lg font-semibold text-[#E8EAED] flex items-center gap-2">
            <ShieldCheck size={20} className="text-[#34A853]" /> Verification & Status
          </h3>
          <div className="space-y-3 divide-y divide-[rgba(255,255,255,0.05)] text-sm">
            <div className="pt-2 flex justify-between items-center">
              <span className="text-[#9AA0A6]">AI Agent Verification</span>
              <span className={`px-2.5 py-1 rounded-full text-xs font-medium ${
                (p.verification_status || '').toLowerCase().includes('verifi') || (p.verification_status || '').toLowerCase() === 'yes'
                  ? 'bg-[rgba(52,168,83,0.15)] text-[#5BB974]'
                  : 'bg-[rgba(251,188,4,0.15)] text-[#FDD663]'
              }`}>
                {p.verification_status || 'Pending'}
              </span>
            </div>

            <div className="pt-3 flex justify-between items-center">
              <span className="text-[#9AA0A6]">GEAR Digital Badge</span>
              <span className={`px-2.5 py-1 rounded-full text-xs font-medium ${
                p.digital_badge ? 'bg-[rgba(52,168,83,0.15)] text-[#5BB974]' : 'bg-[rgba(234,67,53,0.15)] text-[#EE675C]'
              }`}>
                {p.digital_badge ? 'Earned' : 'Not Earned'}
              </span>
            </div>

            <div className="pt-3 flex justify-between items-center">
              <span className="text-[#9AA0A6]">Access Code Redeemed</span>
              <span className={`px-2.5 py-1 rounded-full text-xs font-medium ${
                p.access_code?.toLowerCase() === 'yes' ? 'bg-[rgba(52,168,83,0.15)] text-[#5BB974]' : 'bg-[rgba(251,188,4,0.15)] text-[#FDD663]'
              }`}>
                {p.access_code || 'Pending'}
              </span>
            </div>

            <div className="pt-3 flex justify-between items-center">
              <span className="text-[#9AA0A6]">Google Skills Boost Profile</span>
              {p.google_skills_profile ? (
                <a href={p.google_skills_profile} target="_blank" rel="noopener noreferrer" className="flex items-center gap-1 text-[#8AB4F8] hover:underline text-xs">
                  View Profile <ExternalLink size={12} />
                </a>
              ) : (
                <span className="text-[#5F6368] text-xs">Not Provided</span>
              )}
            </div>

            <div className="pt-3 flex justify-between items-center">
              <span className="text-[#9AA0A6]">Developer Profile</span>
              {p.developer_profile ? (
                <a href={p.developer_profile} target="_blank" rel="noopener noreferrer" className="flex items-center gap-1 text-[#8AB4F8] hover:underline text-xs">
                  View Profile <ExternalLink size={12} />
                </a>
              ) : (
                <span className="text-[#5F6368] text-xs">Not Provided</span>
              )}
            </div>
          </div>
        </GlassCard>

        {/* Milestones */}
        <GlassCard hover={false} className="space-y-4">
          <h3 className="text-lg font-semibold text-[#E8EAED] flex items-center gap-2">
            <Trophy size={20} className="text-[#FBBC04]" /> Milestones
          </h3>
          <div className="space-y-4">
            <div className="p-4 rounded-xl bg-[rgba(255,255,255,0.03)] border border-[rgba(255,255,255,0.05)]">
              <p className="text-xs text-[#9AA0A6] uppercase font-semibold mb-1">General Milestone</p>
              <p className="text-base font-bold text-[#E8EAED]">{p.milestone || 'None'}</p>
            </div>
            <div className="p-4 rounded-xl bg-[rgba(255,255,255,0.03)] border border-[rgba(255,255,255,0.05)]">
              <p className="text-xs text-[#9AA0A6] uppercase font-semibold mb-1">Bonus Milestone</p>
              <p className="text-base font-bold text-[#E8EAED]">{p.bonus_milestone || 'None'}</p>
            </div>
          </div>
        </GlassCard>

        {/* Skill Badges Completed */}
        <GlassCard hover={false} className="space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-semibold text-[#E8EAED] flex items-center gap-2">
              <Award size={20} className="text-[#FBBC04]" /> Skill Badges ({p.skill_badges})
            </h3>
          </div>
          {skillBadgeList.length === 0 ? (
            <p className="text-sm text-[#5F6368]">No individual badge names listed.</p>
          ) : (
            <div className="space-y-2 max-h-60 overflow-y-auto pr-2">
              {skillBadgeList.map((badge, idx) => (
                <div key={idx} className="flex items-center gap-2 p-2.5 rounded-lg bg-[rgba(255,255,255,0.03)] text-xs text-[#E8EAED]">
                  <Check size={14} className="text-[#34A853] flex-shrink-0" />
                  <span>{badge}</span>
                </div>
              ))}
            </div>
          )}
        </GlassCard>

        {/* Arcade Games Completed */}
        <GlassCard hover={false} className="space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-semibold text-[#E8EAED] flex items-center gap-2">
              <Gamepad2 size={20} className="text-[#EA4335]" /> Arcade Games ({p.arcade_games_completed})
            </h3>
          </div>
          {arcadeGameList.length === 0 ? (
            <p className="text-sm text-[#5F6368]">No individual game names listed.</p>
          ) : (
            <div className="space-y-2 max-h-60 overflow-y-auto pr-2">
              {arcadeGameList.map((game, idx) => (
                <div key={idx} className="flex items-center gap-2 p-2.5 rounded-lg bg-[rgba(255,255,255,0.03)] text-xs text-[#E8EAED]">
                  <Check size={14} className="text-[#34A853] flex-shrink-0" />
                  <span>{game}</span>
                </div>
              ))}
            </div>
          )}
        </GlassCard>
      </div>
    </div>
  );
}
