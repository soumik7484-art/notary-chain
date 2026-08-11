import React, { useState } from 'react';
import { NavLink, Link, useNavigate, useLocation } from 'react-router-dom';
import {
  FileText, Wallet, User, Bell, Search, LayoutDashboard,
  FileCheck, ShieldCheck, History, BarChart3, Info, Plus, LogOut, Sun, Moon, Activity
} from 'lucide-react';
import { useAuth } from '../../hooks/useAuth';
import { useTheme } from '../../hooks/useTheme';
import NotificationBell from '../notifications/NotificationBell';

const DesktopTopNav = () => {
  const { user, logout } = useAuth();
  const { isDark, toggleTheme } = useTheme();
  const location = useLocation();
  const navigate = useNavigate();

  const handleLogout = async () => {
    await logout();
    navigate('/');
  };

  const centerLinks = [
    { label: 'Dashboard',     path: '/dashboard',          icon: LayoutDashboard },
    { label: 'Documents',     path: '/documents',          icon: FileText },
    { label: 'Verification',  path: '/verifications',       icon: ShieldCheck },
    { label: 'History',       path: '/admin/audit',        icon: History },
    { label: 'Analytics',     path: '/admin/analytics',    icon: BarChart3 },
    { label: 'Wallet Health', path: '/blockchain-health',  icon: Activity },
  ];

  return (
    <header className="hidden lg:block sticky top-0 z-50 bg-white border-b border-[#E8E2DA] shadow-xs">
      <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
        
        {/* Left: Logo */}
        <Link to="/dashboard" className="flex items-center gap-2.5 shrink-0">
          <div className="w-8 h-8 rounded-xl bg-[#2D6A4F] text-white flex items-center justify-center font-bold shadow-xs">
            <FileText className="w-4 h-4" />
          </div>
          <span className="font-display font-700 text-lg text-[#2E2A26] tracking-tight">NotaryChain</span>
        </Link>

        {/* Center: Desktop Navigation Links */}
        <nav className="flex items-center gap-1 bg-[#F6F3EE] p-1 rounded-xl border border-[#E8E2DA]">
          {centerLinks.map((link) => {
            const Icon = link.icon;
            const isActive = location.pathname === link.path;
            return (
              <NavLink
                key={link.path}
                to={link.path}
                className={({ isActive }) => `
                  flex items-center gap-2 px-3.5 py-1.5 rounded-lg text-xs font-semibold transition-all
                  ${isActive
                    ? 'bg-white text-[#2D6A4F] shadow-xs font-bold'
                    : 'text-[#55504B] hover:text-[#2E2A26] hover:bg-white/50'
                  }
                `}
              >
                <Icon className="w-3.5 h-3.5" />
                <span>{link.label}</span>
              </NavLink>
            );
          })}
        </nav>

        {/* Right: Wallet, Theme Toggle, Notifications, Profile & Logout */}
        <div className="flex items-center gap-3 shrink-0">
          {/* Wallet pill */}
          <Link
            to="/neobank"
            className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-[#F0FAF5] border border-[#B3E4CC] text-[#2D6A4F] hover:bg-[#D9F2E6] transition-all text-xs font-semibold shadow-xs"
          >
            <Wallet className="w-3.5 h-3.5" />
            <span>0x71C7...8976F</span>
          </Link>

          {/* Theme Toggle Button */}
          <button
            onClick={toggleTheme}
            title={`Switch to ${isDark ? 'Bright (Light)' : 'Dark'} Mode`}
            className="p-2 text-[#7B746E] hover:text-[#2E2A26] hover:bg-[#F6F3EE] rounded-xl border border-[#E8E2DA] transition-all flex items-center justify-center"
          >
            {isDark ? <Sun className="w-4 h-4 text-amber-400" /> : <Moon className="w-4 h-4 text-[#52796F]" />}
          </button>

          {/* Notifications */}
          <NotificationBell />

          {/* Profile link */}
          <Link to="/profile" className="flex items-center gap-2 pl-2 border-l border-[#E8E2DA]">
            {user?.avatar || user?.photoURL ? (
              <img
                src={user.avatar || user.photoURL}
                alt="profile"
                className="h-8 w-8 rounded-lg object-cover shadow-xs border border-[#E8E2DA]"
              />
            ) : (
              <div className="h-8 w-8 rounded-lg bg-[#2D6A4F] text-white flex items-center justify-center font-bold text-xs shadow-xs">
                {(user?.name || user?.firstName || 'U').charAt(0)}
              </div>
            )}
            <div className="text-left">
              <p className="text-xs font-semibold text-[#2E2A26] leading-tight">{user?.name || (user?.firstName ? `${user.firstName} ${user.lastName || ''}`.trim() : 'User')}</p>
              <p className="text-[10px] text-[#7B746E] capitalize">{user?.role === 'admin' ? 'System Admin' : user?.role === 'notary' ? 'Notary Officer' : 'Website User'}</p>
            </div>
          </Link>

          {/* Logout Button */}
          <button
            onClick={handleLogout}
            title="Log Out to Landing Page"
            className="p-2 text-[#7B746E] hover:text-[#DC2626] hover:bg-[#FEF2F2] rounded-xl border border-[#E8E2DA] transition-all"
          >
            <LogOut className="w-4 h-4" />
          </button>
        </div>

      </div>
    </header>
  );
};

export default DesktopTopNav;
