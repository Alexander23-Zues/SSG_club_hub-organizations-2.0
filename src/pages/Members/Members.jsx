import { useEffect, useState } from 'react';
import { Users, Check, X, Search, UserCheck, UserX, Clock, Sparkles } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import LoadingSpinner from '../../components/LoadingSpinner';
import { useServices } from '../../firebase/useServices';
import { confirmDelete, confirmDialog } from '../../utils/swal';
import { getMemberEngagementScore } from '../../ai/engine';
import toast from 'react-hot-toast';

const statusConfig = {
  approved: { label: 'Approved', cls: 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400', dot: 'bg-emerald-500' },
  pending:  { label: 'Pending',  cls: 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400',   dot: 'bg-yellow-500' },
  rejected: { label: 'Rejected', cls: 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400',               dot: 'bg-red-500' },
};

const Members = () => {
  const { currentUser, isAdmin, isOfficer } = useAuth();
  const { subscribeOrgs, subscribeOrgMembers, updateMemberStatus, removeMember, logActivity } = useServices(currentUser);
  const [orgs, setOrgs] = useState([]);
  const [selectedOrg, setSelectedOrg] = useState('');
  const [members, setMembers] = useState([]);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [loading, setLoading] = useState(false);

  useEffect(() => { const u = subscribeOrgs(setOrgs); return u; }, []);
  useEffect(() => {
    if (!selectedOrg) { setMembers([]); return; }
    setLoading(true);
    const u = subscribeOrgMembers(selectedOrg, d => { setMembers(d); setLoading(false); });
    return u;
  }, [selectedOrg]);

  const handleApprove = async (memberId, userName) => {
    try {
      await updateMemberStatus(memberId, 'approved');
      await logActivity(currentUser.uid, 'approve_member', { memberId, userName });
      toast.success(`${userName} approved!`);
    } catch { toast.error('Failed to approve'); }
  };

  const handleReject = async (memberId, userName) => {
    const r = await confirmDialog({ title: `Reject ${userName}?`, text: 'Their join request will be removed.', confirmText: 'Yes, reject', icon: 'warning' });
    if (!r.isConfirmed) return;
    try { await removeMember(memberId); toast.success('Request rejected'); }
    catch { toast.error('Failed to reject'); }
  };

  const handleRemove = async (memberId, userName) => {
    const r = await confirmDelete({ title: `Remove ${userName}?`, text: 'They will be removed from this organization.' });
    if (!r.isConfirmed) return;
    try { await removeMember(memberId); toast.success(`${userName} removed`); }
    catch { toast.error('Failed to remove'); }
  };

  const filtered = members.filter(m => {
    const matchSearch = m.userName?.toLowerCase().includes(search.toLowerCase()) || m.userEmail?.toLowerCase().includes(search.toLowerCase());
    const matchStatus = statusFilter === 'all' || m.status === statusFilter;
    return matchSearch && matchStatus;
  });

  const pendingCount = members.filter(m => m.status === 'pending').length;
  const approvedCount = members.filter(m => m.status === 'approved').length;
  const engagementScore = getMemberEngagementScore(members, []);

  // Static color map — dynamic Tailwind classes don't work at runtime
  const scoreColorMap = {
    emerald: { bar: 'bg-emerald-500', text: 'text-emerald-600 dark:text-emerald-400', badge: 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400' },
    blue:    { bar: 'bg-blue-500',    text: 'text-blue-600 dark:text-blue-400',       badge: 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400'             },
    yellow:  { bar: 'bg-yellow-500',  text: 'text-yellow-600 dark:text-yellow-400',   badge: 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400'     },
    orange:  { bar: 'bg-orange-500',  text: 'text-orange-600 dark:text-orange-400',   badge: 'bg-orange-100 text-orange-700 dark:bg-orange-900/30 dark:text-orange-400'     },
    red:     { bar: 'bg-red-500',     text: 'text-red-600 dark:text-red-400',         badge: 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400'                 },
    slate:   { bar: 'bg-slate-400',   text: 'text-slate-600 dark:text-slate-400',     badge: 'bg-slate-100 text-slate-700 dark:bg-slate-700 dark:text-slate-400'            },
  };
  const sc = scoreColorMap[engagementScore.color] || scoreColorMap.slate;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-extrabold text-slate-800 dark:text-white">Members</h1>
        <p className="text-sm text-slate-500 dark:text-slate-400 mt-0.5">Manage organization memberships and join requests</p>
      </div>

      {/* Org selector */}
      <div className="bg-white dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700 p-5">
        <label className="block text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-2">Select Organization</label>
        <select value={selectedOrg} onChange={e => setSelectedOrg(e.target.value)}
          className="w-full sm:w-80 px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-600 bg-slate-50 dark:bg-slate-700/50 text-slate-800 dark:text-white text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all">
          <option value="">Choose an organization...</option>
          {orgs.map(o => <option key={o.id} value={o.id}>{o.name}</option>)}
        </select>
      </div>

      {selectedOrg && (
        <>
          {/* Stats row */}
          <div className="grid grid-cols-3 gap-3">
            {[
              { icon: Users,    label: 'Total',    value: members.length,  color: 'from-blue-500 to-blue-600' },
              { icon: UserCheck,label: 'Approved', value: approvedCount,   color: 'from-emerald-500 to-green-600' },
              { icon: Clock,    label: 'Pending',  value: pendingCount,    color: 'from-yellow-500 to-amber-500' },
            ].map(({ icon: Icon, label, value, color }) => (
              <div key={label} className={`bg-gradient-to-br ${color} rounded-2xl p-4 text-white shadow-md`}>
                <Icon size={18} className="mb-2 opacity-80" />
                <p className="text-2xl font-extrabold">{value}</p>
                <p className="text-xs text-white/70 font-medium">{label}</p>
              </div>
            ))}
          </div>

          {/* AI Engagement Score */}
          {members.length > 0 && (
            <div className="flex items-center gap-4 p-4 bg-white dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700">
              <div className="w-10 h-10 bg-purple-100 dark:bg-purple-900/30 rounded-xl flex items-center justify-center flex-shrink-0">
                <Sparkles size={18} className="text-purple-600 dark:text-purple-400" />
              </div>
              <div className="flex-1">
                <p className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">AI Engagement Score</p>
                <div className="flex items-center gap-3 mt-1">
                  <div className="flex-1 bg-slate-100 dark:bg-slate-700 rounded-full h-2">
                    <div className={`h-2 rounded-full ${sc.bar} transition-all duration-700`}
                      style={{ width: `${engagementScore.score}%` }} />
                  </div>
                  <span className={`text-sm font-extrabold ${sc.text}`}>
                    {engagementScore.score}%
                  </span>
                  <span className={`text-xs font-bold px-2 py-0.5 rounded-full ${sc.badge}`}>
                    {engagementScore.label}
                  </span>
                </div>
              </div>
            </div>
          )}

          {/* Pending alert */}
          {pendingCount > 0 && (
            <div className="flex items-center gap-3 p-4 bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-2xl">
              <div className="w-9 h-9 bg-yellow-100 dark:bg-yellow-900/40 rounded-xl flex items-center justify-center flex-shrink-0">
                <Clock size={16} className="text-yellow-600 dark:text-yellow-400" />
              </div>
              <p className="text-sm font-semibold text-yellow-800 dark:text-yellow-300">
                {pendingCount} pending join request{pendingCount > 1 ? 's' : ''} awaiting your approval
              </p>
            </div>
          )}

          {/* Filters */}
          <div className="flex flex-col sm:flex-row gap-3">
            <div className="relative flex-1">
              <Search size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
              <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search members..."
                className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-600 bg-white dark:bg-slate-800 text-slate-800 dark:text-white text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all" />
            </div>
            <div className="flex gap-1 bg-slate-100 dark:bg-slate-800 p-1 rounded-xl border border-slate-200 dark:border-slate-700">
              {['all', 'approved', 'pending'].map(s => (
                <button key={s} onClick={() => setStatusFilter(s)}
                  className={`px-4 py-1.5 rounded-lg text-xs font-bold capitalize transition-all ${
                    statusFilter === s ? 'bg-white dark:bg-slate-700 text-blue-600 dark:text-blue-400 shadow-sm' : 'text-slate-500 dark:text-slate-400'
                  }`}>
                  {s}
                </button>
              ))}
            </div>
          </div>

          {loading ? <LoadingSpinner text="Loading members..." /> : (
            <div className="bg-white dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700 overflow-hidden">
              {filtered.length === 0 ? (
                <div className="text-center py-12">
                  <Users size={28} className="mx-auto mb-2 text-slate-300 dark:text-slate-600" />
                  <p className="text-sm text-slate-400 dark:text-slate-500">No members found</p>
                </div>
              ) : (
                <table className="w-full text-sm">
                  <thead>
                    <tr className="bg-slate-50 dark:bg-slate-700/50 border-b border-slate-200 dark:border-slate-700">
                      <th className="text-left px-5 py-3.5 text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Member</th>
                      <th className="text-left px-5 py-3.5 text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider hidden sm:table-cell">Email</th>
                      <th className="text-left px-5 py-3.5 text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Status</th>
                      <th className="text-right px-5 py-3.5 text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 dark:divide-slate-700">
                    {filtered.map(m => {
                      const sc = statusConfig[m.status] || statusConfig.pending;
                      return (
                        <tr key={m.id} className="hover:bg-slate-50 dark:hover:bg-slate-700/30 transition-colors group">
                          <td className="px-5 py-3.5">
                            <div className="flex items-center gap-3">
                              <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-blue-500 to-indigo-500 flex items-center justify-center text-white text-xs font-bold flex-shrink-0">
                                {m.userName?.charAt(0).toUpperCase()}
                              </div>
                              <div>
                                <p className="font-semibold text-slate-800 dark:text-white">{m.userName}</p>
                                <p className="text-xs text-slate-500 dark:text-slate-400 capitalize">{m.role}</p>
                              </div>
                            </div>
                          </td>
                          <td className="px-5 py-3.5 text-slate-500 dark:text-slate-400 hidden sm:table-cell text-xs">{m.userEmail}</td>
                          <td className="px-5 py-3.5">
                            <span className={`inline-flex items-center gap-1.5 text-xs font-bold px-2.5 py-1 rounded-full ${sc.cls}`}>
                              <span className={`w-1.5 h-1.5 rounded-full ${sc.dot}`} />
                              {sc.label}
                            </span>
                          </td>
                          <td className="px-5 py-3.5">
                            <div className="flex items-center justify-end gap-1.5">
                              {m.status === 'pending' && (
                                <>
                                  <button onClick={() => handleApprove(m.id, m.userName)}
                                    className="flex items-center gap-1 px-3 py-1.5 bg-emerald-600 text-white text-xs font-bold rounded-lg hover:bg-emerald-700 transition-colors shadow-sm">
                                    <Check size={12} /> Approve
                                  </button>
                                  <button onClick={() => handleReject(m.id, m.userName)}
                                    className="flex items-center gap-1 px-3 py-1.5 border border-red-200 dark:border-red-800 text-red-600 dark:text-red-400 text-xs font-bold rounded-lg hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors">
                                    <X size={12} /> Reject
                                  </button>
                                </>
                              )}
                              {m.status === 'approved' && (isAdmin || isOfficer) && (
                                <button onClick={() => handleRemove(m.id, m.userName)}
                                  className="px-3 py-1.5 border border-slate-200 dark:border-slate-600 text-slate-500 dark:text-slate-400 text-xs font-bold rounded-lg hover:border-red-300 hover:text-red-500 dark:hover:text-red-400 transition-colors">
                                  Remove
                                </button>
                              )}
                            </div>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              )}
            </div>
          )}
        </>
      )}

      {!selectedOrg && (
        <div className="text-center py-20">
          <div className="w-16 h-16 bg-slate-100 dark:bg-slate-800 rounded-2xl flex items-center justify-center mx-auto mb-4">
            <Users size={28} className="text-slate-400" />
          </div>
          <p className="font-semibold text-slate-600 dark:text-slate-400">Select an organization</p>
          <p className="text-sm text-slate-400 dark:text-slate-500 mt-1">Choose one above to view and manage its members</p>
        </div>
      )}
    </div>
  );
};

export default Members;
