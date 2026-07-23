// ============================================================
// Arcade Tracker — Home Page
// Landing page with resource links, helpers, and participant
// status sections (unclaimed credits, not started labs).
// ============================================================
import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Link } from 'react-router-dom';
import {
  ExternalLink, Video, FileText, Users, HeartHandshake,
  ChevronDown, ChevronUp, AlertTriangle, Rocket,
  ArrowRight, BarChart3, Sparkles, Link2, UserX, Star,
} from 'lucide-react';
import { fetchParticipants } from '../lib/api';
import { GlassCard, LoadingSpinner } from '../components/ui';
import type { Participant } from '../types';
import { hasMilestone } from './ParticipantsPage';

// ── Helpers ──────────────────────────────────────────────────
const HELPERS = [
  'Ujjwal', 'Rupesh', 'Dev', 'Jiya', 'Sumit',
  'Knaishka Bhatt', 'Ayush Hemdani', 'Chesta Munjal',
  'Khushi Jain', 'Shilpi Aggarwal', 'Diksha Jain', 'Naitik',
];

// ── Helper Assignment Logic ─────────────────────────────────
function assignToHelpers(nonStarters: Participant[]): Record<string, Participant[]> {
  const assignments: Record<string, Participant[]> = {};
  for (const h of HELPERS) assignments[h] = [];

  let remaining = [...nonStarters];

  // 1. Anshika Tomar → always Ujjwal
  const anshikaIdx = remaining.findIndex(p =>
    p.name.toLowerCase().includes('anshika tomar'),
  );
  if (anshikaIdx !== -1) {
    assignments['Ujjwal'].push(remaining[anshikaIdx]);
    remaining.splice(anshikaIdx, 1);
  }

  // 2. Adrika Gaur → always Dev
  const adrikaIdx = remaining.findIndex(p =>
    p.name.toLowerCase().includes('adrika gaur'),
  );
  if (adrikaIdx !== -1) {
    assignments['Dev'].push(remaining[adrikaIdx]);
    remaining.splice(adrikaIdx, 1);
  }

  // 3. Round-robin: distribute remaining one-by-one across helpers
  //    e.g. 44 remaining / 12 helpers → first 8 helpers get 4, last 4 get 3
  for (let i = 0; i < remaining.length; i++) {
    const helperIndex = i % HELPERS.length;
    assignments[HELPERS[helperIndex]].push(remaining[i]);
  }

  return assignments;
}

// ── Resource Links ───────────────────────────────────────────
const RESOURCES = [
  {
    title: 'How to Claim Credits',
    description: 'Watch this video guide to learn how to claim your Google Cloud credits for the Arcade program.',
    url: 'https://www.youtube.com/watch?v=pA03jYwsDS4',
    icon: <Video size={22} />,
    color: '#EA4335',
    bgColor: 'rgba(234, 67, 53, 0.12)',
    borderColor: 'rgba(234, 67, 53, 0.3)',
  },
  {
    title: 'How to Do Labs Guide',
    description: 'Step-by-step documentation on how to complete the Arcade labs and earn badges.',
    url: 'https://docs.google.com/document/d/1BPUKyED6HhWd3zim-S4xPlWls7-3n1ci44ly395x4Yg/edit?tab=t.0#heading=h.wdnkb8i6rll7',
    icon: <FileText size={22} />,
    color: '#4285F4',
    bgColor: 'rgba(66, 133, 244, 0.12)',
    borderColor: 'rgba(66, 133, 244, 0.3)',
  },
];

// ── Collapsible Section Component ────────────────────────────
function CollapsibleSection({
  title,
  icon,
  count,
  color,
  borderColor,
  bgColor,
  children,
}: {
  title: string;
  icon: React.ReactNode;
  count: number;
  color: string;
  borderColor: string;
  bgColor: string;
  children: React.ReactNode;
}) {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="rounded-xl overflow-hidden"
      style={{ border: `1px solid ${borderColor}`, background: bgColor }}
    >
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="w-full flex items-center justify-between px-5 py-4 transition-all hover:bg-[rgba(255,255,255,0.03)]"
      >
        <div className="flex items-center gap-3">
          <div className="p-2 rounded-lg" style={{ backgroundColor: `${color}20` }}>
            {icon}
          </div>
          <div className="text-left">
            <h3 className="text-sm font-semibold text-[#E8EAED]">{title}</h3>
            <p className="text-xs text-[#9AA0A6]">{count} participant{count !== 1 ? 's' : ''}</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <span
            className="text-xs font-bold px-2.5 py-1 rounded-full"
            style={{ backgroundColor: `${color}20`, color }}
          >
            {count}
          </span>
          {isOpen ? (
            <ChevronUp size={18} className="text-[#9AA0A6]" />
          ) : (
            <ChevronDown size={18} className="text-[#9AA0A6]" />
          )}
        </div>
      </button>
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.3 }}
            className="overflow-hidden"
          >
            <div className="px-5 pb-4 pt-1 border-t" style={{ borderColor }}>
              {children}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}

// ── Main Component ───────────────────────────────────────────
export default function HomePage() {
  const [participants, setParticipants] = useState<Participant[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      try {
        const res = await fetchParticipants({ pageSize: '1000' });
        setParticipants((res.data ?? []) as Participant[]);
      } catch {
        // fail silently — sections just show 0
      } finally {
        setLoading(false);
      }
    }
    load();
  }, []);

  const notClaimed = participants.filter(
    p => !p.access_code || p.access_code.trim().toLowerCase() !== 'yes',
  );

  const notStarted = participants.filter(
    p => (p.skill_badges || 0) === 0 && (p.arcade_games_completed || 0) === 0,
  );

  // Wrong profiles: status exists and is NOT a "good" status
  const GOOD_STATUSES = ['all good', 'yes', 'ok', 'valid', 'verified', 'success'];
  const isWrongStatus = (status: string | null): boolean => {
    if (!status) return false; // null/empty means not submitted — not "wrong"
    const lower = status.toLowerCase().trim();
    return !GOOD_STATUSES.some(good => lower.includes(good));
  };

  const wrongDevProfile = participants.filter(p => isWrongStatus(p.developer_profile_status));
  const wrongSkillsProfile = participants.filter(p => isWrongStatus(p.google_skills_profile_status));

  const helperAssignments = assignToHelpers(notStarted);

  return (
    <div className="p-6 lg:p-8 space-y-8 max-w-5xl mx-auto">
      {/* ── Hero ──────────────────────────────────────────── */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="text-center py-8 sm:py-12"
      >
        <motion.div
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ type: 'spring', stiffness: 200, damping: 15, delay: 0.1 }}
          className="w-28 h-28 sm:w-32 sm:h-32 rounded-full mx-auto mb-6 shadow-2xl shadow-[#00FFE5]/20 overflow-hidden"
        >
          <img
            src="/arcade-facilitator-badge.png"
            alt="Google Cloud Arcade Facilitator Program"
            className="w-full h-full object-cover"
          />
        </motion.div>
        <h1 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold text-gradient mb-3">
          Google Cloud Arcade Tracker
        </h1>
        <p className="text-sm sm:text-base text-[#9AA0A6] max-w-lg mx-auto">
          Track your Arcade progress, earn badges, complete labs, and level up your cloud skills.
        </p>
      </motion.div>

      {/* ── Resource Links ─────────────────────────────── */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.15 }}
      >
        <h2 className="text-lg font-bold text-[#E8EAED] mb-4 flex items-center gap-2">
          <Sparkles size={20} className="text-[#FBBC04]" /> Helpful Resources
        </h2>
        <div className="grid sm:grid-cols-2 gap-4">
          {RESOURCES.map((r) => (
            <a
              key={r.title}
              href={r.url}
              target="_blank"
              rel="noopener noreferrer"
              className="glass-card group flex items-start gap-4 hover:border-opacity-60 transition-all"
              style={{ borderColor: r.borderColor }}
            >
              <div
                className="p-3 rounded-xl flex-shrink-0 transition-transform group-hover:scale-110"
                style={{ backgroundColor: r.bgColor, color: r.color }}
              >
                {r.icon}
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-1">
                  <h3 className="text-sm font-semibold text-[#E8EAED]">{r.title}</h3>
                  <ExternalLink size={14} className="text-[#5F6368] group-hover:text-[#8AB4F8] transition-colors flex-shrink-0" />
                </div>
                <p className="text-xs text-[#9AA0A6] leading-relaxed">{r.description}</p>
              </div>
            </a>
          ))}
        </div>
      </motion.div>

      {/* ── Helpers Section ────────────────────────────── */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.25 }}
      >
        <GlassCard hover={false} className="space-y-4">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-xl bg-[rgba(0,102,255,0.15)] text-[#0066FF]">
              <HeartHandshake size={22} />
            </div>
            <div>
              <h2 className="text-lg font-bold text-[#E8EAED]">Our Helpers</h2>
              <p className="text-xs text-[#9AA0A6]">
                You can ask your doubts from them in the group.
              </p>
            </div>
          </div>
          <div className="flex flex-wrap gap-2">
            {HELPERS.map((name, i) => {
              const isUjjwal = name === 'Ujjwal';
              return (
              <motion.span
                key={name}
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 0.3 + i * 0.04 }}
                className={`inline-flex items-center gap-1.5 px-3 py-2 rounded-lg text-sm font-medium ${isUjjwal ? 'fire-badge' : ''}`}
                style={isUjjwal ? {} : {
                  background: `${COLORS_HELPERS[i % COLORS_HELPERS.length]}15`,
                  color: COLORS_HELPERS[i % COLORS_HELPERS.length],
                  border: `1px solid ${COLORS_HELPERS[i % COLORS_HELPERS.length]}30`,
                }}
              >
                <span className={`w-5 h-5 rounded-full flex items-center justify-center text-[10px] font-bold text-white ${isUjjwal ? 'fire-avatar' : ''}`}
                  style={isUjjwal ? { background: 'linear-gradient(135deg, #FF4400, #FF6B00)' } : { background: COLORS_HELPERS[i % COLORS_HELPERS.length] }}
                >
                  {name.charAt(0)}
                </span>
                {name}
              </motion.span>
              );
            })}
          </div>
        </GlassCard>
      </motion.div>

      {/* ── Participant Status Sections ────────────────── */}
      {loading ? (
        <LoadingSpinner size="md" />
      ) : (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.35 }}
          className="space-y-4"
        >
          <h2 className="text-lg font-bold text-[#E8EAED] flex items-center gap-2">
            <Users size={20} className="text-[#3B82F6]" /> Participant Status
          </h2>

          {/* Not Claimed Credits */}
          <CollapsibleSection
            title="People Who Have Not Claimed Credits"
            icon={<AlertTriangle size={18} className="text-[#FBBC04]" />}
            count={notClaimed.length}
            color="#FBBC04"
            borderColor="rgba(251, 188, 4, 0.2)"
            bgColor="rgba(251, 188, 4, 0.04)"
          >
            {notClaimed.length === 0 ? (
              <p className="text-sm text-[#9AA0A6] py-2">Everyone has claimed their credits! 🎉</p>
            ) : (
              <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-2 pt-2 max-h-80 overflow-y-auto">
                {notClaimed.map((p, i) => (
                  <div
                    key={p.email}
                    className="flex items-center gap-2 px-3 py-2 rounded-lg bg-[rgba(255,255,255,0.03)] text-sm"
                  >
                    <span className="w-5 h-5 rounded-full bg-[rgba(251,188,4,0.2)] text-[#FBBC04] flex items-center justify-center text-[10px] font-bold">
                      {i + 1}
                    </span>
                    <span className="text-[#E8EAED] truncate flex items-center gap-1">
                      {hasMilestone(p) && (
                        <span title="Milestone 1 Achieved" className="inline-flex items-center">
                          <Star size={14} className="text-[#FFB800] fill-[#FFB800] shrink-0" />
                        </span>
                      )}
                      <span>{p.name}</span>
                    </span>
                  </div>
                ))}
              </div>
            )}
          </CollapsibleSection>

          {/* Not Started Labs */}
          <CollapsibleSection
            title="People Who Have Not Started Labs"
            icon={<Rocket size={18} className="text-[#EA4335]" />}
            count={notStarted.length}
            color="#EA4335"
            borderColor="rgba(234, 67, 53, 0.2)"
            bgColor="rgba(234, 67, 53, 0.04)"
          >
            {notStarted.length === 0 ? (
              <p className="text-sm text-[#9AA0A6] py-2">Everyone has started! Great progress! 🚀</p>
            ) : (
              <div className="space-y-4 pt-2">
                {HELPERS.map((helper) => {
                  const assigned = helperAssignments[helper];
                  if (!assigned || assigned.length === 0) return null;
                  return (
                    <div key={helper}>
                      <div className="flex items-center gap-2 mb-2">
                        <span className="text-xs font-bold text-[#A855F7] bg-[rgba(139,92,246,0.15)] px-2.5 py-1 rounded-md">
                          {helper}
                        </span>
                        <span className="text-[10px] text-[#9AA0A6]">
                          ({assigned.length} assigned)
                        </span>
                      </div>
                      <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-1.5 pl-1">
                        {assigned.map((p, i) => (
                          <div
                            key={p.email}
                            className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-[rgba(255,255,255,0.03)] text-sm"
                          >
                            <span className="w-4 h-4 rounded-full bg-[rgba(234,67,53,0.2)] text-[#EE675C] flex items-center justify-center text-[9px] font-bold">
                              {i + 1}
                            </span>
                            <span className="text-[#E8EAED] truncate text-xs flex items-center gap-1">
                              {hasMilestone(p) && (
                                <span title="Milestone 1 Achieved" className="inline-flex items-center">
                                  <Star size={12} className="text-[#FFB800] fill-[#FFB800] shrink-0" />
                                </span>
                              )}
                              <span>{p.name}</span>
                            </span>
                          </div>
                        ))}
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </CollapsibleSection>

          {/* Wrong Developer Profile */}
          <CollapsibleSection
            title="Wrong Google Developer Profile"
            icon={<Link2 size={18} className="text-[#FFB800]" />}
            count={wrongDevProfile.length}
            color="#FFB800"
            borderColor="rgba(255, 184, 0, 0.2)"
            bgColor="rgba(255, 184, 0, 0.04)"
          >
            {wrongDevProfile.length === 0 ? (
              <p className="text-sm text-[#9AA0A6] py-2">All developer profiles look good! ✅</p>
            ) : (
              <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-2 pt-2 max-h-80 overflow-y-auto">
                {wrongDevProfile.map((p, i) => (
                  <div
                    key={p.email}
                    className="flex items-center gap-2 px-3 py-2 rounded-lg bg-[rgba(255,255,255,0.03)] text-sm"
                  >
                    <span className="w-5 h-5 rounded-full bg-[rgba(255,184,0,0.2)] text-[#FFB800] flex items-center justify-center text-[10px] font-bold">
                      {i + 1}
                    </span>
                    <div className="min-w-0">
                      <span className="text-[#E8EAED] truncate block text-xs flex items-center gap-1">
                        {hasMilestone(p) && (
                          <span title="Milestone 1 Achieved" className="inline-flex items-center">
                            <Star size={12} className="text-[#FFB800] fill-[#FFB800] shrink-0" />
                          </span>
                        )}
                        <span>{p.name}</span>
                      </span>
                      <span className="text-[10px] text-[#FFB800] truncate block">{p.developer_profile_status}</span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CollapsibleSection>

          {/* Wrong Skills Profile */}
          <CollapsibleSection
            title="Wrong Google Skills Profile"
            icon={<UserX size={18} className="text-[#7C3AED]" />}
            count={wrongSkillsProfile.length}
            color="#7C3AED"
            borderColor="rgba(124, 58, 237, 0.2)"
            bgColor="rgba(124, 58, 237, 0.04)"
          >
            {wrongSkillsProfile.length === 0 ? (
              <p className="text-sm text-[#9AA0A6] py-2">All skills profiles look good! ✅</p>
            ) : (
              <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-2 pt-2 max-h-80 overflow-y-auto">
                {wrongSkillsProfile.map((p, i) => (
                  <div
                    key={p.email}
                    className="flex items-center gap-2 px-3 py-2 rounded-lg bg-[rgba(255,255,255,0.03)] text-sm"
                  >
                    <span className="w-5 h-5 rounded-full bg-[rgba(124,58,237,0.2)] text-[#7C3AED] flex items-center justify-center text-[10px] font-bold">
                      {i + 1}
                    </span>
                    <div className="min-w-0">
                      <span className="text-[#E8EAED] truncate block text-xs flex items-center gap-1">
                        {hasMilestone(p) && (
                          <span title="Milestone 1 Achieved" className="inline-flex items-center">
                            <Star size={12} className="text-[#FFB800] fill-[#FFB800] shrink-0" />
                          </span>
                        )}
                        <span>{p.name}</span>
                      </span>
                      <span className="text-[10px] text-[#7C3AED] truncate block">{p.google_skills_profile_status}</span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CollapsibleSection>
        </motion.div>
      )}

      {/* ── Quick Navigation ──────────────────────────── */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.45 }}
        className="grid grid-cols-1 sm:grid-cols-3 gap-4"
      >
        <Link to="/dashboard" className="glass-card flex items-center justify-between group">
          <div className="flex items-center gap-3">
            <BarChart3 size={20} className="text-[#00BFFF]" />
            <span className="text-sm font-medium text-[#E8EAED]">Dashboard</span>
          </div>
          <ArrowRight size={16} className="text-[#666] group-hover:text-[#00FFE5] transition-colors" />
        </Link>
        <Link to="/participants" className="glass-card flex items-center justify-between group">
          <div className="flex items-center gap-3">
            <Users size={20} className="text-[#FFE500]" />
            <span className="text-sm font-medium text-[#E8EAED]">Participants</span>
          </div>
          <ArrowRight size={16} className="text-[#666] group-hover:text-[#00FFE5] transition-colors" />
        </Link>
        <Link to="/analytics" className="glass-card flex items-center justify-between group">
          <div className="flex items-center gap-3">
            <BarChart3 size={20} className="text-[#39FF14]" />
            <span className="text-sm font-medium text-[#E8EAED]">Analytics</span>
          </div>
          <ArrowRight size={16} className="text-[#666] group-hover:text-[#00FFE5] transition-colors" />
        </Link>
      </motion.div>
    </div>
  );
}

// Bold dark helper badge colors — NO red, NO pink (red is exclusive to Ujjwal's fire badge)
const COLORS_HELPERS = [
  '#0066FF', '#00FFE5', '#39FF14', '#FFB800', '#7C3AED', '#00BFFF',
  '#4F46E5', '#06B6D4', '#22C55E', '#FACC15', '#6366F1', '#14B8A6',
];
