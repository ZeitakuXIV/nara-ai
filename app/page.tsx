'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import { ArrowRight, Apple, ShieldCheck } from 'lucide-react';

export default function AppEntry() {
  const [isLogin, setIsLogin] = useState(false);
  const router = useRouter();

  const handleAuthAction = () => {
    router.push('/onboarding');
  };

  return (
    <div className="flex-1 flex flex-col justify-center items-center px-8 relative">
      
      {/* Identity Section - Centered and Safe */}
      <motion.div 
        initial={{ y: -20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.8 }}
        className="flex flex-col items-center mb-10 z-10"
      >
        <div className="w-24 h-24 bg-gradient-to-br from-nara-hunter to-nara-evergreen rounded-[32px] shadow-float flex items-center justify-center mb-6">
           <span className="text-white font-black text-4xl tracking-tighter drop-shadow-md">N</span>
        </div>
        <h1 className="text-4xl font-extrabold tracking-tight text-nara-text mb-2 text-glow">N.A.R.A</h1>
        <div className="flex items-center gap-1.5 text-nara-emerald font-bold text-[10px] uppercase tracking-[0.2em] bg-nara-emerald/10 px-3 py-1 rounded-full border border-nara-emerald/20">
           <ShieldCheck size={12} /> Expert Reasoning System
        </div>
      </motion.div>

      {/* Auth Container */}
      <motion.div 
        initial={{ y: 20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.8, delay: 0.1 }}
        className="w-full max-w-sm z-10"
      >
        <div className="glass-container p-8 relative overflow-hidden">
          <AnimatePresence mode="wait">
            {isLogin ? (
              <motion.div key="login" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="flex flex-col gap-6">
                <div className="text-center">
                  <h2 className="text-2xl font-bold text-nara-text tracking-tight">Welcome back</h2>
                  <p className="text-nara-muted text-xs mt-1 uppercase tracking-widest font-black opacity-60">Identity Verified</p>
                </div>
                <div className="space-y-3">
                  <input type="email" placeholder="Email" className="app-input py-4" />
                  <input type="password" placeholder="Password" className="app-input py-4" />
                </div>
                <button onClick={handleAuthAction} className="btn-primary mt-2">
                  Sign In <ArrowRight size={18} />
                </button>
              </motion.div>
            ) : (
              <motion.div key="reg" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="flex flex-col gap-6">
                <div className="text-center">
                  <h2 className="text-2xl font-bold text-nara-text tracking-tight">Create Account</h2>
                  <p className="text-nara-muted text-xs mt-1 uppercase tracking-widest font-black opacity-60">Begin Bio-Sensing</p>
                </div>
                <div className="space-y-3">
                  <input type="text" placeholder="Full Name" className="app-input py-4" />
                  <input type="email" placeholder="Email" className="app-input py-4" />
                  <input type="password" placeholder="Password" className="app-input py-4" />
                </div>
                <button onClick={handleAuthAction} className="btn-primary mt-2">
                  Get Started <ArrowRight size={18} />
                </button>
              </motion.div>
            )}
          </AnimatePresence>

          <div className="mt-8 flex items-center gap-4 opacity-40">
            <div className="flex-1 h-[1px] bg-slate-300"></div>
            <span className="text-[9px] text-slate-500 font-black uppercase tracking-widest">Secure Handshake</span>
            <div className="flex-1 h-[1px] bg-slate-300"></div>
          </div>

          <button className="btn-secondary w-full mt-6 py-4">
            <Apple size={20} className="fill-current" />
            Continue with Apple
          </button>
        </div>

        <div className="mt-8 text-center">
          <button onClick={() => setIsLogin(!isLogin)} className="text-nara-muted text-sm font-medium">
            {isLogin ? "New to NARA? " : "Already sensing? "}
            <span className="text-nara-hunter font-bold underline decoration-nara-hunter/20">
              {isLogin ? "Create account" : "Log in"}
            </span>
          </button>
        </div>
      </motion.div>
      
      <footer className="mt-auto pb-[env(safe-area-inset-bottom,2rem)] pt-8 text-[9px] text-slate-400 font-bold uppercase tracking-[0.4em] opacity-40 z-10">
        Reasoning Protocol v2.5.0
      </footer>
    </div>
  );
}
