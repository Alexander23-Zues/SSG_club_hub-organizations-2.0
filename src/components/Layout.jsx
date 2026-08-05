import { useState } from 'react';
import Sidebar from './Sidebar';
import Navbar from './Navbar';

const Layout = ({ children }) => {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 flex">
      <Sidebar open={sidebarOpen} onClose={() => setSidebarOpen(false)} />

      <div className="flex-1 flex flex-col lg:ml-64 min-w-0">
        <Navbar onMenuClick={() => setSidebarOpen(true)} />
        <main className="flex-1 p-4 md:p-6 fade-in max-w-7xl w-full mx-auto">
          {children}
        </main>
        {/* Footer */}
        <footer className="px-6 py-3 border-t border-slate-200 dark:border-slate-800 flex items-center justify-between">
          <p className="text-xs text-slate-400 dark:text-slate-600">
            © {new Date().getFullYear()} SSG Club Hub Organizations 2.0
          </p>
          <p className="text-xs text-slate-400 dark:text-slate-600">
            Powered by Firebase + React
          </p>
        </footer>
      </div>
    </div>
  );
};

export default Layout;
