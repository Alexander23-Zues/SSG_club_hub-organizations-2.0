import { useEffect, useState } from 'react';
import { Plus, Search, Building2, LayoutGrid, List } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import OrgCard from '../../components/OrgCard';
import Modal from '../../components/Modal';
import LoadingSpinner from '../../components/LoadingSpinner';
import { useServices } from '../../firebase/useServices';
import useSearchQuery from '../../hooks/useSearchQuery';
import { confirmDelete } from '../../utils/swal';
import toast from 'react-hot-toast';

const inputCls = "w-full px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-600 bg-slate-50 dark:bg-slate-700/50 text-slate-800 dark:text-white text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all placeholder-slate-400";

const OrgForm = ({ initial, onSave, onCancel, loading }) => {
  const [form, setForm] = useState(initial || { name: '', description: '' });
  const [file, setFile] = useState(null);
  const set = k => e => setForm(f => ({ ...f, [k]: e.target.value }));
  return (
    <form onSubmit={e => { e.preventDefault(); onSave(form, file); }} className="space-y-4">
      <div>
        <label className="block text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-1.5">Organization Name</label>
        <input required value={form.name} onChange={set('name')} placeholder="e.g. Computer Science Society" className={inputCls} />
      </div>
      <div>
        <label className="block text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-1.5">Description</label>
        <textarea required value={form.description} onChange={set('description')} rows={3} placeholder="What is this organization about?" className={`${inputCls} resize-none`} />
      </div>
      <div>
        <label className="block text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-1.5">Logo (optional)</label>
        <input type="file" accept="image/*" onChange={e => setFile(e.target.files[0])}
          className="w-full text-sm text-slate-500 file:mr-3 file:py-2 file:px-4 file:rounded-xl file:border-0 file:text-xs file:font-bold file:bg-blue-600 file:text-white hover:file:bg-blue-700 transition-all" />
      </div>
      <div className="flex gap-3 pt-2">
        <button type="button" onClick={onCancel} className="flex-1 py-2.5 rounded-xl border border-slate-200 dark:border-slate-600 text-sm font-semibold text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-700 transition-colors">Cancel</button>
        <button type="submit" disabled={loading} className="flex-1 py-2.5 rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 text-white text-sm font-bold hover:from-blue-700 hover:to-indigo-700 disabled:opacity-60 transition-all shadow-md shadow-blue-500/20">
          {loading ? 'Saving...' : 'Save Organization'}
        </button>
      </div>
    </form>
  );
};

const Organizations = () => {
  const { currentUser, userProfile, isAdmin, isOfficer } = useAuth();
  const { subscribeOrgs, createOrg, updateOrg, deleteOrg,
    joinOrg, removeMember, getUserMemberships,
    subscribeOrgMembers, uploadFile, logActivity } = useServices(currentUser);
  const urlQuery = useSearchQuery();
  const [orgs, setOrgs] = useState([]);
  const [memberships, setMemberships] = useState([]);
  const [memberCounts, setMemberCounts] = useState({});
  const [search, setSearch] = useState(urlQuery);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [modal, setModal] = useState(null);
  const [editTarget, setEditTarget] = useState(null);
  const [view, setView] = useState('grid');

  useEffect(() => { const u = subscribeOrgs(d => { setOrgs(d); setLoading(false); }); return u; }, []);
  useEffect(() => { if (currentUser) getUserMemberships(currentUser.uid).then(setMemberships); }, [currentUser]);
  useEffect(() => {
    const unsubs = orgs.map(org => subscribeOrgMembers(org.id, members =>
      setMemberCounts(prev => ({ ...prev, [org.id]: members.filter(m => m.status === 'approved').length }))
    ));
    return () => unsubs.forEach(u => u());
  }, [orgs]);

  const isMember = id => memberships.some(m => m.organizationId === id && m.status === 'approved');
  const isPending = id => memberships.some(m => m.organizationId === id && m.status === 'pending');

  const handleJoin = async (orgId) => {
    if (!currentUser || !userProfile) return;
    try {
      await joinOrg(currentUser.uid, orgId, { userName: userProfile.name, userEmail: userProfile.email });
      await logActivity(currentUser.uid, 'join_request', { orgId });
      toast.success('Join request sent!');
      setMemberships(await getUserMemberships(currentUser.uid));
    } catch { toast.error('Failed to send join request'); }
  };

  const handleLeave = async (orgId) => {
    const m = memberships.find(m => m.organizationId === orgId);
    if (!m) return;
    try {
      await removeMember(m.id);
      toast.success('Left organization');
      setMemberships(await getUserMemberships(currentUser.uid));
    } catch { toast.error('Failed to leave'); }
  };

  const handleSave = async (form, file) => {
    setSaving(true);
    try {
      let logoUrl = editTarget?.logoUrl || '';
      if (file) logoUrl = await uploadFile(file, `orgs/${Date.now()}_${file.name}`);
      if (modal === 'create') {
        await createOrg({ ...form, logoUrl, createdBy: currentUser.uid });
        await logActivity(currentUser.uid, 'create_org', { name: form.name });
        toast.success('Organization created!');
      } else {
        await updateOrg(editTarget.id, { ...form, logoUrl });
        toast.success('Organization updated!');
      }
      setModal(null); setEditTarget(null);
    } catch { toast.error('Failed to save'); }
    finally { setSaving(false); }
  };

  const handleDelete = async (id) => {
    const r = await confirmDelete({ title: 'Delete Organization?', text: 'All data will be permanently removed.' });
    if (!r.isConfirmed) return;
    try { await deleteOrg(id); toast.success('Deleted'); }
    catch { toast.error('Failed to delete'); }
  };

  const filtered = orgs.filter(o =>
    o.name.toLowerCase().includes(search.toLowerCase()) ||
    o.description?.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-extrabold text-slate-800 dark:text-white">Organizations</h1>
          <p className="text-sm text-slate-500 dark:text-slate-400 mt-0.5">{orgs.length} organizations registered</p>
        </div>
        {(isAdmin || isOfficer) && (
          <button onClick={() => setModal('create')}
            className="flex items-center gap-2 px-5 py-2.5 bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-xl text-sm font-bold hover:from-blue-700 hover:to-indigo-700 transition-all shadow-lg shadow-blue-500/25 hover:-translate-y-0.5">
            <Plus size={16} /> New Organization
          </button>
        )}
      </div>

      {/* Search + view toggle */}
      <div className="flex gap-3">
        <div className="relative flex-1">
          <Search size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
          <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search organizations..."
            className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-600 bg-white dark:bg-slate-800 text-slate-800 dark:text-white text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all" />
        </div>
        <div className="flex gap-1 bg-slate-100 dark:bg-slate-800 p-1 rounded-xl border border-slate-200 dark:border-slate-700">
          <button onClick={() => setView('grid')} className={`p-2 rounded-lg transition-colors ${view === 'grid' ? 'bg-white dark:bg-slate-700 shadow-sm text-blue-600' : 'text-slate-400 hover:text-slate-600'}`}>
            <LayoutGrid size={16} />
          </button>
          <button onClick={() => setView('list')} className={`p-2 rounded-lg transition-colors ${view === 'list' ? 'bg-white dark:bg-slate-700 shadow-sm text-blue-600' : 'text-slate-400 hover:text-slate-600'}`}>
            <List size={16} />
          </button>
        </div>
      </div>

      {loading ? <LoadingSpinner text="Loading organizations..." /> : filtered.length === 0 ? (
        <div className="text-center py-20">
          <div className="w-16 h-16 bg-slate-100 dark:bg-slate-800 rounded-2xl flex items-center justify-center mx-auto mb-4">
            <Building2 size={28} className="text-slate-400" />
          </div>
          <p className="font-semibold text-slate-600 dark:text-slate-400">No organizations found</p>
          <p className="text-sm text-slate-400 dark:text-slate-500 mt-1">Try a different search term</p>
        </div>
      ) : (
        <div className={view === 'grid'
          ? 'grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4'
          : 'space-y-3'
        }>
          {filtered.map(org => (
            <div key={org.id} className="relative">
              <OrgCard org={org} memberCount={memberCounts[org.id] || 0}
                isMember={isMember(org.id)} isPending={isPending(org.id)}
                onJoin={handleJoin} onLeave={handleLeave} />
              {isAdmin && (
                <div className="absolute top-2 right-2 flex gap-1">
                  <button onClick={() => { setEditTarget(org); setModal('edit'); }}
                    className="px-2 py-1 bg-white dark:bg-slate-700 rounded-lg shadow-md text-xs font-semibold text-blue-600 border border-slate-200 dark:border-slate-600 hover:bg-blue-50 transition-colors">
                    Edit
                  </button>
                  <button onClick={() => handleDelete(org.id)}
                    className="px-2 py-1 bg-white dark:bg-slate-700 rounded-lg shadow-md text-xs font-semibold text-red-500 border border-slate-200 dark:border-slate-600 hover:bg-red-50 transition-colors">
                    Delete
                  </button>
                </div>
              )}
            </div>
          ))}
        </div>
      )}

      <Modal open={!!modal} onClose={() => { setModal(null); setEditTarget(null); }}
        title={modal === 'create' ? 'Create Organization' : 'Edit Organization'}>
        <OrgForm initial={editTarget} onSave={handleSave}
          onCancel={() => { setModal(null); setEditTarget(null); }} loading={saving} />
      </Modal>
    </div>
  );
};

export default Organizations;
