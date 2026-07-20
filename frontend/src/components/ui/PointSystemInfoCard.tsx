// ============================================================
// Arcade Tracker — Ranking Point System Info Card
// Displayed above all leaderboard and ranking sections.
// ============================================================
import React from 'react';
import { motion } from 'framer-motion';
import { Trophy, Star, Gamepad2, BarChart2 } from 'lucide-react';

export function PointSystemInfoCard({ className = '' }: { className?: string }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: -10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className={`glass-card p-4 sm:p-5 border border-[rgba(251,188,4,0.2)] bg-gradient-to-r from-[rgba(251,188,4,0.06)] via-[rgba(66,133,244,0.06)] to-[rgba(52,168,83,0.06)] rounded-2xl ${className}`}
    >
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div className="flex items-center gap-2.5">
          <div className="p-2 rounded-xl bg-[rgba(251,188,4,0.15)] text-[#FBBC04] flex-shrink-0">
            <Trophy size={18} />
          </div>
          <div>
            <h4 className="text-sm font-bold text-[#E8EAED]">🏆 Ranking Point System</h4>
            <p className="text-xs text-[#9AA0A6]">Rankings are calculated dynamically based on total accumulated points.</p>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-3 sm:gap-4 text-xs font-medium pt-2 sm:pt-0 border-t sm:border-t-0 border-[rgba(255,255,255,0.08)]">
          <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-[rgba(255,255,255,0.05)] text-[#E8EAED]">
            <Star size={14} className="text-[#FBBC04]" />
            <span>2 Skill Badges = <strong className="text-[#FBBC04]">1 Pt</strong></span>
          </div>

          <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-[rgba(255,255,255,0.05)] text-[#E8EAED]">
            <Gamepad2 size={14} className="text-[#EA4335]" />
            <span>1 Arcade Game = <strong className="text-[#EE675C]">1 Pt</strong></span>
          </div>

          <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-[rgba(66,133,244,0.15)] text-[#8AB4F8] font-bold">
            <BarChart2 size={14} />
            <span>Total Points = Arcade Games + ⌊Skill Badges ÷ 2⌋</span>
          </div>
        </div>
      </div>
    </motion.div>
  );
}
