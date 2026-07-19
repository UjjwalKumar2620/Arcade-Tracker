// ============================================================
// Arcade Tracker — Sidebar Layout
// ============================================================
import React, { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  LayoutDashboard, Users, BarChart3, Shield,
  Trophy, Menu, X, ChevronLeft,
} from 'lucide-react';

const navItems = [
  { to: '/', label: 'Dashboard', icon: <LayoutDashboard size={20} /> },
  { to: '/participants', label: 'Participants', icon: <Users size={20} /> },
  { to: '/analytics', label: 'Analytics', icon: <BarChart3 size={20} /> },
  { to: '/settings', label: 'Admin Panel', icon: <Shield size={20} /> },
];

export default function Sidebar({ children }: { children: React.ReactNode }) {
  const location = useLocation();
  const [collapsed, setCollapsed] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);

  const isActive = (path: string) => path === '/' ? location.pathname === '/' : location.pathname.startsWith(path);

  const NavLink = ({ item, onClick }: { item: typeof navItems[0]; onClick?: () => void }) => (
    <Link
      to={item.to}
      onClick={onClick}
      className={`flex items-center gap-3 px-3 py-3 rounded-xl text-sm font-medium transition-all duration-200 ${
        isActive(item.to)
          ? 'bg-[rgba(66,133,244,0.15)] text-[#8AB4F8] shadow-sm'
          : 'text-[#9AA0A6] hover:text-[#E8EAED] hover:bg-[rgba(255,255,255,0.05)]'
      }`}
      title={collapsed ? item.label : undefined}
    >
      <span className="flex-shrink-0">{item.icon}</span>
      {!collapsed && <span>{item.label}</span>}
    </Link>
  );

  return (
    <div className="flex min-h-screen">
      {/* Desktop Sidebar */}
      <aside className={`hidden lg:flex flex-col fixed top-0 left-0 h-full z-40 transition-all duration-300 glass-strong border-r border-[rgba(255,255,255,0.08)] ${collapsed ? 'w-20' : 'w-64'}`}>
        <div className="flex items-center gap-3 px-5 h-16 border-b border-[rgba(255,255,255,0.08)]">
          <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-[#4285F4] to-[#34A853] flex items-center justify-center shadow-lg flex-shrink-0">
            <Trophy size={18} className="text-white" />
          </div>
          {!collapsed && (
            <motion.span initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="text-base font-bold text-gradient whitespace-nowrap">
              Arcade Tracker
            </motion.span>
          )}
        </div>
        <nav className="flex-1 py-4 px-3 space-y-1">
          {navItems.map(item => <NavLink key={item.to} item={item} />)}
        </nav>
        <button onClick={() => setCollapsed(!collapsed)} className="flex items-center justify-center h-12 border-t border-[rgba(255,255,255,0.08)] text-[#5F6368] hover:text-[#E8EAED] transition-colors">
          <ChevronLeft size={18} className={`transition-transform duration-300 ${collapsed ? 'rotate-180' : ''}`} />
        </button>
      </aside>

      {/* Mobile Header */}
      <div className="lg:hidden fixed top-0 left-0 right-0 h-16 z-50 glass-strong border-b border-[rgba(255,255,255,0.08)] flex items-center justify-between px-4">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-[#4285F4] to-[#34A853] flex items-center justify-center">
            <Trophy size={16} className="text-white" />
          </div>
          <span className="text-sm font-bold text-gradient">Arcade Tracker</span>
        </div>
        <button onClick={() => setMobileOpen(!mobileOpen)} className="p-2 rounded-xl text-[#9AA0A6] hover:text-[#E8EAED]">
          {mobileOpen ? <X size={20} /> : <Menu size={20} />}
        </button>
      </div>

      {/* Mobile Overlay */}
      <AnimatePresence>
        {mobileOpen && (
          <>
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="lg:hidden fixed inset-0 bg-black/60 z-40" onClick={() => setMobileOpen(false)} />
            <motion.div initial={{ x: -280 }} animate={{ x: 0 }} exit={{ x: -280 }} transition={{ type: 'spring', damping: 25, stiffness: 300 }} className="lg:hidden fixed top-0 left-0 h-full w-72 z-50 glass-strong border-r border-[rgba(255,255,255,0.08)]">
              <div className="flex items-center gap-3 px-5 h-16 border-b border-[rgba(255,255,255,0.08)]">
                <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-[#4285F4] to-[#34A853] flex items-center justify-center">
                  <Trophy size={18} className="text-white" />
                </div>
                <span className="text-base font-bold text-gradient">Arcade Tracker</span>
              </div>
              <nav className="py-4 px-3 space-y-1">
                {navItems.map(item => <NavLink key={item.to} item={item} onClick={() => setMobileOpen(false)} />)}
              </nav>
            </motion.div>
          </>
        )}
      </AnimatePresence>

      {/* Main Content */}
      <main className={`flex-1 transition-all duration-300 ${collapsed ? 'lg:ml-20' : 'lg:ml-64'} pt-16 lg:pt-0`}>
        <div className="min-h-screen">{children}</div>
      </main>
    </div>
  );
}
