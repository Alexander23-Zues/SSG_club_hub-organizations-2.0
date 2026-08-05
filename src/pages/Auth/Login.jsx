import { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { Shield, Eye, EyeOff, ArrowLeft, ChevronDown, ChevronUp } from 'lucide-react';
import toast from 'react-hot-toast';

const inputCls = "w-full px-4 py-3 rounded-xl border border-slate-200 dark:border-slate-600 bg-slate-50 dark:bg-slate-700/50 text-slate-800 dark:text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm transition-all";

const DEMO_ACCOUNTS = [
  {
    role: 'admin',
    label: 'SSG Admin',
    name: 'Demo Admin',
    email: 'demo.admin@ssgclubhub.edu',
    description: 'Full access — manage orgs, members, reports',
    gradient: 'from-red-500 to-rose-600',
    badge: 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400',
    emoji: '🛡️',
  },
  {
    role: 'officer',
    label: 'Org Officer',
    name: 'Clara Mendoza',
    email: 'demo.officer@ssgclubhub.edu',
    description: 'Manage CS Society — events, announcements, members',
    gradient: 'from-blue-500 to-indigo-600',
    badge: 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400',
    emoji: '📋',
  },
  {
    role: 'student',
    label: 'Student',
    name: 'Alice Reyes',
    email: 'demo.student@ssgclubhub.edu',
    description: 'Browse orgs, RSVP to events, view announcements',
    gradient: 'from-emerald-500 to-green-600',
    badge: 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400',
    emoji: '🎓',
  },
];

const Login = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPass, setShowPass] = useState(false);
  const [loading, setLoading] = useState(false);
  const [showDemo, setShowDemo] = useState(false);
  const { login, demoLogin } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const from = location.state?.from?.pathname || '/dashboard';

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      await login(email, password);
      toast.success('Welcome back!');
      navigate(from, { replace: true });
    } catch (err) {
      const msg = err.code === 'auth/invalid-credential' || err.code === 'auth/wrong-password'
        ? 'Invalid email or password'
        : err.code === 'auth/user-not-found'
        ? 'No account found with this email'
        : err.code === 'auth/too-many-requests'
        ? 'Too many attempts. Try again later.'
        : 'Login failed. Please try again.';
      toast.error(msg);
    } finally {
      setLoading(false);
    }
  };

  const handleDemoLogin = (role) => {
    demoLogin(role);
    toast.success(`Logged in as Demo ${role.charAt(0).toUpperCase() + role.slice(1)}`);
    navigate('/dashboard', { replace: true });
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 dark:from-slate-950 dark:via-slate-900 dark:to-slate-950 flex items-center justify-center p-4">
      {/* Back to home */}
      <Link to="/" className="fixed top-4 left-4 flex items-center gap-1.5 text-xs font-medium text-slate-500 hover:text-blue-600 dark:text-slate-400 dark:hover:text-blue-400 transition-colors bg-white dark:bg-slate-800 px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 shadow-sm">
        <ArrowLeft size={13} /> Back to Home
      </Link>

      <div className="w-full max-w-md">
        {/* Logo */}
        <div className="text-center mb-8">
          <div className="w-16 h-16 bg-gradient-to-br from-blue-600 to-indigo-600 rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-xl shadow-blue-500/25">
            <Shield size={30} className="text-white" />
          </div>
          <h1 className="text-2xl font-extrabold text-slate-800 dark:text-white">SSG Club Hub</h1>
          <p className="text-slate-500 dark:text-slate-400 text-sm mt-1">Organizations 2.0</p>
        </div>

        <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-2xl border border-slate-200 dark:border-slate-700 overflow-hidden">
          {/* Top accent */}
          <div className="h-1 bg-gradient-to-r from-blue-600 to-indigo-600" />

          <div className="p-8">
            <h2 className="text-xl font-extrabold text-slate-800 dark:text-white mb-1">Welcome back</h2>
            <p className="text-sm text-slate-500 dark:text-slate-400 mb-6">Sign in to your account to continue</p>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-1.5">Email Address</label>
                <input type="email" required value={email} onChange={e => setEmail(e.target.value)}
                  placeholder="you@school.edu" className={inputCls} autoComplete="email" />
              </div>

              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <label className="block text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Password</label>
                  <Link to="/forgot-password" className="text-xs text-blue-600 dark:text-blue-400 hover:underline font-medium">
                    Forgot password?
                  </Link>
                </div>
                <div className="relative">
                  <input type={showPass ? 'text' : 'password'} required value={password}
                    onChange={e => setPassword(e.target.value)} placeholder="••••••••"
                    className={`${inputCls} pr-11`} autoComplete="current-password" />
                  <button type="button" onClick={() => setShowPass(s => !s)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 transition-colors p-1">
                    {showPass ? <EyeOff size={16} /> : <Eye size={16} />}
                  </button>
                </div>
              </div>

              <button type="submit" disabled={loading}
                className="w-full py-3 bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-xl font-bold text-sm hover:from-blue-700 hover:to-indigo-700 disabled:opacity-60 transition-all shadow-lg shadow-blue-500/20 hover:-translate-y-0.5 mt-2">
                {loading ? (
                  <span className="flex items-center justify-center gap-2">
                    <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    Signing in...
                  </span>
                ) : 'Sign In'}
              </button>
            </form>

            <div className="mt-6 pt-5 border-t border-slate-100 dark:border-slate-700">
              <p className="text-sm text-slate-500 dark:text-slate-400 text-center mb-4">
                Don't have an account?{' '}
                <Link to="/register" className="text-blue-600 dark:text-blue-400 font-bold hover:underline">
                  Create one free
                </Link>
              </p>

              {/* Demo accounts toggle */}
              <button
                type="button"
                onClick={() => setShowDemo(s => !s)}
                className="w-full flex items-center justify-between px-4 py-2.5 rounded-xl border-2 border-dashed border-slate-300 dark:border-slate-600 text-slate-500 dark:text-slate-400 text-sm font-semibold hover:border-blue-400 hover:text-blue-600 dark:hover:border-blue-500 dark:hover:text-blue-400 transition-all"
              >
                <span>Try a Demo Account</span>
                {showDemo ? <ChevronUp size={15} /> : <ChevronDown size={15} />}
              </button>

              {showDemo && (
                <div className="mt-3 space-y-2">
                  {DEMO_ACCOUNTS.map(acc => (
                    <button
                      key={acc.role}
                      type="button"
                      onClick={() => handleDemoLogin(acc.role)}
                      className="w-full flex items-center gap-3 p-3 rounded-xl border border-slate-200 dark:border-slate-700 hover:border-blue-300 dark:hover:border-blue-700 hover:bg-slate-50 dark:hover:bg-slate-700/50 transition-all text-left group"
                    >
                      <div className={`w-9 h-9 rounded-xl bg-gradient-to-br ${acc.gradient} flex items-center justify-center text-base flex-shrink-0 shadow-sm`}>
                        {acc.emoji}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2">
                          <span className="text-sm font-bold text-slate-800 dark:text-white">{acc.name}</span>
                          <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded-full ${acc.badge}`}>{acc.label}</span>
                        </div>
                        <p className="text-xs text-slate-400 dark:text-slate-500 truncate mt-0.5">{acc.description}</p>
                      </div>
                    </button>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>

        <p className="text-center text-xs text-slate-400 dark:text-slate-600 mt-4">
          SSG Admin?{' '}
          <Link to="/admin-setup" className="text-slate-500 dark:text-slate-500 hover:text-blue-600 dark:hover:text-blue-400 transition-colors">
            Setup admin account
          </Link>
        </p>
      </div>
    </div>
  );
};

export default Login;
