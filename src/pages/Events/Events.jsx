import { useEffect, useState } from 'react';
import { Plus, Search, CalendarDays, Tag, Wand2, Filter } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import EventCard from '../../components/EventCard';
import Modal from '../../components/Modal';
import LoadingSpinner from '../../components/LoadingSpinner';
import AIAssistant from '../../components/AIAssistant';
import { useServices } from '../../firebase/useServices';
import { confirmDelete } from '../../utils/swal';
import { generateEventDescription, suggestEventTags, suggestEventTitles, getDashboardInsights } from '../../ai/engine';
import toast from 'react-hot-toast';
import { useLocation } from 'react-router-dom';

const inputCls = "w-full px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-600 bg-slate-50 dark:bg-slate-700/50 text-slate-800 dark:text-white text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all placeholder-slate-400";

const EventForm = ({ initial, orgs, onSave, onCancel, loading }) => {
  const [form, setForm] = useState(initial || { title: '', description: '', date: '', location: '', organizationId: '' });
  const [tags, setTags] = useState([]);
  const [titleSuggestions, setTitleSuggestions] = useState([]);
  const [generating, setGenerating] = useState(false);
  const set = k => e => {
    const val = e.target.value;
    setForm(f => ({ ...f, [k]: val }));
    if (k === 'title') {
      setTags(suggestEventTags(val, form.description));
      setTitleSuggestions(val.length > 2 ? suggestEventTitles('', val) : []);
    }
  };

  const handleAIDescription = () => {
    if (!form.title) return toast.error('Enter a title first');
    setGenerating(true);
    const orgName = orgs.find(o => o.id === form.organizationId)?.name || '';
    setTimeout(() => {
      const desc = generateEventDescription(form.title, orgName, form.location);
      setForm(f => ({ ...f, description: desc }));
      setTags(suggestEventTags(form.title, desc));
      setGenerating(false);
      toast.success('AI generated event description!');
    }, 500);
  };

  const applyTitle = (t) => {
    setForm(f => ({ ...f, title: t }));
    setTitleSuggestions([]);
    setTags(suggestEventTags(t, form.description));
  };

  return (
    <form onSubmit={e => { e.preventDefault(); onSave(form); }} className="space-y-4">
      {/* Title with autocomplete */}
      <div className="relative">
        <label className="block text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-1.5">Event Title</label>
        <input required value={form.title} onChange={set('title')} placeholder="e.g. General Assembly" className={inputCls} autoComplete="off" />
        {titleSuggestions.length > 0 && (
          <div className="absolute top-full left-0 right-0 z-10 mt-1 bg-white dark:bg-slate-700 rounded-xl border border-slate-200 dark:border-slate-600 shadow-lg overflow-hidden">
            {titleSuggestions.map((s, i) => (
              <button key={i} type="button" onClick={() => applyTitle(s)}
                className="w-full text-left px-3 py-2 text-xs text-slate-700 dark:text-slate-300 hover:bg-blue-50 dark:hover:bg-blue-900/20 transition-colors border-b border-slate-100 dark:border-slate-600 last:border-0">
                {s}
              </button>
            ))}
          </div>
        )}
      </div>

      {/* AI tags */}
      {tags.length > 0 && (
        <div className="flex flex-wrap gap-1.5">
          {tags.map(tag => (
            <span key={tag} className="flex items-center gap-1 text-[10px] font-bold px-2 py-1 bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400 rounded-full border border-blue-200 dark:border-blue-800">
              <Tag size={9} /> {tag}
            </span>
          ))}
        </div>
      )}

      <div>
        <div className="flex items-center justify-between mb-1.5">
          <label className="block text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Description</label>
          <button type="button" onClick={handleAIDescription} disabled={generating}
            className="flex items-center gap-1.5 text-xs font-bold text-purple-600 dark:text-purple-400 bg-purple-50 dark:bg-purple-900/20 px-3 py-1.5 rounded-lg hover:bg-purple-100 dark:hover:bg-purple-900/30 transition-colors disabled:opacity-60">
            <Wand2 size={11} /> {generating ? 'Generating...' : 'AI Generate'}
          </button>
        </div>
        <textarea required value={form.description} onChange={set('description')} rows={4} placeholder="Describe the event or click AI Generate..." className={`${inputCls} resize-none`} />
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="block text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-1.5">Date and Time</label>
          <input required type="datetime-local" value={form.date} onChange={set('date')} className={inputCls} />
        </div>
        <div>
          <label className="block text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-1.5">Location</label>
          <input value={form.location} onChange={set('location')} placeholder="e.g. Auditorium" className={inputCls} />
        </div>
      </div>
      <div>
        <label className="block text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-1.5">Organization</label>
        <select required value={form.organizationId} onChange={set('organizationId')} className={inputCls}>
          <option value="">Select organization</option>
          {orgs.map(o => <option key={o.id} value={o.id}>{o.name}</option>)}
        </select>
      </div>
      <div className="flex gap-3 pt-2">
        <button type="button" onClick={onCancel} className="flex-1 py-2.5 rounded-xl border border-slate-200 dark:border-slate-600 text-sm font-semibold text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-700 transition-colors">Cancel</button>
        <button type="submit" disabled={loading} className="flex-1 py-2.5 rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 text-white text-sm font-bold hover:from-blue-700 hover:to-indigo-700 disabled:opacity-60 transition-all shadow-md shadow-blue-500/20">
          {loading ? 'Saving...' : 'Save Event'}
        </button>
      </div>
    </form>
  );
};

const Events = () => {
  const { currentUser, isAdmin, isOfficer } = useAuth();
  const { subscribeEvents, createEvent, updateEvent, deleteEvent,
    rsvpEvent, getUserRsvps, subscribeOrgs, logActivity } = useServices(currentUser);
  const location = useLocation();
  const urlQ = new URLSearchParams(location.search).get('q') || '';
  const [events, setEvents] = useState([]);
  const [orgs, setOrgs] = useState([]);
  const [rsvps, setRsvps] = useState([]);
  const [search, setSearch] = useState(urlQ);
  const [orgFilter, setOrgFilter] = useState('');
  const [filter, setFilter] = useState('all');
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [modal, setModal] = useState(null);
  const [editTarget, setEditTarget] = useState(null);

  useEffect(() => {
    const u1 = subscribeEvents(d => { setEvents(d); setLoading(false); });
    const u2 = subscribeOrgs(setOrgs);
    return () => { u1(); u2(); };
  }, []);

  useEffect(() => { if (currentUser) getUserRsvps(currentUser.uid).then(setRsvps); }, [currentUser]);

  const handleSave = async (form) => {
    setSaving(true);
    try {
      const data = { ...form, date: new Date(form.date), createdBy: currentUser.uid };
      if (modal === 'create') {
        await createEvent(data);
        await logActivity(currentUser.uid, 'create_event', { title: form.title });
        toast.success('Event created!');
      } else {
        await updateEvent(editTarget.id, data);
        toast.success('Event updated!');
      }
      setModal(null); setEditTarget(null);
    } catch { toast.error('Failed to save event'); }
    finally { setSaving(false); }
  };

  const handleDelete = async (id) => {
    const r = await confirmDelete({ title: 'Delete Event?', text: 'This event and all RSVPs will be permanently removed.' });
    if (!r.isConfirmed) return;
    try { await deleteEvent(id); toast.success('Event deleted'); }
    catch { toast.error('Failed to delete'); }
  };

  const handleRsvp = async (eventId, status) => {
    if (!currentUser) return;
    try {
      await rsvpEvent(eventId, currentUser.uid, status);
      setRsvps(await getUserRsvps(currentUser.uid));
      toast.success('RSVP: ' + status);
    } catch { toast.error('Failed to RSVP'); }
  };

  const now = new Date();
  const upcoming = events.filter(e => { const d = e.date?.toDate ? e.date.toDate() : new Date(e.date); return d >= now; });

  const filtered = events
    .filter(e => {
      const d = e.date?.toDate ? e.date.toDate() : new Date(e.date);
      if (filter === 'upcoming') return d >= now;
      if (filter === 'past') return d < now;
      return true;
    })
    .filter(e => !orgFilter || e.organizationId === orgFilter)
    .filter(e => {
      if (!search.trim()) return true;
      // AI natural language search — also matches synonyms
      const q = search.toLowerCase();
      const synonyms = { 'meeting': ['assembly', 'ga'], 'sports': ['game', 'tournament'], 'seminar': ['workshop', 'training'] };
      const terms = [q, ...(Object.entries(synonyms).find(([k]) => q.includes(k))?.[1] || [])];
      return terms.some(t => e.title?.toLowerCase().includes(t) || e.description?.toLowerCase().includes(t));
    });

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-extrabold text-slate-800 dark:text-white">Events</h1>
          <p className="text-sm text-slate-500 dark:text-slate-400 mt-0.5">{events.length} total · {upcoming.length} upcoming</p>
        </div>
        {(isAdmin || isOfficer) && (
          <button onClick={() => setModal('create')}
            className="flex items-center gap-2 px-5 py-2.5 bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-xl text-sm font-bold hover:from-blue-700 hover:to-indigo-700 transition-all shadow-lg shadow-blue-500/25 hover:-translate-y-0.5">
            <Plus size={16} /> New Event
          </button>
        )}
      </div>

      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
          <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search events..."
            className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-600 bg-white dark:bg-slate-800 text-slate-800 dark:text-white text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all" />
        </div>
        <select value={orgFilter} onChange={e => setOrgFilter(e.target.value)}
          className="px-3 py-2.5 rounded-xl border border-slate-200 dark:border-slate-600 bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-300 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all">
          <option value="">All Organizations</option>
          {orgs.map(o => <option key={o.id} value={o.id}>{o.name}</option>)}
        </select>
        <div className="flex gap-1 bg-slate-100 dark:bg-slate-800 p-1 rounded-xl border border-slate-200 dark:border-slate-700">
          {['all', 'upcoming', 'past'].map(f => (
            <button key={f} onClick={() => setFilter(f)}
              className={`px-4 py-1.5 rounded-lg text-xs font-bold capitalize transition-all ${
                filter === f ? 'bg-white dark:bg-slate-700 text-blue-600 dark:text-blue-400 shadow-sm' : 'text-slate-500 dark:text-slate-400 hover:text-slate-700'
              }`}>
              {f}
            </button>
          ))}
        </div>
      </div>

      {loading ? <LoadingSpinner text="Loading events..." /> : filtered.length === 0 ? (
        <div className="text-center py-20">
          <div className="w-16 h-16 bg-slate-100 dark:bg-slate-800 rounded-2xl flex items-center justify-center mx-auto mb-4">
            <CalendarDays size={28} className="text-slate-400" />
          </div>
          <p className="font-semibold text-slate-600 dark:text-slate-400">No events found</p>
          <p className="text-sm text-slate-400 dark:text-slate-500 mt-1">Try a different filter or search term</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {filtered.map(event => (
            <EventCard key={event.id} event={event}
              onEdit={e => { setEditTarget(e); setModal('edit'); }}
              onDelete={handleDelete} onRsvp={handleRsvp}
              userRsvp={rsvps.find(r => r.eventId === event.id)?.status} />
          ))}
        </div>
      )}

      <Modal open={!!modal} onClose={() => { setModal(null); setEditTarget(null); }}
        title={modal === 'create' ? 'Create Event' : 'Edit Event'} size="lg">
        <EventForm
          initial={editTarget ? { ...editTarget, date: editTarget.date?.toDate ? editTarget.date.toDate().toISOString().slice(0, 16) : editTarget.date } : null}
          orgs={orgs} onSave={handleSave}
          onCancel={() => { setModal(null); setEditTarget(null); }} loading={saving} />
      </Modal>

      <AIAssistant
        features={[
          { icon: Wand2, label: 'Event Title Ideas', component: ({ context }) => (
            <div className="space-y-1.5">
              {suggestEventTitles('', '').map((t, i) => (
                <p key={i} className="text-xs text-slate-600 dark:text-slate-400 py-1 px-2 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-700 cursor-default">• {t}</p>
              ))}
            </div>
          )},
          { icon: Tag, label: 'Upcoming Events', component: () => (
            <div className="space-y-1">
              {events.filter(e => { const d = e.date?.toDate ? e.date.toDate() : new Date(e.date); return d >= new Date(); }).slice(0, 4).map(e => (
                <p key={e.id} className="text-xs text-slate-600 dark:text-slate-400 py-1">📅 {e.title}</p>
              ))}
              {events.filter(e => { const d = e.date?.toDate ? e.date.toDate() : new Date(e.date); return d >= new Date(); }).length === 0 && (
                <p className="text-xs text-slate-400">No upcoming events</p>
              )}
            </div>
          )},
        ]}
        context={{ orgs, events }}
      />
    </div>
  );
};

export default Events;
