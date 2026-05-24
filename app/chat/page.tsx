'use client';

import { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import { AnimatePresence } from 'framer-motion';
import { Send, User, MoreVertical, Plus, Calendar, MessageSquare } from 'lucide-react';

const INITIAL_MESSAGES = [
  { id: 1, sender: 'nara', text: "Hello! I'm NARA, your Nutrition Agent. How can I help you today?", timestamp: '09:00' },
  { id: 2, sender: 'nara', text: "Based on my reasoning, I've scaled your portions to match your goals.", timestamp: '09:01', isXAI: true }
];

export default function Chatbot() {
  const [messages, setMessages] = useState(INITIAL_MESSAGES);
  const [inputValue, setInputValue] = useState('');
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (scrollRef.current) scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
  }, [messages]);

  const handleSend = () => {
    if (!inputValue.trim()) return;
    const msg = { id: Date.now(), sender: 'user', text: inputValue, timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) };
    setMessages([...messages, msg]);
    setInputValue('');
  };

  return (
    <div className="app-content bg-nara-light">
      <div className="pwa-bg" />
      
      <header className="px-6 pt-[env(safe-area-inset-top,1.5rem)] pb-4 flex items-center justify-between z-20 shrink-0 bg-white/20 backdrop-blur-md">
        <div className="flex items-center gap-3">
           <div className="w-10 h-10 bg-nara-hunter rounded-2xl flex items-center justify-center text-white font-black">N</div>
           <div>
              <h1 className="text-sm font-bold">N.A.R.A Agent</h1>
              <span className="text-[10px] text-nara-emerald font-bold uppercase tracking-widest">Inference Active</span>
           </div>
        </div>
        <MoreVertical size={20} className="text-slate-400" />
      </header>

      <div ref={scrollRef} className="flex-1 overflow-y-auto px-6 py-4 space-y-6 z-10 no-scrollbar pb-40">
        <AnimatePresence>
          {messages.map((msg) => (
            <div key={msg.id} className={`flex ${msg.sender === 'user' ? 'justify-end' : 'justify-start'}`}>
              <div className={`max-w-[85%] p-4 rounded-[24px] ${msg.sender === 'user' ? 'bg-nara-hunter text-white rounded-tr-none' : msg.isXAI ? 'bg-nara-evergreen text-white rounded-tl-none border border-nara-hunter/30 shadow-sm' : 'bg-white/70 backdrop-blur-md text-nara-text rounded-tl-none border border-white/80 shadow-sm'}`}>
                <p className="text-sm font-medium">{msg.text}</p>
              </div>
            </div>
          ))}
        </AnimatePresence>
      </div>

      {/* Input Section - Floating above Nav */}
      <div className="p-6 bg-white/40 backdrop-blur-2xl border-t border-white/60 z-20 shrink-0 pb-[calc(100px+env(safe-area-inset-bottom))]">
        <div className="flex items-center gap-3">
          <button className="w-12 h-12 flex items-center justify-center rounded-2xl bg-white border border-slate-100 text-slate-400 shadow-sm"><Plus size={20} /></button>
          <div className="flex-1 relative">
            <input type="text" value={inputValue} onChange={e => setInputValue(e.target.value)} onKeyPress={e => e.key === 'Enter' && handleSend()} placeholder="Ask NARA..." className="app-input py-3.5 pr-12 text-sm" />
            <button onClick={handleSend} className="absolute right-2 top-2 w-10 h-10 flex items-center justify-center bg-nara-hunter text-white rounded-xl shadow-soft active:scale-90 transition-all"><Send size={18} /></button>
          </div>
        </div>
      </div>

      {/* Navigation */}
      <nav className="fixed bottom-0 left-0 right-0 h-[calc(84px+env(safe-area-inset-bottom))] bg-white/80 backdrop-blur-3xl border-t border-white shadow-[0_-10px_40px_rgba(0,0,0,0.05)] flex items-stretch justify-around px-6 z-[100] pb-[env(safe-area-inset-bottom)]">
         <Link href="/dashboard" className="nav-hitbox text-slate-400 hover:text-nara-hunter">
            <Calendar size={24} />
            <span className="text-[10px] font-bold uppercase mt-1.5">Plan</span>
         </Link>
         <Link href="/chat" className="nav-hitbox text-nara-hunter">
            <MessageSquare size={24} fill="currentColor" className="opacity-80" />
            <span className="text-[10px] font-bold uppercase mt-1.5">Chat</span>
         </Link>
         <Link href="/profile" className="nav-hitbox text-slate-400 hover:text-nara-hunter">
            <User size={24} />
            <span className="text-[10px] font-bold uppercase mt-1.5">Profile</span>
         </Link>
      </nav>
    </div>
  );
}
