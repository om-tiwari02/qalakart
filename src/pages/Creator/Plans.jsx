import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Check, Zap, Sparkles, Star, ShieldCheck, X } from 'lucide-react';
import useAuthStore from '../../store/authStore';
import { useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import { client } from '../../lib/api/client';

const PLANS = [
  {
    id: 'p1',
    name: 'Starter Creator',
    price: '₹199',
    amount: 199,
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
    amount: 399,
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
    amount: 1199,
    period: ' for 50 days',
    offer: 'Best for large inventories',
    icon: <Sparkles className="w-8 h-8 text-purple-400" />,
    features: ['Bulk Order Processing', 'Commission Free Selling', 'Featured in Spotlights', 'Custom Store URL'],
    color: 'bg-white/5 opacity-80',
    button: 'btn-outline',
    upcoming: true
  }
];

const DEMO_GST_NUMBER = '07AABCU9603R1ZV';

const loadRazorpayCheckout = () =>
  new Promise((resolve, reject) => {
    if (window.Razorpay) {
      resolve(true);
      return;
    }

    const script = document.createElement('script');
    script.src = 'https://checkout.razorpay.com/v1/checkout.js';
    script.onload = () => resolve(true);
    script.onerror = () => reject(new Error('Unable to load Razorpay checkout'));
    document.body.appendChild(script);
  });

const Plans = () => {
  const { setSubscribed, isSubscribed, user } = useAuthStore();
  const navigate = useNavigate();
  const [selectedPlan, setSelectedPlan] = useState(null);
  const [showCheckout, setShowCheckout] = useState(false);
  const [panNumber, setPanNumber] = useState('');
  const [isPaying, setIsPaying] = useState(false);
  const [isSimulating, setIsSimulating] = useState(false);

  React.useEffect(() => {
    if (isSubscribed) {
      navigate('/creator/dashboard', { replace: true });
    }
  }, [isSubscribed, navigate]);

  const validatePAN = (value) => {
    const normalized = value.trim().toUpperCase();
    return /^[A-Z]{5}[0-9]{4}[A-Z]{1}$/.test(normalized);
  };

  const handleOpenPlan = (plan) => {
    setSelectedPlan(plan);
    setPanNumber('');
    setShowCheckout(true);
  };

  const handlePaymentSuccess = async () => {
    setSubscribed();
    setShowCheckout(false);
    toast.success('Payment successful! Creator Dashboard unlocked.');
    navigate('/creator/dashboard', { replace: true });
  };

  const handleSimulatedPayment = async () => {
    if (!selectedPlan) return;
    if (!validatePAN(panNumber)) {
      toast.error('Please enter a valid PAN number.');
      return;
    }

    setIsSimulating(true);
    const toastId = toast.loading('Initiating secure payment simulation...');
    try {
      await new Promise((resolve) => setTimeout(resolve, 1000));
      
      toast.loading('Processing with Sandbox Bank...', { id: toastId });
      await new Promise((resolve) => setTimeout(resolve, 1000));

      toast.loading('Upgrading account on server...', { id: toastId });
      await client.post('/payments/simulate-success');

      toast.dismiss(toastId);
      await handlePaymentSuccess();
    } catch (err) {
      toast.dismiss(toastId);
      toast.error(err.response?.data?.error?.message || err.message || 'Payment simulation failed');
    } finally {
      setIsSimulating(false);
    }
  };

  const handleCheckout = async () => {
    if (!selectedPlan) return;
    if (!validatePAN(panNumber)) {
      toast.error('Please enter a valid PAN number.');
      return;
    }

    setIsPaying(true);
    try {
      await loadRazorpayCheckout();

      const [{ data: configResponse }, { data: orderResponse }] = await Promise.all([
        client.get('/payments/config'),
        client.post('/payments/razorpay/orders', {
          amount: selectedPlan.amount,
          currency: 'INR',
          notes: {
            source: 'creator-subscription',
            planName: selectedPlan.name,
            panNumber: panNumber.trim().toUpperCase(),
            gstNumber: DEMO_GST_NUMBER
          }
        })
      ]);

      const razorpay = new window.Razorpay({
        key: configResponse.data.keyId,
        amount: orderResponse.data.amount,
        currency: orderResponse.data.currency,
        name: 'QalaKart Creator Plan',
        description: `${selectedPlan.name} Subscription`,
        order_id: orderResponse.data.id,
        prefill: {
          name: user?.name || '',
          email: user?.email || '',
          contact: user?.phone || ''
        },
        theme: { color: '#fcd34d' },
        handler: async (response) => {
          try {
            await client.post('/payments/razorpay/verify', response);
            await handlePaymentSuccess();
          } catch (err) {
            toast.error(err.response?.data?.error?.message || 'Payment verification failed');
          } finally {
            setIsPaying(false);
          }
        },
        modal: {
          ondismiss: () => setIsPaying(false)
        }
      });

      razorpay.open();
    } catch (err) {
      setIsPaying(false);
      toast.error(err.response?.data?.error?.message || err.message || 'Unable to start Razorpay payment');
    }
  };

  return (
    <div className="max-w-6xl mx-auto py-12 px-6">
      <div className="text-center mb-16">
        <h1 className="text-4xl md:text-5xl font-black text-white mb-4">Launch Your <span className="neon-text">Creator Journey</span></h1>
        <p className="text-slate-400 max-w-2xl mx-auto">Choose a plan to start selling and growing your creative business on QalaKart.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        {PLANS.map((plan, idx) => (
          <motion.div
            key={plan.id}
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
                  handleOpenPlan(plan);
                }
              }}
              className={`${plan.button} w-full flex items-center justify-center gap-2`}
            >
              {plan.upcoming ? 'Notify Me' : 'Activate Plan'}
            </button>
          </motion.div>
        ))}
      </div>

      <AnimatePresence>
        {showCheckout && selectedPlan && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-6 bg-black/80 backdrop-blur-sm">
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="glass-card max-w-lg w-full p-8 rounded-3xl relative text-center"
            >
              <button onClick={() => setShowCheckout(false)} className="absolute top-4 right-4 text-slate-500 hover:text-white">
                <X />
              </button>

              <div className="mb-6">
                <div className="w-16 h-16 rounded-2xl bg-accent2/10 flex items-center justify-center text-accent2 mx-auto mb-4">
                  <ShieldCheck className="w-10 h-10" />
                </div>
                <h3 className="text-2xl font-bold text-white mb-2">Activate {selectedPlan.name}</h3>
                <p className="text-slate-400 text-sm">Enter your PAN details to continue with Razorpay checkout.</p>
              </div>

              <div className="space-y-4 mb-8 text-left">
                <label className="block text-sm font-semibold text-slate-300">PAN Number</label>
                <input
                  type="text"
                  value={panNumber}
                  maxLength={10}
                  onChange={(e) => setPanNumber(e.target.value.toUpperCase())}
                  placeholder="ABCDE1234F"
                  className="w-full bg-surface/60 border border-white/10 rounded-2xl p-4 text-white placeholder:text-slate-500 focus:outline-none focus:border-accent1 transition-colors"
                />
                <p className="text-xs text-slate-500">PAN is required for creator subscription activation.</p>
              </div>

              <div className="flex flex-col gap-3">
                <button
                  disabled={isPaying || isSimulating}
                  onClick={handleCheckout}
                  className="w-full btn-primary py-4 text-lg font-bold disabled:opacity-60"
                >
                  {isPaying ? 'Opening Razorpay...' : `Pay ₹${selectedPlan.amount}`}
                </button>

                <button
                  disabled={isPaying || isSimulating}
                  onClick={handleSimulatedPayment}
                  className="w-full btn-outline py-4 text-lg font-bold disabled:opacity-60 border-dashed border-accent1/30 hover:border-accent1 text-accent1 hover:bg-accent1/5"
                >
                  {isSimulating ? 'Simulating Transaction...' : 'Simulate Payment (Sandbox)'}
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default Plans;
