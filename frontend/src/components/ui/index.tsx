// ============================================================
// Arcade Tracker — Reusable UI Components
// ============================================================
import React from 'react';
import { motion } from 'framer-motion';
import { Check, X, Award, Flame, Gamepad2, CreditCard, Shield, Star, Loader2 } from 'lucide-react';

// ==================== GLASS CARD ====================
interface GlassCardProps {
  children: React.ReactNode;
  className?: string;
  hover?: boolean;
  glow?: 'blue' | 'green' | 'yellow' | 'red';
  onClick?: () => void;
}

export function GlassCard({ children, className = '', hover = true, glow, onClick }: GlassCardProps) {
  const glowClass = glow ? `glow-${glow}` : '';
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
      whileHover={hover ? { y: -2, scale: 1.01 } : undefined}
      className={`glass-card ${glowClass} ${onClick ? 'cursor-pointer' : ''} ${className}`}
      onClick={onClick}
    >
      {children}
    </motion.div>
  );
}

// ==================== STAT CARD ====================
interface StatCardProps {
  label: string;
  value: number | string;
  icon: React.ReactNode;
  color: string;
  trend?: { value: number; label: string };
  delay?: number;
}

export function StatCard({ label, value, icon, color, trend, delay = 0 }: StatCardProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, delay }}
      className="glass-card group"
    >
      <div className="flex items-start justify-between">
        <div>
          <p className="text-sm text-[#9AA0A6] mb-1">{label}</p>
          <p className="text-3xl font-bold stat-value" style={{ color }}>
            {typeof value === 'number' ? value.toLocaleString() : value}
          </p>
          {trend && (
            <p className={`text-xs mt-1 ${trend.value >= 0 ? 'text-[#34A853]' : 'text-[#EA4335]'}`}>
              {trend.value >= 0 ? '↑' : '↓'} {Math.abs(trend.value)} {trend.label}
            </p>
          )}
        </div>
        <div
          className="p-3 rounded-xl transition-transform group-hover:scale-110"
          style={{ backgroundColor: `${color}20` }}
        >
          {icon}
        </div>
      </div>
    </motion.div>
  );
}

// ==================== BADGE ICONS ====================
interface StatusBadgeProps {
  active: boolean;
  label: string;
  type?: 'credits' | 'gear' | 'arcade' | 'reward';
}

export function StatusBadge({ active, label, type = 'credits' }: StatusBadgeProps) {
  const configs = {
    credits: { icon: <CreditCard size={12} />, activeColor: 'badge-success', inactiveColor: 'badge-danger' },
    gear: { icon: <Shield size={12} />, activeColor: 'badge-success', inactiveColor: 'badge-danger' },
    arcade: { icon: <Gamepad2 size={12} />, activeColor: 'badge-success', inactiveColor: 'badge-danger' },
    reward: { icon: <Star size={12} />, activeColor: 'badge-warning', inactiveColor: 'badge-danger' },
  };

  const config = configs[type];

  return (
    <span className={`badge ${active ? config.activeColor : config.inactiveColor}`}>
      {active ? <Check size={12} /> : <X size={12} />}
      {label}
    </span>
  );
}

// ==================== PROGRESS BAR ====================
interface ProgressBarProps {
  value: number;
  max?: number;
  label?: string;
  showPercentage?: boolean;
  size?: 'sm' | 'md' | 'lg';
  color?: string;
}

export function ProgressBar({
  value,
  max = 100,
  label,
  showPercentage = true,
  size = 'md',
  color,
}: ProgressBarProps) {
  const percentage = Math.min((value / max) * 100, 100);
  const heights = { sm: 'h-1.5', md: 'h-2.5', lg: 'h-4' };

  return (
    <div className="w-full">
      {(label || showPercentage) && (
        <div className="flex justify-between items-center mb-1">
          {label && <span className="text-xs text-[#9AA0A6]">{label}</span>}
          {showPercentage && (
            <span className="text-xs font-medium text-[#E8EAED]">{percentage.toFixed(1)}%</span>
          )}
        </div>
      )}
      <div className={`${heights[size]} bg-[rgba(255,255,255,0.08)] rounded-full overflow-hidden`}>
        <motion.div
          initial={{ width: 0 }}
          animate={{ width: `${percentage}%` }}
          transition={{ duration: 1, ease: 'easeOut', delay: 0.3 }}
          className={`h-full rounded-full`}
          style={{
            background: color || `linear-gradient(90deg, #4285F4, ${percentage > 70 ? '#34A853' : '#FBBC04'})`,
          }}
        />
      </div>
    </div>
  );
}

// ==================== SEARCH BAR ====================
interface SearchBarProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
}

export function SearchBar({ value, onChange, placeholder = 'Search participants...' }: SearchBarProps) {
  return (
    <div className="relative">
      <input
        type="text"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        className="w-full px-4 py-3 pl-11 rounded-xl bg-[rgba(255,255,255,0.05)] border border-[rgba(255,255,255,0.1)] text-[#E8EAED] placeholder-[#5F6368] focus:outline-none focus:border-[#4285F4] focus:bg-[rgba(255,255,255,0.08)] transition-all text-sm"
      />
      <svg className="absolute left-3.5 top-3.5 w-4 h-4 text-[#5F6368]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
      </svg>
    </div>
  );
}

// ==================== LOADING SPINNER ====================
export function LoadingSpinner({ size = 'md' }: { size?: 'sm' | 'md' | 'lg' }) {
  const sizes = { sm: 'w-5 h-5', md: 'w-8 h-8', lg: 'w-12 h-12' };
  return (
    <div className="flex items-center justify-center p-8">
      <Loader2 className={`${sizes[size]} animate-spin text-[#4285F4]`} />
    </div>
  );
}

// ==================== EMPTY STATE ====================
export function EmptyState({ icon, title, description }: { icon: React.ReactNode; title: string; description: string }) {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="flex flex-col items-center justify-center py-16 text-center"
    >
      <div className="p-4 rounded-2xl bg-[rgba(255,255,255,0.05)] mb-4">
        {icon}
      </div>
      <h3 className="text-lg font-semibold text-[#E8EAED] mb-2">{title}</h3>
      <p className="text-sm text-[#9AA0A6] max-w-md">{description}</p>
    </motion.div>
  );
}

// ==================== INSIGHT CARD ====================
export function InsightCard({ icon, message }: { icon: string; message: string }) {
  return (
    <motion.div
      initial={{ opacity: 0, x: -20 }}
      animate={{ opacity: 1, x: 0 }}
      className="flex items-center gap-3 px-4 py-3 glass-subtle"
    >
      <span className="text-xl">{icon}</span>
      <p className="text-sm text-[#E8EAED]">{message}</p>
    </motion.div>
  );
}

// ==================== PAGE HEADER ====================
export function PageHeader({ title, description, actions }: { title: string; description?: string; actions?: React.ReactNode }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: -10 }}
      animate={{ opacity: 1, y: 0 }}
      className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-8"
    >
      <div>
        <h1 className="text-2xl sm:text-3xl font-bold text-[#E8EAED]">{title}</h1>
        {description && <p className="text-sm text-[#9AA0A6] mt-1">{description}</p>}
      </div>
      {actions && <div className="flex items-center gap-3">{actions}</div>}
    </motion.div>
  );
}

// ==================== TAB BAR ====================
interface TabBarProps {
  tabs: { id: string; label: string; icon?: React.ReactNode }[];
  activeTab: string;
  onChange: (id: string) => void;
}

export function TabBar({ tabs, activeTab, onChange }: TabBarProps) {
  return (
    <div className="flex gap-1 p-1 glass-subtle rounded-xl overflow-x-auto">
      {tabs.map((tab) => (
        <button
          key={tab.id}
          onClick={() => onChange(tab.id)}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-lg text-sm font-medium whitespace-nowrap transition-all ${
            activeTab === tab.id
              ? 'bg-[rgba(66,133,244,0.2)] text-[#8AB4F8]'
              : 'text-[#9AA0A6] hover:text-[#E8EAED] hover:bg-[rgba(255,255,255,0.05)]'
          }`}
        >
          {tab.icon}
          {tab.label}
        </button>
      ))}
    </div>
  );
}

export * from './PointSystemInfoCard';

