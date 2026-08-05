import { CalendarDays, MapPin, Edit2, Trash2, CheckCircle2, XCircle, Clock } from 'lucide-react';
import { format, isToday, isTomorrow } from 'date-fns';
import { useAuth } from '../context/AuthContext';

const getDateLabel = (d) => {
  if (isToday(d)) return { label: 'Today', cls: 'bg-red-500 text-white' };
  if (isTomorrow(d)) return { label: 'Tomorrow', cls: 'bg-orange-500 text-white' };
  return { label: format(d, 'MMM d'), cls: 'bg-blue-600 text-white' };
};

const EventCard = ({ event, onEdit, onDelete, onRsvp, userRsvp }) => {
  const { isAdmin, isOfficer } = useAuth();
  const canManage = isAdmin || isOfficer;
  const eventDate = event.date?.toDate ? event.date.toDate() : new Date(event.date);
  const isPast = eventDate < new Date();
  const dateInfo = getDateLabel(eventDate);

  return (
    <div className={`bg-white dark:bg-slate-800 rounded-2xl border overflow-hidden hover:shadow-lg transition-all duration-300 hover:-translate-y-0.5 flex flex-col ${
      isPast ? 'border-slate-200 dark:border-slate-700 opacity-75' : 'border-slate-200 dark:border-slate-700'
    }`}>
      {/* Top color bar */}
      <div className={`h-1.5 ${isPast ? 'bg-slate-300 dark:bg-slate-600' : 'bg-gradient-to-r from-blue-500 to-indigo-600'}`} />

      <div className="p-4 flex flex-col flex-1">
        {/* Header row */}
        <div className="flex items-start justify-between gap-2 mb-3">
          <div className="flex items-start gap-3 flex-1 min-w-0">
            {/* Date badge */}
            <div className={`flex-shrink-0 w-12 h-12 rounded-xl flex flex-col items-center justify-center shadow-sm ${dateInfo.cls}`}>
              <span className="text-[9px] font-bold uppercase leading-none opacity-80">{format(eventDate, 'MMM')}</span>
              <span className="text-lg font-extrabold leading-none">{format(eventDate, 'd')}</span>
            </div>
            <div className="flex-1 min-w-0">
              <h3 className="font-bold text-slate-800 dark:text-white text-sm leading-tight truncate">{event.title}</h3>
              <div className="flex items-center gap-1 mt-0.5">
                <Clock size={10} className="text-slate-400 flex-shrink-0" />
                <p className="text-xs text-slate-500 dark:text-slate-400">{format(eventDate, 'EEEE, h:mm a')}</p>
              </div>
              {!isPast && (
                <span className={`inline-block text-[10px] font-bold px-1.5 py-0.5 rounded-full mt-1 ${dateInfo.cls}`}>
                  {dateInfo.label}
                </span>
              )}
            </div>
          </div>

          {canManage && !isPast && (
            <div className="flex gap-1 flex-shrink-0">
              <button onClick={() => onEdit?.(event)}
                className="p-1.5 text-slate-400 hover:text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-900/20 rounded-lg transition-colors">
                <Edit2 size={13} />
              </button>
              <button onClick={() => onDelete?.(event.id)}
                className="p-1.5 text-slate-400 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-colors">
                <Trash2 size={13} />
              </button>
            </div>
          )}
        </div>

        {/* Description */}
        <p className="text-xs text-slate-600 dark:text-slate-400 line-clamp-2 mb-3 flex-1">{event.description}</p>

        {/* Location */}
        {event.location && (
          <div className="flex items-center gap-1.5 text-xs text-slate-500 dark:text-slate-400 mb-3">
            <MapPin size={11} className="text-slate-400 flex-shrink-0" />
            <span className="truncate">{event.location}</span>
          </div>
        )}

        {/* RSVP */}
        {!isPast ? (
          <div className="flex gap-2 pt-3 border-t border-slate-100 dark:border-slate-700 mt-auto">
            <button onClick={() => onRsvp?.(event.id, 'going')}
              className={`flex-1 flex items-center justify-center gap-1.5 text-xs py-2 rounded-xl font-bold transition-all ${
                userRsvp === 'going'
                  ? 'bg-emerald-600 text-white shadow-md shadow-emerald-500/20'
                  : 'border border-emerald-200 dark:border-emerald-800 text-emerald-700 dark:text-emerald-400 hover:bg-emerald-50 dark:hover:bg-emerald-900/20'
              }`}>
              <CheckCircle2 size={12} /> Going
            </button>
            <button onClick={() => onRsvp?.(event.id, 'not going')}
              className={`flex-1 flex items-center justify-center gap-1.5 text-xs py-2 rounded-xl font-bold transition-all ${
                userRsvp === 'not going'
                  ? 'bg-red-500 text-white shadow-md shadow-red-500/20'
                  : 'border border-slate-200 dark:border-slate-600 text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-700'
              }`}>
              <XCircle size={12} /> Not Going
            </button>
          </div>
        ) : (
          <div className="pt-3 border-t border-slate-100 dark:border-slate-700 mt-auto">
            <span className="text-xs text-slate-400 dark:text-slate-500 italic flex items-center gap-1">
              <Clock size={10} /> Event has passed
            </span>
          </div>
        )}
      </div>
    </div>
  );
};

export default EventCard;
