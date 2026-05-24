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
    <div className="min-h-[100dvh] flex flex-col justify-center items-center px-6 pt-[env(safe-area-inset-top,2rem)] pb-[env(safe-area-inset-bottom,2rem)] relative">
      
      {/* App Logo & Identity */}
      <motion.div 
        initial={{ y: -30, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        className="flex flex-col items-center mb-10 z-10"
      >
        <div className="w-24 h-24 bg-gradient-to-br from-nara-hunter to-nara-evergreen rounded-[32px] shadow-[0_20px_40px_-4px_rgba(61,100,77,0.3)] flex items-center justify-center mb-6 relative overflow-hidden">
           <span className="text-white font-black text-4xl tracking-tighter">N</span>
        </div>
        <h1 className="text-4xl font-extrabold tracking-tight text-nara-text mb-2 text-glow">N.A.R.A</h1>
        <div className="flex items-center gap-1.5 text-nara-emerald font-bold text-[11px] uppercase tracking-[0.2em] bg-nara-emerald/10 px-3 py-1 rounded-full border border-nara-emerald/20">
           <ShieldCheck size={12} /> Expert Reasoning System
        </div>
      </motion.div>

      {/* Auth Container */}
      <motion.div 
        initial={{ y: 40, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        className="w-full max-w-sm z-10"
      >
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
                  <h2 className="text-2xl font-bold text-nara-text tracking-tight">Welcome back</h2>
                  <p className="text-nara-muted text-sm mt-1">Please enter your details to continue.</p>
                </div>
                <div className="space-y-3 mt-2">
                  <input type="email" placeholder="Email address" className="app-input" />
                  <input type="password" placeholder="Password" className="app-input" />
                </div>
                <button onClick={handleAuthAction} className="btn-primary mt-2 group">
                  Sign In <ArrowRight size={18} className="group-hover:translate-x-1 transition-transform" />
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
                  <h2 className="text-2xl font-bold text-nara-text tracking-tight">Create Account</h2>
                  <p className="text-nara-muted text-sm mt-1">Join the future of precision nutrition.</p>
                </div>
                <div className="space-y-3 mt-2">
                  <input type="text" placeholder="Full name" className="app-input" />
                  <input type="email" placeholder="Email address" className="app-input" />
                  <input type="password" placeholder="Create password" className="app-input" />
                </div>
                <button onClick={handleAuthAction} className="btn-primary mt-2 group">
                  Get Started <ArrowRight size={18} className="group-hover:translate-x-1 transition-transform" />
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
             <button className="btn-secondary w-full">
               <Apple size={20} className="fill-current" />
               Continue with Apple
             </button>
          </div>
        </div>

        <div className="mt-8 text-center">
          <p className="text-nara-muted text-[15px] font-medium">
            {isLogin ? "New to NARA? " : "Already using NARA? "}
            <button 
              onClick={() => setIsLogin(!isLogin)}
              className="text-nara-hunter font-bold hover:text-nara-emerald transition-colors"
            >
              {isLogin ? "Create account" : "Log in"}
            </button>
          </p>
        </div>
      </motion.div>
      
      <footer className="mt-auto pt-8 text-[10px] text-slate-400 font-bold uppercase tracking-[0.3em] z-10 opacity-60">
        Protocol Compliance v2.0
      </footer>
    </div>
  );
}
