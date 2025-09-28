import { useCallback, useEffect, useState } from 'react';
import { fetchNotifications, markNotificationRead } from '../api';
import type { Notification } from '../api/types';
import { useAuth } from '../context/AuthContext';

interface UseProjectNotificationsResult {
  notifications: Notification[];
  isLoading: boolean;
  error: string | null;
  refresh: () => void;
  markRead: (notificationId: string) => Promise<Notification | null>;
}

export function useProjectNotifications(projectId: string): UseProjectNotificationsResult {
  const { token } = useAuth();
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const loadNotifications = useCallback(() => {
    if (!token) {
      setNotifications([]);
      return;
    }

    setIsLoading(true);
    setError(null);

    fetchNotifications(projectId, token)
      .then((data) => setNotifications(data))
      .catch((err) => {
        console.error('Failed to fetch notifications', err);
        setError('알림을 불러오는 중 문제가 발생했습니다.');
        setNotifications([]);
      })
      .finally(() => setIsLoading(false));
  }, [projectId, token]);

  useEffect(() => {
    loadNotifications();
  }, [loadNotifications]);

  const handleMarkRead = useCallback(
    async (notificationId: string) => {
      if (!token) {
        return null;
      }
      try {
        const updated = await markNotificationRead(projectId, notificationId, token);
        setNotifications((prev) => prev.map((item) => (item.id === notificationId ? updated : item)));
        return updated;
      } catch (err) {
        console.error('Failed to mark notification as read', err);
        setError('알림 상태 업데이트 중 문제가 발생했습니다.');
        return null;
      }
    },
    [projectId, token],
  );

  return {
    notifications,
    isLoading,
    error,
    refresh: loadNotifications,
    markRead: handleMarkRead,
  };
}
