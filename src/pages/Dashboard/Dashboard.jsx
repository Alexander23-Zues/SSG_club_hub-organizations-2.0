import { useEffect, useState } from 'react';
import { Building2, CalendarDays, Users, Megaphone, TrendingUp, Sparkles, ArrowRight, Clock, Lightbulb } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import StatCard from '../../components/StatCard';
import { useServices } from '../../firebase/useServices';
import { getDashboardInsights, getBestPostTime } from '../../ai/engine';
import { format, isToday, isTomorrow } from 'date-fns';
import { Link } from 'react-router-dom';

const getSmartSuggestion = (role, orgs, events) => {
  const insights = getDashboardInsights(role, orgs, events, []);
  return insights[0]?.text || 'Welcome to SSG Club Hub!';
};

const getDateLabel = (d) => {
  if (isToday(d)) return 'Today';
  if (isTomorrow(d)) return 'Tomorrow';
  return format(d, 'MMM d');
};

const quickActions = [
  { to: '/organizations', label: 'Manage Orgs',     icon: Building2,   from: 'from-blue-500',   to2: 'to-blue-600' },
  { to: '/members',       label: 'Approve Members', icon: Users,       from: 'from-emerald-500', to2: 'to-green-600' },
  { to: '/reports',       label: 'View Reports',    icon: TrendingUp,  from: 'from-purple-500',  to2: 'to-indigo-600' },
  { to: '/events',        label: 'Create Event',    icon: CalendarDays,from: 'from-orange-500',  to2: 'to-amber-500' },
];

const Dashboard = () => {
  const { userProfile, isAdmin, isOfficer, currentUser } = useAuth();
  const { subscribeOrgs, subscribeEvents, subscribeAnnouncements } = useServices(currentUser);
  const [orgs, setOrgs] = useState([]);
  const [events, setEvents] = useState([]);
  const [announcements, setAnnouncements] = useState([]);

  useEffect(() => {
    const u1 = subscribeOrgs(setOrgs);
    const u2 = subscribeEvents(setEvents);
    const u3 = subscribeAnnouncements(setAnnouncements);
    return () => { u1(); u2(); u3(); };
  }, []);

  const upcomingEvents = events.filter(e => {
    const d = e.date?.toDate ? e.date.toDate() : new Date(e.date);
    return d > new Date();
  }).slice(0, 4);

  const recentAnnouncements = announcements.slice(0, 3);
  const suggestion = getSmartSuggestion(userProfile?.role, orgs, events);
  const insights = getDashboardInsights(userProfile?.role, orgs, events, announcements);
  const bestTime = getBestPostTime();

  const roleGradient = isAdmin
    ? 'from-red-500 to-rose-600'
    : isOfficer
    ? 'from-blue-500 to-indigo-600'
    : 'from-emerald-500 to-green-600';

  return (
    <div className="space-y-6">

      {/* ── Hero welcome banner ── */}
      <div className={`relative bg-gradient-to-br ${roleGradient} rounded-2xl p-6 text-white overflow-hidden shadow-xl`}>
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_70%_50%,rgba(255,255,255,0.1),transparent_60%)]" />
        <div className="absolute top-0 right-0 w-48 h-48 bg-white/5 rounded-full -translate-y-16 translate-x-16" />
        <div className="relative flex items-start justify-between gap-4">
          <div>
            <p className="text-white/70 text-sm font-medium">{format(new Date(), 'EEEE, MMMM d, yyyy')}</p>
            <h1 className="text-2xl font-extrabold mt-1">
              Welcome back, {userProfile?.name?.split(' ')[0]} 👋
            </h1>
            <p className="text-white/70 text-sm mt-1 capitalize">{userProfile?.role} account</p>
          </div>
          <div className="flex-shrink-0 w-14 h-14 bg-white/20 backdrop-blur-sm rounded-2xl flex items-center justify-center text-2xl font-extrabold">
            {userProfile?.name?.charAt(0).toUpperCase()}
          </div>
        </div>

        {/* AI Insights panel */}
        <div className="relative mt-4 bg-white/10 backdrop-blur-sm rounded-xl border border-white/20 overflow-hidden">
          <div className="flex items-center gap-2 px-3 py-2 border-b border-white/10">
            <Sparkles size={13} className="text-white/70" />
            <p className="text-[11px] font-bold text-white/60 uppercase tracking-wider">AI Insights</p>
            <span className="ml-auto text-[10px] bg-white/20 text-white px-1.5 py-0.5 rounded-full font-bold">{insights.length}</span>
          </div>
          <div className="divide-y divide-white/10">
            {insights.slice(0, 2).map((ins, i) => (
              <div key={i} className="flex items-start gap-2 px-3 py-2">
                <span className="text-base leading-none mt-0.5">{ins.icon}</span>
                <p className="text-xs text-white/85 leading-relaxed">{ins.text}</p>
                {ins.priority === 'high' && (
                  <span className="flex-shrink-0 text-[9px] font-bold bg-red-500/30 text-red-200 px-1.5 py-0.5 rounded-full ml-auto">Action</span>
                )}
              </div>
            ))}
          </div>
          {(isAdmin || isOfficer) && (
            <div className="flex items-center gap-1.5 px-3 py-2 bg-white/5 border-t border-white/10">
              <Clock size={11} className="text-white/50" />
              <p className="text-[10px] text-white/60">Best time to post: <strong className="text-white/80">{bestTime.time}</strong></p>
            </div>
          )}
        </div>
      </div>

      {/* ── Stats ── */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard icon={Building2}   label="Organizations"  value={orgs.length}           color="blue" />
        <StatCard icon={CalendarDays} label="Total Events"  value={events.length}          color="purple" />
        <StatCard icon={Megaphone}   label="Announcements"  value={announcements.length}   color="orange" />
        <StatCard icon={Users}       label="Upcoming Events" value={upcomingEvents.length} color="green" />
      </div>

      {/* ── Admin quick actions ── */}
      {(isAdmin || isOfficer) && (
        <div>
          <p className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-widest mb-3">Quick Actions</p>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            {quickActions
              .filter(a => isAdmin || a.to !== '/reports')
              .map(({ to, label, icon: Icon, from, to2 }) => (
                <Link key={to} to={to}
                  className={`group flex flex-col items-center gap-2 p-4 bg-gradient-to-br ${from} ${to2} rounded-2xl text-white shadow-md hover:shadow-lg hover:-translate-y-0.5 transition-all duration-200`}>
                  <div className="w-9 h-9 bg-white/20 rounded-xl flex items-center justify-center group-hover:bg-white/30 transition-colors">
                    <Icon size={18} />
                  </div>
                  <span className="text-xs font-semibold text-center leading-tight">{label}</span>
                </Link>
              ))}
          </div>
        </div>
      )}

      {/* ── Two-column content ── */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">

        {/* Upcoming Events */}
        <div className="bg-white dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700 overflow-hidden">
          <div className="flex items-center justify-between px-5 py-4 border-b border-slate-100 dark:border-slate-700">
            <div className="flex items-center gap-2">
              <div className="w-7 h-7 bg-blue-100 dark:bg-blue-900/30 rounded-lg flex items-center justify-center">
                <CalendarDays size={14} className="text-blue-600 dark:text-blue-400" />
              </div>
              <h2 className="font-bold text-slate-800 dark:text-white text-sm">Upcoming Events</h2>
            </div>
            <Link to="/events" className="flex items-center gap-1 text-xs text-blue-600 dark:text-blue-400 hover:underline font-medium">
              View all <ArrowRight size={12} />
            </Link>
          </div>
          <div className="p-4">
            {upcomingEvents.length === 0 ? (
              <div className="text-center py-8">
                <CalendarDays size={28} className="mx-auto mb-2 text-slate-300 dark:text-slate-600" />
                <p className="text-sm text-slate-400 dark:text-slate-500">No upcoming events</p>
              </div>
            ) : (
              <div className="space-y-2">
                {upcomingEvents.map(event => {
                  const d = event.date?.toDate ? event.date.toDate() : new Date(event.date);
                  return (
                    <div key={event.id} className="flex items-center gap-3 p-3 rounded-xl bg-slate-50 dark:bg-slate-700/40 hover:bg-blue-50 dark:hover:bg-blue-900/20 transition-colors group">
                      <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-xl flex flex-col items-center justify-center flex-shrink-0 shadow-sm">
                        <span className="text-[9px] font-bold text-blue-100 uppercase leading-none">{format(d, 'MMM')}</span>
                        <span className="text-sm font-extrabold text-white leading-none">{format(d, 'd')}</span>
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-semibold text-slate-800 dark:text-white truncate">{event.title}</p>
                        <div className="flex items-center gap-1 mt-0.5">
                          <Clock size={10} className="text-slate-400" />
                          <p className="text-xs text-slate-500 dark:text-slate-400">{getDateLabel(d)} · {format(d, 'h:mm a')}</p>
                        </div>
                      </div>
                      <ArrowRight size={14} className="text-slate-300 dark:text-slate-600 group-hover:text-blue-500 transition-colors flex-shrink-0" />
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>

        {/* Recent Announcements */}
        <div className="bg-white dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700 overflow-hidden">
          <div className="flex items-center justify-between px-5 py-4 border-b border-slate-100 dark:border-slate-700">
            <div className="flex items-center gap-2">
              <div className="w-7 h-7 bg-orange-100 dark:bg-orange-900/30 rounded-lg flex items-center justify-center">
                <Megaphone size={14} className="text-orange-600 dark:text-orange-400" />
              </div>
              <h2 className="font-bold text-slate-800 dark:text-white text-sm">Recent Announcements</h2>
            </div>
            <Link to="/announcements" className="flex items-center gap-1 text-xs text-blue-600 dark:text-blue-400 hover:underline font-medium">
              View all <ArrowRight size={12} />
            </Link>
          </div>
          <div className="p-4">
            {recentAnnouncements.length === 0 ? (
              <div className="text-center py-8">
                <Megaphone size={28} className="mx-auto mb-2 text-slate-300 dark:text-slate-600" />
                <p className="text-sm text-slate-400 dark:text-slate-500">No announcements yet</p>
              </div>
            ) : (
              <div className="space-y-2">
                {recentAnnouncements.map((ann, i) => (
                  <div key={ann.id} className="p-3 rounded-xl bg-slate-50 dark:bg-slate-700/40 hover:bg-orange-50 dark:hover:bg-orange-900/10 transition-colors">
                    <div className="flex items-start gap-2">
                      <div className={`w-1.5 h-1.5 rounded-full mt-1.5 flex-shrink-0 ${i === 0 ? 'bg-orange-500' : 'bg-slate-300 dark:bg-slate-600'}`} />
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-semibold text-slate-800 dark:text-white truncate">{ann.title}</p>
                        <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5 line-clamp-2">{ann.content}</p>
                        {ann.createdAt && (
                          <p className="text-[10px] text-slate-400 mt-1">
                            {format(ann.createdAt.toDate?.() || new Date(ann.createdAt), 'MMM d, yyyy')}
                          </p>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
