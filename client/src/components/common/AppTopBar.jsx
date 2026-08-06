import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { Search, Menu, Copy, CheckCircle2, Sun, Moon } from 'lucide-react';
import { useAuth } from '../../hooks/useAuth';
import { useTheme } from '../../hooks/useTheme';
import NotificationBell from '../notifications/NotificationBell';

const AppTopBar = ({ onMobileMenuToggle }) => {
  const { user } = useAuth();
  const { theme, toggleTheme, isDark } = useTheme();
  const [walletCopied, setWalletCopied] = useState(false);

  const walletAddress = user?.walletAddress || '0x71C7…8976F';
  const shortWallet = walletAddress.length > 12
    ? `${walletAddress.slice(0, 6)}…${walletAddress.slice(-5)}`
    : walletAddress;

  const handleCopyWallet = () => {
    navigator.clipboard.writeText(walletAddress).catch(() => {});
    setWalletCopied(true);
    setTimeout(() => setWalletCopied(false), 2000);
  };

  return (
    <header className="sticky top-0 z-30 flex items-center h-[57px] bg-white border-b border-[#E9E4DD] px-4 sm:px-6 gap-4 shrink-0 transition-colors">
      {/* Mobile hamburger */}
      <button
        onClick={onMobileMenuToggle}
        className="lg:hidden p-1.5 -ml-1 rounded-lg text-[#7B746E] hover:bg-[#F6F3EE] hover:text-[#2D2A27] transition-colors"
      >
        <Menu className="w-5 h-5" />
      </button>

      {/* Search */}
      <div className="flex-1 max-w-sm">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-[#AAA49F]" />
          <input
            type="text"
            placeholder="Search documents, transactions…"
            className="w-full pl-9 pr-4 py-2 text-[13px] bg-[#FAF8F4] border border-[#E9E4DD] rounded-lg text-[#2D2A27] placeholder:text-[#AAA49F] focus:outline-none focus:border-[#2D6A4F] transition-all"
          />
        </div>
      </div>

      <div className="flex-1" />

      {/* Right cluster */}
      <div className="flex items-center gap-2 sm:gap-3">
        {/* Wallet pill */}
        <button
          onClick={handleCopyWallet}
          title="Copy wallet address"
          className="hidden sm:flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-[#F0FAF5] border border-[#C3DDD0] text-[#2D6A4F] text-[12px] font-medium hover:bg-[#D9F2E6] transition-colors group"
        >
          {walletCopied ? (
            <CheckCircle2 className="w-3.5 h-3.5 text-[#2D6A4F]" />
          ) : (
            <div className="w-2 h-2 rounded-full bg-[#2D6A4F] animate-pulse" />
          )}
          <span className="font-mono">{shortWallet}</span>
          <Copy className="w-3 h-3 opacity-0 group-hover:opacity-60 transition-opacity" />
        </button>

        {/* Bright Mode / Dark Mode Toggle Button */}
        <button
          onClick={toggleTheme}
          title={`Switch to ${isDark ? 'Bright (Light)' : 'Dark'} Mode`}
          className="p-2 rounded-lg text-[#7B746E] hover:text-[#2D2A27] hover:bg-[#F6F3EE] border border-[#E9E4DD] transition-all flex items-center justify-center"
        >
          {isDark ? (
            <Sun className="w-4 h-4 text-amber-400 animate-spin-slow" />
          ) : (
            <Moon className="w-4 h-4 text-[#52796F]" />
          )}
        </button>

        {/* Notifications */}
        <NotificationBell />

        {/* Divider */}
        <div className="w-px h-6 bg-[#E9E4DD]" />

        {/* Profile link */}
        <Link
          to="/profile"
          className="flex items-center gap-2 rounded-lg py-1 px-1 hover:bg-[#F6F3EE] transition-colors"
        >
          <div className="w-7 h-7 rounded-md bg-[#2D6A4F] text-white flex items-center justify-center text-[11px] font-bold uppercase shrink-0">
            {user?.name?.charAt(0) || 'U'}
          </div>
          <div className="hidden sm:block text-left">
            <p className="text-[12px] font-semibold text-[#2D2A27] leading-tight">{user?.name || 'User'}</p>
            <p className="text-[11px] text-[#9B9490] capitalize leading-tight">{user?.role || 'Company'}</p>
          </div>
        </Link>
      </div>
    </header>
  );
};

export default AppTopBar;
