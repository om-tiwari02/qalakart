import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  TrendingUp, 
  Users, 
  Package, 
  DollarSign,
  Plus,
  MessageSquare,
  Clock,
  ChevronRight,
  Zap,
  Camera,
  Coins,
  ShieldCheck,
  AlertCircle,
  Star,
  Headphones,
  Phone,
  Mail,
  FileText,
  Truck,
  CreditCard,
  Calendar,
  X,
  ExternalLink,
  Edit3,
  Check,
  Image as ImageIcon,
  ArrowRight,
  Info,
  ArrowLeft
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import useAuthStore from '../../store/authStore';
import toast from 'react-hot-toast';
import { client } from '../../lib/api/client';
import { productService } from '../../services/productService';

const InstagramIcon = ({ className }) => (
  <svg 
    viewBox="0 0 24 24" 
    fill="none" 
    stroke="currentColor" 
    strokeWidth="2" 
    strokeLinecap="round" 
    strokeLinejoin="round" 
    className={className}
  >
    <rect x="2" y="2" width="20" height="20" rx="5" ry="5"></rect>
    <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z"></path>
    <line x1="17.5" y1="6.5" x2="17.51" y2="6.5"></line>
  </svg>
);

const Dashboard = () => {
  const { user } = useAuthStore();
  const navigate = useNavigate();
  const [activeModal, setActiveModal] = React.useState(null);
  const [isAddProductModalOpen, setIsAddProductModalOpen] = React.useState(false);
  const [showGrowthModal, setShowGrowthModal] = React.useState(false);
  const [deadlines, setDeadlines] = React.useState({}); // orderId -> date

  const [products, setProducts] = React.useState([]);
  const [isLoadingProducts, setIsLoadingProducts] = React.useState(true);

  const fetchCreatorProducts = React.useCallback(async () => {
    if (!user?.id && !user?._id) return;
    setIsLoadingProducts(true);
    try {
      const { data } = await client.get('/products', {
        params: {
          userId: user.id || user._id,
          limit: 100
        }
      });
      setProducts(data.data || []);
    } catch (err) {
      toast.error('Failed to fetch listed products');
    } finally {
      setIsLoadingProducts(false);
    }
  }, [user]);

  React.useEffect(() => {
    fetchCreatorProducts();
  }, [fetchCreatorProducts]);

  const handleSetDeadline = (orderId, date) => {
    if (deadlines[orderId]) return; // Only set once
    setDeadlines({ ...deadlines, [orderId]: date });
    toast.success('Deadline locked successfully!');
  };

  const [newProduct, setNewProduct] = React.useState({
    name: '',
    description: '',
    price: '',
    category: '',
    timeline: '3',
    address: '',
    images: []
  });

  const handleProductImageUpload = async (e) => {
    const files = Array.from(e.target.files || []);
    if (newProduct.images.length + files.length > 5) {
      toast.error('Maximum 5 images allowed');
      return;
    }

    const toastId = toast.loading('Uploading images...');
    try {
      const formData = new FormData();
      files.forEach((file) => {
        formData.append('images', file);
      });

      const { data } = await client.post('/upload', formData, {
        headers: {
          'Content-Type': 'multipart/form-data'
        }
      });

      const newUrls = data.data.imageUrls;
      setNewProduct(prev => ({ ...prev, images: [...prev.images, ...newUrls] }));
      toast.success('Images uploaded successfully!', { id: toastId });
    } catch (err) {
      toast.error(err.response?.data?.error?.message || err.message || 'Image upload failed', { id: toastId });
    }
  };

  const handleAddProductSubmit = async (e) => {
    e.preventDefault();
    if (newProduct.images.length === 0) {
      toast.error('Please upload at least one image');
      return;
    }

    const toastId = toast.loading('Listing your product...');
    try {
      await client.post('/products', {
        title: newProduct.name,
        description: newProduct.description,
        price: Number(newProduct.price),
        category: newProduct.category,
        images: newProduct.images
      });

      toast.success('✨ Product listed successfully! It will be live after a quick review.', { id: toastId });
      setIsAddProductModalOpen(false);
      setNewProduct({ name: '', description: '', price: '', category: '', timeline: '3', address: '', images: [] });
      fetchCreatorProducts();
    } catch (err) {
      toast.error(err.response?.data?.error?.message || err.message || 'Failed to list product', { id: toastId });
    }
  };

  const stats = [
    { id: 'pending', label: 'Pending Orders', value: '4', icon: <Clock />, color: 'from-blue-500/20 to-cyan-500/20', text: 'text-blue-400' },
    { id: 'active_orders', label: 'Order Tracking', value: '3 Active', icon: <Truck />, color: 'from-amber-500/20 to-orange-500/20', text: 'text-amber-400' },
    { id: 'subscription', label: 'Subscription Period', value: '24 Days Left', icon: <Calendar />, color: 'from-purple-500/20 to-indigo-500/20', text: 'text-purple-400' },
    { id: 'reviews', label: 'Customer Reviews', value: '4.8/5', icon: <Star />, color: 'from-yellow-500/20 to-orange-500/20', text: 'text-yellow-400' },
    { id: 'coins', label: 'QalaCoins Earned', value: user?.qalaCoins || '450', icon: <Coins />, color: 'from-accent1/20 to-emerald-500/20', text: 'text-accent1' },
    { id: 'pay_success', label: 'Payment Successful', value: '₹24,500', icon: <ShieldCheck />, color: 'from-green-500/20 to-emerald-500/20', text: 'text-green-400' },
    { id: 'pay_pending', label: 'Payment Pending', value: '₹1,200', icon: <CreditCard />, color: 'from-red-500/20 to-orange-500/20', text: 'text-red-400' },
    { id: 'demands', label: 'Active Demands', value: '3', icon: <MessageSquare />, color: 'from-accent2/20 to-blue-500/20', text: 'text-accent2' },
    { id: 'products', label: 'My Products', value: isLoadingProducts ? 'Loading...' : `${products.length} Items`, icon: <Package />, color: 'from-pink-500/20 to-rose-500/20', text: 'text-pink-400' },
    { id: 'customs', label: 'Customization Requests', value: '2 New', icon: <FileText />, color: 'from-indigo-500/20 to-blue-500/20', text: 'text-indigo-400' },
  ];

  const DetailModal = ({ type, onClose }) => {
    const getContent = () => {
      switch(type) {
        case 'pending':
          return (
            <div className="space-y-4">
              {[
                { id: 'ORD-5521', product: 'Nebula Resin Clock', price: '₹1,200', buyer: 'Rahul V.', date: '22 Apr' },
                { id: 'ORD-5522', product: 'Custom Sketch', price: '₹800', buyer: 'Sonia M.', date: '22 Apr' },
              ].map(order => (
                <div key={order.id} className="glass-card p-4 rounded-2xl border border-white/5 border-white/10 transition-all">
                  <div className="flex justify-between items-start mb-3">
                    <div>
                      <h4 className="text-white font-bold">{order.product}</h4>
                      <p className="text-xs text-slate-500">Order #{order.id} • {order.buyer}</p>
                    </div>
                    <span className="text-accent1 font-bold">{order.price}</span>
                  </div>
                  <div className="flex items-center gap-3">
                    {deadlines[order.id] ? (
                      <div className="flex items-center gap-2 text-xs text-green-400 font-bold bg-green-400/10 px-3 py-1.5 rounded-lg">
                        <Check className="w-3 h-3" />
                        Deadline: {deadlines[order.id]}
                      </div>
                    ) : (
                      <div className="flex items-center gap-2 flex-1">
                        <input 
                          type="date" 
                          className="bg-white/5 border border-white/10 rounded-lg px-3 py-1.5 text-xs text-white focus:outline-none"
                          onBlur={(e) => e.target.value && handleSetDeadline(order.id, e.target.value)}
                        />
                        <span className="text-[10px] text-slate-500 uppercase font-bold">Set once</span>
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          );
        case 'active_orders':
          return (
            <div className="space-y-4">
              {[
                { id: 'ORD-4401', product: 'Ocean Table top', status: 'Shipped', progress: 75 },
                { id: 'ORD-4402', product: 'Wooden Lamp', status: 'Confirmed', progress: 40 },
              ].map(order => (
                <div key={order.id} className="glass-card p-4 rounded-2xl">
                  <div className="flex justify-between items-center mb-2">
                    <span className="text-white font-bold">{order.product}</span>
                    <span className="text-xs text-amber-400 font-bold">{order.status}</span>
                  </div>
                  <div className="h-1.5 bg-white/5 rounded-full overflow-hidden">
                    <div className="h-full bg-amber-400" style={{ width: `${order.progress}%` }} />
                  </div>
                </div>
              ))}
            </div>
          );
        case 'reviews':
          return (
            <div className="space-y-4">
              {[
                { product: 'Nebula Clock', reviews: 24, rating: 4.8 },
                { product: 'Custom Sketch', reviews: 12, rating: 4.9 },
              ].map(p => (
                <div key={p.product} className="glass-card p-4 rounded-2xl flex justify-between items-center">
                  <div>
                    <h4 className="text-white font-bold">{p.product}</h4>
                    <p className="text-xs text-slate-500">{p.reviews} Reviews Received</p>
                  </div>
                  <div className="flex items-center gap-1 text-yellow-400">
                    <Star className="w-3 h-3 fill-current" />
                    <span className="font-bold">{p.rating}</span>
                  </div>
                </div>
              ))}
            </div>
          );
        case 'coins':
          return (
            <div className="space-y-4">
              {[
                { product: 'Nebula Clock', coins: 150, sales: 5 },
                { product: 'Custom Sketch', coins: 300, sales: 3 },
              ].map(p => (
                <div key={p.product} className="glass-card p-4 rounded-2xl flex justify-between items-center">
                  <div>
                    <h4 className="text-white font-bold">{p.product}</h4>
                    <p className="text-xs text-slate-500">{p.sales} Sales</p>
                  </div>
                  <div className="flex items-center gap-1 text-accent1">
                    <Coins className="w-4 h-4" />
                    <span className="font-bold">{p.coins}</span>
                  </div>
                </div>
              ))}
            </div>
          );
        case 'pay_success':
          return (
            <div className="space-y-3">
              {[
                { id: 'TXN-9901', product: 'Resin Table', amount: '₹8,500', date: '21 Apr' },
                { id: 'TXN-9902', product: 'Keychain Set', amount: '₹450', date: '20 Apr' },
              ].map(txn => (
                <div key={txn.id} className="flex items-center justify-between p-3 rounded-xl bg-green-400/5 border border-green-400/10">
                  <div>
                    <p className="text-white text-sm font-bold">{txn.product}</p>
                    <p className="text-[10px] text-slate-500">{txn.id} • {txn.date}</p>
                  </div>
                  <span className="text-green-400 font-bold">{txn.amount}</span>
                </div>
              ))}
            </div>
          );
        case 'pay_pending':
          return (
            <div className="space-y-3">
              {[
                { product: 'Portrait Sketch', amount: '₹800', status: 'Verifying' },
                { product: 'Wooden Coasters', amount: '₹400', status: 'Payment Initiated' },
              ].map(p => (
                <div key={p.product} className="flex items-center justify-between p-3 rounded-xl bg-red-400/5 border border-red-400/10">
                  <div>
                    <p className="text-white text-sm font-bold">{p.product}</p>
                    <p className="text-[10px] text-slate-500">{p.status}</p>
                  </div>
                  <span className="text-red-400 font-bold">{p.amount}</span>
                </div>
              ))}
            </div>
          );
        case 'demands':
          return (
            <div className="space-y-4">
              {[
                { buyer: 'Amit S.', req: 'Ocean theme resin clock, 12 inch', budget: '₹1,500' },
                { buyer: 'Neha K.', req: 'Handpainted terracotta pots (3)', budget: '₹900' },
              ].map(d => (
                <div key={d.buyer} className="glass-card p-4 rounded-2xl border border-white/5">
                  <div className="flex justify-between items-center mb-2">
                    <span className="text-white font-bold">{d.buyer}</span>
                    <span className="text-accent2 font-bold">{d.budget}</span>
                  </div>
                  <p className="text-xs text-slate-400 leading-relaxed">{d.req}</p>
                  <button className="w-full mt-3 py-2 rounded-xl bg-white/5 text-xs font-bold text-white hover:bg-white/10 transition-colors">Submit Offer</button>
                </div>
              ))}
            </div>
          );
        case 'products':
          return (
            <div className="grid grid-cols-2 gap-4">
              {isLoadingProducts ? (
                <div className="col-span-2 text-center text-slate-400">Loading your products...</div>
              ) : products.length === 0 ? (
                <div className="col-span-2 text-center text-slate-400">You haven't listed any products yet.</div>
              ) : (
                products.map(p => (
                  <div key={p._id || p.id} className="glass-card p-4 rounded-2xl text-center flex flex-col justify-between">
                    <div>
                      {p.images && p.images[0] && (
                        <img 
                          src={productService.getImageUrl(p.images[0])} 
                          alt={p.title} 
                          className="w-full h-24 object-cover rounded-xl mb-2 border border-white/5" 
                        />
                      )}
                      <p className="text-white font-bold text-sm mb-1 line-clamp-1">{p.title}</p>
                      <p className="text-xs text-slate-500 mb-2">Category: <span className="text-accent1 font-bold">{p.category}</span></p>
                    </div>
                    <span className="text-xs font-bold text-white">₹{p.price}</span>
                  </div>
                ))
              )}
            </div>
          );
        case 'customs':
          return (
            <div className="space-y-4">
              {[
                { id: 'CUST-01', product: 'Resin Table', instruction: 'Use more golden flakes in the middle', image: 'https://images.unsplash.com/photo-1579546929518-9e396f3cc809' },
                { id: 'CUST-02', product: 'Wall Art', instruction: 'Background should be matte black', image: 'https://images.unsplash.com/photo-1513364776144-60967b0f800f' },
              ].map(c => (
                <div key={c.id} className="glass-card p-4 rounded-2xl border border-white/5">
                  <div className="flex gap-4">
                    <img src={c.image} alt="ref" className="w-20 h-20 rounded-xl object-cover border border-white/10" />
                    <div className="flex-1">
                      <h4 className="text-white font-bold text-sm mb-1">{c.product}</h4>
                      <p className="text-[10px] text-slate-500 uppercase font-bold mb-2">Request #{c.id}</p>
                      <p className="text-xs text-slate-400 italic">"{c.instruction}"</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          );
        default:
          return <p className="text-slate-400">Section details coming soon...</p>;
      }
    };

    const title = stats.find(s => s.id === type)?.label || 'Details';

    return (
      <div className="fixed inset-0 z-[100] flex items-center justify-center p-6 bg-black/80 backdrop-blur-md">
        <motion.div 
          initial={{ scale: 0.9, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          exit={{ scale: 0.9, opacity: 0 }}
          className="glass-card max-w-lg w-full max-h-[80vh] overflow-hidden flex flex-col rounded-[2.5rem] border border-white/10 shadow-2xl"
        >
          <div className="p-6 border-b border-white/5 flex items-center justify-between bg-white/5">
            <h3 className="text-xl font-outfit font-black text-white uppercase tracking-tighter">{title}</h3>
            <button onClick={onClose} className="p-2 rounded-full hover:bg-white/10 transition-colors text-slate-400 hover:text-white">
              <X className="w-6 h-6" />
            </button>
          </div>
          <div className="p-6 overflow-y-auto hide-scrollbar flex-1">
            {getContent()}
          </div>
        </motion.div>
      </div>
    );
  };

  const contactOptions = [
    { label: 'Contact Admin', icon: <Headphones className="w-5 h-5" />, sub: 'Live Chat Support' },
    { label: 'Mobile Support', icon: <Phone className="w-5 h-5" />, sub: '8305480316', isMobile: true },
    { label: 'Instagram', icon: <InstagramIcon className="w-5 h-5" />, sub: '@qalakart_0206' },
    { label: 'Gmail', icon: <Mail className="w-5 h-5" />, sub: 'som91094@gmail.com' },
  ];

  return (
    <div className="max-w-7xl mx-auto py-8 px-6">
      {/* Back Button */}
      <button 
        onClick={() => navigate(-1)}
        className="flex items-center gap-2 text-slate-400 hover:text-white transition-colors mb-6 group"
      >
        <div className="w-8 h-8 rounded-full bg-white/5 flex items-center justify-center group-hover:bg-white/10 transition-colors">
          <ArrowLeft className="w-4 h-4" />
        </div>
        <span className="text-sm font-bold uppercase tracking-wider">Back</span>
      </button>
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-12">
        <div>
          <h1 className="text-4xl font-outfit font-black text-white mb-1 uppercase tracking-tighter">Creator Dashboard</h1>
          <p className="text-slate-400">Welcome back, {user?.name}! Your creative business at a glance.</p>
        </div>
        <div className="flex items-center gap-4">
          <button 
            onClick={() => setIsAddProductModalOpen(true)}
            className="btn-outline flex items-center gap-2"
          >
            <Plus className="w-5 h-5" />
            <span>Add Product</span>
          </button>
          <button onClick={() => setShowGrowthModal(true)} className="btn-primary flex items-center gap-2 shadow-lg shadow-accent1/10">
            <TrendingUp className="w-5 h-5" />
            <span>Growth Tools</span>
          </button>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
        {stats.map((stat, idx) => (
          <motion.div
            key={stat.label}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: idx * 0.05 }}
            onClick={() => setActiveModal(stat.id)}
            className={`p-6 rounded-3xl bg-gradient-to-br ${stat.color} border border-white/5 relative overflow-hidden group hover:border-white/10 transition-colors shadow-xl cursor-pointer`}
          >
            <div className={`w-12 h-12 rounded-2xl bg-white/5 flex items-center justify-center ${stat.text} mb-4 transform group-hover:scale-110 transition-transform`}>
              {stat.icon}
            </div>
            <div className="text-3xl font-black text-white mb-1">{stat.value}</div>
            <div className="text-xs text-slate-400 font-bold uppercase tracking-widest">{stat.label}</div>
            <div className="absolute top-0 right-0 p-4 opacity-5 group-hover:opacity-10 transition-opacity">
              {React.cloneElement(stat.icon, { className: 'w-24 h-24' })}
            </div>
          </motion.div>
        ))}
      </div>

      <AnimatePresence>
        {activeModal && (
          <DetailModal type={activeModal} onClose={() => setActiveModal(null)} />
        )}
        {isAddProductModalOpen && (
          <AddProductModal 
            onClose={() => setIsAddProductModalOpen(false)} 
            onSubmit={handleAddProductSubmit}
            newProduct={newProduct}
            setNewProduct={setNewProduct}
            handleImageUpload={handleProductImageUpload}
          />
        )}
        {showGrowthModal && (
          <GrowthModal onClose={() => setShowGrowthModal(false)} />
        )}
      </AnimatePresence>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-12">
        {/* Customer Reviews Section */}
        <div className="lg:col-span-2 space-y-6">
          <div className="flex items-center justify-between">
            <h2 className="text-2xl font-black text-white flex items-center gap-3">
              <Star className="text-accent2" />
              Customer Reviews
            </h2>
            <button className="text-sm text-accent2 hover:underline font-bold" onClick={() => setActiveModal('reviews')}>View All</button>
          </div>
          
          <div className="glass-card rounded-3xl p-6 space-y-6 border border-white/5">
            {[1, 2].map((review, idx) => (
              <div key={idx} className="flex gap-4 p-4 rounded-2xl bg-white/5 border border-white/5 hover:bg-white/10 transition-colors">
                <div className="w-12 h-12 rounded-full bg-accent1/10 flex items-center justify-center shrink-0">
                  <Users className="w-6 h-6 text-accent1" />
                </div>
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <span className="font-bold text-white">Rahul Verma</span>
                    <div className="flex gap-0.5">
                      {[...Array(5)].map((_, i) => <Star key={i} className="w-3 h-3 fill-accent2 text-accent2" />)}
                    </div>
                  </div>
                  <p className="text-sm text-slate-400">"The Nebula Clock is absolutely stunning. Perfect finishing and packaging was very secure. Highly recommended creator!"</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Support & Contact Section */}
        <div className="space-y-6">
          <h2 className="text-2xl font-black text-white flex items-center gap-3">
            <Headphones className="text-accent1" />
            Support Hub
          </h2>
          <div className="grid grid-cols-1 gap-4">
            {contactOptions.map((opt) => (
              <div key={opt.label} className="glass-card p-5 rounded-2xl border border-white/5 hover:border-accent1/30 transition-all flex items-center gap-4 cursor-pointer group">
                <div className="w-10 h-10 rounded-xl bg-white/5 flex items-center justify-center text-slate-400 group-hover:text-accent1 transition-colors">
                  {opt.icon}
                </div>
                <div>
                  <div className="font-bold text-white text-sm">{opt.label}</div>
                  <div className="text-xs text-slate-500">
                    {opt.sub}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

// ─────────────────────────── GROWTH TOOLS MODAL ──────────────────────────────
const GrowthModal = ({ onClose }) => {
  const options = [
    { title: 'Product Recommendation', price: '₹50', duration: '3 Days', desc: 'Boost your product visibility in recommendation sections.' },
    { title: 'Instagram Post Ad', price: '₹399', duration: 'Static Post', desc: 'Feature your product on QalaKart official Instagram page.' },
    { title: 'Instagram Reel Ad', price: '₹999', duration: 'Video Reel', desc: 'Premium ad reel showcasing your creation on Instagram.' },
  ];

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-6 bg-black/80 backdrop-blur-md" onClick={onClose}>
      <motion.div 
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.9, opacity: 0 }}
        className="glass-card max-w-lg w-full rounded-[2.5rem] border border-white/10 shadow-2xl relative overflow-hidden"
        onClick={e => e.stopPropagation()}
      >
        <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-accent1 to-accent2" />
        <div className="p-8">
          <div className="flex justify-between items-center mb-8">
            <div>
              <h3 className="text-2xl font-outfit font-black text-white uppercase tracking-tighter">Growth Tools</h3>
              <p className="text-xs text-slate-500 font-bold uppercase tracking-widest mt-1">Scale your creative business</p>
            </div>
            <button onClick={onClose} className="p-2 rounded-full hover:bg-white/10 text-slate-400 hover:text-white transition-colors">
              <X className="w-6 h-6" />
            </button>
          </div>

          <div className="grid grid-cols-1 gap-4 mb-10">
            {options.map((opt, idx) => (
              <div key={idx} className="glass-card p-5 rounded-2xl border border-white/5 bg-white/5 relative overflow-hidden">
                <div className="flex justify-between items-start mb-2">
                  <h4 className="text-white font-bold">{opt.title}</h4>
                  <span className="text-accent1 font-black text-xl">{opt.price}</span>
                </div>
                <p className="text-xs text-slate-400 mb-4 leading-relaxed max-w-[80%]">{opt.desc}</p>
                <div className="flex items-center gap-2 text-[10px] font-bold text-accent2 uppercase tracking-widest bg-accent2/10 px-3 py-1 rounded-full w-fit">
                  <Clock className="w-3 h-3" />
                  {opt.duration}
                </div>
                <div className="absolute top-1/2 right-4 -translate-y-1/2 opacity-20 grayscale">
                  {idx === 0 ? <Zap className="w-12 h-12" /> : <InstagramIcon className="w-12 h-12" />}
                </div>
              </div>
            ))}
          </div>

          <div className="text-center py-6 border-t border-white/10 bg-white/5 -mx-8 -mb-8 mt-2">
             <div className="flex items-center justify-center gap-3">
               <span className="h-px w-8 bg-white/10" />
               <span className="text-sm font-black text-white/40 uppercase tracking-[0.4em] animate-pulse">Coming Soon</span>
               <span className="h-px w-8 bg-white/10" />
             </div>
          </div>
        </div>
      </motion.div>
    </div>
  );
};

// ─────────────────────────── ADD PRODUCT MODAL ──────────────────────────────
const AddProductModal = ({ onClose, onSubmit, newProduct, setNewProduct, handleImageUpload }) => {
  return (
    <div className="fixed inset-0 z-[110] flex items-center justify-center p-6 bg-black/90 backdrop-blur-xl overflow-y-auto pt-20 pb-10">
      <motion.div 
        initial={{ scale: 0.95, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.95, opacity: 0 }}
        className="glass-card max-w-2xl w-full rounded-[2.5rem] border border-white/10 shadow-2xl relative overflow-hidden"
        onClick={e => e.stopPropagation()}
      >
        <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-accent1 to-accent2" />
        <div className="p-8">
          <div className="flex justify-between items-center mb-8">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-2xl bg-accent1/10 flex items-center justify-center text-accent1">
                <Plus className="w-6 h-6" />
              </div>
              <div>
                <h3 className="text-2xl font-outfit font-black text-white uppercase tracking-tighter">Add New Product</h3>
                <p className="text-[10px] text-slate-500 font-bold uppercase tracking-widest mt-1">Share your creation with the world</p>
              </div>
            </div>
            <button onClick={onClose} className="p-2 rounded-full hover:bg-white/10 text-slate-400 hover:text-white transition-colors">
              <X className="w-6 h-6" />
            </button>
          </div>

          <form onSubmit={onSubmit} className="space-y-6">
            {/* Image Upload Area */}
            <div className="space-y-4">
              <label className="block text-sm font-bold text-slate-300 uppercase tracking-widest">Product Images (Up to 5)</label>
              <div className="grid grid-cols-5 gap-2">
                {newProduct.images.map((img, idx) => (
                  <div key={idx} className="relative aspect-square rounded-xl overflow-hidden border border-white/10 group">
                    <img src={productService.getImageUrl(img)} alt="preview" className="w-full h-full object-cover" />
                    <button 
                      type="button"
                      onClick={() => setNewProduct(prev => ({ ...prev, images: prev.images.filter((_, i) => i !== idx) }))}
                      className="absolute inset-0 bg-black/60 items-center justify-center text-white opacity-0 group-hover:opacity-100 transition-opacity hidden group-hover:flex"
                    >
                      <X className="w-5 h-5" />
                    </button>
                  </div>
                ))}
                {newProduct.images.length < 5 && (
                  <>
                    <input 
                      id="product-image-upload"
                      type="file" 
                      multiple 
                      accept="image/*" 
                      className="hidden" 
                      onChange={handleImageUpload} 
                    />
                    <label 
                      htmlFor="product-image-upload"
                      className="aspect-square rounded-xl border-2 border-dashed border-white/10 flex flex-col items-center justify-center cursor-pointer hover:bg-white/5 hover:border-accent1/50 transition-all"
                    >
                      <ImageIcon className="w-6 h-6 text-slate-500 mb-1 pointer-events-none" />
                      <span className="text-[8px] text-slate-500 font-bold uppercase pointer-events-none">Add</span>
                    </label>
                  </>
                )}
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <label className="block text-xs font-black text-slate-500 uppercase tracking-widest">Product Name</label>
                <input 
                  type="text" 
                  required
                  value={newProduct.name}
                  onChange={e => setNewProduct({...newProduct, name: e.target.value})}
                  placeholder="e.g. Handmade Ceramic Vase"
                  className="w-full bg-white/5 border border-white/10 rounded-2xl px-5 py-3 text-white focus:outline-none focus:border-accent1 transition-all"
                />
              </div>
              <div className="space-y-2">
                <label className="block text-xs font-black text-slate-500 uppercase tracking-widest">Category</label>
                <select 
                  required
                  value={newProduct.category}
                  onChange={e => setNewProduct({...newProduct, category: e.target.value})}
                  className="w-full bg-white/5 border border-white/10 rounded-2xl px-5 py-3 text-white focus:outline-none focus:border-accent1 transition-all appearance-none"
                >
                  <option value="" className="bg-[#0f172a]">Select Category</option>
                  <option value="Home Decor" className="bg-[#0f172a]">Home Decor</option>
                  <option value="Sketches & Art" className="bg-[#0f172a]">Sketches & Art</option>
                  <option value="Resin Art" className="bg-[#0f172a]">Resin Art</option>
                  <option value="DIY & Handcrafted" className="bg-[#0f172a]">DIY & Handcrafted</option>
                  <option value="Merchandise" className="bg-[#0f172a]">Merchandise</option>
                </select>
              </div>
            </div>

            <div className="space-y-2">
              <label className="block text-xs font-black text-slate-500 uppercase tracking-widest">Description / Instructions</label>
              <textarea 
                required
                rows="3"
                value={newProduct.description}
                onChange={e => setNewProduct({...newProduct, description: e.target.value})}
                placeholder="Tell buyers about your creation..."
                className="w-full bg-white/5 border border-white/10 rounded-2xl px-5 py-4 text-white focus:outline-none focus:border-accent1 transition-all resize-none"
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <label className="block text-xs font-black text-slate-500 uppercase tracking-widest">Price (₹)</label>
                <input 
                  type="number" 
                  required
                  value={newProduct.price}
                  onChange={e => setNewProduct({...newProduct, price: e.target.value})}
                  placeholder="e.g. 599"
                  className="w-full bg-white/5 border border-white/10 rounded-2xl px-5 py-3 text-white focus:outline-none focus:border-accent1 transition-all"
                />
              </div>
              <div className="space-y-2 relative">
                <label className="block text-xs font-black text-slate-500 uppercase tracking-widest flex justify-between items-center">
                  Delivery Timeline
                  <span className="text-[10px] text-accent1 lowercase">Max 7 Days</span>
                </label>
                <select 
                  required
                  value={newProduct.timeline}
                  onChange={e => setNewProduct({...newProduct, timeline: e.target.value})}
                  className="w-full bg-white/5 border border-white/10 rounded-2xl px-5 py-3 text-white focus:outline-none focus:border-accent1 transition-all appearance-none"
                >
                  <option value="1" className="bg-[#0f172a]">24 Hours (Turbo + 10% QalaCoins)</option>
                  <option value="2" className="bg-[#0f172a]">48 Hours (Fast + 10% QalaCoins)</option>
                  <option value="3" className="bg-[#0f172a]">3 Days</option>
                  <option value="4" className="bg-[#0f172a]">4 Days</option>
                  <option value="5" className="bg-[#0f172a]">5 Days</option>
                  <option value="6" className="bg-[#0f172a]">6 Days</option>
                  <option value="7" className="bg-[#0f172a]">7 Days</option>
                </select>
                {(newProduct.timeline === '1' || newProduct.timeline === '2') ? (
                  <div className="absolute -bottom-10 left-2 right-2 flex items-start gap-2 animate-pulse bg-accent1/10 p-2 rounded-xl border border-accent1/20">
                    <Zap className="w-4 h-4 text-accent1 shrink-0 mt-0.5" />
                    <p className="text-[9px] font-bold text-accent1 leading-tight uppercase">
                      Smart Move! This timeline earns the buyer <span className="text-white">10% QalaCoins</span>—a great way to boost your sales!
                    </p>
                  </div>
                ) : (
                   <p className="text-[9px] text-slate-500 mt-1 px-1 italic">
                     Tip: Delivery within 48 hours rewards buyers with 10% QalaCoins!
                   </p>
                )}
              </div>
            </div>

            <div className="space-y-2">
              <label className="block text-xs font-black text-slate-500 uppercase tracking-widest">Pickup Address</label>
              <div className="relative">
                <Truck className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-500" />
                <input 
                  type="text" 
                  required
                  value={newProduct.address}
                  onChange={e => setNewProduct({...newProduct, address: e.target.value})}
                  placeholder="Enter detailed pickup address..."
                  className="w-full bg-white/5 border border-white/10 rounded-2xl pl-12 pr-5 py-3 text-white focus:outline-none focus:border-accent1 transition-all"
                />
              </div>
            </div>

            <div className="flex gap-4 pt-4">
              <button 
                type="button" 
                onClick={onClose} 
                className="flex-1 py-4 rounded-2xl border border-white/10 text-white font-black uppercase tracking-widest hover:bg-white/5 transition-all"
              >
                Cancel
              </button>
              <button 
                type="submit" 
                className="flex-1 py-4 rounded-2xl bg-gradient-to-r from-accent1 to-accent2 text-white font-black uppercase tracking-widest shadow-lg shadow-accent1/20 hover:opacity-90 active:scale-95 transition-all"
              >
                List Product
              </button>
            </div>
          </form>
        </div>
      </motion.div>
    </div>
  );
};

export default Dashboard;
