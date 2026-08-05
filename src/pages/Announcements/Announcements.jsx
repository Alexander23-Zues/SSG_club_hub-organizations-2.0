import { useEffect, useState } from 'react';
import { Plus, Megaphone, Edit2, Trash2, Sparkles, Globe, Wand2, Search } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import Modal from '../../components/Modal';
import LoadingSpinner from '../../components/LoadingSpinner';
import AIAssistant from '../../components/AIAssistant';
import { useServices } from '../../firebase/useServices';
import { confirmDelete } from '../../utils/swal';
import { generateAnnouncement, getBestPostTime } from '../../ai/engine';
import { format } from 'date-fns';
import toast from 'react-hot-toast';
import { useLocation } from 'react-router-dom';

const inputCls = "w-full px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-600 bg-slate-50 dark:bg-slate-700/50 text-slate-800 dark:text-white text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all placeholder-slate-400";

const TONES = [
  { value: 'formal', label: 'Formal', emoji: '📋' },
  { value: 'casual', label: 'Casual', emoji: '😊' },
  { value: 'urgent', label: 'Urgent', emoji: '🚨' },
];

const AnnouncementForm = ({ initial, orgs, onSave, onCancel, loading }) => {
  const [form, setForm] = useState(initial || { title: '', content: '', organizationId: '' });
  const [tone, setTone] = useState('formal');
  const [generating, setGenerating] = useState(false);
  const set = k => e => setForm(f => ({ ...f, [k]: e.target.value }));
  const bestTime = getBestPostTime();

  const handleAIWrite = () => {
    if (!form.title) return toast.error('Enter a title first');
    setGenerating(true);
    const orgName = orgs.find(o => o.id === form.organizationId)?.name || 'the organization';
    setTimeout(() => {
      const content = generateAnnouncement(form.title, orgName, tone);
      setForm(f => ({ ...f, content }));
      setGenerating(false);
      toast.success(`AI wrote a ${tone} announcement!`);
    }, 600);
  };

  return (
    <form onSubmit={e => { e.preventDefault(); onSave(form); }} className="space-y-4">
      <div>
        <label className="block text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-1.5">Title</label>
        <input required value={form.title} onChange={set('title')} placeholder="Announcement title" className={inputCls} />
      </div>

      {/* AI Tone selector */}
      <div>
        <label className="block text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-1.5">AI Writing Tone</label>
        <div className="flex gap-2">
          {TONES.map(t => (
            <button key={t.value} type="button" onClick={() => setTone(t.value)}
              className={`flex-1 flex items-center justify-center gap-1.5 py-2 rounded-xl text-xs font-bold border transition-all ${
                tone === t.value
                  ? 'bg-purple-600 text-white border-purple-600 shadow-md shadow-purple-500/20'
                  : 'border-slate-200 dark:border-slate-600 text-slate-600 dark:text-slate-400 hover:border-purple-300'
              }`}>
              <span>{t.emoji}</span> {t.label}
            </button>
          ))}
        </div>
      </div>

      <div>
        <div className="flex items-center justify-between mb-1.5">
          <label className="block text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Content</label>
          <button type="button" onClick={handleAIWrite} disabled={generating}
            className="flex items-center gap-1.5 text-xs font-bold text-purple-600 dark:text-purple-400 bg-purple-50 dark:bg-purple-900/20 px-3 py-1.5 rounded-lg hover:bg-purple-100 dark:hover:bg-purple-900/30 transition-colors disabled:opacity-60">
            <Wand2 size={11} /> {generating ? 'Writing...' : 'AI Write'}
          </button>
        </div>
        <textarea required value={form.content} onChange={set('content')} rows={5} placeholder="Write your announcement or click AI Write..." className={`${inputCls} resize-none`} />
        <p className="text-[10px] text-slate-400 mt-1 flex items-center gap-1">
          💡 Best time to post: <strong>{bestTime.time}</strong> — {bestTime.reason}
        </p>
      </div>

      <div>
        <label className="block text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-1.5">Organization</label>
        <select value={form.organizationId} onChange={set('organizationId')} className={inputCls}>
          <option value="">All Organizations (Global)</option>
          {orgs.map(o => <option key={o.id} value={o.id}>{o.name}</option>)}
        </select>
      </div>
      <div className="flex gap-3 pt-2">
        <button type="button" onClick={onCancel} className="flex-1 py-2.5 rounded-xl border border-slate-200 dark:border-slate-600 text-sm font-semibold text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-700 transition-colors">Cancel</button>
        <button type="submit" disabled={loading} className="flex-1 py-2.5 rounded-xl bg-gradient-to-r from-orange-500 to-amber-500 text-white text-sm font-bold hover:from-orange-600 hover:to-amber-600 disabled:opacity-60 transition-all shadow-md shadow-orange-500/20">
          {loading ? 'Posting...' : 'Post Announcement'}
        </button>
      </div>
    </form>
  );
};

const Announcements = () => {
  const { currentUser, isAdmin, isOfficer } = useAuth();
  const { subscribeAnnouncements, createAnnouncement, updateAnnouncement,
    deleteAnnouncement, subscribeOrgs, logActivity } = useServices(currentUser);
  const location = useLocation();
  const urlQ = new URLSearchParams(location.search).get('q') || '';
  const [announcements, setAnnouncements] = useState([]);
  const [orgs, setOrgs] = useState([]);
  const [search, setSearch] = useState(urlQ);
  const [orgFilter, setOrgFilter] = useState('');
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [modal, setModal] = useState(null);
  const [editTarget, setEditTarget] = useState(null);

  useEffect(() => {
    const u1 = subscribeAnnouncements(d => { setAnnouncements(d); setLoading(false); });
    const u2 = subscribeOrgs(setOrgs);
    return () => { u1(); u2(); };
  }, []);

  const getOrgName = id => orgs.find(o => o.id === id)?.name || 'All Organizations';

  const filtered = announcements
    .filter(a => !orgFilter || a.organizationId === orgFilter)
    .filter(a => {
      if (!search.trim()) return true;
      const q = search.toLowerCase();
      return a.title?.toLowerCase().includes(q) || a.content?.toLowerCase().includes(q);
    });

  const handleSave = async (form) => {
    setSaving(true);
    try {
      if (modal === 'create') {
        await createAnnouncement({ ...form, createdBy: currentUser.uid });
        await logActivity(currentUser.uid, 'create_announcement', { title: form.title });
        toast.success('Announcement posted!');
      } else {
        await updateAnnouncement(editTarget.id, form);
        toast.success('Updated!');
      }
      setModal(null); setEditTarget(null);
    } catch { toast.error('Failed to save'); }
    finally { setSaving(false); }
  };

  const handleDelete = async (id) => {
    const r = await confirmDelete({ title: 'Delete Announcement?', text: 'This will be permanently removed.' });
    if (!r.isConfirmed) return;
    try { await deleteAnnouncement(id); toast.success('Deleted'); }
    catch { toast.error('Failed to delete'); }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-extrabold text-slate-800 dark:text-white">Announcements</h1>
          <p className="text-sm text-slate-500 dark:text-slate-400 mt-0.5">Real-time updates · {announcements.length} total</p>
        </div>
        {(isAdmin || isOfficer) && (
          <button onClick={() => setModal('create')}
            className="flex items-center gap-2 px-5 py-2.5 bg-gradient-to-r from-orange-500 to-amber-500 text-white rounded-xl text-sm font-bold hover:from-orange-600 hover:to-amber-600 transition-all shadow-lg shadow-orange-500/25 hover:-translate-y-0.5">
            <Plus size={16} /> Post Announcement
          </button>
        )}
      </div>

      {loading ? <LoadingSpinner text="Loading announcements..." /> : announcements.length === 0 ? (
        <div className="text-center py-20">
          <div className="w-16 h-16 bg-slate-100 dark:bg-slate-800 rounded-2xl flex items-center justify-center mx-auto mb-4">
            <Megaphone size={28} className="text-slate-400" />
          </div>
          <p className="font-semibold text-slate-600 dark:text-slate-400">No announcements yet</p>
          <p className="text-sm text-slate-400 dark:text-slate-500 mt-1">Be the first to post one</p>
        </div>
      ) : (
        <>
        {/* Search + filter */}
        <div className="flex flex-col sm:flex-row gap-3">
          <div className="relative flex-1">
            <Search size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
            <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search announcements..."
              className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-600 bg-white dark:bg-slate-800 text-slate-800 dark:text-white text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all" />
          </div>
          <select value={orgFilter} onChange={e => setOrgFilter(e.target.value)}
            className="px-3 py-2.5 rounded-xl border border-slate-200 dark:border-slate-600 bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-300 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all">
            <option value="">All Organizations</option>
            {orgs.map(o => <option key={o.id} value={o.id}>{o.name}</option>)}
          </select>
        </div>

        {filtered.length === 0 ? (
          <div className="text-center py-12">
            <Megaphone size={24} className="mx-auto mb-2 text-slate-300 dark:text-slate-600" />
            <p className="text-sm text-slate-400">No announcements match your search</p>
          </div>
        ) : (
        <div className="space-y-3">
          {filtered.map((ann, idx) => (
            <div key={ann.id}
              className="group bg-white dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700 p-5 hover:shadow-md hover:border-orange-200 dark:hover:border-orange-800/50 transition-all duration-200 fade-in">
              <div className="flex items-start gap-4">
                {/* Icon */}
                <div className={`w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 ${
                  idx === 0 ? 'bg-gradient-to-br from-orange-500 to-amber-500 shadow-md shadow-orange-500/20' : 'bg-orange-100 dark:bg-orange-900/30'
                }`}>
                  <Megaphone size={17} className={idx === 0 ? 'text-white' : 'text-orange-600 dark:text-orange-400'} />
                </div>

                {/* Content */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <h3 className="font-bold text-slate-800 dark:text-white">{ann.title}</h3>
                      <div className="flex items-center gap-1.5 mt-0.5">
                        <Globe size={11} className="text-blue-500" />
                        <span className="text-xs font-semibold text-blue-600 dark:text-blue-400">{getOrgName(ann.organizationId)}</span>
                      </div>
                    </div>
                    {(isAdmin || isOfficer) && (
                      <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity flex-shrink-0">
                        <button onClick={() => { setEditTarget(ann); setModal('edit'); }}
                          className="p-1.5 text-slate-400 hover:text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-900/20 rounded-lg transition-colors">
                          <Edit2 size={13} />
                        </button>
                        <button onClick={() => handleDelete(ann.id)}
                          className="p-1.5 text-slate-400 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-colors">
                          <Trash2 size={13} />
                        </button>
                      </div>
                    )}
                  </div>
                  <p className="text-sm text-slate-600 dark:text-slate-400 mt-2 leading-relaxed">{ann.content}</p>
                  {ann.createdAt && (
                    <p className="text-xs text-slate-400 dark:text-slate-500 mt-2">
                      {format(ann.createdAt.toDate?.() || new Date(ann.createdAt), 'MMMM d, yyyy · h:mm a')}
                    </p>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
        )}
        </>
      )}

      <Modal open={!!modal} onClose={() => { setModal(null); setEditTarget(null); }}
        title={modal === 'create' ? 'Post Announcement' : 'Edit Announcement'}>
        <AnnouncementForm initial={editTarget} orgs={orgs} onSave={handleSave}
          onCancel={() => { setModal(null); setEditTarget(null); }} loading={saving} />
      </Modal>

      <AIAssistant
        features={[
          { icon: Wand2, label: 'Writing Tips', component: () => (
            <div className="space-y-1.5 text-xs text-slate-600 dark:text-slate-400">
              <p>• Use <strong>Formal</strong> tone for official notices</p>
              <p>• Use <strong>Casual</strong> for events and activities</p>
              <p>• Use <strong>Urgent</strong> for deadlines and alerts</p>
              <p>• Keep titles short and action-oriented</p>
              <p>• Always include date, time, and venue</p>
            </div>
          )},
          { icon: Megaphone, label: 'Recent Posts', component: () => (
            <div className="space-y-1">
              {announcements.slice(0, 4).map(a => (
                <p key={a.id} className="text-xs text-slate-600 dark:text-slate-400 py-0.5">📢 {a.title}</p>
              ))}
            </div>
          )},
        ]}
        context={{ orgs, announcements }}
      />
    </div>
  );
};

export default Announcements;
