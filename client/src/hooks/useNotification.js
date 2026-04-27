import { useEffect, useState } from "react";
import notificationStore from "../store/notificationStore";
import notificationService from "../services/notificationService";

export default function useNotification() {
  const [notifications, setNotifications] = useState(notificationStore.getState());
  const [loading, setLoading] = useState(false);

  useEffect(() => notificationStore.subscribe(setNotifications), []);

  const loadNotifications = async () => {
    setLoading(true);
    try {
      const data = await notificationService.list();
      notificationStore.setNotifications(data.notifications || data || []);
    } finally {
      setLoading(false);
    }
  };

  const markRead = async (id) => {
    notificationStore.markRead(id);
    await notificationService.markRead(id);
  };

  return {
    notifications,
    loading,
    unreadCount: notifications.filter((item) => !item.read).length,
    loadNotifications,
    markRead,
  };
}
