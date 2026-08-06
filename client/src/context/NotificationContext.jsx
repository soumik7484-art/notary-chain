import { createContext, useState, useEffect, useContext, useCallback } from 'react';
import axiosInstance from '../api/axios';
import { AuthContext } from './AuthContext';

export const NotificationContext = createContext();

const INITIAL_MOCK_NOTIFICATIONS = [
  {
    id: 'notif-1',
    title: 'Polygon Amoy Seal Verified',
    message: 'Document #DOC-908234 was cryptographically anchored to block #18,920,412.',
    type: 'approval',
    isRead: false,
    createdAt: new Date(Date.now() - 1000 * 60 * 15).toISOString(), // 15 mins ago
    actionUrl: '/documents'
  },
  {
    id: 'notif-[#B5883D]',
    title: 'P2P Transfer Completed',
    message: 'Successfully transferred 150.00 USDC to @ada.polygon on custodial OMS.',
    type: 'info',
    isRead: false,
    createdAt: new Date(Date.now() - 1000 * 60 * 120).toISOString(), // 2 hours ago
    actionUrl: '/neobank'
  },
  {
    id: 'notif-3',
    title: 'KYC Biometric Verification Passed',
    message: 'Face match and liveness check passed with 99.8% confidence.',
    type: 'approval',
    isRead: true,
    createdAt: new Date(Date.now() - 1000 * 60 * 600).toISOString(), // 10 hours ago
    actionUrl: '/neobank'
  },
  {
    id: 'notif-4',
    title: 'Enterprise Workspace Active',
    message: 'Welcome to NotaryChain. Gas sponsorship enabled on Polygon Amoy.',
    type: 'info',
    isRead: true,
    createdAt: new Date(Date.now() - 1000 * 60 * 1440).toISOString(), // 1 day ago
    actionUrl: '/dashboard'
  }
];

export const NotificationProvider = ({ children }) => {
  const { isAuthenticated } = useContext(AuthContext);
  const [notifications, setNotifications] = useState(INITIAL_MOCK_NOTIFICATIONS);
  const [unreadCount, setUnreadCount] = useState(2);
  const [loading, setLoading] = useState(false);

  const fetchUnreadCount = useCallback(async () => {
    if (!isAuthenticated) return;
    try {
      const res = await axiosInstance.get('/notifications/unread-count');
      const count = res?.data?.data?.count ?? res?.data?.count;
      if (typeof count === 'number') {
        setUnreadCount(count);
      } else {
        const unread = notifications.filter((n) => !n.isRead).length;
        setUnreadCount(unread);
      }
    } catch {
      const unread = notifications.filter((n) => !n.isRead).length;
      setUnreadCount(unread);
    }
  }, [isAuthenticated, notifications]);

  const fetchNotifications = useCallback(async (page = 1, limit = 20) => {
    setLoading(true);
    try {
      const res = await axiosInstance.get(`/notifications?page=${page}&limit=${limit}`);
      const list = res?.data?.data || res?.data?.notifications;
      if (Array.isArray(list) && list.length > 0) {
        setNotifications(list);
        const unread = list.filter((n) => !n.isRead).length;
        setUnreadCount(unread);
      } else {
        // Fallback to initial notifications if server returns empty list
        const unread = notifications.filter((n) => !n.isRead).length;
        setUnreadCount(unread);
      }
    } catch {
      // Keep state resilient
    } finally {
      setLoading(false);
    }
  }, [notifications]);

  const markAsRead = async (id) => {
    try {
      await axiosInstance.patch(`/notifications/${id}/read`);
    } catch {}
    setNotifications((prev) =>
      prev.map((n) => (n.id === id || n._id === id ? { ...n, isRead: true } : n))
    );
    setUnreadCount((prev) => Math.max(0, prev - 1));
  };

  const markAllAsRead = async () => {
    try {
      await axiosInstance.patch('/notifications/read-all');
    } catch {}
    setNotifications((prev) => prev.map((n) => ({ ...n, isRead: true })));
    setUnreadCount(0);
  };

  const addNotification = (notif) => {
    const newNotif = {
      id: `notif-${Date.now()}`,
      title: notif.title || 'Notification',
      message: notif.message || '',
      type: notif.type || 'info',
      isRead: false,
      createdAt: new Date().toISOString(),
      actionUrl: notif.actionUrl || '/dashboard',
    };
    setNotifications((prev) => [newNotif, ...prev]);
    setUnreadCount((prev) => prev + 1);
  };

  useEffect(() => {
    if (isAuthenticated) {
      fetchUnreadCount();
    }
  }, [isAuthenticated, fetchUnreadCount]);

  return (
    <NotificationContext.Provider
      value={{
        notifications,
        unreadCount,
        loading,
        fetchNotifications,
        fetchUnreadCount,
        markAsRead,
        markAllAsRead,
        addNotification,
      }}
    >
      {children}
    </NotificationContext.Provider>
  );
};
