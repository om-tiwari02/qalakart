import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { User, Mail, Phone, MapPin, Calendar, Coins, History, Save, Edit2 } from 'lucide-react';
import useAuthStore from '../../store/authStore';
import { useNavigate } from 'react-router-dom';

const Profile = () => {
  const { user, updateUser } = useAuthStore();
  const navigate = useNavigate();
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState({
    name: user?.name || '',
    age: user?.age || '',
    address: user?.address || '',
    phone: user?.phone || '',
    email: user?.email || '',
  });

  const handleSave = () => {
    updateUser(formData);
    setIsEditing(false);
  };

  if (!user) return null;

  return (
    <div className="max-w-4xl mx-auto py-8 px-4">
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="glass-card rounded-3xl overflow-hidden"
      >
        {/* Header/Banner */}
        <div className="h-32 bg-gradient-to-r from-accent1/20 to-accent2/20 relative">
          <div className="absolute -bottom-12 left-8">
            <div className="w-24 h-24 rounded-2xl bg-surface border-4 border-white/5 flex items-center justify-center shadow-2xl">
              <User className="w-12 h-12 text-accent1" />
            </div>
          </div>
          <div className="absolute top-4 right-8">
            <button 
              onClick={() => isEditing ? handleSave() : setIsEditing(true)}
              className="btn-primary flex items-center gap-2"
            >
              {isEditing ? <Save className="w-4 h-4" /> : <Edit2 className="w-4 h-4" />}
              {isEditing ? 'Save Changes' : 'Edit Profile'}
            </button>
          </div>
        </div>

        <div className="pt-16 pb-8 px-8">
          <div className="mb-8">
            <h1 className="text-3xl font-black">{user.name}</h1>
            <p className="text-slate-400">QalaKart Member</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {/* Left Column: Info */}
            <div className="space-y-6">
              <div className="flex items-center gap-4 group">
                <div className="w-10 h-10 rounded-xl bg-white/5 flex items-center justify-center text-slate-400 group-hover:text-accent1 transition-colors">
                  <User className="w-5 h-5" />
                </div>
                <div className="flex-1">
                  <label className="text-xs text-slate-500 block">Full Name</label>
                  {isEditing ? (
                    <input 
                      type="text"
                      className="bg-white/5 border border-white/10 rounded-lg px-3 py-1 w-full text-white outline-none focus:border-accent1/50"
                      value={formData.name}
                      onChange={(e) => setFormData({...formData, name: e.target.value})}
                    />
                  ) : (
                    <span className="font-medium">{user.name}</span>
                  )}
                </div>
              </div>

              <div className="flex items-center gap-4 group">
                <div className="w-10 h-10 rounded-xl bg-white/5 flex items-center justify-center text-slate-400 group-hover:text-accent1 transition-colors">
                  <Calendar className="w-5 h-5" />
                </div>
                <div className="flex-1">
                  <label className="text-xs text-slate-500 block">Age</label>
                  {isEditing ? (
                    <input 
                      type="number"
                      className="bg-white/5 border border-white/10 rounded-lg px-3 py-1 w-full text-white outline-none focus:border-accent1/50"
                      value={formData.age}
                      onChange={(e) => setFormData({...formData, age: e.target.value})}
                    />
                  ) : (
                    <span className="font-medium">{user.age || 'Not set'}</span>
                  )}
                </div>
              </div>

              <div className="flex items-center gap-4 group">
                <div className="w-10 h-10 rounded-xl bg-white/5 flex items-center justify-center text-slate-400 group-hover:text-accent1 transition-colors">
                  <Phone className="w-5 h-5" />
                </div>
                <div className="flex-1">
                  <label className="text-xs text-slate-500 block">Phone Number</label>
                  {isEditing ? (
                    <input 
                      type="text"
                      className="bg-white/5 border border-white/10 rounded-lg px-3 py-1 w-full text-white outline-none focus:border-accent1/50"
                      value={formData.phone}
                      onChange={(e) => setFormData({...formData, phone: e.target.value})}
                    />
                  ) : (
                    <span className="font-medium">{user.phone || 'Not set'}</span>
                  )}
                </div>
              </div>

              <div className="flex items-center gap-4 group">
                <div className="w-10 h-10 rounded-xl bg-white/5 flex items-center justify-center text-slate-400 group-hover:text-accent1 transition-colors">
                  <Mail className="w-5 h-5" />
                </div>
                <div className="flex-1">
                  <label className="text-xs text-slate-500 block">Gmail</label>
                  {isEditing ? (
                    <input 
                      type="email"
                      className="bg-white/5 border border-white/10 rounded-lg px-3 py-1 w-full text-white outline-none focus:border-accent1/50"
                      value={formData.email}
                      onChange={(e) => setFormData({...formData, email: e.target.value})}
                    />
                  ) : (
                    <span className="font-medium">{user.email || 'Not set'}</span>
                  )}
                </div>
              </div>

              <div className="flex items-center gap-4 group">
                <div className="w-10 h-10 rounded-xl bg-white/5 flex items-center justify-center text-slate-400 group-hover:text-accent1 transition-colors">
                  <MapPin className="w-5 h-5" />
                </div>
                <div className="flex-1">
                  <label className="text-xs text-slate-500 block">Address</label>
                  {isEditing ? (
                    <textarea 
                      className="bg-white/5 border border-white/10 rounded-lg px-3 py-1 w-full text-white outline-none focus:border-accent1/50 h-20"
                      value={formData.address}
                      onChange={(e) => setFormData({...formData, address: e.target.value})}
                    />
                  ) : (
                    <span className="font-medium">{user.address || 'Not set'}</span>
                  )}
                </div>
              </div>
            </div>

            {/* Right Column: Stats & Links */}
            <div className="space-y-6">
              <div className="p-6 rounded-2xl bg-gradient-to-br from-accent1/10 to-accent2/10 border border-accent1/20">
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-3">
                    <Coins className="text-accent1 w-6 h-6" />
                    <span className="font-bold">QalaCoins Earned</span>
                  </div>
                  <span className="text-2xl font-black text-accent1">{user.qalaCoins || 0}</span>
                </div>
                <p className="text-sm text-slate-400">Earn more coins by purchasing art and leaving reviews!</p>
              </div>

              <button 
                onClick={() => navigate('/my-kart')}
                className="w-full p-4 rounded-2xl bg-white/5 border border-white/10 flex items-center justify-between hover:bg-white/10 transition-all group"
              >
                <div className="flex items-center gap-4">
                  <History className="w-6 h-6 text-slate-400 group-hover:text-accent1" />
                  <span className="font-medium">Order History</span>
                </div>
                <div className="w-8 h-8 rounded-full bg-white/5 flex items-center justify-center group-hover:translate-x-1 transition-transform">
                  →
                </div>
              </button>
            </div>
          </div>
        </div>
      </motion.div>
    </div>
  );
};

export default Profile;
