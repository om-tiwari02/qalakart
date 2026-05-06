import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Sparkles, Send, ShieldCheck, Info, Gift, CheckCircle2 } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';

const DemandDrop = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    title: '',
    requirement: '',
    budget: '',
    category: 'Handmade Crafts',
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    toast.success('Demand dropped! Creators in your city will be notified.');
    setTimeout(() => {
      navigate('/');
    }, 2000);
  };

  return (
    <div className="max-w-4xl mx-auto py-12 px-6">
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="text-center mb-12"
      >
        <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-accent2/10 border border-accent2/20 text-accent2 text-sm font-medium mb-6">
          <Sparkles className="w-4 h-4" />
          <span>Post Your Requirement</span>
        </div>
        <h1 className="text-4xl md:text-5xl font-black mb-4">Request a <span className="neon-text">Custom Piece</span></h1>
        <p className="text-slate-400">Can't find what you need? Describe it here and let our creators build it for you.</p>
      </motion.div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2">
          <form onSubmit={handleSubmit} className="glass-card p-8 rounded-3xl space-y-6">
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-bold text-slate-300 mb-2">What do you want created?</label>
                <input 
                  type="text" 
                  placeholder="e.g. Ocean Theme Resin Table" 
                  className="w-full bg-white/5 border border-white/10 rounded-2xl px-4 py-4 text-white focus:outline-none focus:border-accent2 transition-colors"
                  required
                />
              </div>
              
              <div>
                <label className="block text-sm font-bold text-slate-300 mb-2">Details & Specifications</label>
                <textarea 
                  rows="5" 
                  placeholder="Describe dimensions, colors, materials, and any special requests..." 
                  className="w-full bg-white/5 border border-white/10 rounded-2xl px-4 py-4 text-white focus:outline-none focus:border-accent2 transition-colors resize-none"
                  required
                ></textarea>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-bold text-slate-300 mb-2">Approx. Budget (₹)</label>
                  <input 
                    type="number" 
                    placeholder="1500" 
                    className="w-full bg-white/5 border border-white/10 rounded-2xl px-4 py-4 text-white focus:outline-none focus:border-accent2 transition-colors"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-bold text-slate-300 mb-2">Category</label>
                  <select className="w-full bg-white/5 border border-white/10 rounded-2xl px-4 py-4 text-white focus:outline-none focus:border-accent2 transition-colors appearance-none">
                    <option>Handmade Crafts</option>
                    <option>Paintings</option>
                    <option>Digital Art</option>
                    <option>Home Decor</option>
                  </select>
                </div>
              </div>
            </div>

            <button type="submit" className="w-full btn-primary py-5 text-lg font-bold flex items-center justify-center gap-3">
              <Send className="w-5 h-5" />
              Pay ₹69 & Drop Demand
            </button>
          </form>
        </div>

        <div className="space-y-6">
          <div className="glass-card p-6 rounded-3xl border border-accent2/20 bg-accent2/5 relative overflow-hidden">
            <h3 className="text-xl font-bold text-white mb-6 flex items-center gap-2">
              <ShieldCheck className="text-accent2" />
              Fee Structure
            </h3>
            
            <div className="space-y-6">
              <div className="flex gap-4">
                <div className="w-10 h-10 rounded-xl bg-white/5 flex items-center justify-center text-accent1 shrink-0">
                  <Gift className="w-5 h-5" />
                </div>
                <div>
                  <h4 className="text-sm font-bold text-white mb-1">100% Refundable</h4>
                  <p className="text-xs text-slate-400">The ₹69 fee is fully refundable if no creator picks your request within 48 hours.</p>
                </div>
              </div>

              <div className="flex gap-4">
                <div className="w-10 h-10 rounded-xl bg-white/5 flex items-center justify-center text-accent2 shrink-0">
                  <CheckCircle2 className="w-5 h-5" />
                </div>
                <div>
                  <h4 className="text-sm font-bold text-white mb-1">Price Adjustment</h4>
                  <p className="text-xs text-slate-400">₹55 will be directly adjusted into the final product price when you place the order.</p>
                </div>
              </div>

              <div className="flex gap-4">
                <div className="w-10 h-10 rounded-xl bg-white/5 flex items-center justify-center text-purple-400 shrink-0">
                  <Info className="w-5 h-5" />
                </div>
                <div>
                  <h4 className="text-sm font-bold text-white mb-1">Rejection Coupon</h4>
                  <p className="text-xs text-slate-400">If your demand is rejected by creators, the fee converts into a flat ₹69 discount coupon for your next purchase.</p>
                </div>
              </div>
            </div>
            
            {/* Background Glow */}
            <div className="absolute -right-12 -bottom-12 w-32 h-32 bg-accent2 opacity-5 blur-3xl" />
          </div>

          <div className="p-6 rounded-3xl bg-white/5 border border-white/5">
            <h4 className="text-sm font-bold text-slate-300 mb-4 uppercase tracking-widest text-center">Contact Support</h4>
            <div className="space-y-3">
              <div className="flex items-center justify-between text-xs">
                <span className="text-slate-500">Gmail:</span>
                <span className="text-white">som91094@gmail.com</span>
              </div>
              <div className="flex items-center justify-between text-xs">
                <span className="text-slate-500">Instagram:</span>
                <span className="text-white">@qalakart_0206</span>
              </div>
              <div className="flex items-center justify-between text-xs">
                <span className="text-slate-500">Support:</span>
                <span className="text-white">Live Chat Available</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DemandDrop;
