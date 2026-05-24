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
    <div className="h-[100dvh] w-full flex flex-col items-center px-6 pt-[env(safe-area-inset-top,2rem)] pb-[env(safe-area-inset-bottom,2rem)] relative overflow-hidden">
      
      {/* RESTORED: High-fidelity animated background blobs */}
      <div className="absolute top-1/4 left-1/4 w-72 h-72 bg-nara-emerald/10 rounded-full mix-blend-multiply filter blur-3xl animate-blob pointer-events-none" />
      <div className="absolute top-1/3 right-1/4 w-72 h-72 bg-nara-hunter/10 rounded-full mix-blend-multiply filter blur-3xl animate-blob animation-delay-2000 pointer-events-none" />
      <div className="absolute bottom-1/4 left-1/3 w-72 h-72 bg-nara-emerald/5 rounded-full mix-blend-multiply filter blur-3xl animate-blob animation-delay-4000 pointer-events-none" />

      <div className="flex-1 flex flex-col justify-center items-center w-full z-10">
        {/* Balanced identity section - lowered for notch safety */}
        <motion.div 
          initial={{ y: -30, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          className="flex flex-col items-center mb-10"
        >
          <div className="w-24 h-24 bg-gradient-to-br from-nara-hunter to-nara-evergreen rounded-[32px] shadow-[0_20px_40px_-4px_rgba(61,100,77,0.3)] flex items-center justify-center mb-6">
             <span className="text-white font-black text-4xl">N</span>
          </div>
          <h1 className="text-4xl font-extrabold tracking-tight text-nara-text mb-2 text-glow">N.A.R.A</h1>
          <div className="flex items-center gap-1.5 text-nara-emerald font-bold text-[11px] uppercase tracking-[0.2em] bg-nara-emerald/10 px-3 py-1 rounded-full border border-nara-emerald/20">
             <ShieldCheck size={12} /> Expert Reasoning System
          </div>
        </motion.div>

        {/* Auth Container */}
        <motion.div initial={{ y: 40, opacity: 0 }} animate={{ y: 0, opacity: 1 }} className="w-full max-w-sm">
          <div className="glass-container p-8 relative">
            <AnimatePresence mode="wait">
              {isLogin ? (
                <motion.div
                  key="login"
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: 10 }}
                  className="flex flex-col gap-5"
                >
                  <div>
                    <h2 className="text-2xl font-bold text-nara-text tracking-tight text-center">Welcome back</h2>
                  </div>
                  <div className="space-y-3">
                    <input type="email" placeholder="Email address" className="app-input" />
                    <input type="password" placeholder="Password" className="app-input" />
                  </div>
                  <button onClick={handleAuthAction} className="btn-primary mt-2">
                    Sign In <ArrowRight size={18} />
                  </button>
                </motion.div>
              ) : (
                <motion.div
                  key="register"
                  initial={{ opacity: 0, x: 10 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -10 }}
                  className="flex flex-col gap-5"
                >
                  <div>
                    <h2 className="text-2xl font-bold text-nara-text tracking-tight text-center">Create Account</h2>
                  </div>
                  <div className="space-y-3">
                    <input type="text" placeholder="Full name" className="app-input" />
                    <input type="email" placeholder="Email address" className="app-input" />
                    <input type="password" placeholder="Create password" className="app-input" />
                  </div>
                  <button onClick={handleAuthAction} className="btn-primary mt-2">
                    Get Started <ArrowRight size={18} />
                  </button>
                </motion.div>
              )}
            </AnimatePresence>

            <div className="mt-8 flex items-center gap-4">
              <div className="flex-1 h-[1px] bg-slate-200/60"></div>
              <span className="text-[10px] text-slate-400 font-bold uppercase tracking-widest">Secure Access</span>
              <div className="flex-1 h-[1px] bg-slate-200/60"></div>
            </div>

            <div className="mt-6">
               <button className="btn-secondary w-full py-4 font-bold text-[16px]">
                 <Apple size={20} className="fill-current" />
                 Continue with Apple
               </button>
            </div>
          </div>

          <div className="mt-8 text-center">
            <button 
              onClick={() => setIsLogin(!isLogin)}
              className="text-nara-muted text-[15px] font-medium"
            >
              {isLogin ? "New to NARA? " : "Already using NARA? "}
              <span className="text-nara-hunter font-bold underline-offset-4 hover:underline">
                {isLogin ? "Create account" : "Log in"}
              </span>
            </button>
          </div>
        </motion.div>
      </div>
      
      <footer className="mt-auto text-[10px] text-slate-400 font-bold uppercase tracking-[0.3em] z-10 opacity-60">
        Protocol Compliance v2.0
      </footer>
    </div>
  );
}
