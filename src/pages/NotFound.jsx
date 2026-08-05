import { useNavigate, Link } from 'react-router-dom';
import { Home, ArrowLeft, Building2 } from 'lucide-react';

const NotFound = () => {
  const navigate = useNavigate();
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50 dark:from-slate-950 dark:to-slate-900 flex items-center justify-center p-4">
      <div className="text-center max-w-md">
        {/* Big 404 */}
        <div className="relative mb-8">
          <p className="text-[120px] font-extrabold text-slate-200 dark:text-slate-800 leading-none select-none">404</p>
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="w-20 h-20 bg-gradient-to-br from-blue-600 to-indigo-600 rounded-2xl flex items-center justify-center shadow-xl shadow-blue-500/25">
              <Building2 size={36} className="text-white" />
            </div>
          </div>
        </div>

        <h1 className="text-2xl font-extrabold text-slate-800 dark:text-white mb-2">Page Not Found</h1>
        <p className="text-slate-500 dark:text-slate-400 mb-8 leading-relaxed">
          The page you're looking for doesn't exist or has been moved. Let's get you back on track.
        </p>

        <div className="flex flex-col sm:flex-row gap-3 justify-center">
          <button onClick={() => navigate(-1)}
            className="flex items-center justify-center gap-2 px-5 py-2.5 border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 rounded-xl text-sm font-semibold hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors">
            <ArrowLeft size={15} /> Go Back
          </button>
          <Link to="/dashboard"
            className="flex items-center justify-center gap-2 px-5 py-2.5 bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-xl text-sm font-bold hover:from-blue-700 hover:to-indigo-700 transition-all shadow-md shadow-blue-500/20">
            <Home size={15} /> Dashboard
          </Link>
        </div>

        <p className="text-xs text-slate-400 dark:text-slate-600 mt-8">
          SSG Club Hub Organizations 2.0
        </p>
      </div>
    </div>
  );
};

export default NotFound;
