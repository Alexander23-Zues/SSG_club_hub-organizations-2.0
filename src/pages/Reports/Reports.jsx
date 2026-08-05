import { useEffect, useState } from 'react';
import {
  Users, Building2, CalendarDays, Megaphone, Activity,
  Download, Database, Sparkles, TrendingUp, TrendingDown,
  UserCheck, Clock, CheckCircle2, BarChart3, PieChart, Target
} from 'lucide-react';
import { useServices } from '../../firebase/useServices';
import { seedSampleData } from '../../firebase/seedData';
import { useAuth } from '../../context/AuthContext';
import LoadingSpinner from '../../components/LoadingSpinner';
import { confirmDialog } from '../../utils/swal';
import { generateReportSummary } from '../../ai/engine';
import { format, subDays, isAfter } from 'date-fns';
import toast from 'react-hot-toast';

// ── Reusable bar chart ────────────────────────────────────────────────────
const BAR_COLORS = [
  'bg-blue-500','bg-indigo-500','bg-purple-500','bg-pink-500',
  'bg-orange-500','bg-emerald-500','bg-cyan-500','bg-rose-500',
];
const HBar = ({ data, showValue = true }) => {
  const max = Math.max(...data.map(d => d.value), 1);
  return (
    <div className="space-y-3">
      {data.map((item, i) => (
        <div key={i} className="flex items-center gap-3">
          <span className="text-xs font-medium text-slate-500 dark:text-slate-400 w-32 truncate shrink-0">{item.label}</span>
          <div className="flex-1 bg-slate-100 dark:bg-slate-700 rounded-full h-2.5 overflow-hidden">
            <div className={`${BAR_COLORS[i % BAR_COLORS.length]} h-2.5 rounded-full transition-all duration-700`}
              style={{ width: `${(item.value / max) * 100}%` }} />
          </div>
          {showValue && <span className="text-xs font-bold text-slate-700 dark:text-slate-300 w-6 text-right tabular-nums shrink-0">{item.value}</span>}
        </div>
      ))}
      {data.length === 0 && <p className="text-xs text-slate-400 text-center py-4">No data yet</p>}
    </div>
  );
};

// ── Donut / pie chart (CSS only) ──────────────────────────────────────────
const DonutChart = ({ segments }) => {
  const total = segments.reduce((s, d) => s + d.value, 0) || 1;
  let offset = 0;
  const r = 40, cx = 50, cy = 50, circ = 2 * Math.PI * r;
  return (
    <div className="flex items-center gap-5">
      <svg viewBox="0 0 100 100" className="w-24 h-24 -rotate-90 shrink-0">
        {segments.map((seg, i) => {
          const pct = seg.value / total;
          const dash = pct * circ;
          const el = (
            <circle key={i} cx={cx} cy={cy} r={r}
              fill="none" strokeWidth="18"
              className={seg.color}
              strokeDasharray={`${dash} ${circ - dash}`}
              strokeDashoffset={-offset * circ} />
          );
          offset += pct;
          return el;
        })}
      </svg>
      <div className="space-y-1.5">
        {segments.map((seg, i) => (
          <div key={i} className="flex items-center gap-2">
            <span className={`w-2.5 h-2.5 rounded-full shrink-0 ${seg.dotColor}`} />
            <span className="text-xs text-slate-600 dark:text-slate-400">{seg.label}</span>
            <span className="text-xs font-bold text-slate-800 dark:text-white ml-auto pl-3">{seg.value}</span>
          </div>
        ))}
      </div>
    </div>
  );
};

// ── Stat delta card ───────────────────────────────────────────────────────
const DeltaCard = ({ icon: Icon, label, value, sub, gradient, glow, trend }) => (
  <div className={`bg-gradient-to-br ${gradient} rounded-2xl p-5 text-white shadow-lg ${glow} relative overflow-hidden`}>
    <div className="absolute top-0 right-0 w-20 h-20 bg-white/5 rounded-full -translate-y-8 translate-x-8" />
    <div className="flex items-start justify-between">
      <div className="w-9 h-9 bg-white/20 rounded-xl flex items-center justify-center mb-3">
        <Icon size={18} />
      </div>
      {trend !== undefined && (
        <span className={`flex items-center gap-0.5 text-[10px] font-bold px-1.5 py-0.5 rounded-full ${trend >= 0 ? 'bg-white/20 text-white' : 'bg-black/20 text-white/80'}`}>
          {trend >= 0 ? <TrendingUp size={9} /> : <TrendingDown size={9} />} {Math.abs(trend)}%
        </span>
      )}
    </div>
    <p className="text-3xl font-extrabold">{value}</p>
    <p className="text-white/70 text-xs font-medium mt-0.5">{label}</p>
    {sub && <p className="text-white/50 text-[10px] mt-0.5">{sub}</p>}
  </div>
);

const actionLabels = {
  create_org: 'Created Org', create_event: 'Created Event',
  create_announcement: 'Posted Announcement', join_request: 'Join Request',
  approve_member: 'Approved Member',
};
const actionColors = {
  create_org:          'bg-blue-100 text-blue-600 dark:bg-blue-900/30 dark:text-blue-400',
  create_event:        'bg-purple-100 text-purple-600 dark:bg-purple-900/30 dark:text-purple-400',
  create_announcement: 'bg-orange-100 text-orange-600 dark:bg-orange-900/30 dark:text-orange-400',
  join_request:        'bg-green-100 text-green-600 dark:bg-green-900/30 dark:text-green-400',
  approve_member:      'bg-emerald-100 text-emerald-600 dark:bg-emerald-900/30 dark:text-emerald-400',
};

const Reports = () => {
  const [orgs, setOrgs]               = useState([]);
  const [events, setEvents]           = useState([]);
  const [announcements, setAnn]       = useState([]);
  const [logs, setLogs]               = useState([]);
  const [users, setUsers]             = useState([]);
  const [members, setMembers]         = useState([]);
  const [loading, setLoading]         = useState(true);
  const [seeding, setSeeding]         = useState(false);
  const [tab, setTab]                 = useState('overview');
  const { currentUser }               = useAuth();
  const { subscribeOrgs, subscribeEvents, subscribeAnnouncements,
    subscribeActivityLogs, getAllUsers, subscribeOrgMembers } = useServices(currentUser);

  useEffect(() => {
    const u1 = subscribeOrgs(d => { setOrgs(d); setLoading(false); });
    const u2 = subscribeEvents(setEvents);
    const u3 = subscribeAnnouncements(setAnn);
    const u4 = subscribeActivityLogs(setLogs);
    getAllUsers().then(setUsers);
    return () => { u1(); u2(); u3(); u4(); };
  }, []);

  // collect all members across all orgs
  useEffect(() => {
    if (!orgs.length) return;
    const unsubs = [];
    const allMembers = {};
    orgs.forEach(org => {
      const u = subscribeOrgMembers(org.id, ms => {
        allMembers[org.id] = ms;
        setMembers(Object.values(allMembers).flat());
      });
      unsubs.push(u);
    });
    return () => unsubs.forEach(u => u());
  }, [orgs.length]);

  const now = new Date();
  const upcoming  = events.filter(e => isAfter(e.date?.toDate ? e.date.toDate() : new Date(e.date), now));
  const past      = events.filter(e => !isAfter(e.date?.toDate ? e.date.toDate() : new Date(e.date), now));
  const approved  = members.filter(m => m.status === 'approved');
  const pending   = members.filter(m => m.status === 'pending');
  const last7     = logs.filter(l => isAfter(l.createdAt?.toDate?.() || new Date(l.createdAt), subDays(now, 7)));
  const aiSummary = generateReportSummary(orgs, events, users, announcements, logs);

  // ── Chart data ────────────────────────────────────────────────────────
  const eventsPerOrg = orgs.map(o => ({
    label: o.name.split(' ').slice(0, 2).join(' '),
    value: events.filter(e => e.organizationId === o.id).length,
  }));

  const membersPerOrg = orgs.map(o => ({
    label: o.name.split(' ').slice(0, 2).join(' '),
    value: members.filter(m => m.organizationId === o.id && m.status === 'approved').length,
  }));

  const announcementsPerOrg = orgs.map(o => ({
    label: o.name.split(' ').slice(0, 2).join(' '),
    value: announcements.filter(a => a.organizationId === o.id).length,
  }));

  const roleBreakdown = [
    { label: 'Students', value: users.filter(u => u.role === 'student').length,  color: 'stroke-blue-500',    dotColor: 'bg-blue-500'    },
    { label: 'Officers', value: users.filter(u => u.role === 'officer').length,  color: 'stroke-indigo-500',  dotColor: 'bg-indigo-500'  },
    { label: 'Admins',   value: users.filter(u => u.role === 'admin').length,    color: 'stroke-purple-500',  dotColor: 'bg-purple-500'  },
  ];

  const memberStatusBreakdown = [
    { label: 'Approved', value: approved.length, color: 'stroke-emerald-500', dotColor: 'bg-emerald-500' },
    { label: 'Pending',  value: pending.length,  color: 'stroke-yellow-500',  dotColor: 'bg-yellow-500'  },
    { label: 'Rejected', value: members.filter(m => m.status === 'rejected').length, color: 'stroke-red-500', dotColor: 'bg-red-500' },
  ];

  // Activity by type (last 30 days)
  const activityByType = Object.entries(actionLabels).map(([key, label]) => ({
    label, value: logs.filter(l => l.action === key).length,
  })).filter(d => d.value > 0);

  // Events: upcoming vs past
  const eventStatusData = [
    { label: 'Upcoming', value: upcoming.length, color: 'stroke-blue-500',   dotColor: 'bg-blue-500'   },
    { label: 'Past',     value: past.length,     color: 'stroke-slate-400',  dotColor: 'bg-slate-400'  },
  ];

  // Top active orgs by total activity (events + announcements + members)
  const orgActivity = orgs.map(o => ({
    label: o.name.split(' ').slice(0, 2).join(' '),
    value: events.filter(e => e.organizationId === o.id).length
         + announcements.filter(a => a.organizationId === o.id).length
         + members.filter(m => m.organizationId === o.id).length,
  })).sort((a, b) => b.value - a.value);

  const TABS = ['overview', 'organizations', 'members', 'activity'];

  const handleSeedData = async () => {
    if (['demo-admin-uid','demo-officer-uid','demo-student-uid'].includes(currentUser?.uid)) {
      toast('Demo mode already has sample data!', { icon: 'ℹ️' }); return;
    }
    const r = await confirmDialog({ title: 'Seed Demo Data?', text: 'Adds sample orgs, events, and announcements.', confirmText: 'Yes, seed it', icon: 'info' });
    if (!r.isConfirmed) return;
    setSeeding(true);
    try { await seedSampleData(currentUser?.uid || 'system'); toast.success('Sample data seeded!'); }
    catch (e) { toast.error('Failed: ' + e.message); }
    finally { setSeeding(false); }
  };

  const handleExport = () => {
    const data = {
      exportedAt: new Date().toISOString(),
      summary: { orgs: orgs.length, events: events.length, announcements: announcements.length, users: users.length, members: members.length, upcoming: upcoming.length },
      organizations: orgs.map(o => ({ name: o.name, events: events.filter(e => e.organizationId === o.id).length, members: members.filter(m => m.organizationId === o.id).length })),
      recentActivity: logs.slice(0, 20).map(l => ({ action: l.action, createdAt: l.createdAt?.toDate?.()?.toISOString() })),
    };
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a'); a.href = url; a.download = `ssg-report-${format(now, 'yyyy-MM-dd')}.json`; a.click();
    URL.revokeObjectURL(url);
  };

  if (loading) return <LoadingSpinner text="Loading analytics..." />;

  return (
    <div className="space-y-6">

      {/* Header */}
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div>
          <h1 className="text-2xl font-extrabold text-slate-800 dark:text-white">Analytics & Reports</h1>
          <p className="text-sm text-slate-500 dark:text-slate-400 mt-0.5">Full platform overview — {last7.length} actions in the last 7 days</p>
        </div>
        <div className="flex gap-2 flex-wrap">
          <button onClick={handleSeedData} disabled={seeding}
            className="flex items-center gap-2 px-4 py-2.5 bg-gradient-to-r from-purple-600 to-indigo-600 text-white rounded-xl text-sm font-bold hover:from-purple-700 hover:to-indigo-700 disabled:opacity-60 transition-all shadow-md shadow-purple-500/20">
            <Database size={15} /> {seeding ? 'Seeding...' : 'Seed Data'}
          </button>
          <button onClick={handleExport}
            className="flex items-center gap-2 px-4 py-2.5 bg-gradient-to-r from-emerald-600 to-green-600 text-white rounded-xl text-sm font-bold hover:from-emerald-700 hover:to-green-700 transition-all shadow-md shadow-emerald-500/20">
            <Download size={15} /> Export JSON
          </button>
        </div>
      </div>

      {/* AI Summary */}
      <div className="bg-gradient-to-br from-purple-600 to-indigo-700 rounded-2xl p-5 text-white shadow-xl shadow-purple-500/20 relative overflow-hidden">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_80%_20%,rgba(255,255,255,0.08),transparent_60%)]" />
        <div className="relative flex items-start gap-3">
          <div className="w-10 h-10 bg-white/20 rounded-xl flex items-center justify-center shrink-0"><Sparkles size={20} /></div>
          <div className="flex-1">
            <p className="text-xs font-bold text-purple-200 uppercase tracking-wider mb-1">AI Analytics Summary</p>
            <p className="font-bold text-lg mb-1">{aiSummary.headline}</p>
            <p className="text-sm text-purple-100 leading-relaxed mb-3">{aiSummary.summary}</p>
            <div className="space-y-1 mb-3">
              {aiSummary.highlights.map((h, i) => (
                <div key={i} className="flex items-center gap-2 text-xs text-purple-200">
                  <span className="w-1 h-1 rounded-full bg-purple-300 shrink-0" />{h}
                </div>
              ))}
            </div>
            <div className="bg-white/10 rounded-xl px-3 py-2 border border-white/20">
              <p className="text-xs font-semibold text-white/90">💡 {aiSummary.recommendation}</p>
            </div>
          </div>
        </div>
      </div>

      {/* KPI cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <DeltaCard icon={Building2}    label="Organizations"    value={orgs.length}          sub={`${orgActivity[0]?.label || '—'} most active`}  gradient="from-blue-500 to-blue-600"     glow="shadow-blue-500/20"    trend={orgs.length > 0 ? 100 : 0} />
        <DeltaCard icon={CalendarDays} label="Total Events"     value={events.length}        sub={`${upcoming.length} upcoming`}                   gradient="from-purple-500 to-indigo-600" glow="shadow-purple-500/20"  trend={upcoming.length > 0 ? Math.round(upcoming.length/Math.max(events.length,1)*100) : 0} />
        <DeltaCard icon={Users}        label="Total Members"    value={approved.length}      sub={`${pending.length} pending approval`}             gradient="from-emerald-500 to-green-600" glow="shadow-emerald-500/20" trend={pending.length} />
        <DeltaCard icon={Megaphone}    label="Announcements"    value={announcements.length} sub={`${users.length} registered users`}               gradient="from-orange-500 to-amber-500"  glow="shadow-orange-500/20"  trend={last7.length} />
      </div>

      {/* Tabs */}
      <div className="flex gap-1 bg-slate-100 dark:bg-slate-800 p-1 rounded-xl border border-slate-200 dark:border-slate-700 overflow-x-auto">
        {TABS.map(t => (
          <button key={t} onClick={() => setTab(t)}
            className={`px-5 py-2 rounded-lg text-xs font-bold capitalize whitespace-nowrap transition-all ${
              tab === t ? 'bg-white dark:bg-slate-700 text-blue-600 dark:text-blue-400 shadow-sm' : 'text-slate-500 dark:text-slate-400 hover:text-slate-700'
            }`}>
            {t}
          </button>
        ))}
      </div>

      {/* ── OVERVIEW TAB ── */}
      {tab === 'overview' && (
        <div className="space-y-5">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">

            {/* Events status donut */}
            <div className="bg-white dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700 p-5">
              <div className="flex items-center gap-2 mb-4">
                <div className="w-7 h-7 bg-blue-100 dark:bg-blue-900/30 rounded-lg flex items-center justify-center"><CalendarDays size={14} className="text-blue-600 dark:text-blue-400" /></div>
                <div><p className="text-sm font-bold text-slate-800 dark:text-white">Events Status</p><p className="text-xs text-slate-400">Upcoming vs past</p></div>
              </div>
              <DonutChart segments={eventStatusData} />
            </div>

            {/* User roles donut */}
            <div className="bg-white dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700 p-5">
              <div className="flex items-center gap-2 mb-4">
                <div className="w-7 h-7 bg-purple-100 dark:bg-purple-900/30 rounded-lg flex items-center justify-center"><Users size={14} className="text-purple-600 dark:text-purple-400" /></div>
                <div><p className="text-sm font-bold text-slate-800 dark:text-white">User Roles</p><p className="text-xs text-slate-400">{users.length} total users</p></div>
              </div>
              <DonutChart segments={roleBreakdown} />
            </div>

            {/* Member status donut */}
            <div className="bg-white dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700 p-5">
              <div className="flex items-center gap-2 mb-4">
                <div className="w-7 h-7 bg-emerald-100 dark:bg-emerald-900/30 rounded-lg flex items-center justify-center"><UserCheck size={14} className="text-emerald-600 dark:text-emerald-400" /></div>
                <div><p className="text-sm font-bold text-slate-800 dark:text-white">Member Status</p><p className="text-xs text-slate-400">{members.length} total memberships</p></div>
              </div>
              <DonutChart segments={memberStatusBreakdown} />
            </div>
          </div>

          {/* Top org by activity */}
          <div className="bg-white dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700 p-6">
            <div className="flex items-center gap-2 mb-4">
              <div className="w-7 h-7 bg-orange-100 dark:bg-orange-900/30 rounded-lg flex items-center justify-center"><Target size={14} className="text-orange-600 dark:text-orange-400" /></div>
              <div><p className="text-sm font-bold text-slate-800 dark:text-white">Organization Activity Score</p><p className="text-xs text-slate-400">Events + announcements + members combined</p></div>
            </div>
            <HBar data={orgActivity} />
          </div>

          {/* Quick stats row */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            {[
              { icon: CheckCircle2, label: 'Approved Members', value: approved.length,      cls: 'text-emerald-600 dark:text-emerald-400', bg: 'bg-emerald-50 dark:bg-emerald-900/20' },
              { icon: Clock,        label: 'Pending Requests', value: pending.length,       cls: 'text-yellow-600 dark:text-yellow-400',   bg: 'bg-yellow-50 dark:bg-yellow-900/20'   },
              { icon: CalendarDays, label: 'Upcoming Events',  value: upcoming.length,      cls: 'text-blue-600 dark:text-blue-400',       bg: 'bg-blue-50 dark:bg-blue-900/20'       },
              { icon: Activity,     label: 'Actions (7 days)', value: last7.length,         cls: 'text-purple-600 dark:text-purple-400',   bg: 'bg-purple-50 dark:bg-purple-900/20'   },
            ].map(({ icon: Icon, label, value, cls, bg }) => (
              <div key={label} className={`${bg} rounded-2xl p-4 flex items-center gap-3`}>
                <Icon size={20} className={cls} />
                <div>
                  <p className={`text-xl font-extrabold ${cls}`}>{value}</p>
                  <p className="text-xs text-slate-500 dark:text-slate-400">{label}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ── ORGANIZATIONS TAB ── */}
      {tab === 'organizations' && (
        <div className="space-y-5">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
            <div className="bg-white dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700 p-6">
              <div className="flex items-center gap-2 mb-4">
                <div className="w-7 h-7 bg-purple-100 dark:bg-purple-900/30 rounded-lg flex items-center justify-center"><CalendarDays size={14} className="text-purple-600 dark:text-purple-400" /></div>
                <div><p className="text-sm font-bold text-slate-800 dark:text-white">Events per Organization</p><p className="text-xs text-slate-400">Total events created</p></div>
              </div>
              <HBar data={eventsPerOrg} />
            </div>
            <div className="bg-white dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700 p-6">
              <div className="flex items-center gap-2 mb-4">
                <div className="w-7 h-7 bg-emerald-100 dark:bg-emerald-900/30 rounded-lg flex items-center justify-center"><Users size={14} className="text-emerald-600 dark:text-emerald-400" /></div>
                <div><p className="text-sm font-bold text-slate-800 dark:text-white">Members per Organization</p><p className="text-xs text-slate-400">Approved members only</p></div>
              </div>
              <HBar data={membersPerOrg} />
            </div>
          </div>
          <div className="bg-white dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700 p-6">
            <div className="flex items-center gap-2 mb-4">
              <div className="w-7 h-7 bg-orange-100 dark:bg-orange-900/30 rounded-lg flex items-center justify-center"><Megaphone size={14} className="text-orange-600 dark:text-orange-400" /></div>
              <div><p className="text-sm font-bold text-slate-800 dark:text-white">Announcements per Organization</p><p className="text-xs text-slate-400">Total posts per org</p></div>
            </div>
            <HBar data={announcementsPerOrg} />
          </div>

          {/* Org detail table */}
          <div className="bg-white dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700 overflow-hidden">
            <div className="px-6 py-4 border-b border-slate-100 dark:border-slate-700">
              <p className="font-bold text-slate-800 dark:text-white text-sm">Organization Breakdown</p>
            </div>
            <table className="w-full text-sm">
              <thead className="bg-slate-50 dark:bg-slate-700/50">
                <tr>
                  {['Organization','Members','Events','Announcements','Score'].map(h => (
                    <th key={h} className="text-left px-5 py-3 text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-700">
                {orgs.map(org => {
                  const mCount = members.filter(m => m.organizationId === org.id && m.status === 'approved').length;
                  const eCount = events.filter(e => e.organizationId === org.id).length;
                  const aCount = announcements.filter(a => a.organizationId === org.id).length;
                  const score  = mCount + eCount * 2 + aCount;
                  return (
                    <tr key={org.id} className="hover:bg-slate-50 dark:hover:bg-slate-700/30 transition-colors">
                      <td className="px-5 py-3.5 font-semibold text-slate-800 dark:text-white">{org.name}</td>
                      <td className="px-5 py-3.5 text-slate-600 dark:text-slate-400">{mCount}</td>
                      <td className="px-5 py-3.5 text-slate-600 dark:text-slate-400">{eCount}</td>
                      <td className="px-5 py-3.5 text-slate-600 dark:text-slate-400">{aCount}</td>
                      <td className="px-5 py-3.5">
                        <span className="text-xs font-bold px-2 py-1 bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400 rounded-lg">{score} pts</span>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* ── MEMBERS TAB ── */}
      {tab === 'members' && (
        <div className="space-y-5">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
            <div className="bg-white dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700 p-6">
              <div className="flex items-center gap-2 mb-4">
                <div className="w-7 h-7 bg-blue-100 dark:bg-blue-900/30 rounded-lg flex items-center justify-center"><Users size={14} className="text-blue-600 dark:text-blue-400" /></div>
                <div><p className="text-sm font-bold text-slate-800 dark:text-white">User Role Distribution</p><p className="text-xs text-slate-400">{users.length} registered accounts</p></div>
              </div>
              <DonutChart segments={roleBreakdown} />
            </div>
            <div className="bg-white dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700 p-6">
              <div className="flex items-center gap-2 mb-4">
                <div className="w-7 h-7 bg-emerald-100 dark:bg-emerald-900/30 rounded-lg flex items-center justify-center"><UserCheck size={14} className="text-emerald-600 dark:text-emerald-400" /></div>
                <div><p className="text-sm font-bold text-slate-800 dark:text-white">Membership Status</p><p className="text-xs text-slate-400">{members.length} total memberships</p></div>
              </div>
              <DonutChart segments={memberStatusBreakdown} />
            </div>
          </div>

          {/* Members per org bar */}
          <div className="bg-white dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700 p-6">
            <div className="flex items-center gap-2 mb-4">
              <div className="w-7 h-7 bg-indigo-100 dark:bg-indigo-900/30 rounded-lg flex items-center justify-center"><BarChart3 size={14} className="text-indigo-600 dark:text-indigo-400" /></div>
              <div><p className="text-sm font-bold text-slate-800 dark:text-white">Approved Members per Organization</p></div>
            </div>
            <HBar data={membersPerOrg} />
          </div>

          {/* Pending requests list */}
          {pending.length > 0 && (
            <div className="bg-yellow-50 dark:bg-yellow-900/10 border border-yellow-200 dark:border-yellow-800 rounded-2xl overflow-hidden">
              <div className="px-5 py-3.5 border-b border-yellow-200 dark:border-yellow-800 flex items-center gap-2">
                <Clock size={15} className="text-yellow-600 dark:text-yellow-400" />
                <p className="text-sm font-bold text-yellow-800 dark:text-yellow-300">{pending.length} Pending Join Requests</p>
              </div>
              <div className="divide-y divide-yellow-100 dark:divide-yellow-900/30">
                {pending.map(m => (
                  <div key={m.id} className="flex items-center gap-3 px-5 py-3">
                    <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-yellow-400 to-amber-500 flex items-center justify-center text-white text-xs font-bold shrink-0">
                      {m.userName?.charAt(0).toUpperCase()}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-semibold text-slate-800 dark:text-white">{m.userName}</p>
                      <p className="text-xs text-slate-500 dark:text-slate-400">{orgs.find(o => o.id === m.organizationId)?.name || m.organizationId}</p>
                    </div>
                    <span className="text-xs text-slate-400">{m.joinedAt?.toDate ? format(m.joinedAt.toDate(), 'MMM d') : ''}</span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}

      {/* ── ACTIVITY TAB ── */}
      {tab === 'activity' && (
        <div className="space-y-5">
          <div className="bg-white dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700 p-6">
            <div className="flex items-center gap-2 mb-4">
              <div className="w-7 h-7 bg-green-100 dark:bg-green-900/30 rounded-lg flex items-center justify-center"><Activity size={14} className="text-green-600 dark:text-green-400" /></div>
              <div><p className="text-sm font-bold text-slate-800 dark:text-white">Activity by Type</p><p className="text-xs text-slate-400">All-time action counts</p></div>
            </div>
            <HBar data={activityByType} />
          </div>

          {/* Full activity log */}
          <div className="bg-white dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700 overflow-hidden">
            <div className="flex items-center gap-2 px-6 py-4 border-b border-slate-100 dark:border-slate-700">
              <div className="w-7 h-7 bg-green-100 dark:bg-green-900/30 rounded-lg flex items-center justify-center"><Activity size={14} className="text-green-600 dark:text-green-400" /></div>
              <p className="font-bold text-slate-800 dark:text-white">Recent Activity Log</p>
              <span className="ml-auto text-xs text-slate-400">Last {Math.min(logs.length, 20)} actions</span>
            </div>
            {logs.length === 0 ? (
              <div className="text-center py-12">
                <Activity size={24} className="mx-auto mb-2 text-slate-300 dark:text-slate-600" />
                <p className="text-sm text-slate-400">No activity recorded yet</p>
              </div>
            ) : (
              <div className="divide-y divide-slate-100 dark:divide-slate-700">
                {logs.slice(0, 20).map(log => (
                  <div key={log.id} className="flex items-center justify-between px-6 py-3.5 hover:bg-slate-50 dark:hover:bg-slate-700/30 transition-colors">
                    <div className="flex items-center gap-3">
                      <span className={`text-xs font-bold px-2.5 py-1 rounded-lg ${actionColors[log.action] || 'bg-slate-100 text-slate-600 dark:bg-slate-700 dark:text-slate-400'}`}>
                        {actionLabels[log.action] || log.action}
                      </span>
                      {(log.details?.name || log.details?.title || log.details?.userName) && (
                        <span className="text-sm text-slate-500 dark:text-slate-400 truncate max-w-xs">
                          — {log.details.name || log.details.title || log.details.userName}
                        </span>
                      )}
                    </div>
                    {log.createdAt && (
                      <span className="text-xs text-slate-400 shrink-0 ml-4">
                        {format(log.createdAt.toDate?.() || new Date(log.createdAt), 'MMM d, h:mm a')}
                      </span>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}

    </div>
  );
};

export default Reports;
