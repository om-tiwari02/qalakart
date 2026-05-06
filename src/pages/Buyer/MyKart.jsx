import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  ShoppingCart,
  Heart,
  Package,
  Star,
  Truck,
  CheckCircle,
  Clock,
  MapPin,
  Trash2,
  Plus,
  Minus,
  MessageSquare,
  X,
  ShoppingBag,
  ChevronRight,
  Gift,
  CreditCard,
  Smartphone,
  Coins,
  ArrowLeft
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import useKartStore from '../../store/kartStore';
import useAuthStore from '../../store/authStore';
import toast from 'react-hot-toast';

// ─────────────────────────── ORDER TRACKER ──────────────────────────────────
const STEPS = ['Order Placed', 'Confirmed', 'Shipped', 'Out for Delivery', 'Delivered'];

const OrderTracker = ({ step }) => (
  <div className="mt-4">
    <div className="flex items-center justify-between relative">
      {/* Progress bar behind steps */}
      <div className="absolute top-4 left-0 right-0 h-0.5 bg-white/10 z-0" />
      <div
        className="absolute top-4 left-0 h-0.5 bg-gradient-to-r from-accent1 to-accent2 z-0 transition-all duration-700"
        style={{ width: `${(step / (STEPS.length - 1)) * 100}%` }}
      />
      {STEPS.map((label, i) => (
        <div key={i} className="flex flex-col items-center gap-1.5 z-10">
          <div
            className={`w-8 h-8 rounded-full border-2 flex items-center justify-center transition-all duration-500 ${
              i <= step
                ? 'bg-gradient-to-br from-accent1 to-accent2 border-accent2 shadow-[0_0_12px_rgba(252,211,77,0.5)]'
                : 'bg-surface border-white/10'
            }`}
          >
            {i <= step ? (
              <CheckCircle className="w-4 h-4 text-black" />
            ) : (
              <span className="text-xs text-slate-500 font-bold">{i + 1}</span>
            )}
          </div>
          <span
            className={`text-[10px] text-center font-semibold max-w-[60px] leading-tight ${
              i <= step ? 'text-accent2' : 'text-slate-500'
            }`}
          >
            {label}
          </span>
        </div>
      ))}
    </div>
  </div>
);

// ─────────────────────────── REVIEW MODAL ───────────────────────────────────
const ReviewModal = ({ order, onClose, onSubmit }) => {
  const [rating, setRating] = useState(order.rating || 0);
  const [hover, setHover] = useState(0);
  const [review, setReview] = useState(order.review || '');

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!rating) { toast.error('Please select a rating'); return; }
    onSubmit(order.id, rating, review);
    toast.success('Review submitted! Thank you 🌟');
    onClose();
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm"
      onClick={onClose}
    >
      <motion.div
        initial={{ scale: 0.92, opacity: 0, y: 20 }}
        animate={{ scale: 1, opacity: 1, y: 0 }}
        exit={{ scale: 0.92, opacity: 0 }}
        className="glass-card bg-surface w-full max-w-md rounded-3xl p-7 relative"
        onClick={(e) => e.stopPropagation()}
      >
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-slate-400 hover:text-white transition-colors"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="flex items-center gap-3 mb-6">
          <div className="w-12 h-12 rounded-2xl bg-accent1/20 flex items-center justify-center">
            <Star className="w-6 h-6 text-accent1" />
          </div>
          <div>
            <h2 className="text-xl font-outfit font-bold text-white">Rate & Review</h2>
            <p className="text-xs text-slate-400">Order #{order.id}</p>
          </div>
        </div>

        {/* Product thumb */}
        <div className="flex items-center gap-3 glass-card p-3 rounded-xl mb-6">
          <img
            src={order.items[0]?.image}
            alt={order.items[0]?.name}
            className="w-14 h-14 rounded-xl object-cover"
          />
          <div>
            <p className="text-sm font-semibold text-white">{order.items[0]?.name}</p>
            <p className="text-xs text-slate-400">by {order.seller}</p>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-5">
          {/* Star rating */}
          <div>
            <label className="block text-sm font-medium text-slate-300 mb-3">Your Rating</label>
            <div className="flex gap-2">
              {[1, 2, 3, 4, 5].map((star) => (
                <button
                  key={star}
                  type="button"
                  onClick={() => setRating(star)}
                  onMouseEnter={() => setHover(star)}
                  onMouseLeave={() => setHover(0)}
                  className="transition-transform hover:scale-110"
                >
                  <Star
                    className={`w-8 h-8 transition-colors ${
                      star <= (hover || rating)
                        ? 'text-accent2 fill-accent2'
                        : 'text-slate-600'
                    }`}
                  />
                </button>
              ))}
            </div>
          </div>

          {/* Review text */}
          <div>
            <label className="block text-sm font-medium text-slate-300 mb-2">
              Your Review <span className="text-slate-500">(optional)</span>
            </label>
            <textarea
              rows="3"
              value={review}
              onChange={(e) => setReview(e.target.value)}
              className="w-full bg-surface/50 border border-white/10 rounded-xl p-3 text-white text-sm focus:outline-none focus:border-accent1 transition-colors resize-none placeholder:text-slate-600"
              placeholder="Share your experience with this product..."
            />
          </div>

          <div className="flex gap-3 pt-1">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 py-3 rounded-xl border border-white/10 text-white font-semibold hover:bg-white/5 transition-colors text-sm"
            >
              Cancel
            </button>
            <button type="submit" className="flex-1 btn-primary text-sm">
              Submit Review
            </button>
          </div>
        </form>
      </motion.div>
    </motion.div>
  );
};

// ─────────────────────────── CHECKOUT MODAL ─────────────────────────────────
const CheckoutModal = ({ cart, total, onClose, onComplete }) => {
  const { user, addCoins, deductCoins } = useAuthStore();
  const [paymentMethod, setPaymentMethod] = useState('online');
  const [useQalaCoins, setUseQalaCoins] = useState(false);

  // Business Logic
  const hasExpensiveItem = cart.some(i => i.price >= 439);
  const canUseCoins = (user?.qalaCoins >= 100);

  const discount = useQalaCoins ? total * 0.08 : 0;
  const finalTotal = total - discount;
  const coinsReward = total * 0.10;

  const handleConfirm = () => {
    if (useQalaCoins) deductCoins(100);
    addCoins(coinsReward);
    onComplete(Math.round(coinsReward));
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/90 backdrop-blur-md"
      onClick={onClose}
    >
      <motion.div
        initial={{ scale: 0.9, y: 20 }}
        animate={{ scale: 1, y: 0 }}
        className="glass-card bg-surface max-w-md w-full rounded-[2.5rem] p-8 border border-white/10 relative overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-accent1 to-accent2" />
        <button onClick={onClose} className="absolute top-6 right-6 text-slate-500 hover:text-white">
          <X className="w-6 h-6" />
        </button>

        <h2 className="text-2xl font-outfit font-black text-white mb-6 uppercase tracking-tighter">Finalize Checkout</h2>

        <div className="space-y-6 mb-8">
          {/* Summary */}
          <div className="glass-card p-4 rounded-2xl bg-white/5">
            <div className="flex justify-between text-sm text-slate-400 mb-2">
              <span>Subtotal</span>
              <span className="text-white">₹{total}</span>
            </div>
            {useQalaCoins && (
              <div className="flex justify-between text-sm text-green-400 mb-2">
                <span>8% Qala Discount</span>
                <span>-₹{Math.round(total * 0.08)}</span>
              </div>
            )}
            <div className="flex justify-between text-lg font-black text-white pt-2 border-t border-white/5">
              <span>Total Payable</span>
              <span className="neon-text">₹{Math.round(finalTotal)}</span>
            </div>
          </div>

          {/* Qala Coin Option */}
          <button 
            disabled={!canUseCoins}
            onClick={() => setUseQalaCoins(!useQalaCoins)}
            className={`w-full p-4 rounded-2xl border flex items-center justify-between transition-all ${
              useQalaCoins 
                ? 'bg-accent1/20 border-accent1' 
                : !canUseCoins 
                  ? 'bg-white/2 opacity-40 cursor-not-allowed border-white/5' 
                  : 'bg-white/5 border-white/10 hover:border-accent1/30'
            }`}
          >
            <div className="flex items-center gap-3 text-left">
              <Coins className={`${canUseCoins ? 'text-accent1' : 'text-slate-500'} w-5 h-5`} />
              <div>
                <p className={`text-sm font-bold ${canUseCoins ? 'text-white' : 'text-slate-500'}`}>Use 100 QalaCoins</p>
                <p className="text-[10px] text-slate-500">
                  {canUseCoins ? 'Redeem for 8% OFF this order' : `Need ${100 - (user?.qalaCoins || 0)} more coins to unlock`}
                </p>
              </div>
            </div>
            {canUseCoins && (
              <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center ${useQalaCoins ? 'bg-accent1 border-accent1' : 'border-white/20'}`}>
                {useQalaCoins && <CheckCircle className="w-3 h-3 text-black" />}
              </div>
            )}
          </button>

          {/* Payment Methods */}
          <div>
            <label className="text-xs font-bold text-slate-500 uppercase tracking-widest block mb-3">Select Payment Method</label>
            <div className="grid grid-cols-2 gap-3">
              <button 
                onClick={() => setPaymentMethod('online')}
                className={`p-4 rounded-2xl border flex flex-col items-center gap-2 transition-all ${
                  paymentMethod === 'online' ? 'bg-accent1/20 border-accent1' : 'bg-white/5 border-white/10 hover:border-accent1/30'
                }`}
              >
                <Smartphone className="w-5 h-5" />
                <span className="text-xs font-bold text-white">Online Pay</span>
              </button>
              <button 
                disabled={hasExpensiveItem}
                onClick={() => setPaymentMethod('cod')}
                className={`p-4 rounded-2xl border flex flex-col items-center gap-2 transition-all relative ${
                  paymentMethod === 'cod' ? 'bg-accent1/20 border-accent1' : 'bg-white/5 border-white/10'
                } ${hasExpensiveItem ? 'opacity-40 cursor-not-allowed grayscale' : 'hover:border-accent1/30'}`}
              >
                <Truck className="w-5 h-5" />
                <span className="text-xs font-bold text-white">COD</span>
                {hasExpensiveItem && <div className="absolute inset-0 flex items-center justify-center text-red-500 font-bold">X</div>}
              </button>
            </div>
            {hasExpensiveItem && (
              <p className="text-[10px] text-red-400 mt-2 text-center">COD disabled for items above ₹439</p>
            )}
          </div>
        </div>

        <button 
          onClick={handleConfirm}
          className="w-full btn-primary py-4 text-lg flex items-center justify-center gap-3"
        >
          <Coins className="w-5 h-5 text-black" />
          Confirm & Pay
        </button>
        <p className="text-[10px] text-accent1 text-center mt-3 font-bold uppercase tracking-widest animate-pulse">
          +{Math.round(coinsReward)} QalaCoins will be awarded!
        </p>
      </motion.div>
    </motion.div>
  );
};

// ─────────────────────────── MY ORDERS TAB ──────────────────────────────────
const MyOrders = () => {
  const { orders, submitReview } = useKartStore();
  const [reviewOrder, setReviewOrder] = useState(null);
  const [orderTab, setOrderTab] = useState('upcoming');

  const upcoming = orders.filter((o) => o.status === 'upcoming');
  const previous = orders.filter((o) => o.status === 'previous');
  const shown = orderTab === 'upcoming' ? upcoming : previous;

  return (
    <div>
      {/* Sub-tabs */}
      <div className="flex gap-2 mb-6 p-1 bg-surface/40 rounded-2xl border border-white/5 w-fit">
        {['upcoming', 'previous'].map((tab) => (
          <button
            key={tab}
            onClick={() => setOrderTab(tab)}
            className={`px-5 py-2 rounded-xl text-sm font-semibold capitalize transition-all duration-300 ${
              orderTab === tab
                ? 'bg-gradient-to-r from-accent1 to-accent2 text-black shadow-[0_0_15px_rgba(212,175,55,0.4)]'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            {tab === 'upcoming' ? '🚀 Upcoming' : '✅ Previous'}
            <span className="ml-2 text-xs bg-white/10 px-1.5 py-0.5 rounded-full">
              {tab === 'upcoming' ? upcoming.length : previous.length}
            </span>
          </button>
        ))}
      </div>

      {shown.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-20 text-center">
          <div className="w-20 h-20 rounded-3xl bg-accent1/10 flex items-center justify-center mb-4">
            <Package className="w-10 h-10 text-accent1/40" />
          </div>
          <p className="text-slate-400 text-lg font-semibold">
            No {orderTab} orders yet
          </p>
          <p className="text-slate-600 text-sm mt-1">
            {orderTab === 'upcoming'
              ? 'Place an order from Browse to see it here.'
              : 'Your delivered orders will appear here.'}
          </p>
        </div>
      ) : (
        <div className="space-y-5">
          {shown.map((order, i) => (
            <motion.div
              key={order.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.08 }}
              className="glass-card rounded-2xl overflow-hidden"
            >
              {/* Order header */}
              <div className="flex items-center justify-between px-5 py-4 border-b border-white/5">
                <div>
                  <div className="flex items-center gap-2 mb-0.5">
                    <span className="text-sm font-bold text-white font-outfit">
                      #{order.id}
                    </span>
                    <span
                      className={`text-xs px-2 py-0.5 rounded-full font-semibold ${
                        order.status === 'upcoming'
                          ? 'bg-blue-500/20 text-blue-300'
                          : 'bg-green-500/20 text-green-300'
                      }`}
                    >
                      {order.status === 'upcoming' ? '• In Transit' : '• Delivered'}
                    </span>
                  </div>
                  <p className="text-xs text-slate-500">
                    {order.status === 'upcoming'
                      ? `Placed: ${order.placedAt} · Expected by ${order.expectedBy}`
                      : `Delivered: ${order.deliveredAt}`}
                  </p>
                </div>
                <span className="text-lg font-bold text-white">₹{order.total}</span>
              </div>

              {/* Items */}
              <div className="px-5 py-4">
                {order.items.map((item, j) => (
                  <div key={j} className="flex items-center gap-4">
                    <img
                      src={item.image}
                      alt={item.name}
                      className="w-16 h-16 rounded-xl object-cover border border-white/10"
                    />
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-semibold text-white truncate">{item.name}</p>
                      <p className="text-xs text-slate-400">
                        Qty: {item.qty} · ₹{item.price} each
                      </p>
                      <p className="text-xs text-accent1/70 mt-0.5">by {order.seller}</p>
                    </div>
                  </div>
                ))}
              </div>

              {/* Upcoming: tracker */}
              {order.status === 'upcoming' && (
                <div className="px-5 pb-5">
                  <div className="flex items-center gap-2 mb-3">
                    <Truck className="w-4 h-4 text-accent1" />
                    <span className="text-xs font-semibold text-accent1">Track Your Order</span>
                  </div>
                  <OrderTracker step={order.orderStep} />
                </div>
              )}

              {/* Previous: review section */}
              {order.status === 'previous' && (
                <div className="px-5 pb-5">
                  {order.rating ? (
                    <div className="bg-green-500/10 border border-green-500/20 rounded-xl p-3 flex items-start gap-3">
                      <div className="flex gap-0.5 shrink-0">
                        {[1, 2, 3, 4, 5].map((s) => (
                          <Star
                            key={s}
                            className={`w-4 h-4 ${
                              s <= order.rating
                                ? 'text-accent2 fill-accent2'
                                : 'text-slate-600'
                            }`}
                          />
                        ))}
                      </div>
                      <p className="text-xs text-slate-300 leading-relaxed">
                        {order.review || 'No written review.'}
                      </p>
                    </div>
                  ) : (
                    <button
                      onClick={() => setReviewOrder(order)}
                      className="flex items-center gap-2 px-4 py-2.5 rounded-xl border border-accent1/30 text-accent2 text-sm font-semibold hover:bg-accent1/10 transition-all"
                    >
                      <MessageSquare className="w-4 h-4" />
                      Rate &amp; Review this Order
                    </button>
                  )}
                </div>
              )}
            </motion.div>
          ))}
        </div>
      )}

      <AnimatePresence>
        {reviewOrder && (
          <ReviewModal
            order={reviewOrder}
            onClose={() => setReviewOrder(null)}
            onSubmit={submitReview}
          />
        )}
      </AnimatePresence>
    </div>
  );
};

// ─────────────────────────── CART & WISHLIST TAB ────────────────────────────
const CartAndWishlist = () => {
  const {
    cart, addToCart, removeFromCart, updateQty, clearCart, placeOrder,
    wishlist, toggleWishlist,
  } = useKartStore();

  const [subTab, setSubTab] = useState('cart');

  const [showCheckout, setShowCheckout] = useState(false);

  const cartTotal = cart.reduce((s, i) => s + i.price * i.qty, 0);

  const handlePlaceOrder = () => {
    if (!cart.length) { toast.error('Cart is empty!'); return; }
    setShowCheckout(true);
  };

  const completeOrder = (earnedCoins) => {
    placeOrder(cart);
    setShowCheckout(false);
    toast.success(
      (t) => (
        <span className="flex flex-col gap-1">
          <span className="font-bold">Order placed! 🎉</span>
          <span className="text-xs text-slate-500">You earned <span className="text-accent1 font-bold">{earnedCoins} QalaCoins</span>!</span>
        </span>
      ),
      { duration: 5000 }
    );
  };

  return (
    <div>
      {/* Sub-tabs */}
      <div className="flex gap-2 mb-6 p-1 bg-surface/40 rounded-2xl border border-white/5 w-fit">
        {['cart', 'wishlist'].map((tab) => (
          <button
            key={tab}
            onClick={() => setSubTab(tab)}
            className={`px-5 py-2 rounded-xl text-sm font-semibold capitalize transition-all duration-300 ${
              subTab === tab
                ? 'bg-gradient-to-r from-accent1 to-accent2 text-black shadow-[0_0_15px_rgba(212,175,55,0.4)]'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            {tab === 'cart' ? '🛒 Cart' : '❤️ Wishlist'}
            <span className="ml-2 text-xs bg-white/10 px-1.5 py-0.5 rounded-full">
              {tab === 'cart' ? cart.length : wishlist.length}
            </span>
          </button>
        ))}
      </div>

      <AnimatePresence mode="wait">
        {/* ── CART ── */}
        {subTab === 'cart' && (
          <motion.div
            key="cart"
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: 20 }}
          >
            {cart.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-20 text-center">
                <div className="w-20 h-20 rounded-3xl bg-accent1/10 flex items-center justify-center mb-4">
                  <ShoppingCart className="w-10 h-10 text-accent1/40" />
                </div>
                <p className="text-slate-400 text-lg font-semibold">Your cart is empty</p>
                <p className="text-slate-600 text-sm mt-1">
                  Add products from Browse to see them here.
                </p>
              </div>
            ) : (
              <div className="grid lg:grid-cols-3 gap-6">
                {/* Cart items */}
                <div className="lg:col-span-2 space-y-4">
                  {cart.map((item, i) => (
                    <motion.div
                      key={item.id}
                      initial={{ opacity: 0, y: 15 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, x: -30 }}
                      transition={{ delay: i * 0.06 }}
                      layout
                      className="glass-card rounded-2xl p-4 flex items-center gap-4"
                    >
                      <img
                        src={item.image}
                        alt={item.name}
                        className="w-20 h-20 rounded-xl object-cover border border-white/10 shrink-0"
                      />
                      <div className="flex-1 min-w-0">
                        <p className="font-outfit font-bold text-white truncate">{item.name}</p>
                        <p className="text-xs text-slate-400 mb-1">by {item.creator}</p>
                        <p className="text-accent2 font-bold">₹{item.price}</p>
                      </div>
                      {/* Qty controls */}
                      <div className="flex items-center gap-2 shrink-0">
                        <button
                          onClick={() => updateQty(item.id, item.qty - 1)}
                          className="w-7 h-7 rounded-lg bg-white/5 hover:bg-white/10 border border-white/10 flex items-center justify-center text-white transition-colors"
                        >
                          <Minus className="w-3 h-3" />
                        </button>
                        <span className="text-white font-bold w-6 text-center">{item.qty}</span>
                        <button
                          onClick={() => updateQty(item.id, item.qty + 1)}
                          className="w-7 h-7 rounded-lg bg-white/5 hover:bg-white/10 border border-white/10 flex items-center justify-center text-white transition-colors"
                        >
                          <Plus className="w-3 h-3" />
                        </button>
                        <button
                          onClick={() => { removeFromCart(item.id); toast.success('Removed from cart'); }}
                          className="ml-2 text-slate-500 hover:text-red-400 transition-colors"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </motion.div>
                  ))}

                  <button
                    onClick={() => { clearCart(); toast.success('Cart cleared'); }}
                    className="text-xs text-slate-500 hover:text-red-400 transition-colors flex items-center gap-1.5 mt-2"
                  >
                    <Trash2 className="w-3.5 h-3.5" /> Clear All
                  </button>
                </div>

                {/* Order summary */}
                <div className="lg:col-span-1">
                  <div className="glass-card rounded-2xl p-5 sticky top-24">
                    <h3 className="text-lg font-outfit font-bold text-white mb-4">
                      Order Summary
                    </h3>
                    <div className="space-y-2 mb-4 text-sm">
                      {cart.map((i) => (
                        <div key={i.id} className="flex justify-between text-slate-400">
                          <span className="truncate max-w-[140px]">
                            {i.name} ×{i.qty}
                          </span>
                          <span className="text-white shrink-0 ml-2">₹{i.price * i.qty}</span>
                        </div>
                      ))}
                      <div className="border-t border-white/10 pt-2 flex justify-between font-bold text-white text-base">
                        <span>Total</span>
                        <span className="neon-text">₹{cartTotal}</span>
                      </div>
                    </div>
                    <button
                      onClick={handlePlaceOrder}
                      className="w-full btn-primary flex items-center justify-center gap-2"
                    >
                      <Gift className="w-4 h-4" />
                      Place Order
                    </button>
                    <p className="text-[11px] text-slate-500 text-center mt-3">
                      Orders are fulfilled by local QalaKart creators.
                    </p>
                  </div>
                </div>
              </div>
            )}
          </motion.div>
        )}

        {/* ── CHECKOUT ── */}
        {showCheckout && (
          <CheckoutModal 
            cart={cart} 
            total={cartTotal} 
            onClose={() => setShowCheckout(false)} 
            onComplete={(coins) => completeOrder(coins)} 
          />
        )}

        {/* ── WISHLIST ── */}
        {subTab === 'wishlist' && (
          <motion.div
            key="wishlist"
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
          >
            {wishlist.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-20 text-center">
                <div className="w-20 h-20 rounded-3xl bg-rose-500/10 flex items-center justify-center mb-4">
                  <Heart className="w-10 h-10 text-rose-400/40" />
                </div>
                <p className="text-slate-400 text-lg font-semibold">No saved items yet</p>
                <p className="text-slate-600 text-sm mt-1">
                  Tap the ❤️ on any product to save it here.
                </p>
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
                {wishlist.map((product, i) => (
                  <motion.div
                    key={product.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, scale: 0.9 }}
                    transition={{ delay: i * 0.07 }}
                    layout
                    className="glass-card rounded-2xl overflow-hidden group hover:border-accent1/30 transition-all"
                  >
                    <div className="relative h-44 overflow-hidden">
                      <img
                        src={product.image}
                        alt={product.name}
                        className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                      />
                      <button
                        onClick={() => { toggleWishlist(product); toast.success('Removed from wishlist'); }}
                        className="absolute top-3 right-3 w-8 h-8 rounded-full bg-black/60 backdrop-blur-md flex items-center justify-center text-rose-400 hover:text-rose-300 transition-colors"
                      >
                        <Heart className="w-4 h-4 fill-rose-400" />
                      </button>
                    </div>
                    <div className="p-4">
                      <p className="text-xs text-accent1 font-semibold mb-0.5">{product.category}</p>
                      <h3 className="font-outfit font-bold text-white text-base line-clamp-1 mb-1">
                        {product.name}
                      </h3>
                      <p className="text-xs text-slate-500 mb-3">by {product.creator}</p>
                      <div className="flex items-center justify-between">
                        <span className="font-bold text-white text-lg">₹{product.price}</span>
                        <button
                          onClick={() => {
                            addToCart(product);
                            toast.success(`${product.name} added to cart!`);
                          }}
                          className="btn-primary text-xs px-4 py-2 flex items-center gap-1.5"
                        >
                          <ShoppingCart className="w-3.5 h-3.5" />
                          Add to Cart
                        </button>
                      </div>
                    </div>
                  </motion.div>
                ))}
              </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

// ─────────────────────────── MAIN MY KART PAGE ──────────────────────────────
const MyKart = () => {
  const [mainTab, setMainTab] = useState('orders');
  const navigate = useNavigate();
  const { cart, orders, wishlist } = useKartStore();
  const upcomingCount = orders.filter((o) => o.status === 'upcoming').length;

  const tabs = [
    {
      id: 'orders',
      label: 'My Orders',
      icon: <Package className="w-4 h-4" />,
      badge: upcomingCount,
    },
    {
      id: 'cart',
      label: 'Cart & Wishlist',
      icon: <ShoppingCart className="w-4 h-4" />,
      badge: cart.length + wishlist.length,
    },
  ];

  return (
    <div className="py-8 max-w-5xl mx-auto">
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

      {/* Page Header */}
      <div className="mb-8">
        <h1 className="text-3xl md:text-4xl font-outfit font-extrabold text-white mb-2">
          My <span className="neon-text">Kart</span>
        </h1>
        <p className="text-slate-400 text-sm">
          Track your orders, manage your cart, and view your saved items.
        </p>
      </div>

      {/* Main Tabs */}
      <div className="flex gap-3 mb-8 border-b border-white/5 pb-0">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            onClick={() => setMainTab(tab.id)}
            className={`relative flex items-center gap-2 px-5 py-3 text-sm font-semibold transition-all duration-300 rounded-t-xl ${
              mainTab === tab.id
                ? 'text-white bg-surface/60 border border-b-0 border-white/10'
                : 'text-slate-400 hover:text-white hover:bg-white/5'
            }`}
          >
            {tab.icon}
            {tab.label}
            {tab.badge > 0 && (
              <span className="ml-1 bg-gradient-to-r from-accent1 to-accent2 text-black text-[10px] font-bold w-5 h-5 rounded-full flex items-center justify-center">
                {tab.badge}
              </span>
            )}
            {mainTab === tab.id && (
              <motion.div
                layoutId="tabUnderline"
                className="absolute bottom-0 left-0 right-0 h-0.5 bg-gradient-to-r from-accent1 to-accent2"
              />
            )}
          </button>
        ))}
      </div>

      {/* Tab Content */}
      <AnimatePresence mode="wait">
        <motion.div
          key={mainTab}
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -16 }}
          transition={{ duration: 0.25 }}
        >
          {mainTab === 'orders' ? <MyOrders /> : <CartAndWishlist />}
        </motion.div>
      </AnimatePresence>
    </div>
  );
};

export default MyKart;
