import { NavLink, useNavigate } from 'react-router-dom';
import {
  LayoutDashboard, Building2, CalendarDays, Megaphone,
  Users, BarChart3, Settings, LogOut, X, Shield
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { confirmDialog } from '../utils/swal';
import toast from 'react-hot-toast';

const navItems = [
  { to: '/dashboard',     icon: LayoutDashboard, label: 'Dashboard',     roles: ['admin','officer','student'] },
  { to: '/organizations', icon: Building2,        label: 'Organizations', roles: ['admin','officer','student'] },
  { to: '/events',        icon: CalendarDays,     label: 'Events',        roles: ['admin','officer','student'] },
  { to: '/announcements', icon: Megaphone,        label: 'Announcements', roles: ['admin','officer','student'] },
  { to: '/members',       icon: Users,            label: 'Members',       roles: ['admin','officer'] },
  { to: '/reports',       icon: BarChart3,        label: 'Reports',       roles: ['admin'] },
  { to: '/settings',      icon: Settings,         label: 'Settings',      roles: ['admin','officer','student'] },
];

const roleStyle = {
  admin:   { badge: 'bg-red-500/20 text-red-300 border border-red-500/30',   dot: 'bg-red-400' },
  officer: { badge: 'bg-blue-500/20 text-blue-300 border border-blue-500/30', dot: 'bg-blue-400' },
  student: { badge: 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30', dot: 'bg-emerald-400' },
};

const Sidebar = ({ open, onClose }) => {
  const { userProfile, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = async () => {
    const res = await confirmDialog({ title: 'Sign out?', text: 'You will be returned to the login page.', confirmText: 'Sign out', icon: 'question' });
    if (!res.isConfirmed) return;
    try { await logout(); navigate('/login'); }
    catch { toast.error('Failed to logout'); }
  };

  const filtered = navItems.filter(i => !userProfile || i.roles.includes(userProfile.role));
  const rs = roleStyle[userProfile?.role] || roleStyle.student;

  return (
    <>
      {open && <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-20 lg:hidden" onClick={onClose} />}

      <aside className={`
        fixed top-0 left-0 h-full w-64 z-30 flex flex-col
        bg-slate-900 dark:bg-slate-950
        border-r border-slate-700/50
        sidebar-transition
        ${open ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}
      `}>

        {/* Logo */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-slate-700/50">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-xl flex items-center justify-center shadow-lg shadow-blue-500/30">
              <Shield size={17} className="text-white" />
            </div>
            <div>
              <p className="text-sm font-extrabold text-white leading-tight">SSG Club Hub</p>
              <p className="text-[10px] text-slate-500">Organizations 2.0</p>
            </div>
          </div>
          <button onClick={onClose} className="lg:hidden text-slate-500 hover:text-white transition-colors">
            <X size={18} />
          </button>
        </div>

        {/* User card */}
        {userProfile && (
          <div className="mx-3 my-3 p-3 bg-slate-800/60 rounded-xl border border-slate-700/50">
            <div className="flex items-center gap-3">
              <div className="relative flex-shrink-0">
                <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-blue-500 to-indigo-500 flex items-center justify-center text-white font-bold text-sm overflow-hidden">
                  {userProfile.avatarUrl
                    ? <img src={userProfile.avatarUrl} alt="" className="w-full h-full object-cover" />
                    : userProfile.name?.charAt(0).toUpperCase()
                  }
                </div>
                <div className={`absolute -bottom-0.5 -right-0.5 w-3 h-3 ${rs.dot} rounded-full border-2 border-slate-900`} />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-semibold text-white truncate">{userProfile.name}</p>
                <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded-md capitalize ${rs.badge}`}>
                  {userProfile.role}
                </span>
              </div>
            </div>
          </div>
        )}

        {/* Nav */}
        <nav className="flex-1 overflow-y-auto px-3 py-2 space-y-0.5">
          <p className="text-[10px] font-bold text-slate-600 uppercase tracking-widest px-3 py-2">Navigation</p>
          {filtered.map(({ to, icon: Icon, label }) => (
            <NavLink key={to} to={to} onClick={onClose}
              className={({ isActive }) => `
                flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all duration-150
                ${isActive
                  ? 'bg-blue-600 text-white shadow-md shadow-blue-600/30'
                  : 'text-slate-400 hover:bg-slate-800 hover:text-white'
                }
              `}>
              {({ isActive }) => (
                <>
                  <Icon size={17} className={isActive ? 'text-white' : 'text-slate-500'} />
                  {label}
                </>
              )}
            </NavLink>
          ))}
        </nav>

        {/* Logout */}
        <div className="p-3 border-t border-slate-700/50">
          <button onClick={handleLogout}
            className="flex items-center gap-3 w-full px-3 py-2.5 rounded-xl text-sm font-medium text-slate-400 hover:bg-red-500/10 hover:text-red-400 transition-all duration-150">
            <LogOut size={17} />
            Sign Out
          </button>
        </div>
      </aside>
    </>
  );
};

export default Sidebar;
