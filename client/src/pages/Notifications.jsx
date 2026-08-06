import React from 'react';
import { motion } from 'framer-motion';
import { Check, Bell, FileText, CheckCircle2, ShieldAlert, Info } from 'lucide-react';
import { useNotifications } from '../hooks/useNotifications';

const iconConfig = {
  document: { icon: FileText, bg: 'bg-indigo-50 text-indigo-700 border-indigo-200' },
  approval: { icon: CheckCircle2, bg: 'bg-emerald-50 text-emerald-700 border-emerald-200' },
  fraud: { icon: ShieldAlert, bg: 'bg-red-50 text-red-700 border-red-200' },
  info: { icon: Info, bg: 'bg-[#F0FAF5] text-[#2D6A4F] border-[#C3DDD0]' },
};

const Notifications = () => {
  const { notifications, markAllAsRead, markAsRead } = useNotifications();

  return (
    <div className="space-y-6 max-w-4xl">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-[22px] font-bold text-[#2D2A27] tracking-tight">Notification Center</h1>
          <p className="text-[13px] text-[#9B9490] mt-0.5">
            System notifications, security audits, and blockchain verification alerts
          </p>
        </div>
        <button
          onClick={markAllAsRead}
          className="flex items-center gap-1.5 px-3 py-2 rounded-lg bg-[#2D6A4F] text-white text-xs font-semibold hover:bg-[#245741] transition-colors shadow-xs"
        >
          <Check className="w-4 h-4" />
          Mark all as read
        </button>
      </div>

      <div className="space-y-3">
        {notifications.map((n, i) => {
          const config = iconConfig[n.type] || iconConfig.info;
          const Icon = config.icon;
          const notifId = n.id || n._id;

          return (
            <motion.div
              key={notifId || i}
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.05 }}
              onClick={() => markAsRead(notifId)}
              className={`p-5 rounded-xl border transition-all cursor-pointer flex items-start gap-4 ${
                n.isRead
                  ? 'bg-white border-[#E9E4DD] opacity-85'
                  : 'bg-[#FAF8F4] border-[#2D6A4F]/40 shadow-xs'
              }`}
            >
              <div className={`p-2.5 rounded-lg border shrink-0 ${config.bg}`}>
                <Icon className="w-5 h-5" />
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between">
                  <h4 className="text-base font-bold text-[#2D2A27] truncate">{n.title}</h4>
                  {!n.isRead && (
                    <span className="w-2.5 h-2.5 rounded-full bg-[#2D6A4F] shrink-0" />
                  )}
                </div>
                <p className="text-sm text-[#55504B] mt-1 leading-relaxed">{n.message}</p>
                <span className="text-xs font-semibold text-[#9B9490] mt-2 block">
                  {n.createdAt ? new Date(n.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : 'Recent'}
                </span>
              </div>
            </motion.div>
          );
        })}
      </div>
    </div>
  );
};

export default Notifications;
