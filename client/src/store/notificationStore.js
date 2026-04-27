let notifications = [];
const listeners = new Set();

const notify = () => listeners.forEach((listener) => listener(notifications));

const notificationStore = {
  getState: () => notifications,
  subscribe(listener) {
    listeners.add(listener);
    return () => listeners.delete(listener);
  },
  setNotifications(items) {
    notifications = items;
    notify();
  },
  markRead(id) {
    notifications = notifications.map((item) => (item.id === id ? { ...item, read: true } : item));
    notify();
  },
  unreadCount() {
    return notifications.filter((item) => !item.read).length;
  },
};

export default notificationStore;
