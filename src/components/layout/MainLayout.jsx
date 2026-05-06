import React from 'react';
import { Outlet, useLocation, useNavigate } from 'react-router-dom';
import Navbar from './Navbar';
import AIAssistant from './AIAssistant';
import StarField from '../animations/StarField';
import { Toaster } from 'react-hot-toast';
import { ArrowLeft } from 'lucide-react';
import AuthModal from '../auth/AuthModal';

const MainLayout = () => {
  const location = useLocation();
  const navigate = useNavigate();

  return (
    <div className="relative min-h-screen flex flex-col">
      <StarField />
      <Navbar />
      <AuthModal />
      <main className="flex-1 pt-24 pb-12 px-6">
        <div className="max-w-7xl mx-auto relative">
          <Outlet />
        </div>
      </main>
      <Toaster 
        position="bottom-right"
        toastOptions={{
          style: {
            background: '#161b27',
            color: '#fff',
            border: '1px solid rgba(124, 58, 237, 0.2)',
          },
        }}
      />
      <AIAssistant />
    </div>
  );
};

export default MainLayout;
