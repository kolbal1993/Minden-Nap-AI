/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

export type NotificationType = 'news' | 'course' | 'comment' | 'reaction' | 'admin';

export interface Notification {
  id: string;
  userId: string; // recipient, 'all' for everyone
  type: NotificationType;
  title: string;
  message: string;
  link?: string;
  read: boolean;
  createdAt: string;
}

export const getNotifications = (userId: string): Notification[] => {
  const stored = localStorage.getItem('notifications');
  let allNotifications: Notification[] = [];
  
  if (!stored) {
    // Initial mock data if empty
    allNotifications = [
      {
        id: 'm1',
        userId: 'all',
        type: 'news',
        title: 'Üdvözlünk a Minden Nap AI platformon!',
        message: 'Fedezd fel a legújabb AI híreket és kurzusokat.',
        read: false,
        createdAt: new Date(Date.now() - 3600000 * 24).toISOString()
      },
      {
        id: 'm2',
        userId: 'all',
        type: 'course',
        title: 'Új kurzus: GPT-4o alapok',
        message: 'Nézd meg a legújabb modulunkat az OpenAI legfrissebb modelljéről.',
        link: '/tudastar',
        read: false,
        createdAt: new Date(Date.now() - 3600000 * 5).toISOString()
      },
      {
        id: 'm3',
        userId: 'all',
        type: 'admin',
        title: 'Rendszerfrissítés',
        message: 'A platformunk mostantól még gyorsabb és stabilabb.',
        read: true,
        createdAt: new Date(Date.now() - 3600000 * 48).toISOString()
      }
    ];
    localStorage.setItem('notifications', JSON.stringify(allNotifications));
  } else {
    allNotifications = JSON.parse(stored);
  }
  
  return allNotifications.filter(n => n.userId === userId || n.userId === 'all');
};

export const addNotification = (notification: Omit<Notification, 'id' | 'read' | 'createdAt'>) => {
  const allNotifications: Notification[] = JSON.parse(localStorage.getItem('notifications') || '[]');
  const newNotification: Notification = {
    ...notification,
    id: Date.now().toString(),
    read: false,
    createdAt: new Date().toISOString()
  };
  
  allNotifications.unshift(newNotification);
  localStorage.setItem('notifications', JSON.stringify(allNotifications));
  
  // Trigger storage event for other components in the same tab
  window.dispatchEvent(new Event('storage'));
};

export const markAsRead = (notificationId: string) => {
  const allNotifications: Notification[] = JSON.parse(localStorage.getItem('notifications') || '[]');
  const updated = allNotifications.map(n => 
    n.id === notificationId ? { ...n, read: true } : n
  );
  localStorage.setItem('notifications', JSON.stringify(updated));
  window.dispatchEvent(new Event('storage'));
};

export const markAllAsRead = (userId: string) => {
  const allNotifications: Notification[] = JSON.parse(localStorage.getItem('notifications') || '[]');
  const updated = allNotifications.map(n => 
    (n.userId === userId || n.userId === 'all') ? { ...n, read: true } : n
  );
  localStorage.setItem('notifications', JSON.stringify(updated));
  window.dispatchEvent(new Event('storage'));
};
