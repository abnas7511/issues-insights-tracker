import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import { useAuth, useUser } from '@clerk/clerk-react';
import { useAuthStore } from './store/auth';
import Layout from './components/layout/Layout';
import LoginForm from './components/auth/LoginForm';
import RoleSelection from './components/auth/RoleSelection';
import Dashboard from './pages/Dashboard';
import Issues from './pages/Issues';
import CreateIssue from './pages/CreateIssue';
import IssueDetail from './pages/IssueDetail';
import UsersPage from './pages/Users';

const App: React.FC = () => {
  const { isAuthenticated, user } = useAuthStore();
  const { isSignedIn } = useAuth();
  const { user: clerkUser } = useUser();
  const [showRoleSelection, setShowRoleSelection] = React.useState(false);
  // Zustand persist rehydration state
  const [rehydrated, setRehydrated] = React.useState(false);
  // Prevent Clerk auto-login on refresh
  const [forceShowLogin, setForceShowLogin] = React.useState(true);

  React.useEffect(() => {
    const unsub = useAuthStore.persist.onFinishHydration(() => setRehydrated(true));
    if (useAuthStore.persist.hasHydrated()) setRehydrated(true);
    return unsub;
  }, []);

  React.useEffect(() => {
    setForceShowLogin(true); // Always show login on refresh
    useAuthStore.setState({ user: null, isAuthenticated: false });
  }, []);

  // Handle Clerk authentication and role selection
  React.useEffect(() => {
    if (!forceShowLogin && isSignedIn && clerkUser && !isAuthenticated) {
      // Check if user needs role selection (Google sign-in users)
      const needsRoleSelection = !clerkUser.publicMetadata?.role;
      if (needsRoleSelection) {
        setShowRoleSelection(true);
      } else {
        // User already has a role, sign them in
        const mappedUser = {
          id: clerkUser.id,
          email: clerkUser.emailAddresses[0]?.emailAddress || '',
          name: clerkUser.fullName || clerkUser.firstName || 'User',
          role: (clerkUser.publicMetadata?.role as any) || 'REPORTER',
          avatar: clerkUser.imageUrl,
          createdAt: new Date(clerkUser.createdAt || Date.now()),
        };
        useAuthStore.setState({ 
          user: mappedUser, 
          isAuthenticated: true 
        });
      }
    }
  }, [isSignedIn, clerkUser, isAuthenticated, forceShowLogin]);

  // When login is successful, disable forceShowLogin
  const handleLoginSuccess = () => setForceShowLogin(false);

  // Show role selection for new Google users
  if (showRoleSelection && isSignedIn && clerkUser && !forceShowLogin) {
    return (
      <>
        <RoleSelection 
          clerkUser={clerkUser}
          onRoleSelected={() => setShowRoleSelection(false)}
        />
        <Toaster position="top-right" />
      </>
    );
  }

  if (!rehydrated) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900">
        <span className="text-white text-lg animate-pulse">Loading...</span>
      </div>
    );
  }

  return (
    <Router>
      {!isAuthenticated || forceShowLogin ? (
        <>
          <LoginForm onLoginSuccess={handleLoginSuccess} />
          <Toaster position="top-right" />
        </>
      ) : (
        <Layout>
          <Routes>
            <Route path="/" element={<Dashboard />} />
            <Route path="/issues" element={<Issues />} />
            <Route path="/issues/new" element={<CreateIssue />} />
            <Route path="/issues/:id" element={<IssueDetail />} />
            <Route path="/users" element={<UsersPage />} />
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
          <Toaster position="top-right" />
        </Layout>
      )}
    </Router>
  );
};

export default App;