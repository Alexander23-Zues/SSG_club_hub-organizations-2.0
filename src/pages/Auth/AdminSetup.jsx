import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Shield, CheckCircle2, Lock } from 'lucide-react';
import { createUserWithEmailAndPassword, updateProfile } from 'firebase/auth';
import { auth } from '../../firebase/config';
import { createUserDoc, getUserDoc } from '../../firebase/services';
import { doc, getDoc } from 'firebase/firestore';
import { db } from '../../firebase/config';
import Swal from 'sweetalert2';

// ─── Default admin credentials ─────────────────────────────────────────────
// Change these before deploying to production!
const ADMIN_EMAIL = 'admin@ssgclubhub.edu';
const ADMIN_PASSWORD = 'Admin@2025';
const ADMIN_NAME = 'SSG Administrator';

// Secret key to prevent unauthorized access to this setup page
const SETUP_KEY = 'ssg-setup-2025';

const AdminSetup = () => {
  const [key, setKey] = useState('');
  const [unlocked, setUnlocked] = useState(false);
  const [status, setStatus] = useState('idle'); // idle | loading | done | exists | error
  const [message, setMessage] = useState('');
  const navigate = useNavigate();

  const handleUnlock = (e) => {
    e.preventDefault();
    if (key === SETUP_KEY) {
      setUnlocked(true);
    } else {
      Swal.fire({
        title: 'Wrong Key',
        text: 'Invalid setup key. Access denied.',
        icon: 'error',
        confirmButtonColor: '#2563eb',
        background: document.documentElement.classList.contains('dark') ? '#1e293b' : '#fff',
        color: document.documentElement.classList.contains('dark') ? '#f1f5f9' : '#1e293b',
      });
    }
  };

  const handleCreate = async () => {
    setStatus('loading');
    try {
      // Check if admin already exists in Firestore by querying all users
      // We'll try to create — if email exists Firebase throws auth/email-already-in-use
      const userCred = await createUserWithEmailAndPassword(auth, ADMIN_EMAIL, ADMIN_PASSWORD);
      await updateProfile(userCred.user, { displayName: ADMIN_NAME });
      await createUserDoc(userCred.user.uid, {
        name: ADMIN_NAME,
        email: ADMIN_EMAIL,
        role: 'admin',
        organizationId: null,
      });
      setStatus('done');
      setMessage(`Admin account created successfully!`);
    } catch (err) {
      if (err.code === 'auth/email-already-in-use') {
        setStatus('exists');
        setMessage('Admin account already exists. You can log in directly.');
      } else {
        setStatus('error');
        setMessage(err.message);
      }
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 to-slate-950 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="w-14 h-14 bg-gradient-to-br from-red-600 to-rose-600 rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-lg">
            <Shield size={28} className="text-white" />
          </div>
          <h1 className="text-2xl font-bold text-white">Admin Setup</h1>
          <p className="text-slate-400 text-sm mt-1">One-time administrator account creation</p>
        </div>

        <div className="bg-slate-800 rounded-2xl border border-slate-700 p-8 shadow-2xl">

          {/* Step 1 — unlock with key */}
          {!unlocked && (
            <form onSubmit={handleUnlock} className="space-y-4">
              <div className="flex items-center gap-2 p-3 bg-yellow-900/30 border border-yellow-700/50 rounded-lg mb-4">
                <Lock size={14} className="text-yellow-400 flex-shrink-0" />
                <p className="text-xs text-yellow-300">This page is restricted. Enter the setup key to continue.</p>
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-300 mb-1.5">Setup Key</label>
                <input
                  type="password"
                  value={key}
                  onChange={e => setKey(e.target.value)}
                  placeholder="Enter setup key"
                  required
                  className="w-full px-4 py-2.5 rounded-lg border border-slate-600 bg-slate-700 text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-red-500 text-sm"
                />
                <p className="text-xs text-slate-500 mt-1">Default key: <code className="text-slate-400">ssg-setup-2025</code></p>
              </div>
              <button type="submit"
                className="w-full py-2.5 bg-gradient-to-r from-red-600 to-rose-600 text-white rounded-lg font-medium text-sm hover:from-red-700 hover:to-rose-700 transition-all">
                Unlock Setup
              </button>
            </form>
          )}

          {/* Step 2 — create admin */}
          {unlocked && status === 'idle' && (
            <div className="space-y-5">
              <p className="text-sm text-slate-300">This will create the following admin account in Firebase:</p>

              <div className="bg-slate-700/50 rounded-xl p-4 space-y-2 border border-slate-600">
                <div className="flex justify-between text-sm">
                  <span className="text-slate-400">Name</span>
                  <span className="text-white font-medium">{ADMIN_NAME}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-slate-400">Email</span>
                  <span className="text-white font-medium">{ADMIN_EMAIL}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-slate-400">Password</span>
                  <span className="text-white font-medium">{ADMIN_PASSWORD}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-slate-400">Role</span>
                  <span className="text-red-400 font-semibold">admin</span>
                </div>
              </div>

              <div className="flex items-start gap-2 p-3 bg-blue-900/30 border border-blue-700/50 rounded-lg">
                <Shield size={14} className="text-blue-400 mt-0.5 flex-shrink-0" />
                <p className="text-xs text-blue-300">After creation, delete or restrict access to this page (<code>/admin-setup</code>) in production.</p>
              </div>

              <button onClick={handleCreate}
                className="w-full py-2.5 bg-gradient-to-r from-red-600 to-rose-600 text-white rounded-lg font-medium text-sm hover:from-red-700 hover:to-rose-700 transition-all">
                Create Admin Account
              </button>
            </div>
          )}

          {/* Loading */}
          {status === 'loading' && (
            <div className="text-center py-6">
              <div className="w-10 h-10 border-2 border-red-500 border-t-transparent rounded-full animate-spin mx-auto mb-3" />
              <p className="text-slate-300 text-sm">Creating admin account...</p>
            </div>
          )}

          {/* Success */}
          {status === 'done' && (
            <div className="text-center py-4 space-y-4">
              <div className="w-14 h-14 bg-green-900/30 rounded-full flex items-center justify-center mx-auto">
                <CheckCircle2 size={32} className="text-green-400" />
              </div>
              <p className="text-green-400 font-semibold">{message}</p>
              <div className="bg-slate-700/50 rounded-xl p-4 text-left space-y-1 border border-slate-600">
                <p className="text-xs text-slate-400">Use these credentials to log in:</p>
                <p className="text-sm text-white">📧 <strong>{ADMIN_EMAIL}</strong></p>
                <p className="text-sm text-white">🔑 <strong>{ADMIN_PASSWORD}</strong></p>
              </div>
              <button onClick={() => navigate('/login')}
                className="w-full py-2.5 bg-blue-600 text-white rounded-lg font-medium text-sm hover:bg-blue-700 transition-colors">
                Go to Login
              </button>
            </div>
          )}

          {/* Already exists */}
          {status === 'exists' && (
            <div className="text-center py-4 space-y-4">
              <div className="w-14 h-14 bg-blue-900/30 rounded-full flex items-center justify-center mx-auto">
                <Shield size={28} className="text-blue-400" />
              </div>
              <p className="text-blue-300 text-sm">{message}</p>
              <div className="bg-slate-700/50 rounded-xl p-4 text-left space-y-1 border border-slate-600">
                <p className="text-xs text-slate-400">Admin credentials:</p>
                <p className="text-sm text-white">📧 <strong>{ADMIN_EMAIL}</strong></p>
                <p className="text-sm text-white">🔑 <strong>{ADMIN_PASSWORD}</strong></p>
              </div>
              <button onClick={() => navigate('/login')}
                className="w-full py-2.5 bg-blue-600 text-white rounded-lg font-medium text-sm hover:bg-blue-700 transition-colors">
                Go to Login
              </button>
            </div>
          )}

          {/* Error */}
          {status === 'error' && (
            <div className="text-center py-4 space-y-4">
              <p className="text-red-400 text-sm">{message}</p>
              <p className="text-xs text-slate-500">Make sure your Firebase config is set up correctly in <code>src/firebase/config.js</code></p>
              <button onClick={() => setStatus('idle')}
                className="w-full py-2.5 border border-slate-600 text-slate-300 rounded-lg text-sm hover:bg-slate-700 transition-colors">
                Try Again
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default AdminSetup;
