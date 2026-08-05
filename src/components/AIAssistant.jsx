import { useState } from 'react';
import { Sparkles, X, ChevronDown, ChevronUp, Lightbulb, Clock, Tag, FileText, Wand2 } from 'lucide-react';
import { getBestPostTime } from '../ai/engine';

/**
 * Floating AI Assistant button + panel
 * Shown on pages that pass in `features` prop
 */
const AIAssistant = ({ features = [], context = {} }) => {
  const [open, setOpen] = useState(false);
  const [expanded, setExpanded] = useState(null);
  const bestTime = getBestPostTime();

  if (features.length === 0) return null;

  return (
    <>
      {/* Floating button */}
      <button
        onClick={() => setOpen(o => !o)}
        className={`fixed bottom-6 right-6 z-40 flex items-center gap-2 px-4 py-3 rounded-2xl font-bold text-sm shadow-2xl transition-all duration-300 hover:-translate-y-0.5 ${
          open
            ? 'bg-slate-800 dark:bg-slate-700 text-white shadow-slate-500/20'
            : 'bg-gradient-to-r from-purple-600 to-indigo-600 text-white shadow-purple-500/30'
        }`}
        aria-label="AI Assistant"
      >
        {open ? <X size={16} /> : <Sparkles size={16} />}
        {open ? 'Close' : 'AI Assistant'}
      </button>

      {/* Panel */}
      {open && (
        <div className="fixed bottom-20 right-6 z-40 w-80 bg-white dark:bg-slate-800 rounded-2xl shadow-2xl border border-slate-200 dark:border-slate-700 overflow-hidden fade-in">
          {/* Header */}
          <div className="bg-gradient-to-r from-purple-600 to-indigo-600 px-4 py-3 flex items-center gap-2">
            <div className="w-7 h-7 bg-white/20 rounded-lg flex items-center justify-center">
              <Sparkles size={14} className="text-white" />
            </div>
            <div>
              <p className="text-sm font-bold text-white">AI Assistant</p>
              <p className="text-[10px] text-purple-200">Smart suggestions for you</p>
            </div>
          </div>

          {/* Best time to post */}
          <div className="px-4 py-3 border-b border-slate-100 dark:border-slate-700 bg-blue-50 dark:bg-blue-900/20">
            <div className="flex items-start gap-2">
              <Clock size={14} className="text-blue-600 dark:text-blue-400 mt-0.5 flex-shrink-0" />
              <div>
                <p className="text-xs font-bold text-blue-700 dark:text-blue-300">Best time to post</p>
                <p className="text-xs text-blue-600 dark:text-blue-400 mt-0.5">
                  <strong>{bestTime.time}</strong> — {bestTime.reason}
                </p>
              </div>
            </div>
          </div>

          {/* Feature list */}
          <div className="max-h-80 overflow-y-auto divide-y divide-slate-100 dark:divide-slate-700">
            {features.map((feature, i) => (
              <div key={i}>
                <button
                  onClick={() => setExpanded(expanded === i ? null : i)}
                  className="w-full flex items-center justify-between px-4 py-3 hover:bg-slate-50 dark:hover:bg-slate-700/50 transition-colors text-left"
                >
                  <div className="flex items-center gap-2">
                    <div className="w-6 h-6 bg-purple-100 dark:bg-purple-900/30 rounded-lg flex items-center justify-center">
                      <feature.icon size={12} className="text-purple-600 dark:text-purple-400" />
                    </div>
                    <span className="text-xs font-semibold text-slate-700 dark:text-slate-300">{feature.label}</span>
                  </div>
                  {expanded === i ? <ChevronUp size={13} className="text-slate-400" /> : <ChevronDown size={13} className="text-slate-400" />}
                </button>
                {expanded === i && (
                  <div className="px-4 pb-3">
                    <feature.component context={context} />
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      )}
    </>
  );
};

export default AIAssistant;
