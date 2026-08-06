import React from 'react';
import { Menu, Search, LogOut } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';
import NotificationBell from '../notifications/NotificationBell';

const Header = ({ onMenuToggle }) => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = async () => {
    await logout();
    navigate('/');
  };

  return (
    <header className="h-16 bg-white border-b border-[#E8E2DA] sticky top-0 z-30 px-4 flex items-center justify-between shadow-xs">
      <div className="flex items-center gap-3">
        <button
          onClick={onMenuToggle}
          className="p-2 -ml-2 rounded-lg text-[#55504B] hover:bg-[#F6F3EE] lg:hidden transition-colors"
          aria-label="Toggle Menu"
        >
          <Menu className="w-5 h-5" />
        </button>

        <div className="relative hidden sm:block">
          <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-[#7B746E]" />
          <input 
            type="text" 
            placeholder="Search documents..." 
            className="pl-9 pr-4 py-2 bg-[#F6F3EE] border border-[#E8E2DA] rounded-xl text-xs text-[#2E2A26] placeholder-[#7B746E] focus:bg-white focus:border-[#2D6A4F] focus:ring-2 focus:ring-[#2D6A4F]/15 w-48 sm:w-64 transition-all outline-none"
          />
        </div>
      </div>

      <div className="flex items-center gap-2.5">
        <NotificationBell />

        <div className="flex items-center gap-2 pl-2 border-l border-[#E8E2DA]">
          <div className="h-8 w-8 rounded-lg bg-[#2D6A4F] text-white flex items-center justify-center font-bold text-xs shadow-xs">
            {user?.name?.charAt(0) || 'U'}
          </div>
          <div className="hidden sm:block text-left">
            <p className="text-xs font-semibold text-[#2E2A26] leading-tight">{user?.name || 'User'}</p>
            <p className="text-[10px] text-[#7B746E] capitalize">{user?.role || 'Company'}</p>
          </div>
        </div>

        <button
          onClick={handleLogout}
          title="Log Out to Landing Page"
          className="p-2 text-[#7B746E] hover:text-[#DC2626] hover:bg-[#FEF2F2] rounded-xl border border-[#E8E2DA] transition-all"
        >
          <LogOut className="w-4 h-4" />
        </button>
      </div>
    </header>
  );
};

export default Header;
