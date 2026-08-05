// Demo service layer — mirrors services.js but uses in-memory demo data
import {
  DEMO_ORGS, DEMO_EVENTS, DEMO_ANNOUNCEMENTS,
  DEMO_MEMBERS, DEMO_USERS, DEMO_LOGS
} from './demoData';

// Mutable in-memory stores (reset on page refresh — that's fine for demo)
let orgs         = [...DEMO_ORGS];
let events       = [...DEMO_EVENTS];
let announcements= [...DEMO_ANNOUNCEMENTS];
let members      = [...DEMO_MEMBERS];
let users        = [...DEMO_USERS];
let logs         = [...DEMO_LOGS];
let rsvps        = [];

const uid = () => Math.random().toString(36).slice(2);
const ts  = () => ({ toDate: () => new Date() });

// ── Subscriptions (call callback immediately + return no-op unsubscribe) ──
export const subscribeOrgs = (cb) => { cb([...orgs]); return () => {}; };
export const subscribeEvents = (cb) => { cb([...events]); return () => {}; };
export const subscribeAnnouncements = (cb) => { cb([...announcements]); return () => {}; };
export const subscribeActivityLogs = (cb) => { cb([...logs]); return () => {}; };
export const subscribeOrgMembers = (orgId, cb) => {
  cb(members.filter(m => m.organizationId === orgId));
  return () => {};
};
export const subscribeOrgEvents = (orgId, cb) => {
  cb(events.filter(e => e.organizationId === orgId));
  return () => {};
};

// ── Orgs ──
export const createOrg = async (data) => {
  const org = { id: uid(), ...data, createdAt: ts() };
  orgs = [org, ...orgs];
  return org;
};
export const updateOrg = async (id, data) => {
  orgs = orgs.map(o => o.id === id ? { ...o, ...data } : o);
};
export const deleteOrg = async (id) => {
  orgs = orgs.filter(o => o.id !== id);
};
export const getOrg = async (id) => orgs.find(o => o.id === id) || null;

// ── Events ──
export const createEvent = async (data) => {
  const ev = { id: uid(), ...data, createdAt: ts() };
  events = [ev, ...events];
  return ev;
};
export const updateEvent = async (id, data) => {
  events = events.map(e => e.id === id ? { ...e, ...data } : e);
};
export const deleteEvent = async (id) => {
  events = events.filter(e => e.id !== id);
};

// ── Announcements ──
export const createAnnouncement = async (data) => {
  const ann = { id: uid(), ...data, createdAt: ts() };
  announcements = [ann, ...announcements];
  return ann;
};
export const updateAnnouncement = async (id, data) => {
  announcements = announcements.map(a => a.id === id ? { ...a, ...data } : a);
};
export const deleteAnnouncement = async (id) => {
  announcements = announcements.filter(a => a.id !== id);
};

// ── Members ──
export const joinOrg = async (userId, organizationId, userInfo) => {
  const m = { id: uid(), userId, organizationId, role: 'member', status: 'pending', ...userInfo, joinedAt: ts() };
  members = [...members, m];
  return m;
};
export const updateMemberStatus = async (memberId, status) => {
  members = members.map(m => m.id === memberId ? { ...m, status } : m);
};
export const removeMember = async (memberId) => {
  members = members.filter(m => m.id !== memberId);
};
export const getUserMemberships = async (userId) => members.filter(m => m.userId === userId);

// ── RSVPs ──
export const rsvpEvent = async (eventId, userId, status) => {
  rsvps = rsvps.filter(r => !(r.eventId === eventId && r.userId === userId));
  rsvps.push({ id: `${eventId}_${userId}`, eventId, userId, status });
};
export const getUserRsvps = async (userId) => rsvps.filter(r => r.userId === userId);
export const getEventRsvps = async (eventId) => rsvps.filter(r => r.eventId === eventId);

// ── Users ──
export const getAllUsers = async () => [...users];
export const getUserDoc = async (uid) => users.find(u => u.id === uid) || null;
export const createUserDoc = async (uid, data) => { users.push({ id: uid, ...data }); };
export const updateUserDoc = async (uid, data) => {
  users = users.map(u => u.id === uid ? { ...u, ...data } : u);
};

// ── Activity log ──
export const logActivity = async (userId, action, details = {}) => {
  logs = [{ id: uid(), userId, action, details, createdAt: ts() }, ...logs];
};

// ── File upload (no-op in demo) ──
export const uploadFile = async (file) => URL.createObjectURL(file);
export const deleteFile = async () => {};
