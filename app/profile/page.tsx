'use client';

import { useState, useMemo } from 'react';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { 
  User, 
  Ruler, 
  Weight, 
  Calendar as AgeIcon, 
  MapPin, 
  Save, 
  RotateCcw,
  MessageSquare,
  Target
} from 'lucide-react';

export default function Profile() {
  const [weight, setWeight] = useState(65);
  const [height, setHeight] = useState(170);
  const [age, setAge] = useState(24);
  const [location, setLocation] = useState('Jakarta Selatan');

  const bmi = useMemo(() => {
    const heightInMeters = height / 100;
    return parseFloat((weight / (heightInMeters * heightInMeters)).toFixed(1));
  }, [height, weight]);

  return (
    <div className="app-content bg-nara-light">
      
      {/* Header */}
      <header className="px-6 pt-12 pb-6 flex items-center justify-between z-10 shrink-0">
        <div className="flex items-center gap-4">
           <h1 className="text-3xl font-black text-nara-text tracking-tight">Health Identity</h1>
        </div>
        <div className="w-12 h-12 rounded-2xl bg-nara-hunter flex items-center justify-center text-white font-black shadow-soft">
           VA
        </div>
      </header>

      <main className="px-6 space-y-8 z-10 max-w-md mx-auto w-full pb-40">
        
        {/* BMI & Stats Card */}
        <div className="glass-container p-8 flex items-center justify-between">
           <div className="space-y-1">
              <span className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">Bio-Status Index</span>
              <div className="flex items-baseline gap-2">
                 <span className="text-5xl font-black text-nara-text tracking-tighter">{bmi}</span>
                 <span className="text-[10px] font-black text-nara-emerald bg-nara-emerald/10 px-3 py-1 rounded-full uppercase">Optimal</span>
              </div>
           </div>
           <div className="w-20 h-20 rounded-full border-[6px] border-nara-emerald/20 flex items-center justify-center relative">
              <motion.div animate={{ rotate: 360 }} transition={{ duration: 10, repeat: Infinity, ease: "linear" }} className="absolute inset-0 rounded-full border-t-[6px] border-nara-emerald" />
              <User size={28} className="text-nara-hunter" />
           </div>
        </div>

        {/* Biometrics */}
        <section className="space-y-4">
           <h2 className="text-[11px] font-black text-slate-400 uppercase tracking-widest px-2 opacity-60">Physical Telemetry</h2>
           <div className="grid grid-cols-1 gap-4">
              <div className="flex gap-4">
                 <div className="flex-1 glass-card p-6">
                    <div className="flex items-center gap-2 mb-4 text-nara-muted opacity-60">
                       <Weight size={16} /> <span className="text-[10px] font-black uppercase">Weight</span>
                    </div>
                    <div className="flex items-center gap-1">
                       <input type="number" value={weight} onChange={(e) => setWeight(Number(e.target.value))} className="w-full bg-transparent text-3xl font-black text-nara-text focus:outline-none" />
                       <span className="text-sm font-bold text-slate-400">kg</span>
                    </div>
                 </div>
                 <div className="flex-1 glass-card p-6">
                    <div className="flex items-center gap-2 mb-4 text-nara-muted opacity-60">
                       <Ruler size={16} /> <span className="text-[10px] font-black uppercase">Height</span>
                    </div>
                    <div className="flex items-center gap-1">
                       <input type="number" value={height} onChange={(e) => setHeight(Number(e.target.value))} className="w-full bg-transparent text-3xl font-black text-nara-text focus:outline-none" />
                       <span className="text-sm font-bold text-slate-400">cm</span>
                    </div>
                 </div>
              </div>
              
              <div className="glass-card p-6 flex items-center justify-between">
                 <div className="flex items-center gap-4">
                    <div className="w-12 h-12 rounded-2xl bg-nara-hunter/10 flex items-center justify-center text-nara-hunter"><AgeIcon size={24} /></div>
                    <div>
                       <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest opacity-60">Age</span>
                       <input type="number" value={age} onChange={(e) => setAge(Number(e.target.value))} className="w-full bg-transparent text-xl font-black text-nara-text focus:outline-none" />
                    </div>
                 </div>
                 <div className="h-12 w-[1px] bg-slate-100 mx-4" />
                 <div className="flex items-center gap-4 flex-1 justify-end text-right">
                    <div>
                       <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest opacity-60">Region</span>
                       <input type="text" value={location} onChange={(e) => setLocation(e.target.value)} className="w-full bg-transparent text-sm font-bold text-nara-text text-right focus:outline-none" />
                    </div>
                    <div className="w-12 h-12 rounded-2xl bg-nara-emerald/10 flex items-center justify-center text-nara-emerald"><MapPin size={24} /></div>
                 </div>
              </div>
           </div>
        </section>

        {/* Action Area */}
        <div className="flex flex-col gap-4 pt-6">
           <Link href="/dashboard" className="btn-primary py-5"><Save size={20} /> Deploy Changes</Link>
           <Link href="/onboarding" className="flex items-center justify-center gap-2 text-nara-hunter font-black text-[11px] uppercase tracking-widest py-4 bg-white/20 rounded-2xl border border-white/40"><RotateCcw size={16} /> Full Bio-Recalibration</Link>
        </div>
      </main>

      {/* Nav Bar */}
      <nav className="fixed bottom-0 left-0 right-0 h-[calc(84px+env(safe-area-inset-bottom))] bg-white/80 backdrop-blur-[32px] border-t border-white shadow-[0_-10px_40px_rgba(0,0,0,0.05)] flex items-stretch justify-around px-6 z-[100] pb-[env(safe-area-inset-bottom)]">
         <Link href="/dashboard" className="nav-hitbox text-slate-400 hover:text-nara-hunter transition-colors">
            <Target size={24} />
            <span className="text-[10px] font-black uppercase mt-1.5 tracking-widest">Plan</span>
         </Link>
         <Link href="/chat" className="nav-hitbox text-slate-400 hover:text-nara-hunter transition-colors">
            <MessageSquare size={24} />
            <span className="text-[10px] font-black uppercase mt-1.5 tracking-widest">Chat</span>
         </Link>
         <Link href="/profile" className="nav-hitbox text-nara-hunter">
            <User size={24} fill="currentColor" className="opacity-80" />
            <span className="text-[10px] font-black uppercase mt-1.5 tracking-widest">Profile</span>
         </Link>
      </nav>
    </div>
  );
}
