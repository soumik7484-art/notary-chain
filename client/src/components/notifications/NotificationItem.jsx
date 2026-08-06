import React from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { FileText, CheckCircle2, ShieldAlert, Info } from 'lucide-react';
import { useNotifications } from '../../hooks/useNotifications';

const iconConfig = {
  document: { icon: FileText, bg: 'bg-indigo-50 text-indigo-700 border-indigo-200' },
  approval: { icon: CheckCircle2, bg: 'bg-emerald-50 text-emerald-700 border-emerald-200' },
  fraud: { icon: ShieldAlert, bg: 'bg-red-50 text-red-700 border-red-200' },
  info: { icon: Info, bg: 'bg-[#F0FAF5] text-[#2D6A4F] border-[#C3DDD0]' },
};

const NotificationItem = ({ notification, onClose }) => {
  const { markAsRead } = useNotifications();
  const navigate = useNavigate();

  const notifId = notification.id || notification._id;

  const handleClick = () => {
    if (!notification.isRead) markAsRead(notifId);
    if (notification.actionUrl) {
      navigate(notification.actionUrl);
      onClose();
    }
  };

  const config = iconConfig[notification.type] || iconConfig.info;
  const Icon = config.icon;

  const formattedDate = notification.createdAt
    ? new Date(notification.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    : 'Just now';

  return (
    <motion.div
      initial={{ opacity: 0, y: 6 }}
      animate={{ opacity: 1, y: 0 }}
      onClick={handleClick}
      className={`relative p-4 rounded-xl border transition-all cursor-pointer ${
        notification.isRead
          ? 'bg-white border-[#E9E4DD] opacity-80'
          : 'bg-[#FAF8F4] border-[#2D6A4F]/40 shadow-xs'
      }`}
    >
      {!notification.isRead && (
        <span className="absolute top-4 right-3.5 w-2 h-2 rounded-full bg-[#2D6A4F]" />
      )}
      <div className="flex gap-3">
        <div className={`w-9 h-9 rounded-lg flex items-center justify-center border shrink-0 ${config.bg}`}>
          <Icon className="w-4 h-4" />
        </div>
        <div className="flex-1 pr-3">
          {/* Increased font size for Title (text-sm font-bold) */}
          <h4 className={`text-sm ${notification.isRead ? 'font-bold text-[#2D2A27]' : 'font-bold text-[#2D6A4F]'}`}>
            {notification.title}
          </h4>

          {/* Increased font size for Message (text-xs text-[#55504B]) */}
          <p className="text-xs text-[#55504B] mt-1 leading-relaxed">
            {notification.message}
          </p>

          <span className="text-[11px] font-semibold text-[#9B9490] mt-2 block">
            {formattedDate}
          </span>
        </div>
      </div>
    </motion.div>
  );
};

export default NotificationItem;
