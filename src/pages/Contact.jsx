import React from 'react';
import { motion } from 'framer-motion';
import { Mail, Phone, MapPin, Send, MessageSquare, Camera } from 'lucide-react';

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

const Contact = () => {
  const contactInfo = [
    { 
      label: 'Email', 
      value: 'som91094@gmail.com', 
      icon: <Mail className="w-6 h-6" />,
      color: 'text-blue-400',
      bg: 'bg-blue-400/10'
    },
    { 
      label: 'Instagram', 
      value: '@qalakart_0206', 
      icon: <InstagramIcon className="w-6 h-6" />,
      color: 'text-pink-400',
      bg: 'bg-pink-400/10'
    },
    { 
      label: 'Location', 
      value: 'Bhopal, MP', 
      icon: <MapPin className="w-6 h-6" />,
      color: 'text-green-400',
      bg: 'bg-green-400/10'
    }
  ];

  return (
    <div className="max-w-4xl mx-auto py-16 px-6">
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="text-center mb-16"
      >
        <h1 className="text-5xl font-black mb-4">Get in <span className="neon-text">Touch</span></h1>
        <p className="text-slate-400 max-w-lg mx-auto">Have questions or need support? Our team is here to help you 24/7.</p>
      </motion.div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-16">
        {contactInfo.map((info, idx) => (
          <motion.div
            key={info.label}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: idx * 0.1 }}
            className="glass-card p-8 rounded-3xl text-center border border-white/5 hover:border-white/10 transition-all group"
          >
            <div className={`w-14 h-14 rounded-2xl ${info.bg} ${info.color} flex items-center justify-center mx-auto mb-6 group-hover:scale-110 transition-transform`}>
              {info.icon}
            </div>
            <h3 className="text-slate-500 text-xs font-bold uppercase tracking-widest mb-2">{info.label}</h3>
            <div className="text-white font-bold break-all">{info.value}</div>
          </motion.div>
        ))}
      </div>

      <div className="glass-card p-10 rounded-[3rem] border border-white/5 relative overflow-hidden">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-12 items-center">
          <div>
            <h2 className="text-3xl font-black text-white mb-6">Send us a Message</h2>
            <div className="space-y-4">
              <div className="flex gap-4 items-center p-4 rounded-2xl bg-white/5 border border-white/5">
                <MessageSquare className="text-accent1" />
                <span className="text-slate-300">Fastest response on Instagram DM</span>
              </div>
              <div className="flex gap-4 items-center p-4 rounded-2xl bg-white/5 border border-white/5">
                <MapPin className="text-accent2" />
                <span className="text-slate-300">Based in Bhopal, Madhya Pradesh</span>
              </div>
            </div>
          </div>
          <form className="space-y-4">
            <input type="text" placeholder="Your Name" className="w-full bg-white/5 border border-white/10 rounded-2xl px-6 py-4 text-white focus:outline-none focus:border-accent1 transition-colors" />
            <input type="email" placeholder="Your Email" className="w-full bg-white/5 border border-white/10 rounded-2xl px-6 py-4 text-white focus:outline-none focus:border-accent1 transition-colors" />
            <textarea placeholder="How can we help?" rows="4" className="w-full bg-white/5 border border-white/10 rounded-2xl px-6 py-4 text-white focus:outline-none focus:border-accent1 transition-colors resize-none"></textarea>
            <button className="btn-primary w-full py-4 text-lg font-bold flex items-center justify-center gap-2">
              <Send className="w-5 h-5" />
              Send Message
            </button>
          </form>
        </div>
        
        {/* Decorative elements */}
        <div className="absolute -left-20 -bottom-20 w-64 h-64 bg-accent1/10 blur-[100px] rounded-full" />
        <div className="absolute -right-20 -top-20 w-64 h-64 bg-accent2/10 blur-[100px] rounded-full" />
      </div>
    </div>
  );
};

export default Contact;
