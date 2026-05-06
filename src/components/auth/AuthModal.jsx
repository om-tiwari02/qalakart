import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { Package, Zap, ArrowRight, X } from 'lucide-react';
import useAuthStore from '../../store/authStore';
import useUIStore from '../../store/uiStore';

const AuthModal = () => {
  const { isAuthModalOpen, closeAuthModal } = useUIStore();
  const { login, isAuthenticated } = useAuthStore();
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [otp, setOtp] = useState('');
  const [otpSent, setOtpSent] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    if (isAuthenticated && isAuthModalOpen) {
      closeAuthModal();
      navigate('/browse', { replace: true });
    }
  }, [isAuthenticated, isAuthModalOpen, closeAuthModal, navigate]);

  const handleLogin = (e) => {
    e.preventDefault();
    if (!otpSent) {
      setOtpSent(true);
    } else {
      // Default to buyer role for immediate access to /browse
      login({ name, phone }, 'buyer');
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
          <h2 className="text-3xl font-outfit font-bold text-white text-center mb-2">Welcome</h2>
          <p className="text-slate-400 text-center mb-8 text-sm">Join the QalaKart community</p>
          
          <form className="space-y-4" onSubmit={handleLogin}>
            <div>
              <label className="block text-sm font-medium text-slate-400 mb-1">Full Name</label>
              <input 
                type="text" 
                disabled={otpSent}
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="John Doe" 
                className="w-full bg-surface/50 border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-accent1 transition-colors" 
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-400 mb-1">Phone Number</label>
              <input 
                type="tel" 
                disabled={otpSent}
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                placeholder="+91 98765 43210" 
                className="w-full bg-surface/50 border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-accent1 transition-colors" 
                required
              />
            </div>
            
            {otpSent && (
              <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }}>
                <label className="block text-sm font-medium text-slate-400 mb-1 mt-4">One Time Password</label>
                <input 
                  type="text" 
                  value={otp}
                  onChange={(e) => setOtp(e.target.value)}
                  placeholder="123456" 
                  className="w-full bg-surface/50 border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-accent1 transition-colors" 
                  required
                />
              </motion.div>
            )}
            
            <button type="submit" className="w-full btn-primary mt-6 flex justify-center items-center gap-2 py-4">
              {otpSent ? 'Verify & Continue' : 'Send OTP'}
              <ArrowRight className="w-4 h-4" />
            </button>
          </form>
        </motion.div>
      </motion.div>
    </div>
  );
};

export default AuthModal;
