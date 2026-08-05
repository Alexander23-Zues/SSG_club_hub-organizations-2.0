const gradients = {
  blue:   { card: 'from-blue-500 to-blue-600',     icon: 'bg-white/20', glow: 'shadow-blue-500/30' },
  green:  { card: 'from-emerald-500 to-green-600', icon: 'bg-white/20', glow: 'shadow-emerald-500/30' },
  purple: { card: 'from-purple-500 to-indigo-600', icon: 'bg-white/20', glow: 'shadow-purple-500/30' },
  orange: { card: 'from-orange-500 to-amber-500',  icon: 'bg-white/20', glow: 'shadow-orange-500/30' },
  red:    { card: 'from-red-500 to-rose-600',      icon: 'bg-white/20', glow: 'shadow-red-500/30' },
};

const StatCard = ({ icon: Icon, label, value, color = 'blue', trend }) => {
  const g = gradients[color];
  return (
    <div className={`relative bg-gradient-to-br ${g.card} rounded-2xl p-5 text-white shadow-lg ${g.glow} hover:shadow-xl hover:-translate-y-0.5 transition-all duration-300 overflow-hidden`}>
      {/* Background pattern */}
      <div className="absolute top-0 right-0 w-24 h-24 bg-white/5 rounded-full -translate-y-8 translate-x-8" />
      <div className="absolute bottom-0 left-0 w-16 h-16 bg-white/5 rounded-full translate-y-6 -translate-x-6" />

      <div className="relative flex items-start justify-between mb-4">
        <div className={`w-11 h-11 ${g.icon} backdrop-blur-sm rounded-xl flex items-center justify-center`}>
          <Icon size={22} />
        </div>
        {trend !== undefined && (
          <span className={`text-xs font-bold px-2 py-1 rounded-full ${trend >= 0 ? 'bg-white/20 text-white' : 'bg-black/20 text-white/80'}`}>
            {trend >= 0 ? '↑' : '↓'} {Math.abs(trend)}%
          </span>
        )}
      </div>
      <p className="relative text-3xl font-extrabold tracking-tight">{value}</p>
      <p className="relative text-white/75 text-sm mt-0.5 font-medium">{label}</p>
    </div>
  );
};

export default StatCard;
