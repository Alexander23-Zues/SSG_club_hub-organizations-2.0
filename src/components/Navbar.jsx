import { Menu, Moon, Sun, Search, Home, Building2, CalendarDays, Megaphone, Users, BarChart3, Settings } from 'lucide-react';
import { useTheme } from '../context/ThemeContext';
import { useAuth } from '../context/AuthContext';
import NotificationsDropdown from './NotificationsDropdown';
import { useState } from 'react';
import { useNavigate, useLocation, Link } from 'react-router-dom';

// Page title map for breadcrumb
const PAGE_TITLES = {
  '/dashboard':     { label: 'Dashboard',     icon: Home },
  '/organizations': { label: 'Organizations', icon: Building2 },
  '/events':        { label: 'Events',        icon: CalendarDays },
  '/announcements': { label: 'Announcements', icon: Megaphone },
  '/members':       { label: 'Members',       icon: Users },
  '/reports':       { label: 'Reports',       icon: BarChart3 },
  '/settings':      { label: 'Settings',      icon: Settings },
};

const Navbar = ({ onMenuClick }) => {
  const { dark, toggle } = useTheme();
  const { userProfile } = useAuth();
  const [search, setSearch] = useState('');
  const navigate = useNavigate();
  const location = useLocation();

  // Resolve current page info
  const pathKey = Object.keys(PAGE_TITLES).find(k => location.pathname.startsWith(k)) || '/dashboard';
  const pageInfo = PAGE_TITLES[pathKey];
  const PageIcon = pageInfo?.icon;

  const handleSearch = (e) => {
    e.preventDefault();
    if (!search.trim()) return;
    const q = encodeURIComponent(search.trim());
    // Search across orgs and events based on current page
    const path = location.pathname;
    if (path.startsWith('/events')) navigate(`/events?q=${q}`);
    else if (path.startsWith('/announcements')) navigate(`/announcements?q=${q}`);
    else navigate(`/organizations?q=${q}`);
    setSearch('');
  };

  return (
    <header className="h-16 bg-white dark:bg-slate-900 border-b border-slate-200 dark:border-slate-700 flex items-center px-4 gap-3 sticky top-0 z-10">
      {/* Mobile menu toggle */}
      <button
        onClick={onMenuClick}
        className="lg:hidden p-2 rounded-xl text-slate-500 hover:bg-slate-100 dark:text-slate-400 dark:hover:bg-slate-800 transition-colors"
        aria-label="Open menu"
      >
        <Menu size={20} />
      </button>

      {/* Page title — desktop */}
      {pageInfo && (
        <div className="hidden lg:flex items-center gap-2 mr-2">
          <div className="w-7 h-7 bg-blue-50 dark:bg-blue-900/30 rounded-lg flex items-center justify-center">
            <PageIcon size={14} className="text-blue-600 dark:text-blue-400" />
          </div>
          <span className="text-sm font-bold text-slate-700 dark:text-slate-200">{pageInfo.label}</span>
        </div>
      )}

      {/* Search bar */}
      <form onSubmit={handleSearch} className="flex-1 max-w-sm relative hidden sm:block">
        <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
        <input
          type="text"
          placeholder={
            location.pathname.startsWith('/events') ? 'Search events...' :
            location.pathname.startsWith('/announcements') ? 'Search announcements...' :
            'Search organizations...'
          }
          value={search}
          onChange={e => setSearch(e.target.value)}
          className="w-full pl-9 pr-4 py-2 text-sm bg-slate-100 dark:bg-slate-800 border border-transparent focus:border-blue-400 dark:focus:border-blue-500 rounded-xl outline-none text-slate-700 dark:text-slate-200 placeholder-slate-400 transition-all"
        />
      </form>

      <div className="flex items-center gap-1 ml-auto">
        {/* Dark mode toggle */}
        <button
          onClick={toggle}
          className="p-2 rounded-xl text-slate-500 hover:bg-slate-100 dark:text-slate-400 dark:hover:bg-slate-800 transition-colors"
          aria-label="Toggle dark mode"
        >
          {dark ? <Sun size={17} /> : <Moon size={17} />}
        </button>

        {/* Notifications */}
        <NotificationsDropdown />

        {/* Avatar + name */}
        {userProfile && (
          <button
            onClick={() => navigate('/settings')}
            className="flex items-center gap-2 ml-1 pl-2 pr-3 py-1.5 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors group"
            title="Go to settings"
          >
            <div className="w-7 h-7 rounded-lg bg-gradient-to-br from-blue-500 to-indigo-500 flex items-center justify-center text-white font-bold text-xs overflow-hidden flex-shrink-0">
              {userProfile.avatarUrl
                ? <img src={userProfile.avatarUrl} alt="avatar" className="w-full h-full object-cover" />
                : userProfile.name?.charAt(0).toUpperCase()
              }
            </div>
            <span className="text-xs font-semibold text-slate-700 dark:text-slate-300 hidden md:block max-w-[100px] truncate group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">
              {userProfile.name?.split(' ')[0]}
            </span>
          </button>
        )}
      </div>
    </header>
  );
};

export default Navbar;
