import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

// Protects routes based on auth state and optional role requirement
const ProtectedRoute = ({ children, roles }) => {
  const { currentUser, userProfile } = useAuth();
  const location = useLocation();

  if (!currentUser) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  // Wait for profile to load before checking roles (skip for demo user)
  if (roles && currentUser.uid !== 'demo-admin-uid' && !userProfile) {
    return null;
  }

  if (roles && userProfile && !roles.includes(userProfile.role)) {
    return <Navigate to="/dashboard" replace />;
  }

  return children;
};

export default ProtectedRoute;
