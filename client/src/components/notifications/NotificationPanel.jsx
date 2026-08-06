import React, { useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Check, BellRing } from 'lucide-react';
import { useNotifications } from '../../hooks/useNotifications';
import NotificationItem from './NotificationItem';

const NotificationPanel = ({ isOpen, onClose }) => {
  const { notifications, loading, markAllAsRead, fetchNotifications } = useNotifications();

  useEffect(() => {
    if (isOpen) {
      fetchNotifications();
    }
  }, [isOpen, fetchNotifications]);

  useEffect(() => {
    const handleEscape = (e) => {
      if (e.key === 'Escape') onClose();
    };
    if (isOpen) document.addEventListener('keydown', handleEscape);
    return () => document.removeEventListener('keydown', handleEscape);
  }, [isOpen, onClose]);

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 z-40 bg-black/30 backdrop-blur-xs"
          />

          {/* Panel Drawer */}
          <motion.div
            initial={{ x: '100%' }}
            animate={{ x: 0 }}
            exit={{ x: '100%' }}
            transition={{ type: 'spring', bounce: 0, duration: 0.35 }}
            className="fixed inset-y-0 right-0 z-50 w-full sm:w-[420px] bg-white border-l border-[#E9E4DD] shadow-2xl flex flex-col"
          >
            {/* Header */}
            <div className="flex items-center justify-between p-5 border-b border-[#E9E4DD]">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-lg bg-[#F0FAF5] text-[#2D6A4F] flex items-center justify-center font-bold">
                  <BellRing className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="text-base font-bold text-[#2D2A27]">Notifications</h3>
                  <p className="text-xs text-[#9B9490]">Live alerts & security events</p>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <button
                  onClick={markAllAsRead}
                  className="text-xs font-semibold text-[#2D6A4F] hover:underline flex items-center gap-1 px-2.5 py-1 rounded-lg hover:bg-[#F0FAF5] transition-colors"
                >
                  <Check className="w-3.5 h-3.5" /> Mark all read
                </button>
                <button
                  onClick={onClose}
                  className="p-1.5 rounded-lg text-[#7B746E] hover:bg-[#F6F3EE] hover:text-[#2D2A27] transition-colors"
                >
                  <X className="w-4.5 h-4.5" />
                </button>
              </div>
            </div>

            {/* Notification List Body (Increased text size) */}
            <div className="flex-1 overflow-y-auto p-4 space-y-3">
              {loading && !notifications.length ? (
                <div className="space-y-3">
                  {[1, 2, 3].map((i) => (
                    <div key={i} className="h-20 bg-[#F6F3EE] rounded-xl animate-shimmer" />
                  ))}
                </div>
              ) : notifications.length === 0 ? (
                <div className="h-full flex flex-col items-center justify-center text-center p-8">
                  <div className="w-12 h-12 rounded-full bg-[#F0FAF5] text-[#2D6A4F] flex items-center justify-center mb-3">
                    <Check className="w-6 h-6" />
                  </div>
                  <p className="text-sm font-bold text-[#2D2A27]">You're all caught up!</p>
                  <p className="text-xs text-[#9B9490] mt-1">No unread notifications at this time.</p>
                </div>
              ) : (
                notifications.map((notif) => (
                  <NotificationItem
                    key={notif.id || notif._id}
                    notification={notif}
                    onClose={onClose}
                  />
                ))
              )}
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
};

export default NotificationPanel;
