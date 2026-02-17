import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { AuthProvider, useAuth } from './context/AuthContext';
import Login from './pages/Login';
const Dashboard = React.lazy(() => import('./pages/Dashboard'));
const Incidents = React.lazy(() => import('./pages/Incidents'));
const IncidentDetail = React.lazy(() => import('./pages/IncidentDetail'));
const CreateIncident = React.lazy(() => import('./pages/CreateIncident'));
const MyIncidents = React.lazy(() => import('./pages/MyIncidents'));
const Evidence = React.lazy(() => import('./pages/Evidence'));
const Profile = React.lazy(() => import('./pages/Profile'));
const PublicReport = React.lazy(() => import('./pages/PublicReport'));
const PublicStatus = React.lazy(() => import('./pages/PublicStatus'));
const Analytics = React.lazy(() => import('./pages/Analytics'));
const Users = React.lazy(() => import('./pages/Users'));

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 1000 * 60 * 5, // 5 minutes
      cacheTime: 1000 * 60 * 30, // 30 minutes
      retry: 1,
      refetchOnWindowFocus: false,
    },
  },
});

const ProtectedRoute = ({ children }) => {
  const { isAuthenticated, loading } = useAuth();

  if (loading) return <div className="loading">Checking security status...</div>;

  return isAuthenticated ? children : <Navigate to="/login" replace />;
};

const RoleProtectedRoute = ({ children, allowedRoles }) => {
  const { user, isAuthenticated, loading } = useAuth();

  if (loading) return <div className="loading">Verifying credentials...</div>;
  if (!isAuthenticated) return <Navigate to="/login" replace />;

  const hasAccess = allowedRoles.includes(user?.role);
  return hasAccess ? children : <Navigate to="/" replace />;
};

function AppRoutes() {
  return (
    <BrowserRouter>
      <React.Suspense fallback={<div className="loading">Loading application resources...</div>}>
        <Routes>
          <Route path="/login" element={<Login />} />
          <Route path="/public" element={<PublicReport />} />
          <Route path="/public/status" element={<PublicStatus />} />

          <Route path="/" element={<ProtectedRoute><Dashboard /></ProtectedRoute>} />
          <Route path="/incidents" element={<ProtectedRoute><Incidents /></ProtectedRoute>} />
          <Route path="/incidents/new" element={<ProtectedRoute><CreateIncident /></ProtectedRoute>} />
          <Route path="/incidents/:id" element={<ProtectedRoute><IncidentDetail /></ProtectedRoute>} />
          <Route path="/my-incidents" element={<ProtectedRoute><MyIncidents /></ProtectedRoute>} />
          <Route path="/evidence" element={<ProtectedRoute><Evidence /></ProtectedRoute>} />
          <Route path="/profile" element={<ProtectedRoute><Profile /></ProtectedRoute>} />

          {/* Role-specific routes */}
          <Route
            path="/analytics"
            element={
              <RoleProtectedRoute allowedRoles={['supervisor', 'head', 'admin']}>
                <Analytics />
              </RoleProtectedRoute>
            }
          />
          <Route
            path="/users"
            element={
              <RoleProtectedRoute allowedRoles={['admin']}>
                <Users />
              </RoleProtectedRoute>
            }
          />
        </Routes>
      </React.Suspense>
    </BrowserRouter>
  );
}

export default function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <AppRoutes />
      </AuthProvider>
    </QueryClientProvider>
  );
}
