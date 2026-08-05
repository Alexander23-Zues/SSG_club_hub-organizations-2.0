// Consistent page header with title, subtitle, and optional action button
const PageHeader = ({ title, subtitle, action }) => (
  <div className="flex items-start justify-between gap-4">
    <div>
      <h1 className="text-xl font-bold text-slate-800 dark:text-white">{title}</h1>
      {subtitle && <p className="text-sm text-slate-500 dark:text-slate-400 mt-0.5">{subtitle}</p>}
    </div>
    {action && (
      <button
        onClick={action.onClick}
        className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg text-sm font-medium hover:bg-blue-700 transition-colors flex-shrink-0"
      >
        {action.icon && <action.icon size={16} />}
        {action.label}
      </button>
    )}
  </div>
);

export default PageHeader;
