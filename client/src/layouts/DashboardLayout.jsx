import React, { useState } from 'react';
import { Outlet, Navigate, useLocation } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import Sidebar from '../components/common/Sidebar';
import AppTopBar from '../components/common/AppTopBar';
import MobileBottomNav from '../components/common/MobileBottomNav';
import { ToastProvider } from '../components/common/Toast';
import FloatingChatbot from '../components/common/FloatingChatbot';
import { useAuth } from '../hooks/useAuth';

const DashboardLayout = () => {
  const { isAuthenticated, isLoading } = useAuth();
  const location = useLocation();
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-[#FAF8F4] dark:bg-[#0B1120] site-grid-bg flex items-center justify-center">
        <div className="flex flex-col items-center gap-3 bg-white dark:bg-slate-900 border border-[#E8E2DA] dark:border-slate-800 p-8 rounded-2xl shadow-card">
          <div className="w-8 h-8 border-2 border-[#2D6A4F] border-t-transparent rounded-full animate-spin" />
          <p className="text-xs text-[#7B746E] dark:text-slate-400 font-medium">Loading workspace…</p>
        </div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  return (
    <div className="min-h-screen bg-[#FAF8F4] dark:bg-[#0B1120] site-grid-bg text-[#2E2A26] dark:text-slate-100 flex selection:bg-[#2D6A4F]/20 transition-colors">
      <ToastProvider />

      {/* ── Mobile Sidebar Backdrop ── */}
      <AnimatePresence>
        {mobileSidebarOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setMobileSidebarOpen(false)}
            className="lg:hidden fixed inset-0 z-40 bg-black/30 backdrop-blur-sm"
          />
        )}
      </AnimatePresence>

      {/* ── Left Sidebar (Desktop: persistent, Mobile: drawer) ── */}
      <div className="hidden lg:flex shrink-0">
        <Sidebar
          collapsed={sidebarCollapsed}
          onToggle={() => setSidebarCollapsed((c) => !c)}
        />
      </div>

      {/* Mobile Sidebar Drawer */}
      <AnimatePresence>
        {mobileSidebarOpen && (
          <motion.div
            initial={{ x: -280 }}
            animate={{ x: 0 }}
            exit={{ x: -280 }}
            transition={{ type: 'spring', stiffness: 300, damping: 30 }}
            className="lg:hidden fixed left-0 top-0 bottom-0 z-50 flex"
          >
            <Sidebar
              collapsed={false}
              onToggle={() => setMobileSidebarOpen(false)}
              isMobileDrawer
            />
          </motion.div>
        )}
      </AnimatePresence>

      {/* ── Main Area (Topbar + Content) ── */}
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        {/* Sticky Top Bar */}
        <AppTopBar
          onMobileMenuToggle={() => setMobileSidebarOpen((o) => !o)}
        />

        {/* Page Content */}
        <main className="flex-1 overflow-y-auto px-4 sm:px-6 lg:px-8 py-6 pb-24 lg:pb-8">
          <AnimatePresence mode="wait">
            <motion.div
              key={location.pathname}
              initial={{ opacity: 0, y: 6 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -6 }}
              transition={{ duration: 0.18 }}
            >
              <Outlet />
            </motion.div>
          </AnimatePresence>
        </main>
      </div>

      {/* Mobile Bottom Navigation */}
      <MobileBottomNav />

      {/* Global AI Chatbot */}
      <FloatingChatbot />
    </div>
  );
};

export default DashboardLayout;
