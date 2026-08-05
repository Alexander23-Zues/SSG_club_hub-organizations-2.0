const LoadingSpinner = ({ size = 'md', text = '', fullPage = false }) => {
  const sizes = { sm: 'w-5 h-5 border-2', md: 'w-9 h-9 border-2', lg: 'w-14 h-14 border-2' };
  const spinner = (
    <div className="flex flex-col items-center justify-center gap-3 py-10">
      <div className={`${sizes[size]} border-blue-200 dark:border-blue-900 border-t-blue-600 dark:border-t-blue-400 rounded-full animate-spin`} />
      {text && <p className="text-sm text-slate-500 dark:text-slate-400 font-medium">{text}</p>}
    </div>
  );
  if (fullPage) {
    return (
      <div className="fixed inset-0 bg-white/80 dark:bg-slate-950/80 backdrop-blur-sm z-50 flex items-center justify-center">
        {spinner}
      </div>
    );
  }
  return spinner;
};

export const SkeletonCard = () => (
  <div className="bg-white dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700 p-5 animate-pulse">
    <div className="h-24 bg-slate-200 dark:bg-slate-700 rounded-xl mb-4" />
    <div className="h-4 bg-slate-200 dark:bg-slate-700 rounded w-3/4 mb-2" />
    <div className="h-3 bg-slate-100 dark:bg-slate-700/50 rounded w-full mb-1" />
    <div className="h-3 bg-slate-100 dark:bg-slate-700/50 rounded w-2/3" />
  </div>
);

export default LoadingSpinner;
