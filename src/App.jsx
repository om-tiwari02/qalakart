import React, { useEffect } from 'react';
import { BrowserRouter, Routes, Route, Navigate, useLocation } from 'react-router-dom';
import useAuthStore from './store/authStore';
import useUIStore from './store/uiStore';

// Layouts
import MainLayout from './components/layout/MainLayout';

// Pages
import Landing from './pages/Landing';
import Browse from './pages/Buyer/Browse';
import DemandDrop from './pages/Buyer/DemandDrop';
import MyKart from './pages/Buyer/MyKart';
import Profile from './pages/Buyer/Profile';
import Plans from './pages/Creator/Plans';
import Dashboard from './pages/Creator/Dashboard';
import Contact from './pages/Contact';

const ProtectedRoute = ({ children }) => {
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated);
  const openAuthModal = useUIStore((state) => state.openAuthModal);
  const location = useLocation();

  if (!isAuthenticated) {
    // Open modal and redirect to landing
    setTimeout(() => openAuthModal(), 100);
    return <Navigate to="/" state={{ from: location }} replace />;
  }
  return children;
};

const CreatorRoute = ({ children }) => {
  const { isAuthenticated, isSubscribed } = useAuthStore();
  if (!isAuthenticated) return <Navigate to="/" replace />;
  if (!isSubscribed) return <Navigate to="/creator/plans" />;
  return children;
};

function App() {
  const bootstrap = useAuthStore((state) => state.bootstrap);
  const isBootstrapping = useAuthStore((state) => state.isBootstrapping);

  useEffect(() => {
    bootstrap();
  }, [bootstrap]);

  if (isBootstrapping) {
    return <div className="min-h-screen bg-bg flex items-center justify-center text-white">Loading...</div>;
  }

  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<MainLayout />}>
          <Route index element={<Landing />} />
          
          <Route path="browse" element={<ProtectedRoute><Browse /></ProtectedRoute>} />
          <Route path="demand-drop" element={<ProtectedRoute><DemandDrop /></ProtectedRoute>} />
          <Route path="my-kart" element={<ProtectedRoute><MyKart /></ProtectedRoute>} />
          <Route path="profile" element={<ProtectedRoute><Profile /></ProtectedRoute>} />
          <Route path="contact" element={<Contact />} />
          
          <Route path="creator">
            <Route path="plans" element={<ProtectedRoute><Plans /></ProtectedRoute>} />
            <Route path="dashboard" element={<CreatorRoute><Dashboard /></CreatorRoute>} />
          </Route>

          {/* Catch-all redirect */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Route>
      </Routes>
    </BrowserRouter>
  );
}

export default App;
