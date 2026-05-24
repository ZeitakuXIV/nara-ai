'use client';

import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Send, 
  ChevronLeft, 
  ShieldCheck, 
  Info, 
  Sparkles, 
  User,
  MoreVertical,
  Plus,
  ArrowLeft
} from 'lucide-react';

// Mock chat history for demonstration
const INITIAL_MESSAGES = [
  {
    id: 1,
    sender: 'nara',
    text: "Hello! I'm NARA, your Nutrition Adaptive Reasoning Agent. I've analyzed your biometric data and prepared your local meal plan. How can I help you today?",
    timestamp: '09:00'
  },
  {
    id: 2,
    sender: 'user',
    text: "Why did you increase the portion of chicken in my lunch?",
    timestamp: '09:01'
  },
  {
    id: 3,
    sender: 'nara',
    text: "Based on my abductive reasoning, I increased your chicken breast portion by 45g to meet your protein target of 120g/day. I also accounted for a 15% protein reduction during the frying process.",
    timestamp: '09:01',
    isXAI: true
  }
];

export default function Chatbot() {
  const [messages, setMessages] = useState(INITIAL_MESSAGES);
  const [inputValue, setInputValue] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  // Auto scroll to bottom
  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages, isTyping]);

  const handleSend = () => {
    if (!inputValue.trim()) return;

    const newUserMsg = {
      id: Date.now(),
      sender: 'user',
      text: inputValue,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    };

    setMessages([...messages, newUserMsg]);
    setInputValue('');
    
    // Simulate AI thinking
    setIsTyping(true);
    setTimeout(() => {
      setIsTyping(false);
      const naraReply = {
        id: Date.now() + 1,
        sender: 'nara',
        text: "This is a frontend-only demonstration. My expert system engine is ready to be linked to this interface.",
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      };
      setMessages(prev => [...prev, naraReply]);
    }, 2000);
  };

  const quickActions = [
    "Why this menu?",
    "Allergy check",
    "Swap ingredient",
    "Nutrition detail"
  ];

  return (
    <div className="flex-1 flex flex-col bg-nara-light h-[100dvh] relative overflow-hidden">
      
      {/* Mesh Background */}
      <div className="absolute top-0 left-0 w-full h-full bg-mesh-gradient opacity-30 pointer-events-none" />

      {/* Chat Header */}
      <header className="nav-blur px-6 py-4 flex items-center justify-between z-20">
        <div className="flex items-center gap-4">
          <button 
            onClick={() => window.history.back()}
            className="w-8 h-8 flex items-center justify-center rounded-full bg-slate-100 text-nara-text active:scale-90 transition-all"
          >
            <ArrowLeft size={18} />
          </button>
          <div className="flex items-center gap-3">
             <div className="w-10 h-10 bg-nara-hunter rounded-2xl flex items-center justify-center shadow-soft relative">
                <span className="text-white font-black text-lg">N</span>
                <div className="absolute -bottom-0.5 -right-0.5 w-3 h-3 bg-nara-emerald border-2 border-white rounded-full" />
             </div>
             <div>
                <h1 className="text-sm font-bold text-nara-text">N.A.R.A Agent</h1>
                <div className="flex items-center gap-1">
                   <div className="w-1 h-1 rounded-full bg-nara-emerald animate-pulse" />
                   <span className="text-[10px] font-bold text-nara-emerald uppercase tracking-widest">Logic Engine Online</span>
                </div>
             </div>
          </div>
        </div>
        <button className="text-slate-400 hover:text-nara-text transition-colors">
          <MoreVertical size={20} />
        </button>
      </header>

      {/* Messages Area */}
      <div 
        ref={scrollRef}
        className="flex-1 overflow-y-auto px-6 py-8 space-y-6 z-10 no-scrollbar"
      >
        <div className="text-center mb-8">
           <span className="px-4 py-1.5 rounded-full bg-white/50 border border-white/80 text-[10px] font-bold text-slate-400 uppercase tracking-widest">Today • May 24</span>
        </div>

        <AnimatePresence>
          {messages.map((msg) => (
            <motion.div
              key={msg.id}
              initial={{ opacity: 0, y: 10, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              className={`flex ${msg.sender === 'user' ? 'justify-end' : 'justify-start'}`}
            >
              <div className={`max-w-[85%] flex flex-col ${msg.sender === 'user' ? 'items-end' : 'items-start'}`}>
                {msg.isXAI && (
                  <div className="flex items-center gap-1.5 mb-1.5 px-2">
                     <ShieldCheck size={12} className="text-nara-emerald" />
                     <span className="text-[9px] font-black text-nara-emerald uppercase tracking-widest">Explainable AI (XAI) Insight</span>
                  </div>
                )}
                
                <div className={`p-4 rounded-[24px] ${
                  msg.sender === 'user' 
                  ? 'bg-nara-hunter text-white rounded-tr-none shadow-soft shadow-nara-hunter/10' 
                  : msg.isXAI 
                  ? 'bg-nara-evergreen text-white rounded-tl-none border border-nara-hunter/30 shadow-float'
                  : 'bg-white/70 backdrop-blur-md border border-white/80 text-nara-text rounded-tl-none shadow-sm'
                }`}>
                  <p className="text-[15px] leading-relaxed font-medium">
                    {msg.text}
                  </p>
                </div>
                <span className="mt-1.5 text-[10px] font-bold text-slate-400 px-2 uppercase">
                   {msg.timestamp}
                </span>
              </div>
            </motion.div>
          ))}
        </AnimatePresence>

        {isTyping && (
          <motion.div 
            initial={{ opacity: 0 }} 
            animate={{ opacity: 1 }} 
            className="flex justify-start"
          >
            <div className="bg-white/50 backdrop-blur-sm p-4 rounded-[24px] rounded-tl-none border border-white/80 flex gap-1">
              <motion.div animate={{ opacity: [0.4, 1, 0.4] }} transition={{ repeat: Infinity, duration: 1 }} className="w-1.5 h-1.5 bg-nara-hunter rounded-full" />
              <motion.div animate={{ opacity: [0.4, 1, 0.4] }} transition={{ repeat: Infinity, duration: 1, delay: 0.2 }} className="w-1.5 h-1.5 bg-nara-hunter rounded-full" />
              <motion.div animate={{ opacity: [0.4, 1, 0.4] }} transition={{ repeat: Infinity, duration: 1, delay: 0.4 }} className="w-1.5 h-1.5 bg-nara-hunter rounded-full" />
            </div>
          </motion.div>
        )}
      </div>

      {/* Input Section */}
      <div className="p-6 bg-white/40 backdrop-blur-2xl border-t border-white/60 z-20">
        {/* Quick Actions */}
        <div className="flex gap-2 overflow-x-auto no-scrollbar mb-4">
           {quickActions.map((action, i) => (
             <button 
               key={i} 
               onClick={() => { setInputValue(action); }}
               className="whitespace-nowrap px-4 py-2 rounded-full bg-white border border-slate-100 text-[11px] font-bold text-nara-hunter shadow-sm active:scale-95 transition-all hover:bg-nara-hunter/5"
             >
                {action}
             </button>
           ))}
        </div>

        <div className="flex items-center gap-3">
          <button className="w-12 h-12 flex items-center justify-center rounded-2xl bg-white border border-slate-100 text-slate-400 shadow-sm active:scale-90 transition-all">
             <Plus size={20} />
          </button>
          <div className="flex-1 relative">
            <input 
              type="text" 
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && handleSend()}
              placeholder="Ask NARA about your diet..."
              className="w-full bg-white border border-slate-100 rounded-[20px] px-5 py-3.5 pr-12 text-[15px] focus:outline-none focus:border-nara-hunter shadow-sm transition-all"
            />
            <button 
              onClick={handleSend}
              className={`absolute right-2 top-2 w-10 h-10 flex items-center justify-center rounded-xl transition-all ${
                inputValue.trim() ? 'bg-nara-hunter text-white shadow-soft' : 'bg-slate-50 text-slate-300'
              }`}
            >
              <Send size={18} />
            </button>
          </div>
        </div>
        
        <p className="mt-4 text-center text-[9px] text-slate-400 font-bold uppercase tracking-[0.3em]">
           Hybrid Reasoning Engine v2.0
        </p>
      </div>

    </div>
  );
}
