import React, { useEffect } from 'react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import useAuthStore from '../../store/authStore';
import useUIStore from '../../store/uiStore';
import { Sparkles } from 'lucide-react';

const Landing = () => {
  const { isAuthenticated } = useAuthStore();
  const { openAuthModal } = useUIStore();
  const navigate = useNavigate();

  useEffect(() => {
    if (isAuthenticated) {
      navigate('/browse');
    }
  }, [isAuthenticated, navigate]);

  return (
    <div className="relative min-h-[calc(100vh-6rem)] flex flex-col items-center justify-center text-center px-6">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8 }}
        className="max-w-4xl"
      >
        <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/5 border border-white/10 text-accent2 text-sm font-medium mb-8">
          <Sparkles className="w-4 h-4" />
          <span>Bhopal's Premier Creative Marketplace</span>
        </div>
        
        <h1 className="text-5xl md:text-7xl font-black mb-8 leading-tight">
          Where Local Creativity <br />
          Finds Its <span className="neon-text">Market</span>
        </h1>
        
        <p className="text-lg md:text-xl text-slate-400 mb-12 max-w-2xl mx-auto leading-relaxed">
          Discover unique, handcrafted gifts or post what you need through our 
          Demand Drop. Zero hassle, endless creativity.
        </p>

        <motion.button 
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={openAuthModal}
          className="btn-primary py-4 px-10 text-lg font-bold shadow-2xl shadow-accent1/20"
        >
          Join QalaKart
        </motion.button>
      </motion.div>
    </div>
  );
};

export default Landing;
