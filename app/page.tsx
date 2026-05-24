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
    <div className="h-[100dvh] w-full flex flex-col relative overflow-hidden bg-nara-light">
      
      {/* BULLETPROOF BACKGROUND */}
      <div className="pwa-bg" />
      
      {/* ANIMATED BLOBS */}
      <div className="absolute top-1/4 left-1/4 w-72 h-72 bg-nara-emerald/10 rounded-full mix-blend-multiply filter blur-3xl animate-blob pointer-events-none" />
      <div className="absolute top-1/3 right-1/4 w-72 h-72 bg-nara-hunter/10 rounded-full mix-blend-multiply filter blur-3xl animate-blob animation-delay-2000 pointer-events-none" />
      <div className="absolute bottom-1/4 left-1/3 w-72 h-72 bg-nara-emerald/5 rounded-full mix-blend-multiply filter blur-3xl animate-blob animation-delay-4000 pointer-events-none" />

      {/* NOTCH SAFE AREA PADDING */}
      <div className="pt-[env(safe-area-inset-top,3rem)]" />

      <div className="flex-1 flex flex-col justify-center items-center px-8 z-10 w-full">
        {/* Logo Section */}
        <motion.div 
          initial={{ y: -20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          className="flex flex-col items-center mb-8"
        >
          <div className="w-20 h-20 bg-gradient-to-br from-nara-hunter to-nara-evergreen rounded-[28px] shadow-soft flex items-center justify-center mb-5 relative overflow-hidden">
             <span className="text-white font-black text-3xl">N</span>
          </div>
          <h1 className="text-3xl font-extrabold tracking-tight text-nara-text mb-1 text-glow">N.A.R.A</h1>
          <div className="flex items-center gap-1.5 text-nara-emerald font-bold text-[9px] uppercase tracking-[0.2em] bg-nara-emerald/10 px-3 py-1 rounded-full border border-nara-emerald/20">
             <ShieldCheck size={10} /> Expert Reasoning
          </div>
        </motion.div>

        {/* Auth Glass Card */}
        <motion.div 
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          className="w-full max-w-[340px]"
        >
          <div className="glass-container p-6 relative">
            <AnimatePresence mode="wait">
              {isLogin ? (
                <motion.div key="login" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="flex flex-col gap-4">
                  <div className="text-center">
                    <h2 className="text-xl font-bold text-nara-text tracking-tight">Welcome back</h2>
                  </div>
                  <div className="space-y-3">
                    <input type="email" placeholder="Email" className="app-input py-3.5 text-sm" />
                    <input type="password" placeholder="Password" className="app-input py-3.5 text-sm" />
                  </div>
                  <button onClick={handleAuthAction} className="btn-primary py-3.5 mt-1">
                    Sign In <ArrowRight size={16} />
                  </button>
                </motion.div>
              ) : (
                <motion.div key="reg" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="flex flex-col gap-4">
                  <div className="text-center">
                    <h2 className="text-xl font-bold text-nara-text tracking-tight">Create Account</h2>
                  </div>
                  <div className="space-y-3">
                    <input type="text" placeholder="Full Name" className="app-input py-3.5 text-sm" />
                    <input type="email" placeholder="Email" className="app-input py-3.5 text-sm" />
                    <input type="password" placeholder="Password" className="app-input py-3.5 text-sm" />
                  </div>
                  <button onClick={handleAuthAction} className="btn-primary py-3.5 mt-1">
                    Get Started <ArrowRight size={16} />
                  </button>
                </motion.div>
              )}
            </AnimatePresence>

            <div className="mt-6 flex items-center gap-4">
              <div className="flex-1 h-[1px] bg-slate-200"></div>
              <span className="text-[8px] text-slate-400 font-bold uppercase tracking-widest">Secure Access</span>
              <div className="flex-1 h-[1px] bg-slate-200"></div>
            </div>

            <button className="btn-secondary w-full py-3.5 mt-4 text-sm">
              <Apple size={16} className="fill-current" />
              Continue with Apple
            </button>
          </div>

          <div className="mt-8 text-center">
            <button onClick={() => setIsLogin(!isLogin)} className="text-nara-muted text-sm font-medium">
              {isLogin ? "New here? " : "Already using NARA? "}
              <span className="text-nara-hunter font-bold underline decoration-nara-hunter/20">
                {isLogin ? "Create account" : "Log in"}
              </span>
            </button>
          </div>
        </motion.div>
      </div>
      
      {/* Footer - Pushed to absolute bottom safe area */}
      <footer className="w-full text-center pb-[env(safe-area-inset-bottom,1.5rem)] text-[9px] text-slate-400 font-bold uppercase tracking-[0.3em] opacity-40">
        Protocol Compliance v2.0
      </footer>
    </div>
  );
}
