import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  ArrowLeft, Users, CalendarDays, Megaphone, Building2,
  Edit2, UserPlus, UserMinus, CheckCircle2, XCircle, MapPin, Clock
} from 'lucide-react';
import { useServices } from '../../firebase/useServices';
import { useAuth } from '../../context/AuthContext';
import { confirmDelete } from '../../utils/swal';
import LoadingSpinner from '../../components/LoadingSpinner';
import { format, isToday, isTomorrow } from 'date-fns';
import toast from 'react-hot-toast';

const statusBadge = {
  approved: 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400',
  pending:  'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400',
  rejected: 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400',
};

const OrgDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { currentUser, userProfile, isAdmin, isOfficer } = useAuth();
  const { getOrg, subscribeOrgMembers, subscribeOrgEvents, subscribeAnnouncements,
    joinOrg, removeMember, getUserMemberships, rsvpEvent, getUserRsvps,
    updateMemberStatus, logActivity } = useServices(currentUser);

  const [org, setOrg] = useState(null);
  const [members, setMembers] = useState([]);
  const [events, setEvents] = useState([]);
  const [announcements, setAnnouncements] = useState([]);
  const [memberships, setMemberships] = useState([]);
  const [rsvps, setRsvps] = useState([]);
  const [loading, setLoading] = useState(true);
  const [tab, setTab] = useState('overview');

  useEffect(() => {
    getOrg(id).then(d => { setOrg(d); setLoading(false); });
    const u1 = subscribeOrgMembers(id, setMembers);
    const u2 = subscribeOrgEvents(id, setEvents);
    const u3 = subscribeAnnouncements(d => setAnnouncements(d.filter(a => a.organizationId === id)));
    return () => { u1(); u2(); u3(); };
  }, [id]);

  useEffect(() => {
    if (!currentUser) return;
    getUserMemberships(currentUser.uid).then(setMemberships);
    getUserRsvps(currentUser.uid).then(setRsvps);
  }, [currentUser]);

  const myMembership = memberships.find(m => m.organizationId === id);
  const isMember = myMembership?.status === 'approved';
  const isPending = myMembership?.status === 'pending';

  const handleJoin = async () => {
    if (!currentUser || !userProfile) return;
    try {
      await joinOrg(currentUser.uid, id, { userName: userProfile.name, userEmail: userProfile.email });
      await logActivity(currentUser.uid, 'join_request', { orgId: id });
      toast.success('Join request sent! Waiting for approval.');
      setMemberships(await getUserMemberships(currentUser.uid));
    } catch { toast.error('Failed to send join request'); }
  };

  const handleLeave = async () => {
    if (!myMembership) return;
    const r = await confirmDelete({ title: 'Leave organization?', text: 'You will need to request to join again.' });
    if (!r.isConfirmed) return;
    try {
      await removeMember(myMembership.id);
      toast.success('Left organization');
      setMemberships(await getUserMemberships(currentUser.uid));
    } catch { toast.error('Failed to leave'); }
  };

  const handleRsvp = async (eventId, status) => {
    if (!currentUser) return;
    try {
      await rsvpEvent(eventId, currentUser.uid, status);
      setRsvps(await getUserRsvps(currentUser.uid));
      toast.success(`RSVP: ${status}`);
    } catch { toast.error('Failed to RSVP'); }
  };

  const handleApproveMember = async (memberId, userName) => {
    try {
      await updateMemberStatus(memberId, 'approved');
      toast.success(`${userName} approved!`);
    } catch { toast.error('Failed to approve'); }
  };

  const handleRemoveMember = async (memberId, userName) => {
    const r = await confirmDelete({ title: `Remove ${userName}?`, text: 'They will be removed from this organization.' });
    if (!r.isConfirmed) return;
    try { await removeMember(memberId); toast.success('Member removed'); }
    catch { toast.error('Failed to remove'); }
  };

  if (loading) return <LoadingSpinner text="Loading organization..." />;
  if (!org) return (
    <div className="text-center py-20">
      <Building2 size={40} className="mx-auto mb-3 text-slate-300" />
      <p className="text-slate-500">Organization not found</p>
      <button onClick={() => navigate('/organizations')} className="mt-4 text-blue-600 text-sm hover:underline">Back to Organizations</button>
    </div>
  );

  const approvedMembers = members.filter(m => m.status === 'approved');
  const pendingMembers = members.filter(m => m.status === 'pending');
  const tabs = [
    { key: 'overview', label: 'Overview' },
    { key: 'events', label: `Events (${events.length})` },
    { key: 'announcements', label: `Announcements (${announcements.length})` },
    { key: 'members', label: `Members (${approvedMembers.length})` },
  ];

  return (
    <div className="space-y-5">
      {/* Back */}
      <button onClick={() => navigate(-1)}
        className="flex items-center gap-2 text-sm font-medium text-slate-500 hover:text-slate-800 dark:text-slate-400 dark:hover:text-white transition-colors">
        <ArrowLeft size={16} /> Back to Organizations
      </button>

      {/* Hero card */}
      <div className="bg-white dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700 overflow-hidden">
        <div className="h-40 bg-gradient-to-br from-blue-500 to-indigo-600 relative">
          {org.logoUrl && <img src={org.logoUrl} alt={org.name} className="w-full h-full object-cover" />}
          <div className="absolute inset-0 bg-gradient-to-t from-black/40 to-transparent" />
          <div className="absolute bottom-4 left-5 right-5 flex items-end justify-between">
            <div>
              <h1 className="text-xl font-extrabold text-white drop-shadow">{org.name}</h1>
            </div>
            {/* Join/Leave button */}
            {currentUser && !isAdmin && (
              <div>
                {isMember ? (
                  <button onClick={handleLeave}
                    className="flex items-center gap-1.5 px-4 py-2 bg-white/20 backdrop-blur-sm text-white rounded-xl text-xs font-bold border border-white/30 hover:bg-red-500/80 transition-colors">
                    <UserMinus size={13} /> Leave
                  </button>
                ) : isPending ? (
                  <span className="flex items-center gap-1.5 px-4 py-2 bg-yellow-500/80 text-white rounded-xl text-xs font-bold">
                    <Clock size={13} /> Pending
                  </span>
                ) : (
                  <button onClick={handleJoin}
                    className="flex items-center gap-1.5 px-4 py-2 bg-white text-blue-700 rounded-xl text-xs font-bold hover:bg-blue-50 transition-colors shadow-md">
                    <UserPlus size={13} /> Join Organization
                  </button>
                )}
              </div>
            )}
          </div>
        </div>

        <div className="px-5 py-4">
          <p className="text-sm text-slate-600 dark:text-slate-400 leading-relaxed">{org.description}</p>
          <div className="flex flex-wrap gap-4 mt-4">
            {[
              { icon: Users,       label: `${approvedMembers.length} Members`,      color: 'text-blue-600 dark:text-blue-400' },
              { icon: CalendarDays,label: `${events.length} Events`,                color: 'text-purple-600 dark:text-purple-400' },
              { icon: Megaphone,   label: `${announcements.length} Announcements`,  color: 'text-orange-600 dark:text-orange-400' },
              ...(pendingMembers.length > 0 && (isAdmin || isOfficer) ? [{ icon: Clock, label: `${pendingMembers.length} Pending`, color: 'text-yellow-600 dark:text-yellow-400' }] : []),
            ].map(({ icon: Icon, label, color }) => (
              <span key={label} className={`flex items-center gap-1.5 text-sm font-medium ${color}`}>
                <Icon size={15} /> {label}
              </span>
            ))}
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex gap-1 bg-slate-100 dark:bg-slate-800 p-1 rounded-xl overflow-x-auto">
        {tabs.map(t => (
          <button key={t.key} onClick={() => setTab(t.key)}
            className={`px-4 py-2 rounded-lg text-xs font-bold whitespace-nowrap transition-all ${
              tab === t.key
                ? 'bg-white dark:bg-slate-700 text-blue-600 dark:text-blue-400 shadow-sm'
                : 'text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-200'
            }`}>
            {t.label}
          </button>
        ))}
      </div>

      {/* ── Overview ── */}
      {tab === 'overview' && (
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          {[
            { icon: Users,        label: 'Approved Members', value: approvedMembers.length, gradient: 'from-blue-500 to-blue-600' },
            { icon: CalendarDays, label: 'Total Events',     value: events.length,          gradient: 'from-purple-500 to-indigo-600' },
            { icon: Megaphone,    label: 'Announcements',    value: announcements.length,   gradient: 'from-orange-500 to-amber-500' },
          ].map(({ icon: Icon, label, value, gradient }) => (
            <div key={label} className={`bg-gradient-to-br ${gradient} rounded-2xl p-5 text-white shadow-lg`}>
              <div className="w-9 h-9 bg-white/20 rounded-xl flex items-center justify-center mb-3">
                <Icon size={18} />
              </div>
              <p className="text-3xl font-extrabold">{value}</p>
              <p className="text-white/70 text-xs font-medium mt-0.5">{label}</p>
            </div>
          ))}
        </div>
      )}

      {/* ── Events ── */}
      {tab === 'events' && (
        <div className="space-y-3">
          {events.length === 0 ? (
            <div className="text-center py-16">
              <CalendarDays size={32} className="mx-auto mb-2 text-slate-300 dark:text-slate-600" />
              <p className="text-sm text-slate-400">No events yet</p>
            </div>
          ) : events.map(event => {
            const d = event.date?.toDate ? event.date.toDate() : new Date(event.date);
            const isPastEv = d < new Date();
            const userRsvp = rsvps.find(r => r.eventId === event.id)?.status;
            return (
              <div key={event.id} className="bg-white dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700 p-4">
                <div className="flex items-start gap-3">
                  <div className={`w-12 h-12 rounded-xl flex flex-col items-center justify-center flex-shrink-0 shadow-sm ${isPastEv ? 'bg-slate-200 dark:bg-slate-700' : 'bg-gradient-to-br from-blue-500 to-indigo-600'}`}>
                    <span className={`text-[9px] font-bold uppercase leading-none ${isPastEv ? 'text-slate-500' : 'text-blue-100'}`}>{format(d, 'MMM')}</span>
                    <span className={`text-base font-extrabold leading-none ${isPastEv ? 'text-slate-600 dark:text-slate-300' : 'text-white'}`}>{format(d, 'd')}</span>
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-bold text-slate-800 dark:text-white text-sm">{event.title}</p>
                    <div className="flex items-center gap-3 mt-0.5 flex-wrap">
                      <span className="flex items-center gap-1 text-xs text-slate-500 dark:text-slate-400">
                        <Clock size={10} /> {format(d, 'MMMM d, yyyy · h:mm a')}
                      </span>
                      {event.location && (
                        <span className="flex items-center gap-1 text-xs text-slate-500 dark:text-slate-400">
                          <MapPin size={10} /> {event.location}
                        </span>
                      )}
                    </div>
                    <p className="text-xs text-slate-600 dark:text-slate-400 mt-1.5 line-clamp-2">{event.description}</p>
                    {!isPastEv && (
                      <div className="flex gap-2 mt-3">
                        <button onClick={() => handleRsvp(event.id, 'going')}
                          className={`flex items-center gap-1 text-xs px-3 py-1.5 rounded-lg font-bold transition-all ${userRsvp === 'going' ? 'bg-emerald-600 text-white' : 'border border-emerald-200 dark:border-emerald-800 text-emerald-700 dark:text-emerald-400 hover:bg-emerald-50 dark:hover:bg-emerald-900/20'}`}>
                          <CheckCircle2 size={11} /> Going
                        </button>
                        <button onClick={() => handleRsvp(event.id, 'not going')}
                          className={`flex items-center gap-1 text-xs px-3 py-1.5 rounded-lg font-bold transition-all ${userRsvp === 'not going' ? 'bg-red-500 text-white' : 'border border-slate-200 dark:border-slate-600 text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-700'}`}>
                          <XCircle size={11} /> Not Going
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* ── Announcements ── */}
      {tab === 'announcements' && (
        <div className="space-y-3">
          {announcements.length === 0 ? (
            <div className="text-center py-16">
              <Megaphone size={32} className="mx-auto mb-2 text-slate-300 dark:text-slate-600" />
              <p className="text-sm text-slate-400">No announcements yet</p>
            </div>
          ) : announcements.map(ann => (
            <div key={ann.id} className="bg-white dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700 p-4">
              <div className="flex items-start gap-3">
                <div className="w-9 h-9 bg-orange-100 dark:bg-orange-900/30 rounded-xl flex items-center justify-center flex-shrink-0">
                  <Megaphone size={15} className="text-orange-600 dark:text-orange-400" />
                </div>
                <div>
                  <p className="font-bold text-slate-800 dark:text-white text-sm">{ann.title}</p>
                  <p className="text-xs text-slate-600 dark:text-slate-400 mt-1 leading-relaxed">{ann.content}</p>
                  {ann.createdAt && (
                    <p className="text-[10px] text-slate-400 mt-1.5">
                      {format(ann.createdAt.toDate?.() || new Date(ann.createdAt), 'MMMM d, yyyy · h:mm a')}
                    </p>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* ── Members ── */}
      {tab === 'members' && (
        <div className="bg-white dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700 overflow-hidden">
          {members.length === 0 ? (
            <div className="text-center py-12">
              <Users size={28} className="mx-auto mb-2 text-slate-300 dark:text-slate-600" />
              <p className="text-sm text-slate-400">No members yet</p>
            </div>
          ) : (
            <table className="w-full text-sm">
              <thead className="bg-slate-50 dark:bg-slate-700/50 border-b border-slate-200 dark:border-slate-700">
                <tr>
                  <th className="text-left px-5 py-3 text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Member</th>
                  <th className="text-left px-5 py-3 text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider hidden sm:table-cell">Role</th>
                  <th className="text-left px-5 py-3 text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Status</th>
                  {(isAdmin || isOfficer) && (
                    <th className="text-right px-5 py-3 text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Actions</th>
                  )}
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-700">
                {members.map(m => (
                  <tr key={m.id} className="hover:bg-slate-50 dark:hover:bg-slate-700/30 transition-colors">
                    <td className="px-5 py-3">
                      <div className="flex items-center gap-2.5">
                        <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-blue-500 to-indigo-500 flex items-center justify-center text-white text-xs font-bold flex-shrink-0">
                          {m.userName?.charAt(0).toUpperCase()}
                        </div>
                        <div>
                          <p className="font-semibold text-slate-800 dark:text-white text-sm">{m.userName}</p>
                          <p className="text-xs text-slate-500 dark:text-slate-400 hidden sm:block">{m.userEmail}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-5 py-3 text-slate-500 dark:text-slate-400 capitalize text-xs hidden sm:table-cell">{m.role}</td>
                    <td className="px-5 py-3">
                      <span className={`text-xs font-bold px-2.5 py-1 rounded-full ${statusBadge[m.status] || statusBadge.pending}`}>
                        {m.status}
                      </span>
                    </td>
                    {(isAdmin || isOfficer) && (
                      <td className="px-5 py-3 text-right">
                        <div className="flex items-center justify-end gap-1.5">
                          {m.status === 'pending' && (
                            <button onClick={() => handleApproveMember(m.id, m.userName)}
                              className="px-3 py-1.5 bg-emerald-600 text-white text-xs font-bold rounded-lg hover:bg-emerald-700 transition-colors">
                              Approve
                            </button>
                          )}
                          {m.status === 'approved' && (
                            <button onClick={() => handleRemoveMember(m.id, m.userName)}
                              className="px-3 py-1.5 border border-slate-200 dark:border-slate-600 text-slate-500 dark:text-slate-400 text-xs font-bold rounded-lg hover:border-red-300 hover:text-red-500 transition-colors">
                              Remove
                            </button>
                          )}
                        </div>
                      </td>
                    )}
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      )}
    </div>
  );
};

export default OrgDetail;
