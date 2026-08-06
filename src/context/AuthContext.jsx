import { createContext, useContext, useEffect, useState } from 'react';
import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signOut,
  sendPasswordResetEmail,
  onAuthStateChanged,
  updateProfile
} from 'firebase/auth';
import { auth } from '../firebase/config';
import { createUserDoc, getUserDoc } from '../firebase/services';

const AuthContext = createContext(null);

export const useAuth = () => {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
};

const DEMO_ACCOUNTS = {
  admin: {
    user:    { uid: 'demo-admin-uid',   email: 'demo.admin@ssgclubhub.edu',   displayName: 'Demo Admin'   },
    profile: { name: 'Demo Admin',      email: 'demo.admin@ssgclubhub.edu',   role: 'admin',   organizationId: null },
  },
  officer: {
    user:    { uid: 'demo-officer-uid', email: 'demo.officer@ssgclubhub.edu', displayName: 'Clara Mendoza' },
    profile: { name: 'Clara Mendoza',   email: 'demo.officer@ssgclubhub.edu', role: 'officer', organizationId: 'org1' },
  },
  student: {
    user:    { uid: 'demo-student-uid', email: 'demo.student@ssgclubhub.edu', displayName: 'Alice Reyes'  },
    profile: { name: 'Alice Reyes',     email: 'demo.student@ssgclubhub.edu', role: 'student', organizationId: 'org1' },
  },
};

const DEMO_UIDS = new Set(Object.values(DEMO_ACCOUNTS).map(a => a.user.uid));

export const AuthProvider = ({ children }) => {
  const [currentUser, setCurrentUser] = useState(null);
  const [userProfile, setUserProfile] = useState(null);
  const [loading, setLoading] = useState(true);

  // Demo login — no Firebase needed. role: 'admin' | 'officer' | 'student'
  const demoLogin = (role = 'admin') => {
    const account = DEMO_ACCOUNTS[role] || DEMO_ACCOUNTS.admin;
    setCurrentUser(account.user);
    setUserProfile(account.profile);
  };

  // Register new user
  const register = async (email, password, name, role = 'student') => {
    const { user } = await createUserWithEmailAndPassword(auth, email, password);
    await updateProfile(user, { displayName: name });
    await createUserDoc(user.uid, { name, email, role, organizationId: null });
    return user;
  };

  // Login
  const login = (email, password) =>
    signInWithEmailAndPassword(auth, email, password);

  // Logout
  const logout = () => {
    if (DEMO_UIDS.has(currentUser?.uid)) {
      setCurrentUser(null);
      setUserProfile(null);
      return Promise.resolve();
    }
    return signOut(auth);
  };

  // Password reset
  const resetPassword = (email) => sendPasswordResetEmail(auth, email);

  // Refresh user profile from Firestore
  const refreshProfile = async () => {
    if (DEMO_UIDS.has(currentUser?.uid)) {
      // For demo, just return the current profile — no Firestore needed
      return userProfile;
    }
    if (currentUser) {
      const profile = await getUserDoc(currentUser.uid);
      setUserProfile(profile);
      return profile;
    }
  };

  useEffect(() => {
    const unsub = onAuthStateChanged(auth, async (user) => {
      if (user) {
        setCurrentUser(user);
        const profile = await getUserDoc(user.uid);
        setUserProfile(profile);
      } else {
        // Only clear if not in demo mode
        setCurrentUser(prev => DEMO_UIDS.has(prev?.uid) ? prev : null);
        setUserProfile(prev => DEMO_UIDS.has(prev?.uid) ? prev : null);
      }
      setLoading(false);
    });
    return unsub;
  }, []);

  const value = {
    currentUser,
    userProfile,
    loading,
    register,
    login,
    logout,
    demoLogin,
    resetPassword,
    refreshProfile,
    isAdmin: userProfile?.role === 'admin',
    isOfficer: userProfile?.role === 'officer',
    isStudent: userProfile?.role === 'student',
  };

  return (
    <AuthContext.Provider value={value}>
      {!loading && children}
    </AuthContext.Provider>
  );
};
