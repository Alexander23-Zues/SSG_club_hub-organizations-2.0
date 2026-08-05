import { createContext, useContext, useEffect, useState, useCallback } from 'react';
import { collection, query, onSnapshot, orderBy, limit, where } from 'firebase/firestore';
import { db } from '../firebase/config';
import { useAuth } from './AuthContext';
import { prioritizeNotifications } from '../ai/engine';
import { DEMO_ANNOUNCEMENTS, DEMO_MEMBERS } from '../firebase/demoData';

const NotificationsContext = createContext(null);
export const useNotifications = () => useContext(NotificationsContext);

export const NotificationsProvider = ({ children }) => {
  const { currentUser, userProfile } = useAuth();
  const isDemo = ['demo-admin-uid', 'demo-officer-uid', 'demo-student-uid'].includes(currentUser?.uid);
  const [rawNotifications, setRawNotifications] = useState([]);
  const [readIds, setReadIds] = useState(() => {
    try { return new Set(JSON.parse(localStorage.getItem('ssg_read_notifs') || '[]')); }
    catch { return new Set(); }
  });

  useEffect(() => {
    if (!currentUser) { setRawNotifications([]); return; }

    // ── Demo mode: use static mock notifications ──
    if (isDemo) {
      const annItems = DEMO_ANNOUNCEMENTS.map(d => ({
        id: `ann_${d.id}`, type: 'announcement', icon: '📢',
        title: d.title, message: (d.content || '').slice(0, 90) + '...',
        createdAt: d.createdAt, link: '/announcements',
      }));
      const pendingItems = DEMO_MEMBERS.filter(m => m.status === 'pending').map(d => ({
        id: `pending_${d.id}`, type: 'pending_member', icon: '👥',
        title: `${d.userName} wants to join`, message: 'New join request awaiting your approval.',
        createdAt: d.joinedAt, link: '/members', priority: 'high',
      }));
      setRawNotifications(prioritizeNotifications([...annItems, ...pendingItems]));
      return;
    }

    const items = [];
    const listeners = [];

    // 1. Announcements as notifications
    const annQ = query(collection(db, 'announcements'), orderBy('createdAt', 'desc'), limit(15));
    listeners.push(onSnapshot(annQ, snap => {
      const annItems = snap.docs.map(d => ({
        id: `ann_${d.id}`,
        type: 'announcement',
        icon: '📢',
        title: d.data().title,
        message: (d.data().content || '').slice(0, 90) + '...',
        createdAt: d.data().createdAt,
        link: '/announcements',
      }));
      setRawNotifications(prev => {
        const filtered = prev.filter(n => n.type !== 'announcement');
        return prioritizeNotifications([...filtered, ...annItems]);
      });
    }));

    // 2. Pending member requests (for officers/admins)
    if (userProfile?.role === 'admin' || userProfile?.role === 'officer') {
      const pendingQ = query(collection(db, 'members'), where('status', '==', 'pending'), limit(10));
      listeners.push(onSnapshot(pendingQ, snap => {
        const pendingItems = snap.docs.map(d => ({
          id: `pending_${d.id}`,
          type: 'pending_member',
          icon: '👥',
          title: `${d.data().userName || 'Someone'} wants to join`,
          message: 'New join request awaiting your approval.',
          createdAt: d.data().joinedAt,
          link: '/members',
          priority: 'high',
        }));
        setRawNotifications(prev => {
          const filtered = prev.filter(n => n.type !== 'pending_member');
          return prioritizeNotifications([...filtered, ...pendingItems]);
        });
      }));
    }

    return () => listeners.forEach(u => u());
  }, [currentUser, userProfile?.role]);

  const unreadCount = rawNotifications.filter(n => !readIds.has(n.id)).length;

  const markAllRead = useCallback(() => {
    const allIds = rawNotifications.map(n => n.id);
    const newSet = new Set([...readIds, ...allIds]);
    setReadIds(newSet);
    localStorage.setItem('ssg_read_notifs', JSON.stringify([...newSet]));
  }, [rawNotifications, readIds]);

  const markRead = useCallback((id) => {
    const newSet = new Set([...readIds, id]);
    setReadIds(newSet);
    localStorage.setItem('ssg_read_notifs', JSON.stringify([...newSet]));
  }, [readIds]);

  const notifications = rawNotifications.map(n => ({ ...n, read: readIds.has(n.id) }));

  return (
    <NotificationsContext.Provider value={{ notifications, unreadCount, markAllRead, markRead }}>
      {children}
    </NotificationsContext.Provider>
  );
};
