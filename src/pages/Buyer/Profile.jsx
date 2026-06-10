import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { User, Mail, Phone, MapPin, Calendar, Coins, History, Save, Edit2, Camera } from 'lucide-react';
import useAuthStore from '../../store/authStore';
import { useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import { env } from '../../lib/env';

const getProfileImageUrl = (path) => {
  if (!path) return '';
  if (path.startsWith('http') || path.startsWith('data:')) return path;
  if (path.startsWith('/uploads/')) return `${env.VITE_API_BASE_URL}${path}`;
  return path;
};

const Profile = () => {
  const { user, updateUser, uploadProfileImage } = useAuthStore();
  const navigate = useNavigate();
  const [isEditing, setIsEditing] = useState(false);
  const [isUploadingImage, setIsUploadingImage] = useState(false);
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

  const handleProfileImageChange = (event) => {
    const file = event.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      toast.error('Please choose an image file');
      return;
    }

    if (file.size > 2_000_000) {
      toast.error('Image must be smaller than 2MB');
      return;
    }

    const reader = new FileReader();
    reader.onloadend = async () => {
      setIsUploadingImage(true);
      try {
        await uploadProfileImage(reader.result);
        toast.success('Profile image saved');
      } catch (error) {
        toast.error(error.response?.data?.error?.message || 'Could not save profile image');
      } finally {
        setIsUploadingImage(false);
      }
    };
    reader.readAsDataURL(file);
    event.target.value = '';
  };

  if (!user) return null;

  const profileImageUrl = getProfileImageUrl(user.profileImage);

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
            <label className="relative block w-24 h-24 rounded-2xl bg-surface border-4 border-white/5 shadow-2xl overflow-hidden group cursor-pointer">
              {profileImageUrl ? (
                <img src={profileImageUrl} alt="Profile" className="w-full h-full object-cover" />
              ) : (
                <div className="w-full h-full flex items-center justify-center">
                  <User className="w-12 h-12 text-accent1" />
                </div>
              )}
              <input
                type="file"
                accept="image/png,image/jpeg,image/jpg,image/webp"
                className="hidden"
                onChange={handleProfileImageChange}
                disabled={isUploadingImage}
              />
              <div className="absolute inset-0 bg-black/55 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                <Camera className="w-6 h-6 text-white" />
              </div>
              {isUploadingImage && (
                <div className="absolute inset-0 bg-black/70 flex items-center justify-center text-[10px] font-bold uppercase tracking-wider text-white">
                  Saving
                </div>
              )}
            </label>
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
