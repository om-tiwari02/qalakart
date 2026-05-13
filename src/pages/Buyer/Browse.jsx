import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Search, SlidersHorizontal, Star, ImagePlus, X, Upload, Zap, Heart, ShoppingCart, Camera, Gem, Leaf, Sparkles, MoreHorizontal, Store, Shirt, RotateCcw, Palette, Check, Package, BookOpen, LogOut } from 'lucide-react';
import { Link } from 'react-router-dom';

import toast from 'react-hot-toast';
import useKartStore from '../../store/kartStore';
import useAuthStore from '../../store/authStore';
import { useNavigate } from 'react-router-dom';
import { productService } from '../../services/productService';

const Browse = () => {
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [isDemandModalOpen, setIsDemandModalOpen] = useState(false);
  const [isMomentModalOpen, setIsMomentModalOpen] = useState(false);
  const [showMenu, setShowMenu] = useState(false);
  const [activeModal, setActiveModal] = useState(null);
  const [fullViewImage, setFullViewImage] = useState(null);
  const [momentPreviewUrls, setMomentPreviewUrls] = useState([]);
  const [momentPreserveType, setMomentPreserveType] = useState('');
  const [sortBy, setSortBy] = useState('none');
  const [showSortDropdown, setShowSortDropdown] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  
  const { isAuthenticated, logout } = useAuthStore();
  const navigate = useNavigate();
  const [products, setProducts] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        const data = await productService.list();
        // Map backend _id to id for consistency with the rest of the app if needed,
        // but we can also just update the UI to use _id
        const mappedProducts = data.map(p => ({
          ...p,
          id: p._id,
          name: p.title,
          image: productService.getImageUrl(p.images[0]),
          creator: p.creatorName
        }));
        setProducts(mappedProducts);
      } catch (error) {
        console.error('Failed to fetch products:', error);
        toast.error('Failed to load products');
      } finally {
        setIsLoading(false);
      }
    };

    fetchProducts();
  }, []);

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    if (params.get('action') === 'moment') {
      setIsMomentModalOpen(true);
    }
  }, []);

  const { addToCart, toggleWishlist, isWishlisted } = useKartStore();

  const handleMomentImages = (e) => {
    const files = Array.from(e.target.files || []);
    const urls = files.map((f) => URL.createObjectURL(f));
    setMomentPreviewUrls((prev) => [...prev, ...urls].slice(0, 4));
  };

  const handleMomentSubmit = (e) => {
    e.preventDefault();
    if (!momentPreserveType) { toast.error('Please select a preservation type'); return; }
    toast.success('✨ Your moment has been submitted! Our creators will reach out soon.');
    setIsMomentModalOpen(false);
    setMomentPreviewUrls([]);
    setMomentPreserveType('');
  };

  const handleCustomizeSubmit = (e) => {
    e.preventDefault();
    toast.success('Customization request sent to the creator!');
    setSelectedProduct(null);
  };

  const handleDemandSubmit = (e) => {
    e.preventDefault();
    toast.success('Demand placed!');
    setIsDemandModalOpen(false);
  };

  const filteredProducts = products.filter(product => 
    product.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
    product.category.toLowerCase().includes(searchQuery.toLowerCase()) ||
    product.creator.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const sortedProducts = [...filteredProducts].sort((a, b) => {
    if (sortBy === 'lowToHigh') return a.price - b.price;
    if (sortBy === 'highToLow') return b.price - a.price;
    return 0;
  });

  const Modal = ({ title, icon: Icon, children, onClose }) => (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-6 bg-black/80 backdrop-blur-md" onClick={onClose}>
      <motion.div
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.9, opacity: 0 }}
        className="glass-card max-w-lg w-full rounded-[2.5rem] border border-white/10 shadow-2xl relative overflow-hidden text-left"
        onClick={e => e.stopPropagation()}
      >
        <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-accent1 to-accent2" />
        <div className="p-8">
          <div className="flex justify-between items-center mb-8">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-2xl bg-accent1/10 flex items-center justify-center text-accent1">
                <Icon className="w-6 h-6" />
              </div>
              <h3 className="text-2xl font-outfit font-black text-white uppercase tracking-tighter">{title}</h3>
            </div>
            <button onClick={onClose} className="p-2 rounded-full hover:bg-white/10 text-slate-400 hover:text-white transition-colors">
              <X className="w-6 h-6" />
            </button>
          </div>

          <div className="space-y-4 mb-10">
            {children}
          </div>

          <div className="text-center py-6 border-t border-white/10 bg-white/5 -mx-8 -mb-8 mt-2">
            <span className="text-sm font-black text-white/40 uppercase tracking-[0.4em] animate-pulse">Coming Soon</span>
          </div>
        </div>
      </motion.div>
    </div>
  );

  return (
    <div className="py-8 relative">
      {/* Triple Dot Menu */}
      <div className="absolute top-[1.5rem] right-0 z-50">
        <motion.button
          onClick={() => setShowMenu(!showMenu)}
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          className="w-12 h-12 rounded-full bg-white/5 border border-white/10 flex items-center justify-center text-white hover:bg-white/10 hover:border-accent1/50 transition-all shadow-xl"
        >
          <MoreHorizontal className="w-6 h-6" />
        </motion.button>

        <AnimatePresence>
          {showMenu && (
            <>
              <div className="fixed inset-0" onClick={() => setShowMenu(false)} />
              <motion.div
                initial={{ opacity: 0, y: 10, scale: 0.95 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: 10, scale: 0.95 }}
                className="absolute right-0 mt-4 w-72 glass-card rounded-[2rem] border border-white/10 shadow-2xl overflow-hidden p-2"
              >
                <div className="grid grid-cols-1 gap-1">
                  <button onClick={() => { setShowMenu(false); window.scrollTo({ top: 0, behavior: 'smooth' }); }} className="flex items-center gap-4 p-4 rounded-2xl hover:bg-white/5 transition-colors group w-full text-left">
                    <div className="w-10 h-10 rounded-xl bg-accent1/10 flex items-center justify-center text-accent1">
                      <Palette className="w-5 h-5" />
                    </div>
                    <div className="text-left">
                      <p className="text-sm font-black text-white uppercase tracking-tight">Start Exploring</p>
                      <p className="text-[10px] text-slate-500 font-bold uppercase">Browse Stock</p>
                    </div>
                  </button>

                  <button onClick={() => { setActiveModal('seller'); setShowMenu(false); }} className="flex items-center gap-4 p-4 rounded-2xl hover:bg-white/5 transition-colors group w-full text-left">
                    <div className="w-10 h-10 rounded-xl bg-accent2/10 flex items-center justify-center text-accent2">
                      <Store className="w-5 h-5" />
                    </div>
                    <div className="text-left">
                      <div className="flex items-center gap-2">
                        <p className="text-sm font-black text-white uppercase tracking-tight">Seller Hub</p>
                        <span className="text-[8px] bg-accent2/20 text-accent2 px-1 py-0.5 rounded uppercase">Soon</span>
                      </div>
                      <p className="text-[10px] text-slate-500 font-bold uppercase">Manage Shop</p>
                    </div>
                  </button>

                  <Link to="/creator/plans" className="flex items-center gap-4 p-4 rounded-2xl hover:bg-white/5 transition-colors group">
                    <div className="w-10 h-10 rounded-xl bg-yellow-500/10 flex items-center justify-center text-yellow-500">
                      <Zap className="w-5 h-5" />
                    </div>
                    <div className="text-left">
                      <p className="text-sm font-black text-white uppercase tracking-tight">Become a Creator</p>
                      <p className="text-[10px] text-slate-500 font-bold uppercase">Join Community</p>
                    </div>
                  </Link>

                  <div className="h-px bg-white/10 my-1 mx-4" />

                  <button onClick={() => { setActiveModal('fit'); setShowMenu(false); }} className="flex items-center gap-4 p-4 rounded-2xl hover:bg-white/5 transition-colors group w-full text-left">
                    <div className="w-10 h-10 rounded-xl bg-accent1/10 flex items-center justify-center text-accent1">
                      <Shirt className="w-5 h-5" />
                    </div>
                    <div className="text-left flex items-center gap-2">
                      <p className="text-sm font-black text-white uppercase tracking-tight">Fit Maker</p>
                      <span className="text-[8px] bg-accent1/20 text-accent1 px-1 py-0.5 rounded uppercase">Soon</span>
                    </div>
                  </button>

                  <button onClick={() => { setActiveModal('dejavu'); setShowMenu(false); }} className="flex items-center gap-4 p-4 rounded-2xl hover:bg-white/5 transition-colors group w-full text-left">
                    <div className="w-10 h-10 rounded-xl bg-accent2/10 flex items-center justify-center text-accent2">
                      <RotateCcw className="w-5 h-5" />
                    </div>
                    <div className="text-left flex items-center gap-2">
                      <p className="text-sm font-black text-white uppercase tracking-tight">Deja Vu</p>
                      <span className="text-[8px] bg-accent2/20 text-accent2 px-1 py-0.5 rounded uppercase">Soon</span>
                    </div>
                  </button>


                  <Link to="/my-kart" className="flex items-center gap-4 p-4 rounded-2xl hover:bg-white/5 transition-colors group">
                    <div className="w-10 h-10 rounded-xl bg-green-500/10 flex items-center justify-center text-green-500">
                      <ShoppingCart className="w-5 h-5" />
                    </div>
                    <div className="text-left">
                      <p className="text-sm font-black text-white uppercase tracking-tight">My Kart</p>
                    </div>
                  </Link>

                  <div className="h-px bg-white/10 my-1 mx-4" />

                  <button onClick={() => { setIsMomentModalOpen(true); setShowMenu(false); }} className="flex items-center gap-4 p-4 rounded-2xl hover:bg-rose-500/10 transition-colors group w-full text-left">
                    <div className="w-10 h-10 rounded-xl bg-rose-500/10 flex items-center justify-center text-rose-500">
                      <Camera className="w-5 h-5" />
                    </div>
                    <div className="text-left">
                      <p className="text-sm font-black text-white uppercase tracking-tight">Save the Moment</p>
                      <p className="text-[10px] text-slate-500 font-bold uppercase">Preserve Memories</p>
                    </div>
                  </button>

                  <button onClick={() => { setIsDemandModalOpen(true); setShowMenu(false); }} className="flex items-center gap-4 p-4 rounded-2xl hover:bg-accent2/10 transition-colors group w-full text-left">
                    <div className="w-10 h-10 rounded-xl bg-accent2/10 flex items-center justify-center text-accent2">
                      <Zap className="w-5 h-5" />
                    </div>
                    <div className="text-left">
                      <p className="text-sm font-black text-white uppercase tracking-tight">Place a Demand</p>
                      <p className="text-[10px] text-slate-500 font-bold uppercase">Request Custom Item</p>
                    </div>
                  </button>

                  <div className="h-px bg-white/10 my-1 mx-4" />

                  <button onClick={() => { logout(); navigate('/'); }} className="flex items-center gap-4 p-4 rounded-2xl hover:bg-red-500/10 transition-colors group w-full text-left">
                    <div className="w-10 h-10 rounded-xl bg-red-500/10 flex items-center justify-center text-red-500">
                      <LogOut className="w-5 h-5" />
                    </div>
                    <div className="text-left">
                      <p className="text-sm font-black text-red-500 uppercase tracking-tight">Logout</p>
                      <p className="text-[10px] text-red-500/50 font-bold uppercase">End Session</p>
                    </div>
                  </button>
                </div>
              </motion.div>
            </>
          )}
        </AnimatePresence>
      </div>
      {/* Header & Search */}
      <div className="flex flex-col items-center justify-center gap-6 mb-12 text-center">
        <div>
          <h1 className="text-4xl md:text-5xl font-outfit font-black text-white mb-3">Explore <span className="neon-text">Stock</span></h1>
          <p className="text-slate-400 max-w-lg">Discover unique local creations ready for you.</p>
        </div>

        <div className="flex flex-col sm:flex-row items-center gap-4 w-full max-w-2xl relative">
          <div className="relative flex items-center gap-2 w-full">
            <div className="relative">
              <button 
                onClick={() => setShowSortDropdown(!showSortDropdown)}
                className={`p-3 border rounded-full transition-all flex items-center gap-2 ${
                  sortBy !== 'none' ? 'bg-accent1 border-accent1 text-white shadow-[0_0_15px_rgba(34,211,238,0.3)]' : 'bg-surface/60 border-white/10 text-white hover:bg-surface'
                }`}
              >
                <SlidersHorizontal className="w-5 h-5" />
                {sortBy !== 'none' && <span className="text-[10px] font-black uppercase tracking-tighter">
                  {sortBy === 'lowToHigh' ? '₹ Low' : '₹ High'}
                </span>}
              </button>

              <AnimatePresence>
                {showSortDropdown && (
                  <>
                    <div className="fixed inset-0 z-40" onClick={() => setShowSortDropdown(false)} />
                    <motion.div
                      initial={{ opacity: 0, y: 10, scale: 0.95 }}
                      animate={{ opacity: 1, y: 0, scale: 1 }}
                      exit={{ opacity: 0, y: 10, scale: 0.95 }}
                      className="absolute left-0 mt-4 w-56 glass-card rounded-2xl border border-white/10 shadow-2xl overflow-hidden p-2 z-50"
                    >
                      <div className="flex flex-col gap-1">
                        <button 
                          onClick={() => { setSortBy('lowToHigh'); setShowSortDropdown(false); }}
                          className={`flex items-center justify-between p-3 rounded-xl transition-colors ${sortBy === 'lowToHigh' ? 'bg-accent1/20 text-accent1' : 'hover:bg-white/5 text-slate-300'}`}
                        >
                          <span className="text-xs font-bold uppercase">Price: Low to High</span>
                          {sortBy === 'lowToHigh' && <Check className="w-4 h-4" />}
                        </button>
                        <button 
                          onClick={() => { setSortBy('highToLow'); setShowSortDropdown(false); }}
                          className={`flex items-center justify-between p-3 rounded-xl transition-colors ${sortBy === 'highToLow' ? 'bg-accent1/20 text-accent1' : 'hover:bg-white/5 text-slate-300'}`}
                        >
                          <span className="text-xs font-bold uppercase">Price: High to Low</span>
                          {sortBy === 'highToLow' && <Check className="w-4 h-4" />}
                        </button>
                        <div className="h-px bg-white/10 my-1 mx-2" />
                        <button 
                          onClick={() => { setSortBy('none'); setShowSortDropdown(false); }}
                          className={`flex items-center justify-between p-3 rounded-xl transition-colors ${sortBy === 'none' ? 'bg-white/10 text-white' : 'hover:bg-white/5 text-slate-500'}`}
                        >
                          <span className="text-xs font-bold uppercase text-left">Reset Sort</span>
                        </button>
                      </div>
                    </motion.div>
                  </>
                )}
              </AnimatePresence>
            </div>

            <div className="relative flex-1">
              <Search className="w-5 h-5 absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" />
              <input
                type="text"
                placeholder="Search products..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full bg-surface/60 border border-white/10 rounded-full pl-12 pr-4 py-3 text-white focus:outline-none focus:border-accent1 transition-colors"
              />
            </div>
          </div>
        </div>
      </div>

      {/* Product Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {sortedProducts.map((product, i) => (
          <motion.div
            key={product.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.1 }}
            className="glass-card rounded-2xl overflow-hidden group hover:border-accent1/30 transition-all"
          >
            <div 
              className="h-48 overflow-hidden relative cursor-zoom-in"
              onClick={() => setFullViewImage(product.image)}
            >
              <img
                src={product.image}
                alt={product.name}
                className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
              />
              {/* Rating badge */}
              <div className="absolute top-3 left-3 bg-black/60 backdrop-blur-md px-2 py-1 rounded-lg flex items-center gap-1">
                <Star className="w-3 h-3 text-accent2 fill-accent2" />
                <span className="text-xs font-bold text-white">{product.rating}</span>
              </div>
              {/* Wishlist button */}
              <button
                onClick={() => {
                  toggleWishlist(product);
                  toast.success(isWishlisted(product.id) ? 'Removed from wishlist' : `${product.name} wishlisted!`);
                }}
                className="absolute top-3 right-3 w-8 h-8 rounded-full bg-black/60 backdrop-blur-md flex items-center justify-center transition-all hover:scale-110"
              >
                <Heart
                  className={`w-4 h-4 transition-colors ${isWishlisted(product.id) ? 'text-rose-400 fill-rose-400' : 'text-white'
                    }`}
                />
              </button>
            </div>

            <div className="p-5">
              <div className="text-xs text-accent1 font-semibold mb-1">{product.category}</div>
              <h3 className="text-lg font-outfit font-bold text-white mb-1 line-clamp-1">{product.name}</h3>
              <p className="text-xs text-slate-400 mb-3">By {product.creator}</p>

              <div className="flex items-center justify-between mb-4">
                <span className="text-xl font-bold text-white">₹{product.price}</span>
                <span className="text-xs text-slate-500 bg-surface px-2 py-1 rounded-md">{product.delivery}</span>
              </div>

              <div className="flex flex-col gap-2">
                <button
                  onClick={() => { addToCart(product); toast.success(`${product.name} added to cart!`); }}
                  className="w-full btn-primary py-2 text-sm flex items-center justify-center gap-2"
                >
                  <ShoppingCart className="w-4 h-4" /> Add to Cart
                </button>
                <button
                  onClick={() => setSelectedProduct(product)}
                  className="w-full btn-outline py-2 text-sm flex items-center justify-center gap-2"
                >
                  <ImagePlus className="w-4 h-4" /> Customize
                </button>
              </div>
            </div>
          </motion.div>
        ))}
      </div>

      {/* Customize Modal */}
      <AnimatePresence>
        {selectedProduct && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm"
          >
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="glass-card bg-surface w-full max-w-lg rounded-3xl p-6 relative overflow-y-auto max-h-[90vh]"
            >
              <button
                onClick={() => setSelectedProduct(null)}
                className="absolute top-4 right-4 text-slate-400 hover:text-white"
              >
                <X className="w-6 h-6" />
              </button>

              <h2 className="text-2xl font-outfit font-bold text-white mb-2">Customize Order</h2>
              <p className="text-slate-400 text-sm mb-6">You are customizing: <span className="text-accent2">{selectedProduct.name}</span></p>

              <form onSubmit={handleCustomizeSubmit} className="space-y-6">
                <div>
                  <span className="block text-sm font-medium text-slate-300 mb-2">Reference Picture</span>
                  <label className="border-2 border-dashed border-white/20 rounded-xl p-8 flex flex-col items-center justify-center text-center hover:bg-white/5 hover:border-accent1/50 transition-colors cursor-pointer w-full">
                    <input type="file" accept="image/*" className="hidden" />
                    <Upload className="w-8 h-8 text-slate-400 mb-3" />
                    <p className="text-sm text-white font-medium">Click to upload an image</p>
                    <p className="text-xs text-slate-500 mt-1">PNG, JPG up to 5MB</p>
                  </label>
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-300 mb-2">Instructions for Creator</label>
                  <textarea
                    rows="4"
                    className="w-full bg-surface/50 border border-white/10 rounded-xl p-4 text-white focus:outline-none focus:border-accent1 transition-colors resize-none"
                    placeholder="E.g., I want the text on the keychain to be in cursive and colored gold..."
                    required
                  ></textarea>
                </div>

                <div className="bg-accent1/10 border border-accent1/20 rounded-xl p-4 flex gap-3">
                  <Star className="w-5 h-5 text-accent1 shrink-0 mt-0.5" />
                  <p className="text-xs text-slate-300">
                    The creator will review your request and confirm if it's possible. Extra charges may apply based on the customization complexity.
                  </p>
                </div>

                <div className="flex gap-4 pt-2">
                  <button type="button" onClick={() => setSelectedProduct(null)} className="flex-1 py-3 rounded-xl border border-white/10 text-white font-semibold hover:bg-white/5 transition-colors">
                    Cancel
                  </button>
                  <button type="submit" className="flex-1 btn-primary">
                    Send Request
                  </button>
                </div>
              </form>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Demand Modal */}
      <AnimatePresence>
        {isDemandModalOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm"
          >
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="glass-card bg-surface w-full max-w-lg rounded-3xl p-6 relative overflow-y-auto max-h-[90vh]"
            >
              <button
                onClick={() => setIsDemandModalOpen(false)}
                className="absolute top-4 right-4 text-slate-400 hover:text-white"
              >
                <X className="w-6 h-6" />
              </button>

              <h2 className="text-2xl font-outfit font-bold text-white mb-2 flex items-center gap-2">
                <Zap className="text-accent2" /> Place a Demand
              </h2>
              <p className="text-slate-400 text-sm mb-6">Can't find what you need? Request it from local creators.</p>

              <form onSubmit={handleDemandSubmit} className="space-y-5">
                <div>
                  <span className="block text-sm font-medium text-slate-300 mb-2">Reference Picture</span>
                  <label className="border-2 border-dashed border-white/20 rounded-xl p-6 flex flex-col items-center justify-center text-center hover:bg-white/5 hover:border-accent1/50 transition-colors cursor-pointer w-full">
                    <input type="file" accept="image/*" className="hidden" required />
                    <Upload className="w-6 h-6 text-slate-400 mb-2" />
                    <p className="text-sm text-white font-medium">Click to upload an image</p>
                    <p className="text-xs text-slate-500 mt-1">PNG, JPG up to 5MB</p>
                  </label>
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-300 mb-2">Instructions</label>
                  <textarea
                    rows="3"
                    className="w-full bg-surface/50 border border-white/10 rounded-xl p-4 text-white focus:outline-none focus:border-accent1 transition-colors resize-none"
                    placeholder="Describe what you need created in detail..."
                    required
                  ></textarea>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-slate-300 mb-2">Timeline</label>
                    <input
                      type="text"
                      className="w-full bg-surface/50 border border-white/10 rounded-xl p-3 text-white focus:outline-none focus:border-accent1 transition-colors"
                      placeholder="e.g. 1 week"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-slate-300 mb-2">Budget (Optional)</label>
                    <input
                      type="text"
                      className="w-full bg-surface/50 border border-white/10 rounded-xl p-3 text-white focus:outline-none focus:border-accent1 transition-colors"
                      placeholder="e.g. ₹500"
                    />
                  </div>
                </div>

                <div className="bg-accent2/10 border border-accent2/20 rounded-xl p-4 flex gap-3">
                  <Zap className="w-5 h-5 text-accent2 shrink-0 mt-0.5" />
                  <div className="text-xs text-slate-300">
                    <p className="font-semibold text-white mb-1">Demand Fee: ₹69</p>
                    <p>This fee is 100% refundable if your demand is not accepted (or convertible into a coupon). If accepted, ₹55 will be adjusted into your final product price.</p>
                  </div>
                </div>

                <div className="flex gap-4 pt-2">
                  <button type="button" onClick={() => setIsDemandModalOpen(false)} className="flex-1 py-3 rounded-xl border border-white/10 text-white font-semibold hover:bg-white/5 transition-colors">
                    Cancel
                  </button>
                  <button type="submit" className="flex-1 btn-primary">
                    Pay ₹69 & Place
                  </button>
                </div>
              </form>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ── Save the Moment Modal ── */}
      <AnimatePresence>
        {isMomentModalOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-sm"
            onClick={() => setIsMomentModalOpen(false)}
          >
            <motion.div
              initial={{ scale: 0.94, opacity: 0, y: 24 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.94, opacity: 0 }}
              transition={{ type: 'spring', stiffness: 320, damping: 28 }}
              className="glass-card bg-surface w-full max-w-xl rounded-3xl overflow-y-auto max-h-[92vh] relative"
              onClick={(e) => e.stopPropagation()}
            >
              {/* Gradient header */}
              <div className="relative bg-gradient-to-br from-rose-600/30 via-purple-700/20 to-accent1/10 px-6 pt-6 pb-5 border-b border-white/5">
                <button
                  onClick={() => setIsMomentModalOpen(false)}
                  className="absolute top-4 right-4 text-slate-400 hover:text-white transition-colors"
                >
                  <X className="w-5 h-5" />
                </button>
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-rose-500 to-purple-600 flex items-center justify-center shadow-[0_0_20px_rgba(168,85,247,0.4)]">
                    <Camera className="w-6 h-6 text-white" />
                  </div>
                  <div>
                    <h2 className="text-xl font-outfit font-bold text-white">Save the Moment</h2>
                    <p className="text-xs text-slate-400">Preserve your memories — forever, beautifully.</p>
                  </div>
                </div>
              </div>

              <form onSubmit={handleMomentSubmit} className="p-6 space-y-5">

                {/* Preservation Type */}
                <div>
                  <label className="block text-sm font-semibold text-slate-300 mb-3">How do you want to preserve it? <span className="text-rose-400">*</span></label>
                  <div className="grid grid-cols-2 gap-3">
                    {[
                      { id: 'resin', label: 'Resin Art', desc: 'Cast in crystal-clear resin', icon: <Gem className="w-5 h-5" /> },
                      { id: 'frame', label: 'Framed Display', desc: 'Elegantly framed & mounted', icon: <ImagePlus className="w-5 h-5" /> },
                      { id: 'shadow', label: 'Shadow Box', desc: '3D keepsake box display', icon: <Sparkles className="w-5 h-5" /> },
                      { id: 'dried', label: 'Dried & Pressed', desc: 'Naturally dried & preserved', icon: <Leaf className="w-5 h-5" /> },
                    ].map((opt) => (
                      <button
                        key={opt.id}
                        type="button"
                        onClick={() => setMomentPreserveType(opt.id)}
                        className={`flex flex-col gap-1.5 p-3.5 rounded-2xl border text-left transition-all duration-200 ${momentPreserveType === opt.id
                            ? 'border-rose-400/70 bg-rose-500/10 shadow-[0_0_14px_rgba(244,63,94,0.2)]'
                            : 'border-white/10 bg-white/3 hover:border-white/20 hover:bg-white/5'
                          }`}
                      >
                        <div className={`${momentPreserveType === opt.id ? 'text-rose-400' : 'text-slate-400'} transition-colors`}>{opt.icon}</div>
                        <span className="text-sm font-semibold text-white">{opt.label}</span>
                        <span className="text-[11px] text-slate-500 leading-tight">{opt.desc}</span>
                      </button>
                    ))}
                  </div>
                </div>

                {/* Image Upload */}
                <div>
                  <label className="block text-sm font-semibold text-slate-300 mb-2">Upload Reference Photos <span className="text-xs text-slate-500">(up to 4)</span></label>
                  {momentPreviewUrls.length > 0 ? (
                    <div className="grid grid-cols-4 gap-2 mb-2">
                      {momentPreviewUrls.map((url, i) => (
                        <div key={i} className="relative group">
                          <img src={url} alt="preview" className="w-full h-20 object-cover rounded-xl border border-white/10" />
                          <button
                            type="button"
                            onClick={() => setMomentPreviewUrls((p) => p.filter((_, j) => j !== i))}
                            className="absolute top-1 right-1 w-5 h-5 rounded-full bg-black/70 text-white hidden group-hover:flex items-center justify-center"
                          >
                            <X className="w-3 h-3" />
                          </button>
                        </div>
                      ))}
                      {momentPreviewUrls.length < 4 && (
                        <label className="h-20 rounded-xl border-2 border-dashed border-white/15 flex items-center justify-center cursor-pointer hover:border-rose-400/40 transition-colors">
                          <input type="file" accept="image/*" multiple className="hidden" onChange={handleMomentImages} />
                          <Upload className="w-5 h-5 text-slate-500" />
                        </label>
                      )}
                    </div>
                  ) : (
                    <label className="border-2 border-dashed border-white/15 rounded-xl p-7 flex flex-col items-center justify-center text-center hover:bg-rose-500/5 hover:border-rose-400/40 transition-colors cursor-pointer w-full">
                      <input type="file" accept="image/*" multiple className="hidden" onChange={handleMomentImages} />
                      <div className="w-12 h-12 rounded-2xl bg-rose-500/10 flex items-center justify-center mb-3">
                        <Camera className="w-6 h-6 text-rose-400" />
                      </div>
                      <p className="text-sm text-white font-medium">Click to upload your memory photos</p>
                      <p className="text-xs text-slate-500 mt-1">Flowers, gifts, keepsakes — up to 4 images, 5MB each</p>
                    </label>
                  )}
                </div>

                {/* Occasion */}
                <div>
                  <label className="block text-sm font-semibold text-slate-300 mb-2">Occasion / Memory</label>
                  <input
                    type="text"
                    className="w-full bg-surface/50 border border-white/10 rounded-xl px-4 py-3 text-white text-sm focus:outline-none focus:border-rose-400/60 transition-colors placeholder:text-slate-600"
                    placeholder="e.g. Anniversary flowers, Wedding bouquet, First gift..."
                    required
                  />
                </div>

                {/* Instructions */}
                <div>
                  <label className="block text-sm font-semibold text-slate-300 mb-2">Preservation Instructions</label>
                  <textarea
                    rows="3"
                    className="w-full bg-surface/50 border border-white/10 rounded-xl p-4 text-white text-sm focus:outline-none focus:border-rose-400/60 transition-colors resize-none placeholder:text-slate-600"
                    placeholder="e.g. Preserve the roses in a round resin coaster, keep the colour as close to original as possible, add a small personalised text at the bottom..."
                    required
                  />
                </div>

                {/* Budget + Timeline */}
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-semibold text-slate-300 mb-2">Your Budget</label>
                    <input
                      type="text"
                      className="w-full bg-surface/50 border border-white/10 rounded-xl px-4 py-3 text-white text-sm focus:outline-none focus:border-rose-400/60 transition-colors placeholder:text-slate-600"
                      placeholder="e.g. ₹800"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-slate-300 mb-2">Timeline</label>
                    <input
                      type="text"
                      className="w-full bg-surface/50 border border-white/10 rounded-xl px-4 py-3 text-white text-sm focus:outline-none focus:border-rose-400/60 transition-colors placeholder:text-slate-600"
                      placeholder="e.g. 2 weeks"
                    />
                  </div>
                </div>

                {/* Info box */}
                <div className="bg-purple-500/10 border border-purple-500/20 rounded-xl p-4 flex gap-3">
                  <Sparkles className="w-5 h-5 text-purple-400 shrink-0 mt-0.5" />
                  <div className="text-xs text-slate-300 space-y-1">
                    <p className="font-semibold text-white">How it works</p>
                    <p>Our local artisans will review your request, suggest options, and quote a price. You only pay once you approve the quote — no upfront fee!</p>
                  </div>
                </div>

                <div className="flex gap-3 pt-1">
                  <button type="button" onClick={() => setIsMomentModalOpen(false)} className="flex-1 py-3 rounded-xl border border-white/10 text-white text-sm font-semibold hover:bg-white/5 transition-colors">
                    Cancel
                  </button>
                  <button type="submit" className="flex-1 py-3 rounded-xl font-outfit font-semibold text-sm text-white bg-gradient-to-r from-rose-500 to-purple-600 hover:opacity-90 transition-all shadow-[0_0_18px_rgba(168,85,247,0.35)] hover:shadow-[0_0_28px_rgba(168,85,247,0.5)] active:scale-95">
                    Submit My Moment ✨
                  </button>
                </div>
              </form>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
      {/* Triple Dot Modals */}
      <AnimatePresence>
        {activeModal === 'fit' && (
          <Modal title="Fit Maker" icon={Shirt} onClose={() => setActiveModal(null)}>
            <p className="text-slate-400 text-sm leading-relaxed mb-6">
              Upload any Pinterest reference or outfit inspiration. Our expert sellers will help you source, customize, and complete your perfect look.
            </p>
            <div className="glass-card p-6 rounded-2xl bg-white/5 border border-white/10 text-center border-dashed">
              <div className="w-12 h-12 rounded-full bg-white/5 flex items-center justify-center mx-auto mb-3">
                <Sparkles className="text-accent1 w-5 h-5" />
              </div>
              <p className="text-xs text-slate-500 font-bold uppercase tracking-widest">Image Upload Terminal</p>
            </div>
          </Modal>
        )}

        {activeModal === 'seller' && (
          <Modal title="Seller Instructions" icon={Store} onClose={() => setActiveModal(null)}>
            <div className="space-y-6">
              <div className="flex items-start gap-4">
                <div className="w-8 h-8 rounded-full bg-green-500/10 flex items-center justify-center shrink-0">
                  <Check className="w-4 h-4 text-green-400" />
                </div>
                <div>
                  <h4 className="text-white font-bold text-sm">Full Marketplace Access</h4>
                  <p className="text-xs text-slate-500">Sell new products, handle custom demands, and list second-hand items after subscribing.</p>
                </div>
              </div>
              <div className="p-4 rounded-2xl bg-accent2/10 border border-accent2/20">
                <h4 className="text-accent2 font-black text-xs uppercase tracking-widest mb-3">Exclusive: Second Hand Categories</h4>
                <div className="grid grid-cols-1 gap-2">
                  <div className="flex items-center gap-2 text-xs text-slate-300"><Package className="w-3 h-3" /> Merchandise Products</div>
                  <div className="flex items-center gap-2 text-xs text-slate-300"><Palette className="w-3 h-3" /> DIY Creations</div>
                  <div className="flex items-center gap-2 text-xs text-slate-300"><BookOpen className="w-3 h-3" /> Books (Novels & Literature)</div>
                </div>
              </div>
            </div>
          </Modal>
        )}

        {activeModal === 'dejavu' && (
          <Modal title="Deja Vu" icon={RotateCcw} onClose={() => setActiveModal(null)}>
            <p className="text-slate-400 text-sm leading-relaxed mb-6">
              The circular economy hub of QalaKart. Buy and sell authentic pre-loved creative items with trust.
            </p>
            <div className="grid grid-cols-1 gap-3">
              {['Exclusive Merchandise', 'DIY & Handcrafted', 'Novels & Literature'].map((item) => (
                <div key={item} className="p-4 rounded-xl bg-white/5 border border-white/10 flex justify-between items-center group hover:bg-white/10 transition-colors">
                  <span className="text-sm font-bold text-white">{item}</span>
                  <span className="text-[10px] text-slate-500 font-black uppercase">Coming Soon</span>
                </div>
              ))}
            </div>
          </Modal>
        )}
      </AnimatePresence>
      
      {/* Full Screen Image View */}
      <AnimatePresence>
        {fullViewImage && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[200] bg-black/95 flex items-center justify-center p-4 md:p-12 cursor-zoom-out overflow-hidden"
            onClick={() => setFullViewImage(null)}
          >
            <motion.button 
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.9 }}
              className="absolute top-8 right-8 z-[210] p-3 rounded-full bg-white/10 hover:bg-white/20 text-white transition-colors border border-white/10 shadow-2xl"
            >
              <X className="w-8 h-8" />
            </motion.button>
            <motion.img 
              initial={{ scale: 0.9, y: 20 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.9, y: 20 }}
              src={fullViewImage} 
              className="max-w-full max-h-full object-contain rounded-2xl shadow-[0_0_50px_rgba(0,0,0,0.5)]" 
              onClick={(e) => e.stopPropagation()}
            />
          </motion.div>
        )}
      </AnimatePresence>

    </div>
  );
};

export default Browse;
