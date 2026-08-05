import { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useTheme } from '../../context/ThemeContext';
import { useServices } from '../../firebase/useServices';
import { updateProfile } from 'firebase/auth';
import { auth } from '../../firebase/config';
import { User, Moon, Sun, Shield, Camera, CheckCircle2, Lock } from 'lucide-react';
import toast from 'react-hot-toast';

const inputCls = "w-full px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-600 bg-slate-50 dark:bg-slate-700/50 text-slate-800 dark:text-white text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all";

const roleConfig = {
  admin:   { gradient: 'from-red-500 to-rose-600',      badge: 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400',         label: 'SSG Admin' },
  officer: { gradient: 'from-blue-500 to-indigo-600',   badge: 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400',     label: 'Organization Officer' },
  student: { gradient: 'from-emerald-500 to-green-600', badge: 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400', label: 'Student / Member' },
};

const permissionMap = {
  admin:   ['Full access to all organizations', 'Manage users and approvals', 'View reports and analytics', 'Delete organizations and events', 'Seed and manage demo data'],
  officer: ['Manage your own organization', 'Create events and announcements', 'Approve or reject join requests', 'View full member roster'],
  student: ['Browse all organizations', 'Send join requests', 'View events and RSVP', 'Read live announcements', 'Update personal profile'],
};

const Settings = () => {
  const { userProfile, currentUser, refreshProfile } = useAuth();
  const { updateUserDoc, uploadFile } = useServices(currentUser);
  const isDemo = currentUser?.uid === 'demo-admin-uid';
  const { dark, toggle } = useTheme();
  const [form, setForm] = useState({ name: userProfile?.name || '', email: userProfile?.email || '' });
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);
  const set = k => e => setForm(f => ({ ...f, [k]: e.target.value }));

  const rc = roleConfig[userProfile?.role] || roleConfig.student;
  const perms = permissionMap[userProfile?.role] || permissionMap.student;

  const handleSaveProfile = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      await updateUserDoc(currentUser.uid, { name: form.name });
      if (!isDemo) await updateProfile(auth.currentUser, { displayName: form.name });
      await refreshProfile();
      toast.success('Profile updated!');
    } catch { toast.error('Failed to update profile'); }
    finally { setSaving(false); }
  };

  const handleAvatarUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    setUploading(true);
    try {
      const url = await uploadFile(file, `avatars/${currentUser.uid}`);
      await updateUserDoc(currentUser.uid, { avatarUrl: url });
      if (!isDemo) await updateProfile(auth.currentUser, { photoURL: url });
      await refreshProfile();
      toast.success('Avatar updated!');
    } catch { toast.error('Failed to upload avatar'); }
    finally { setUploading(false); }
  };

  return (
    <div className="space-y-6 max-w-2xl">
      <div>
        <h1 className="text-2xl font-extrabold text-slate-800 dark:text-white">Settings</h1>
        <p className="text-sm text-slate-500 dark:text-slate-400 mt-0.5">Manage your account and preferences</p>
      </div>

      {/* Profile hero card */}
      <div className={`relative bg-gradient-to-br ${rc.gradient} rounded-2xl p-6 text-white overflow-hidden shadow-xl`}>
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_80%_20%,rgba(255,255,255,0.1),transparent_60%)]" />
        <div className="relative flex items-center gap-5">
          <div className="relative flex-shrink-0">
            <div className="w-20 h-20 rounded-2xl bg-white/20 backdrop-blur-sm flex items-center justify-center text-3xl font-extrabold overflow-hidden border-2 border-white/30">
              {userProfile?.avatarUrl
                ? <img src={userProfile.avatarUrl} alt="Avatar" className="w-full h-full object-cover" />
                : userProfile?.name?.charAt(0).toUpperCase()
              }
            </div>
            <label className="absolute -bottom-1 -right-1 w-7 h-7 bg-white rounded-xl flex items-center justify-center cursor-pointer hover:bg-slate-100 transition-colors shadow-md">
              <Camera size={13} className="text-slate-700" />
              <input type="file" accept="image/*" onChange={handleAvatarUpload} className="hidden" />
            </label>
          </div>
          <div>
            <h2 className="text-xl font-extrabold">{userProfile?.name}</h2>
            <p className="text-white/70 text-sm">{userProfile?.email}</p>
            <span className="inline-block mt-1.5 text-xs font-bold bg-white/20 backdrop-blur-sm px-2.5 py-1 rounded-lg border border-white/20">
              {rc.label}
            </span>
          </div>
          {uploading && <span className="ml-auto text-xs text-white/60 animate-pulse">Uploading...</span>}
        </div>
      </div>

      {/* Profile form */}
      <div className="bg-white dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700 p-6">
        <h2 className="font-bold text-slate-800 dark:text-white mb-5 flex items-center gap-2">
          <div className="w-7 h-7 bg-blue-100 dark:bg-blue-900/30 rounded-lg flex items-center justify-center">
            <User size={14} className="text-blue-600 dark:text-blue-400" />
          </div>
          Profile Information
        </h2>
        <form onSubmit={handleSaveProfile} className="space-y-4">
          <div>
            <label className="block text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-1.5">Full Name</label>
            <input value={form.name} onChange={set('name')} required className={inputCls} />
          </div>
          <div>
            <label className="block text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-1.5">Email Address</label>
            <div className="relative">
              <input value={form.email} disabled className={`${inputCls} cursor-not-allowed opacity-60 pr-10`} />
              <Lock size={13} className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
            </div>
            <p className="text-xs text-slate-400 mt-1">Email cannot be changed here</p>
          </div>
          <button type="submit" disabled={saving}
            className="px-6 py-2.5 bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-xl text-sm font-bold hover:from-blue-700 hover:to-indigo-700 disabled:opacity-60 transition-all shadow-md shadow-blue-500/20">
            {saving ? 'Saving...' : 'Save Changes'}
          </button>
        </form>
      </div>

      {/* Appearance */}
      <div className="bg-white dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700 p-6">
        <h2 className="font-bold text-slate-800 dark:text-white mb-5 flex items-center gap-2">
          <div className={`w-7 h-7 rounded-lg flex items-center justify-center ${dark ? 'bg-indigo-100 dark:bg-indigo-900/30' : 'bg-yellow-100 dark:bg-yellow-900/30'}`}>
            {dark ? <Moon size={14} className="text-indigo-600 dark:text-indigo-400" /> : <Sun size={14} className="text-yellow-600 dark:text-yellow-400" />}
          </div>
          Appearance
        </h2>
        <div className="flex items-center justify-between p-4 bg-slate-50 dark:bg-slate-700/40 rounded-xl">
          <div>
            <p className="text-sm font-semibold text-slate-700 dark:text-slate-300">Dark Mode</p>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">Toggle between light and dark theme</p>
          </div>
          <button onClick={toggle}
            className={`relative w-12 h-6 rounded-full transition-all duration-300 ${dark ? 'bg-blue-600 shadow-md shadow-blue-500/30' : 'bg-slate-300'}`}>
            <span className={`absolute top-0.5 left-0.5 w-5 h-5 bg-white rounded-full shadow transition-transform duration-300 ${dark ? 'translate-x-6' : 'translate-x-0'}`} />
          </button>
        </div>
      </div>

      {/* Role & Permissions */}
      <div className="bg-white dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700 p-6">
        <h2 className="font-bold text-slate-800 dark:text-white mb-5 flex items-center gap-2">
          <div className="w-7 h-7 bg-purple-100 dark:bg-purple-900/30 rounded-lg flex items-center justify-center">
            <Shield size={14} className="text-purple-600 dark:text-purple-400" />
          </div>
          Role & Permissions
        </h2>
        <div className="flex items-center gap-3 mb-4 p-3 bg-slate-50 dark:bg-slate-700/40 rounded-xl">
          <div className={`w-8 h-8 bg-gradient-to-br ${rc.gradient} rounded-lg flex items-center justify-center`}>
            <Shield size={14} className="text-white" />
          </div>
          <div>
            <p className="text-sm font-bold text-slate-800 dark:text-white">{rc.label}</p>
            <p className="text-xs text-slate-500 dark:text-slate-400">Your current role</p>
          </div>
        </div>
        <div className="space-y-2">
          {perms.map((p, i) => (
            <div key={i} className="flex items-center gap-2.5">
              <CheckCircle2 size={15} className="text-emerald-500 flex-shrink-0" />
              <span className="text-sm text-slate-600 dark:text-slate-400">{p}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default Settings;
