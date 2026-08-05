import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import { AuthProvider } from './context/AuthContext';
import { ThemeProvider } from './context/ThemeContext';
import { NotificationsProvider } from './context/NotificationsContext';
import ProtectedRoute from './components/ProtectedRoute';
import Layout from './components/Layout';

// Auth pages
import Login from './pages/Auth/Login';
import Register from './pages/Auth/Register';
import ForgotPassword from './pages/Auth/ForgotPassword';
import AdminSetup from './pages/Auth/AdminSetup';

// App pages
import Dashboard from './pages/Dashboard/Dashboard';
import Organizations from './pages/Organizations/Organizations';
import OrgDetail from './pages/Organizations/OrgDetail';
import Events from './pages/Events/Events';
import Announcements from './pages/Announcements/Announcements';
import Members from './pages/Members/Members';
import Reports from './pages/Reports/Reports';
import Settings from './pages/Settings/Settings';
import NotFound from './pages/NotFound';
import Landing from './pages/Landing/Landing';

// Wrap protected pages in Layout
const AppPage = ({ children, roles }) => (
  <ProtectedRoute roles={roles}>
    <Layout>{children}</Layout>
  </ProtectedRoute>
);

function App() {
  return (
    <ThemeProvider>
      <AuthProvider>
        <NotificationsProvider>
          <BrowserRouter>
            <Toaster
              position="top-right"
              toastOptions={{
                duration: 3000,
                style: { borderRadius: '10px', fontSize: '14px' },
              }}
            />
            <Routes>
              {/* Public */}
              <Route path="/login" element={<Login />} />
              <Route path="/register" element={<Register />} />
              <Route path="/forgot-password" element={<ForgotPassword />} />
              <Route path="/admin-setup" element={<AdminSetup />} />

              {/* Protected */}
              <Route path="/dashboard" element={<AppPage><Dashboard /></AppPage>} />
              <Route path="/organizations" element={<AppPage><Organizations /></AppPage>} />
              <Route path="/organizations/:id" element={<AppPage><OrgDetail /></AppPage>} />
              <Route path="/events" element={<AppPage><Events /></AppPage>} />
              <Route path="/announcements" element={<AppPage><Announcements /></AppPage>} />
              <Route path="/members" element={<AppPage roles={['admin', 'officer']}><Members /></AppPage>} />
              <Route path="/reports" element={<AppPage roles={['admin']}><Reports /></AppPage>} />
              <Route path="/settings" element={<AppPage><Settings /></AppPage>} />

              {/* Redirects */}
              <Route path="/" element={<Landing />} />
              <Route path="*" element={<NotFound />} />
            </Routes>
          </BrowserRouter>
        </NotificationsProvider>
      </AuthProvider>
    </ThemeProvider>
  );
}

export default App;
