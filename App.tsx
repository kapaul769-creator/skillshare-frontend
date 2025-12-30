import React from 'react';
import {
  HashRouter as Router,
  Routes,
  Route,
  Navigate,
  useLocation
} from 'react-router-dom';

import { AuthProvider, useAuth } from './context/AuthContext';
import { ThemeProvider } from './context/ThemeContext';
import { Layout } from './components/Layout';

import { Home } from './pages/Home';
import { Marketplace } from './pages/Marketplace';
import { Login } from './pages/Login';
import { Register } from './pages/Register';
import { Dashboard } from './pages/Dashboard';
import { CreateListing } from './pages/CreateListing';
import { ServiceDetail } from './pages/ServiceDetail';
import { Profile } from './pages/Profile';

// ❌ Disabled because file does not exist
// import { EditProfile } from './pages/EditProfile';


// Protected Route Wrapper
const ProtectedRoute: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { user, isLoading } = useAuth();
  const location = useLocation();

  if (isLoading) return null;

  if (!user) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  return <>{children}</>;
};

const App: React.FC = () => {
  return (
    <ThemeProvider>
      <AuthProvider>
        <Router>
          <Routes>
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />

            <Route
              path="/"
              element={
                <Layout>
                  <Home />
                </Layout>
              }
            />

            <Route
              path="/marketplace"
              element={
                <Layout>
                  <Marketplace />
                </Layout>
              }
            />

            <Route
              path="/service/:id"
              element={
                <Layout>
                  <ServiceDetail />
                </Layout>
              }
            />

            <Route
              path="/profile/:id"
              element={
                <Layout>
                  <Profile />
                </Layout>
              }
            />

            {/* Edit profile disabled safely */}
            {/*
            <Route
              path="/edit-profile"
              element={
                <ProtectedRoute>
                  <Layout>
                    <EditProfile />
                  </Layout>
                </ProtectedRoute>
              }
            />
            */}

            <Route
              path="/dashboard"
              element={
                <ProtectedRoute>
                  <Layout>
                    <Dashboard />
                  </Layout>
                </ProtectedRoute>
              }
            />

            <Route
              path="/create-listing"
              element={
                <ProtectedRoute>
                  <Layout>
                    <CreateListing />
                  </Layout>
                </ProtectedRoute>
              }
            />

            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </Router>
      </AuthProvider>
    </ThemeProvider>
  );
};

export default App;
