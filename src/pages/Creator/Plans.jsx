import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Check, Zap, Sparkles, Star, QrCode, ShieldCheck, X } from 'lucide-react';
import useAuthStore from '../../store/authStore';
import { useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';

const Plans = () => {
  const { setSubscribed, isSubscribed } = useAuthStore();
  const navigate = useNavigate();
  const [selectedPlan, setSelectedPlan] = useState(null);
  const [showQR, setShowQR] = useState(false);

  // If already subscribed, redirect to dashboard
  React.useEffect(() => {
    if (isSubscribed) {
      navigate('/creator/dashboard', { replace: true });
    }
  }, [isSubscribed, navigate]);

  const handleSubscribe = () => {
    setSubscribed();
    setShowQR(false);
    toast.success(`Payment successful! Creator Dashboard Unlocked.`);
    navigate('/creator/dashboard', { replace: true });
  };

  const plans = [
    {
      id: 'p1',
      name: 'Starter Creator',
      price: '₹199',
      period: '/month',
      offer: 'FREE for first 3 months',
      icon: <Zap className="w-8 h-8 text-accent1" />,
      features: ['Sell your products', 'Standard visibility', 'Basic Analytics'],
      color: 'bg-white/5',
      button: 'btn-outline'
    },
    {
      id: 'p2',
      name: 'Premium Creator',
      price: '₹399',
      period: '/month',
      offer: '₹199 for first 3 months',
      icon: <Star className="w-8 h-8 text-accent2" />,
      features: ['High Preference Listing', 'Monthly Advertisements', 'Priority Support', 'Advanced Sales Tools'],
      color: 'bg-accent2/10 border-accent2/30',
      button: 'btn-primary',
      popular: true
    },
    {
      id: 'p3',
      name: 'Bulk Power (Upcoming)',
      price: '₹1199',
      period: ' for 50 days',
      offer: 'Best for large inventories',
      icon: <Sparkles className="w-8 h-8 text-purple-400" />,
      features: ['Bulk Order Processing', 'Commission Free Selling', 'Featured in Spotlights', 'Custom Store URL'],
      color: 'bg-white/5 opacity-80',
      button: 'btn-outline',
      upcoming: true
    }
  ];

  return (
    <div className="max-w-6xl mx-auto py-12 px-6">
      <div className="text-center mb-16">
        <h1 className="text-4xl md:text-5xl font-black text-white mb-4">Launch Your <span className="neon-text">Creator Journey</span></h1>
        <p className="text-slate-400 max-w-2xl mx-auto">Choose a plan to start selling and growing your creative business on QalaKart.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        {plans.map((plan, idx) => (
          <motion.div
            key={plan.name}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: idx * 0.1 }}
            className={`relative p-8 rounded-3xl border border-white/5 flex flex-col ${plan.color} hover:border-white/10 transition-all group`}
          >
            {plan.popular && (
              <div className="absolute -top-4 left-1/2 -translate-x-1/2 px-4 py-1 bg-accent2 text-black text-xs font-bold rounded-full uppercase tracking-widest">
                Most Popular
              </div>
            )}
            
            {plan.upcoming && (
              <div className="absolute top-4 right-4 px-3 py-1 bg-purple-500/20 text-purple-400 text-[10px] font-bold rounded-full uppercase tracking-widest border border-purple-500/30">
                Coming Soon
              </div>
            )}

            <div className="mb-6">{plan.icon}</div>
            <h3 className="text-2xl font-bold text-white mb-1">{plan.name}</h3>
            <div className="text-accent1 text-sm font-bold mb-4 uppercase tracking-tighter">{plan.offer}</div>
            
            <div className="flex items-baseline gap-1 mb-8">
              <span className="text-4xl font-black text-white">{plan.price}</span>
              <span className="text-slate-500 text-sm">{plan.period}</span>
            </div>

            <div className="space-y-4 mb-10 flex-1">
              {plan.features.map((feature) => (
                <div key={feature} className="flex items-center gap-3 text-slate-300">
                  <div className="w-5 h-5 rounded-full bg-accent1/10 flex items-center justify-center shrink-0">
                    <Check className="w-3 h-3 text-accent1" />
                  </div>
                  <span className="text-sm">{feature}</span>
                </div>
              ))}
            </div>

            <button 
              onClick={() => {
                if (plan.upcoming) {
                  toast('Coming soon! We will notify you.', { icon: '⏳' });
                } else {
                  setSelectedPlan(plan);
                  setShowQR(true);
                }
              }}
              className={`${plan.button} w-full flex items-center justify-center gap-2`}
            >
              {plan.upcoming ? 'Notify Me' : 'Activate Plan'}
            </button>
          </motion.div>
        ))}
      </div>

      {/* QR Modal */}
      <AnimatePresence>
        {showQR && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-6 bg-black/80 backdrop-blur-sm">
            <motion.div 
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="glass-card max-w-sm w-full p-8 rounded-3xl relative text-center"
            >
              <button onClick={() => setShowQR(false)} className="absolute top-4 right-4 text-slate-500 hover:text-white">
                <X />
              </button>

              <div className="mb-6">
                <div className="w-16 h-16 rounded-2xl bg-accent2/10 flex items-center justify-center text-accent2 mx-auto mb-4">
                  <QrCode className="w-10 h-10" />
                </div>
                <h3 className="text-2xl font-bold text-white mb-2">Scan to Pay</h3>
                <p className="text-slate-400 text-sm">Scan this QR with any UPI app to activate your <span className="text-accent2 font-bold">{selectedPlan?.name}</span></p>
              </div>

              {/* Simulated QR Code */}
              <div className="bg-white p-4 rounded-2xl mb-8 mx-auto w-48 h-48 flex items-center justify-center border-4 border-accent2">
                <div className="grid grid-cols-4 gap-1 opacity-80">
                   {[...Array(16)].map((_, i) => (
                     <div key={i} className={`w-8 h-8 ${Math.random() > 0.5 ? 'bg-black' : 'bg-gray-200'}`} />
                   ))}
                </div>
              </div>

              <div className="space-y-4">
                <div className="p-4 rounded-xl bg-accent1/10 border border-accent1/20 flex items-center gap-3 text-left">
                  <ShieldCheck className="w-5 h-5 text-accent1 shrink-0" />
                  <p className="text-xs text-slate-300">Secure UPI payment. Your subscription will be activated instantly upon confirmation.</p>
                </div>
                
                <button onClick={handleSubscribe} className="w-full btn-primary py-4 text-lg font-bold">
                  Confirm Payment
                </button>
                <p className="text-[10px] text-slate-500 uppercase tracking-widest font-bold">Verification: One-time per login</p>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default Plans;
