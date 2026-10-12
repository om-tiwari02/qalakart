import React from 'react';
import { motion } from 'framer-motion';
import { useNavigate, Link, useLocation } from 'react-router-dom';
import { ShoppingCart, Heart, Menu, X, User } from 'lucide-react';
import useAuthStore from '../../store/authStore';
import useKartStore from '../../store/kartStore';
import useUIStore from '../../store/uiStore';
import { env } from '../../lib/env';

const getProfileImageUrl = (path) => {
  if (!path) return '';
  if (path.startsWith('http') || path.startsWith('data:')) return path;
  if (path.startsWith('/uploads/')) return `${env.VITE_API_BASE_URL}${path}`;
  return path;
};
const Navbar = () => {
  const { user, role, logout } = useAuthStore();
  const { cart, wishlist } = useKartStore();
  const { openAuthModal } = useUIStore();
  const navigate = useNavigate();
  const location = useLocation();
  const cartCount = cart.reduce((acc, item) => acc + (item.qty || 0), 0);
  const totalKartCount = cartCount + wishlist.length;
  const profileImageUrl = getProfileImageUrl(user?.profileImage);

  const handleProfileClick = () => {
    const profilePath = '/profile';
    
    if (location.pathname === profilePath) {
      // If already on profile, click works as back button
      navigate(-1);
    } else {
      // Otherwise, open profile
      navigate(profilePath);
    }
  };

  return (
    <nav className="fixed top-0 left-0 w-full z-50 glass-card border-b border-white/5 py-4 px-6 md:px-12">
      <div className="max-w-7xl mx-auto flex items-center justify-between">
        <div className="flex items-center gap-8">
          <Link to="/" className="flex items-center gap-3 group">
            <motion.img 
              src="/logo.jpeg" 
              alt="QalaKart Logo" 
              className="w-10 h-10 object-contain drop-shadow-xl"
              whileHover={{ scale: 1.1, rotate: -5 }}
            />
            <div className="flex flex-col">
              <span className="text-2xl font-outfit font-black tracking-tighter text-white">QalaKart</span>
              <div className="h-0.5 w-0 group-hover:w-full bg-accent1 transition-all duration-300" />
            </div>
          </Link>
        </div>

        <div className="flex items-center gap-6">
          {role === 'buyer' && (
            <Link to="/my-kart" className="relative p-2 text-slate-300 hover:text-accent1 transition-colors group">
              <div className="flex items-center gap-2">
                <ShoppingCart className="w-5 h-5" />
                <span className="hidden sm:block font-medium">My Kart</span>
                {totalKartCount > 0 && (
                  <span className="absolute -top-1 -right-1 w-5 h-5 bg-accent1 text-black text-[10px] font-bold rounded-full flex items-center justify-center animate-pulse">
                    {totalKartCount}
                  </span>
                )}
              </div>
            </Link>
          )}

          {role === 'creator' && (
            <Link to="/creator/dashboard" className="relative p-2 text-slate-300 hover:text-accent2 transition-colors group">
              <div className="flex items-center gap-2">
                <span className="font-medium">Creator Dashboard</span>
              </div>
            </Link>
          )}

          {user && (
            <div 
              onClick={handleProfileClick}
              className="flex items-center gap-2 text-slate-300 hover:text-accent1 transition-colors cursor-pointer select-none"
            >
              <div className="w-8 h-8 rounded-full overflow-hidden border border-white/10 bg-white/10 flex items-center justify-center">
                {profileImageUrl ? (
                  <img src={profileImageUrl} alt={`${user.name} profile`} className="w-full h-full object-cover" />
                ) : (
                  <User className="w-4 h-4" />
                )}
              </div>
              <span className="hidden lg:block font-medium">{user.name}</span>
            </div>
          )}
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
