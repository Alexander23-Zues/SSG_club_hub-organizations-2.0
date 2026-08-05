// Firestore service helpers for all collections
import {
  collection, doc, addDoc, updateDoc, deleteDoc,
  getDoc, getDocs, query, where, orderBy, onSnapshot,
  serverTimestamp, setDoc, limit
} from 'firebase/firestore';
import { ref, uploadBytes, getDownloadURL, deleteObject } from 'firebase/storage';
import { db, storage } from './config';

// ─── Activity Logger ───────────────────────────────────────────────────────
export const logActivity = async (userId, action, details = {}) => {
  try {
    await addDoc(collection(db, 'activityLogs'), {
      userId, action, details,
      createdAt: serverTimestamp()
    });
  } catch (e) { /* silent fail */ }
};

// ─── File Upload ───────────────────────────────────────────────────────────
export const uploadFile = async (file, path) => {
  const storageRef = ref(storage, path);
  await uploadBytes(storageRef, file);
  return getDownloadURL(storageRef);
};

export const deleteFile = async (path) => {
  try {
    await deleteObject(ref(storage, path));
  } catch (e) { /* silent fail */ }
};

// ─── Users ─────────────────────────────────────────────────────────────────
export const createUserDoc = (uid, data) =>
  setDoc(doc(db, 'users', uid), { ...data, createdAt: serverTimestamp() });

export const getUserDoc = (uid) =>
  getDoc(doc(db, 'users', uid)).then(d => d.exists() ? { id: d.id, ...d.data() } : null);

export const updateUserDoc = (uid, data) =>
  updateDoc(doc(db, 'users', uid), { ...data, updatedAt: serverTimestamp() });

export const getAllUsers = () =>
  getDocs(collection(db, 'users')).then(s => s.docs.map(d => ({ id: d.id, ...d.data() })));

// ─── Organizations ─────────────────────────────────────────────────────────
export const createOrg = (data) =>
  addDoc(collection(db, 'organizations'), { ...data, createdAt: serverTimestamp() });

export const updateOrg = (id, data) =>
  updateDoc(doc(db, 'organizations', id), { ...data, updatedAt: serverTimestamp() });

export const deleteOrg = (id) =>
  deleteDoc(doc(db, 'organizations', id));

export const getOrg = (id) =>
  getDoc(doc(db, 'organizations', id)).then(d => d.exists() ? { id: d.id, ...d.data() } : null);

export const subscribeOrgs = (callback) =>
  onSnapshot(query(collection(db, 'organizations'), orderBy('createdAt', 'desc')), s =>
    callback(s.docs.map(d => ({ id: d.id, ...d.data() }))));

// ─── Members ───────────────────────────────────────────────────────────────
export const joinOrg = (userId, organizationId, userInfo) =>
  addDoc(collection(db, 'members'), {
    userId, organizationId, role: 'member', status: 'pending',
    ...userInfo, joinedAt: serverTimestamp()
  });

export const updateMemberStatus = (memberId, status) =>
  updateDoc(doc(db, 'members', memberId), { status, updatedAt: serverTimestamp() });

export const removeMember = (memberId) =>
  deleteDoc(doc(db, 'members', memberId));

export const subscribeOrgMembers = (orgId, callback) =>
  onSnapshot(query(collection(db, 'members'), where('organizationId', '==', orgId)), s =>
    callback(s.docs.map(d => ({ id: d.id, ...d.data() }))));

export const getUserMemberships = (userId) =>
  getDocs(query(collection(db, 'members'), where('userId', '==', userId)))
    .then(s => s.docs.map(d => ({ id: d.id, ...d.data() })));

// ─── Events ────────────────────────────────────────────────────────────────
export const createEvent = (data) =>
  addDoc(collection(db, 'events'), { ...data, createdAt: serverTimestamp() });

export const updateEvent = (id, data) =>
  updateDoc(doc(db, 'events', id), { ...data, updatedAt: serverTimestamp() });

export const deleteEvent = (id) =>
  deleteDoc(doc(db, 'events', id));

export const subscribeEvents = (callback) =>
  onSnapshot(query(collection(db, 'events'), orderBy('createdAt', 'desc')), s =>
    callback(s.docs.map(d => ({ id: d.id, ...d.data() }))));

export const subscribeOrgEvents = (orgId, callback) =>
  onSnapshot(query(collection(db, 'events'), where('organizationId', '==', orgId), orderBy('createdAt', 'desc')), s =>
    callback(s.docs.map(d => ({ id: d.id, ...d.data() }))));

// ─── Announcements ─────────────────────────────────────────────────────────
export const createAnnouncement = (data) =>
  addDoc(collection(db, 'announcements'), { ...data, createdAt: serverTimestamp() });

export const updateAnnouncement = (id, data) =>
  updateDoc(doc(db, 'announcements', id), { ...data, updatedAt: serverTimestamp() });

export const deleteAnnouncement = (id) =>
  deleteDoc(doc(db, 'announcements', id));

export const subscribeAnnouncements = (callback) =>
  onSnapshot(query(collection(db, 'announcements'), orderBy('createdAt', 'desc')), s =>
    callback(s.docs.map(d => ({ id: d.id, ...d.data() }))));

// ─── RSVPs ─────────────────────────────────────────────────────────────────
export const rsvpEvent = (eventId, userId, status) =>
  setDoc(doc(db, 'rsvps', `${eventId}_${userId}`), {
    eventId, userId, status, updatedAt: serverTimestamp()
  });

export const getUserRsvps = (userId) =>
  getDocs(query(collection(db, 'rsvps'), where('userId', '==', userId)))
    .then(s => s.docs.map(d => ({ id: d.id, ...d.data() })));

export const getEventRsvps = (eventId) =>
  getDocs(query(collection(db, 'rsvps'), where('eventId', '==', eventId)))
    .then(s => s.docs.map(d => ({ id: d.id, ...d.data() })));

// ─── Activity Logs ─────────────────────────────────────────────────────────
export const subscribeActivityLogs = (callback) =>
  onSnapshot(query(collection(db, 'activityLogs'), orderBy('createdAt', 'desc'), limit(100)), s =>
    callback(s.docs.map(d => ({ id: d.id, ...d.data() }))));
