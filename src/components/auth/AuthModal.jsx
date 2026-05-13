import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { Package, ArrowRight, X } from 'lucide-react';
import useAuthStore from '../../store/authStore';
import useUIStore from '../../store/uiStore';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';

const schema = z.object({
  email: z.string().email("Invalid email address"),
  password: z.string().min(8, "Password must be at least 8 characters")
});

const AuthModal = () => {
  const { isAuthModalOpen, closeAuthModal } = useUIStore();
  const { login, register: registerUser, isAuthenticated } = useAuthStore();
  const [isLogin, setIsLogin] = useState(true);
  const [error, setError] = useState(null);
  const navigate = useNavigate();

  const { register: registerField, handleSubmit, formState: { errors, isSubmitting } } = useForm({
    resolver: zodResolver(schema)
  });

  useEffect(() => {
    if (isAuthenticated && isAuthModalOpen) {
      closeAuthModal();
      navigate('/browse', { replace: true });
    }
  }, [isAuthenticated, isAuthModalOpen, closeAuthModal, navigate]);

  const onSubmit = async (data) => {
    setError(null);
    try {
      if (isLogin) {
        await login(data);
      } else {
        await registerUser({ ...data, role: 'buyer' });
      }
    } catch (err) {
      console.error('Auth operation failed:', err);
      if (err.response) {
        if (err.response.status === 503) {
          setError("Database is not connected. Please ensure your IP is whitelisted in MongoDB Atlas.");
        } else {
          setError(err.response.data?.error?.message || "Server error occurred");
        }
      } else if (err.request) {
        setError("Cannot connect to server. Please ensure the backend is running and your IP is whitelisted.");
      } else {
        setError("An unexpected error occurred. Please try again.");
      }
    }
  };

  if (!isAuthModalOpen) return null;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-6 bg-black/80 backdrop-blur-md">
      <motion.div 
        initial={{ opacity: 0, scale: 0.9, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.9, y: 20 }}
        className="w-full max-w-md relative"
        onClick={e => e.stopPropagation()}
      >
        <button 
          onClick={closeAuthModal}
          className="absolute -top-12 right-0 p-2 text-slate-400 hover:text-white transition-colors"
        >
          <X className="w-8 h-8" />
        </button>

        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="glass-card p-8 rounded-[2.5rem] border border-white/10"
        >
          <div className="flex justify-center mb-6">
            <div className="w-16 h-16 rounded-2xl bg-accent1/20 flex items-center justify-center border border-accent1/30">
              <Package className="w-8 h-8 text-accent1" />
            </div>
          </div>
          <h2 className="text-3xl font-outfit font-bold text-white text-center mb-2">{isLogin ? 'Welcome Back' : 'Create Account'}</h2>
          <p className="text-slate-400 text-center mb-8 text-sm">
            {isLogin ? "Log in to QalaKart" : "Join the QalaKart community"}
          </p>
          
          <form className="space-y-4" onSubmit={handleSubmit(onSubmit)}>
            {error && <div className="text-red-400 text-sm mb-4 text-center">{error}</div>}
            
            <div>
              <label className="block text-sm font-medium text-slate-400 mb-1">Email</label>
              <input 
                {...registerField('email')}
                type="email" 
                placeholder="you@example.com" 
                className="w-full bg-surface/50 border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-accent1 transition-colors" 
              />
              {errors.email && <p className="text-red-400 text-xs mt-1">{errors.email.message}</p>}
            </div>
            
            <div>
              <label className="block text-sm font-medium text-slate-400 mb-1">Password</label>
              <input 
                {...registerField('password')}
                type="password" 
                placeholder="••••••••" 
                className="w-full bg-surface/50 border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-accent1 transition-colors" 
              />
              {errors.password && <p className="text-red-400 text-xs mt-1">{errors.password.message}</p>}
            </div>
            
            <button type="submit" disabled={isSubmitting} className="w-full btn-primary mt-6 flex justify-center items-center gap-2 py-4">
              {isSubmitting ? 'Processing...' : (isLogin ? 'Log In' : 'Sign Up')}
              <ArrowRight className="w-4 h-4" />
            </button>
            
            <div className="text-center mt-4">
              <button 
                type="button"
                onClick={() => setIsLogin(!isLogin)}
                className="text-accent1 text-sm hover:underline"
              >
                {isLogin ? "Don't have an account? Sign up" : "Already have an account? Log in"}
              </button>
            </div>
          </form>
        </motion.div>
      </motion.div>
    </div>
  );
};

export default AuthModal;
