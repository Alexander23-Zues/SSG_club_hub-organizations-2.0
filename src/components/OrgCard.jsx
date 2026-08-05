import { Building2, Users, ArrowRight, Clock } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useState } from 'react';

// Deterministic gradient per org name
const gradients = [
  'from-blue-500 to-indigo-600',
  'from-purple-500 to-pink-600',
  'from-emerald-500 to-teal-600',
  'from-orange-500 to-red-500',
  'from-cyan-500 to-blue-600',
  'from-rose-500 to-pink-600',
  'from-amber-500 to-orange-600',
  'from-green-500 to-emerald-600',
];
const getGradient = (name = '') => gradients[name.charCodeAt(0) % gradients.length];

const OrgCard = ({ org, memberCount = 0, isMember = false, isPending = false, onJoin, onLeave }) => {
  const navigate = useNavigate();
  const gradient = getGradient(org.name);
  const [joining, setJoining] = useState(false);
  const [leaving, setLeaving] = useState(false);

  const handleJoin = async () => {
    setJoining(true);
    try { await onJoin?.(org.id); } finally { setJoining(false); }
  };
  const handleLeave = async () => {
    setLeaving(true);
    try { await onLeave?.(org.id); } finally { setLeaving(false); }
  };

  return (
    <div className="bg-white dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700 overflow-hidden hover:shadow-xl hover:-translate-y-1 transition-all duration-300 group flex flex-col">
      {/* Banner */}
      <div className={`h-28 bg-gradient-to-br ${gradient} relative flex-shrink-0`}>
        {org.logoUrl ? (
          <img src={org.logoUrl} alt={org.name} className="w-full h-full object-cover" />
        ) : (
          <div className="w-full h-full flex items-center justify-center">
            <Building2 size={36} className="text-white/50" />
          </div>
        )}
        {/* Member badge */}
        {isMember && (
          <span className="absolute top-2 left-2 text-[10px] font-bold bg-white/90 text-emerald-700 px-2 py-0.5 rounded-full">
            ✓ Member
          </span>
        )}
        {isPending && (
          <span className="absolute top-2 left-2 text-[10px] font-bold bg-white/90 text-yellow-700 px-2 py-0.5 rounded-full flex items-center gap-1">
            <Clock size={9} /> Pending
          </span>
        )}
      </div>

      <div className="p-4 flex flex-col flex-1">
        <h3 className="font-bold text-slate-800 dark:text-white text-sm mb-1 truncate">{org.name}</h3>
        <p className="text-xs text-slate-500 dark:text-slate-400 line-clamp-2 mb-3 flex-1">{org.description}</p>

        <div className="flex items-center justify-between mt-auto">
          <span className="flex items-center gap-1 text-xs text-slate-500 dark:text-slate-400">
            <Users size={12} />
            {memberCount} member{memberCount !== 1 ? 's' : ''}
          </span>

          <div className="flex gap-1.5">
            {isMember ? (
              <button onClick={handleLeave} disabled={leaving}
                className="text-xs px-3 py-1.5 rounded-lg border border-red-200 dark:border-red-800 text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors font-medium disabled:opacity-60">
                {leaving ? '...' : 'Leave'}
              </button>
            ) : isPending ? (
              <span className="text-xs px-3 py-1.5 rounded-lg bg-yellow-50 dark:bg-yellow-900/20 text-yellow-700 dark:text-yellow-400 font-medium border border-yellow-200 dark:border-yellow-800">
                Pending
              </span>
            ) : (
              <button onClick={handleJoin} disabled={joining}
                className="text-xs px-3 py-1.5 rounded-lg bg-blue-600 text-white hover:bg-blue-700 transition-colors font-bold shadow-sm disabled:opacity-60">
                {joining ? '...' : 'Join'}
              </button>
            )}
            <button onClick={() => navigate(`/organizations/${org.id}`)}
              className="p-1.5 rounded-lg border border-slate-200 dark:border-slate-600 text-slate-500 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-700 hover:text-blue-600 dark:hover:text-blue-400 transition-colors">
              <ArrowRight size={13} />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default OrgCard;
