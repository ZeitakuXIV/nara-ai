'use client';

import { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import { AnimatePresence, motion } from 'framer-motion';
import { Send, User, MoreVertical, Plus, Calendar, ShieldCheck, Loader2, Target } from 'lucide-react';
import { useUserStore } from '@/store/userStore';

interface Message {
  id: number;
  sender: string;
  text: string;
  timestamp: string;
  isXAI?: boolean;
}

const INITIAL_MESSAGES: Message[] = [
  { id: 1, sender: 'nara', text: "Hello! I'm NARA, your Nutrition Agent. I'm connected to the XAI Inference Engine.", timestamp: '09:00' },
  { id: 2, sender: 'nara', text: "Based on my reasoning, I've scaled your portions to match your goals. Portions are increased by 15% to hit your protein threshold.", timestamp: '09:01', isXAI: true }
];

export default function Chatbot() {
  const [messages, setMessages] = useState(INITIAL_MESSAGES);
  const [inputValue, setInputValue] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);
  const store = useUserStore();

  useEffect(() => {
    if (scrollRef.current) scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
  }, [messages, isTyping]);

  const handleSend = async () => {
    if (!inputValue.trim()) return;
    
    const userMsg = inputValue;
    const msg = { 
      id: Date.now(), 
      sender: 'user', 
      text: userMsg, 
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) 
    };
    
    setMessages(prev => [...prev, msg]);
    setInputValue('');
    setIsTyping(true);

    try {
      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          message: userMsg,
          email: store.email,
          // mealPlan from store acts as client-side fallback if Supabase fetch fails server-side
          // No biometrics are sent — ethical decision, keep personal health data off the agent
          context: {
            mealPlan: store.mealPlan ?? null,
          }
        })
      });

      const data = await response.json();

      if (data.success) {
        const naraReply = {
          id: Date.now() + 1,
          sender: 'nara',
          text: data.response,
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
          isXAI: data.isXAI
        };
        setMessages(prev => [...prev, naraReply]);
      } else {
         throw new Error("Failed to get response");
      }
    } catch (error) {
      console.error(error);
      const errorReply = {
        id: Date.now() + 1,
        sender: 'nara',
        text: "My connection to the Inference Engine was interrupted. Please try again.",
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        isXAI: false
      };
      setMessages(prev => [...prev, errorReply]);
    } finally {
      setIsTyping(false);
    }
  };

  return (
    <div className="app-content bg-nara-light">
      <div className="pwa-bg" />
      
      {/* Header */}
      <header className="px-6 pt-[env(safe-area-inset-top,1.5rem)] pb-4 flex items-center justify-between z-20 shrink-0 bg-white/10 backdrop-blur-md border-b border-white/20">
        <div className="flex items-center gap-3">
           <div className="w-10 h-10 bg-nara-hunter rounded-2xl flex items-center justify-center text-white font-black shadow-soft">N</div>
           <div>
              <h1 className="text-sm font-black text-nara-text">N.A.R.A Agent</h1>
              <div className="flex items-center gap-1">
                 <div className="w-1 h-1 rounded-full bg-nara-emerald animate-pulse" />
                 <span className="text-[9px] text-nara-emerald font-black uppercase tracking-widest">Logic Online</span>
              </div>
           </div>
        </div>
        <MoreVertical size={20} className="text-slate-400" />
      </header>

      {/* Messages Area */}
      <div ref={scrollRef} className="flex-1 overflow-y-auto px-6 py-6 space-y-6 z-10 no-scrollbar">
        <div className="text-center mb-4">
           <span className="px-4 py-1 rounded-full bg-white/40 border border-white/60 text-[9px] font-black text-slate-400 uppercase tracking-widest">Protocol Active</span>
        </div>
        
        <AnimatePresence>
          {messages.map((msg) => (
            <motion.div 
              key={msg.id} 
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className={`flex ${msg.sender === 'user' ? 'justify-end' : 'justify-start'}`}
            >
              <div className={`max-w-[85%] flex flex-col ${msg.sender === 'user' ? 'items-end' : 'items-start'}`}>
                {msg.isXAI && (
                  <div className="flex items-center gap-1.5 mb-1.5 px-2">
                     <ShieldCheck size={12} className="text-nara-emerald" />
                     <span className="text-[9px] font-black text-nara-emerald uppercase tracking-widest">XAI Insight</span>
                  </div>
                )}
                <div className={`p-4 rounded-[24px] shadow-sm ${
                  msg.sender === 'user' 
                  ? 'bg-nara-hunter text-white rounded-tr-none shadow-nara-hunter/10' 
                  : msg.isXAI 
                  ? 'bg-nara-evergreen text-white rounded-tl-none border border-nara-hunter/30' 
                  : 'bg-white/70 backdrop-blur-md text-nara-text rounded-tl-none border border-white/80'
                }`}>
                  <p className="text-[15px] leading-relaxed font-medium">{msg.text}</p>
                </div>
                <span className="mt-1 text-[9px] font-bold text-slate-400 px-2 uppercase">{msg.timestamp}</span>
              </div>
            </motion.div>
          ))}

          {isTyping && (
             <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex justify-start">
               <div className="bg-white/70 backdrop-blur-md p-4 rounded-[24px] rounded-tl-none border border-white/80 flex gap-2 items-center text-nara-hunter">
                 <Loader2 size={16} className="animate-spin" />
                 <span className="text-xs font-bold">Reasoning...</span>
               </div>
             </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Input Section - Floating cleanly above Nav */}
      <div className="px-6 pt-4 pb-[calc(100px+env(safe-area-inset-bottom))] bg-white/40 backdrop-blur-2xl border-t border-white/60 z-20 shrink-0">
        <div className="flex items-center gap-3">
          <button className="w-12 h-12 flex items-center justify-center rounded-2xl bg-white border border-slate-100 text-slate-400 shadow-soft active:scale-90 transition-all">
             <Plus size={22} />
          </button>
          <div className="flex-1 relative">
            <input 
              type="text" 
              value={inputValue} 
              onChange={e => setInputValue(e.target.value)} 
              onKeyPress={e => e.key === 'Enter' && handleSend()} 
              placeholder="Ask NARA..." 
              className="app-input py-3.5 pr-12 text-[15px]" 
              disabled={isTyping}
            />
            <button 
              onClick={handleSend} 
              disabled={isTyping}
              className={`absolute right-2 top-2 w-10 h-10 flex items-center justify-center rounded-xl shadow-soft active:scale-90 transition-all ${
                inputValue.trim() && !isTyping ? 'bg-nara-hunter text-white' : 'bg-slate-50 text-slate-300'
              }`}
            >
              <Send size={18} />
            </button>
          </div>
        </div>
      </div>

      {/* Nav Bar - CLEANED: No Chat button here */}
      <nav className="fixed bottom-0 left-0 right-0 h-[calc(84px+env(safe-area-inset-bottom))] bg-white/80 backdrop-blur-3xl border-t border-white shadow-[0_-10px_40px_rgba(0,0,0,0.05)] flex items-stretch justify-center gap-12 px-6 z-[100] pb-[env(safe-area-inset-bottom)]">
         <Link href="/dashboard" className="nav-hitbox text-slate-400 hover:text-nara-hunter transition-colors max-w-[80px]">
            <Target size={24} />
            <span className="text-[10px] font-black uppercase mt-1.5 tracking-widest">Plan</span>
         </Link>
         <Link href="/profile" className="nav-hitbox text-slate-400 hover:text-nara-hunter transition-colors max-w-[80px]">
            <User size={24} />
            <span className="text-[10px] font-black uppercase mt-1.5 tracking-widest">Profile</span>
         </Link>
      </nav>
    </div>
  );
}
