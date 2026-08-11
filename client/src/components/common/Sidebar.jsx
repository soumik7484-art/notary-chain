import React from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  LayoutDashboard, CreditCard, ShieldCheck, FileText,
  History, BarChart3, Wallet, Settings, ChevronLeft,
  ChevronRight, X, LogOut, Activity
} from 'lucide-react';
import { useAuth } from '../../hooks/useAuth';

const NAV_ITEMS = [
  { label: 'Dashboard',     path: '/dashboard',         icon: LayoutDashboard, group: 'main' },
  { label: 'Neobank',       path: '/neobank',            icon: CreditCard,      group: 'main' },
  { label: 'Verification',  path: '/verifications',      icon: ShieldCheck,     group: 'main' },
  { label: 'Documents',     path: '/documents',          icon: FileText,        group: 'main' },
  { label: 'History',       path: '/admin/audit',        icon: History,         group: 'records' },
  { label: 'Analytics',     path: '/admin/analytics',    icon: BarChart3,       group: 'records' },
  { label: 'Wallet Health', path: '/blockchain-health',  icon: Activity,        group: 'records' },
  { label: 'Wallet',        path: '/wallet',             icon: Wallet,          group: 'account' },
  { label: 'Settings',      path: '/settings',           icon: Settings,        group: 'account' },
];

const GROUP_LABELS = {
  main: null,
  records: 'Records',
  account: 'Account',
};

const Sidebar = ({ collapsed, onToggle, isMobileDrawer = false }) => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = async () => {
    await logout();
    navigate('/');
  };

  const groups = [...new Set(NAV_ITEMS.map((i) => i.group))];

  return (
    <motion.aside
      initial={false}
      animate={{ width: collapsed && !isMobileDrawer ? 72 : 240 }}
      transition={{ duration: 0.2, ease: [0.4, 0, 0.2, 1] }}
      className="h-screen sticky top-0 flex flex-col bg-white border-r border-[#E9E4DD] overflow-hidden z-40 shrink-0"
    >
      {/* ── Logo ── */}
      <div className="h-[57px] flex items-center justify-between px-4 border-b border-[#E9E4DD] shrink-0">
        <div className="flex items-center gap-2.5 overflow-hidden">
          <div className="w-8 h-8 rounded-lg bg-[#2D6A4F] flex items-center justify-center shrink-0 shadow-sm">
            <ShieldCheck className="w-4 h-4 text-white" strokeWidth={2.5} />
          </div>
          {(!collapsed || isMobileDrawer) && (
            <motion.span
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="font-semibold text-[15px] text-[#2D2A27] tracking-tight whitespace-nowrap overflow-hidden"
            >
              NotaryChain
            </motion.span>
          )}
        </div>
        {isMobileDrawer ? (
          <button
            onClick={onToggle}
            className="p-1.5 rounded-lg text-[#7B746E] hover:bg-[#F6F3EE] hover:text-[#2D2A27] transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        ) : (
          <button
            onClick={onToggle}
            className="p-1.5 rounded-lg text-[#7B746E] hover:bg-[#F6F3EE] hover:text-[#2D2A27] transition-colors hidden lg:flex"
          >
            {collapsed ? (
              <ChevronRight className="w-3.5 h-3.5" />
            ) : (
              <ChevronLeft className="w-3.5 h-3.5" />
            )}
          </button>
        )}
      </div>

      {/* ── Navigation ── */}
      <nav className="flex-1 overflow-y-auto py-3 px-2 space-y-0.5">
        {groups.map((group) => {
          const items = NAV_ITEMS.filter((i) => i.group === group);
          const label = GROUP_LABELS[group];

          return (
            <div key={group} className="mb-1">
              {label && (!collapsed || isMobileDrawer) && (
                <p className="px-3 py-1.5 text-[10px] font-semibold tracking-widest uppercase text-[#AAA49F] select-none">
                  {label}
                </p>
              )}
              {label && (collapsed && !isMobileDrawer) && (
                <div className="h-px bg-[#E9E4DD] mx-2 my-2" />
              )}
              {items.map((item) => {
                const Icon = item.icon;
                return (
                  <NavLink
                    key={item.label + item.path}
                    to={item.path}
                    title={collapsed && !isMobileDrawer ? item.label : undefined}
                    className={({ isActive }) =>
                      `relative flex items-center gap-3 px-3 py-2.5 rounded-lg text-[13px] font-medium transition-all duration-150 group
                      ${isActive
                        ? 'bg-[#F0FAF5] text-[#2D6A4F]'
                        : 'text-[#55504B] hover:bg-[#F6F3EE] hover:text-[#2D2A27]'
                      }
                      ${collapsed && !isMobileDrawer ? 'justify-center' : ''}
                      `
                    }
                  >
                    {({ isActive }) => (
                      <>
                        {isActive && (
                          <motion.div
                            layoutId="sidebarActiveIndicator"
                            className="absolute left-0 top-1.5 bottom-1.5 w-[3px] bg-[#2D6A4F] rounded-r-full"
                          />
                        )}
                        <Icon
                          className={`w-4 h-4 shrink-0 transition-colors ${
                            isActive ? 'text-[#2D6A4F]' : 'text-[#9B9490] group-hover:text-[#2D2A27]'
                          }`}
                          strokeWidth={isActive ? 2.5 : 2}
                        />
                        {(!collapsed || isMobileDrawer) && (
                          <span className="truncate">{item.label}</span>
                        )}
                        {/* Tooltip for collapsed state */}
                        {collapsed && !isMobileDrawer && (
                          <div className="absolute left-full ml-2 px-2 py-1 bg-[#2D2A27] text-white text-xs rounded-md whitespace-nowrap opacity-0 group-hover:opacity-100 pointer-events-none z-50 transition-opacity">
                            {item.label}
                          </div>
                        )}
                      </>
                    )}
                  </NavLink>
                );
              })}
            </div>
          );
        })}
      </nav>

      {/* ── User Footer ── */}
      <div className="border-t border-[#E9E4DD] p-3 shrink-0 space-y-1">
        {/* User info */}
        <div
          className={`flex items-center gap-2.5 px-2 py-2 rounded-lg ${
            collapsed && !isMobileDrawer ? 'justify-center' : ''
          }`}
        >
          {user?.avatar || user?.photoURL ? (
            <img
              src={user.avatar || user.photoURL}
              alt={user.name || 'Profile Avatar'}
              className="w-7 h-7 rounded-md object-cover shrink-0 border border-[#E8E2DA]"
            />
          ) : (
            <div className="w-7 h-7 rounded-md bg-[#2D6A4F] text-white flex items-center justify-center shrink-0 text-[11px] font-bold uppercase">
              {(user?.name || user?.firstName || 'U').charAt(0)}
            </div>
          )}
          {(!collapsed || isMobileDrawer) && (
            <div className="min-w-0 flex-1">
              <p className="text-[12px] font-semibold text-[#2D2A27] truncate">{user?.name || (user?.firstName ? `${user.firstName} ${user.lastName || ''}`.trim() : 'User')}</p>
              <p className="text-[11px] text-[#9B9490] capitalize truncate">{user?.role === 'admin' ? 'System Admin' : user?.role === 'notary' ? 'Notary Officer' : 'Website User'}</p>
            </div>
          )}
        </div>

        {/* Logout */}
        <button
          onClick={handleLogout}
          title={collapsed && !isMobileDrawer ? 'Log out' : undefined}
          className={`w-full flex items-center gap-2.5 px-3 py-2 rounded-lg text-[13px] font-medium text-[#7B746E] hover:bg-[#FEF2F2] hover:text-[#DC2626] transition-all group ${
            collapsed && !isMobileDrawer ? 'justify-center' : ''
          }`}
        >
          <LogOut className="w-4 h-4 shrink-0 group-hover:text-[#DC2626] transition-colors" strokeWidth={2} />
          {(!collapsed || isMobileDrawer) && <span>Log out</span>}
        </button>
      </div>
    </motion.aside>
  );
};

export default Sidebar;
