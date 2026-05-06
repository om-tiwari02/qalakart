import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Bot, X, Send, Sparkles, User, Minus, Paperclip, Image as ImageIcon } from 'lucide-react';
import useAuthStore from '../../store/authStore';
import { getAIResponse } from '../../services/aiService';

const AIAssistant = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [input, setInput] = useState('');
  const [image, setImage] = useState(null);
  const [imagePreview, setImagePreview] = useState(null);
  const [messages, setMessages] = useState([
    { role: 'assistant', content: 'Hello! I am your QalaKart AI Assistant. You can ask me anything or upload a photo to find similar products!' }
  ]);
  const [isTyping, setIsTyping] = useState(false);
  const messagesEndRef = useRef(null);
  const fileInputRef = useRef(null);
  const { role } = useAuthStore();

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setImage(reader.result);
        setImagePreview(reader.result);
      };
      reader.readAsDataURL(file);
    }
  };

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, isTyping]);

  const handleSend = async (e) => {
    e.preventDefault();
    if (!input.trim() && !image) return;

    const userMessage = { 
      role: 'user', 
      content: input,
      image: imagePreview
    };
    
    setMessages(prev => [...prev, userMessage]);
    const currentInput = input;
    const currentImage = image;
    
    setInput('');
    setImage(null);
    setImagePreview(null);
    setIsTyping(true);

    const aiResponse = await getAIResponse(currentInput, currentImage);
    
    setMessages(prev => [...prev, { role: 'assistant', content: aiResponse }]);
    setIsTyping(false);
  };

  return (
    <div className="fixed bottom-6 right-6 z-[60]">
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: 20, scale: 0.95, transformOrigin: 'bottom right' }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 20, scale: 0.95 }}
            className="mb-4 w-[380px] h-[550px] glass-card rounded-3xl overflow-hidden flex flex-col shadow-[0_20px_50px_rgba(0,0,0,0.5)] border-white/10"
          >
            {/* Header */}
            <div className="px-6 py-4 bg-gradient-to-r from-accent1/20 to-accent2/20 border-b border-white/5 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-accent1/20 flex items-center justify-center border border-accent1/30">
                  <Bot className="w-6 h-6 text-accent1" />
                </div>
                <div>
                  <h3 className="font-outfit font-bold text-white leading-tight">Qala AI</h3>
                  <span className="text-[10px] text-accent2 font-bold uppercase tracking-widest">Active Assistant</span>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <button 
                  onClick={() => setIsOpen(false)}
                  className="p-2 hover:bg-white/5 rounded-full text-slate-400 transition-colors"
                >
                  <Minus className="w-5 h-5" />
                </button>
              </div>
            </div>

            {/* Chat Area */}
            <div className="flex-1 overflow-y-auto p-6 space-y-4 hide-scrollbar">
              {messages.map((msg, index) => (
                <motion.div
                  initial={{ opacity: 0, x: msg.role === 'user' ? 10 : -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  key={index}
                  className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
                >
                  <div className={`max-w-[85%] p-4 rounded-2xl text-sm ${
                    msg.role === 'user' 
                    ? 'bg-accent1 text-black font-medium rounded-tr-none' 
                    : 'bg-white/5 border border-white/10 text-slate-200 rounded-tl-none'
                  }`}>
                    {msg.image && (
                      <img src={msg.image} alt="uploaded" className="w-full max-h-48 object-cover rounded-xl mb-2 border border-black/10" />
                    )}
                    {msg.content}
                  </div>
                </motion.div>
              ))}
              {isTyping && (
                <div className="flex justify-start">
                  <div className="bg-white/5 border border-white/10 p-4 rounded-2xl rounded-tl-none flex gap-1">
                    <span className="w-1.5 h-1.5 bg-slate-400 rounded-full animate-bounce"></span>
                    <span className="w-1.5 h-1.5 bg-slate-400 rounded-full animate-bounce [animation-delay:0.2s]"></span>
                    <span className="w-1.5 h-1.5 bg-slate-400 rounded-full animate-bounce [animation-delay:0.4s]"></span>
                  </div>
                </div>
              )}

              {/* Suggestions */}
              {!isTyping && messages.length === 1 && (
                <div className="flex flex-wrap gap-2 pt-2">
                  {(role === 'creator' 
                    ? ['How to list product?', 'Pricing help', 'Order tracking']
                    : ['What is Demand Drop?', 'Refund policy', 'Customization help']
                  ).map((suggestion, i) => (
                    <button
                      key={i}
                      onClick={() => {
                        setInput(suggestion);
                      }}
                      className="text-[11px] px-3 py-1.5 rounded-full border border-accent1/20 bg-accent1/5 text-slate-300 hover:border-accent1/50 hover:bg-accent1/10 transition-all"
                    >
                      {suggestion}
                    </button>
                  ))}
                </div>
              )}
              <div ref={messagesEndRef} />
            </div>

            {/* Input Area */}
            <div className="p-4 border-t border-white/5 bg-surface/30">
              {imagePreview && (
                <div className="relative inline-block mb-3">
                  <img src={imagePreview} alt="preview" className="w-20 h-20 object-cover rounded-xl border border-accent1/50 shadow-lg" />
                  <button 
                    onClick={() => { setImage(null); setImagePreview(null); }}
                    className="absolute -top-2 -right-2 bg-black/80 border border-white/20 rounded-full p-1 text-white hover:text-accent2"
                  >
                    <X className="w-3 h-3" />
                  </button>
                </div>
              )}
              <form onSubmit={handleSend} className="flex flex-col gap-3">
                <div className="relative flex items-center gap-2">
                  <button 
                    type="button"
                    onClick={() => fileInputRef.current?.click()}
                    className="p-2.5 bg-white/5 hover:bg-white/10 border border-white/10 rounded-full text-slate-400 transition-colors"
                    title="Upload image"
                  >
                    <ImageIcon className="w-5 h-5" />
                  </button>
                  <input 
                    type="file" 
                    ref={fileInputRef} 
                    onChange={handleImageChange} 
                    accept="image/*" 
                    className="hidden" 
                  />
                  <input
                    type="text"
                    value={input}
                    onChange={(e) => setInput(e.target.value)}
                    placeholder="Type or upload image..."
                    className="flex-1 bg-white/5 border border-white/10 rounded-full py-3 px-5 text-sm text-white focus:outline-none focus:border-accent1/50 transition-all placeholder:text-slate-500"
                  />
                  <button 
                    type="submit"
                    disabled={(!input.trim() && !image) || isTyping}
                    className="p-3 bg-accent1 rounded-full text-black hover:scale-110 active:scale-95 transition-all disabled:opacity-50 disabled:scale-100"
                  >
                    <Send className="w-4 h-4" />
                  </button>
                </div>
                <p className="text-[10px] text-center text-slate-500 flex items-center justify-center gap-1">
                  <Sparkles className="w-3 h-3 text-accent2" /> Powered by Qala AI (Groq)
                </p>
              </form>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <motion.button
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        onClick={() => setIsOpen(!isOpen)}
        className={`w-16 h-16 rounded-full flex items-center justify-center shadow-2xl transition-all duration-500 ${
          isOpen ? 'bg-surface border border-white/10 rotate-90' : 'bg-gradient-to-br from-accent1 to-accent2'
        }`}
      >
        {isOpen ? (
          <X className="w-8 h-8 text-white" />
        ) : (
          <div className="relative">
            <Bot className="w-8 h-8 text-black" />
            <span className="absolute -top-1 -right-1 flex h-3 w-3">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-white opacity-75"></span>
              <span className="relative inline-flex rounded-full h-3 w-3 bg-white"></span>
            </span>
          </div>
        )}
      </motion.button>
    </div>
  );
};

export default AIAssistant;
