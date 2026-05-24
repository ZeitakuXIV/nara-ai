'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import { ArrowRight, Apple, ShieldCheck } from 'lucide-react';

export default function AppEntry() {
  const [isLogin, setIsLogin] = useState(false);
  const router = useRouter();

  const handleAuthAction = () => {
    // For now, any auth action leads to onboarding
    router.push('/onboarding');
  };

  return (
    <div className="h-[100dvh] flex flex-col justify-between items-center px-6 pt-[env(safe-area-inset-top,2rem)] pb-[env(safe-area-inset-bottom,2rem)] relative overflow-hidden bg-mesh-gradient">
      
      {/* Animated Background Blobs */}
      <div className="absolute top-1/4 left-1/4 w-72 h-72 bg-nara-emerald/10 rounded-full mix-blend-multiply filter blur-3xl animate-blob" />
      <div className="absolute top-1/3 right-1/4 w-72 h-72 bg-nara-hunter/10 rounded-full mix-blend-multiply filter blur-3xl animate-blob animation-delay-2000" />
      <div className="absolute bottom-1/4 left-1/3 w-72 h-72 bg-nara-emerald/5 rounded-full mix-blend-multiply filter blur-3xl animate-blob animation-delay-4000" />

      <div className="flex-1 flex flex-col justify-center items-center w-full">
        {/* App Logo & Identity */}
        <motion.div 
          initial={{ y: -30, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
          className="flex flex-col items-center mb-8 z-10"
        >
          <div className="w-20 h-20 bg-gradient-to-br from-nara-hunter to-nara-evergreen rounded-[28px] shadow-[0_20px_40px_-4px_rgba(61,100,77,0.3)] flex items-center justify-center mb-5 relative overflow-hidden group">
             <div className="absolute inset-0 bg-white/20 opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
             <span className="text-white font-black text-3xl tracking-tighter drop-shadow-md">N</span>
          </div>
          <h1 className="text-3xl font-extrabold tracking-tight text-nara-text mb-1.5 text-glow">N.A.R.A</h1>
          <div className="flex items-center gap-1.5 text-nara-emerald font-bold text-[10px] uppercase tracking-[0.2em] bg-nara-emerald/10 px-3 py-1 rounded-full border border-nara-emerald/20">
             <ShieldCheck size={10} /> Expert Reasoning System
          </div>
        </motion.div>

        {/* Auth Container with Glassmorphism */}
        <motion.div 
          initial={{ y: 40, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ duration: 0.8, delay: 0.1, ease: [0.16, 1, 0.3, 1] }}
          className="w-full max-w-sm z-10"
        >
          <div className="glass-container p-6 relative overflow-hidden">
            {/* Subtle reflection shine */}
            <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-white/40 to-transparent" />
            
            <AnimatePresence mode="wait">
              {isLogin ? (
                <motion.div
                  key="login"
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: 10 }}
                  transition={{ duration: 0.4, ease: "easeInOut" }}
                  className="flex flex-col gap-4"
                >
                  <div>
                    <h2 className="text-xl font-bold text-nara-text tracking-tight">Welcome back</h2>
                    <p className="text-nara-muted text-xs mt-0.5">Please enter your details to continue.</p>
                  </div>
                  <div className="space-y-3 mt-1">
                    <input type="email" placeholder="Email address" className="app-input py-3.5 text-sm" />
                    <input type="password" placeholder="Password" className="app-input py-3.5 text-sm" />
                  </div>
                  <div className="text-right">
                    <span className="text-xs text-nara-hunter font-bold cursor-pointer hover:text-nara-hunter-light transition-colors">Forgot password?</span>
                  </div>
                  <button onClick={handleAuthAction} className="btn-primary py-3.5 mt-1 group">
                    Sign In <ArrowRight size={16} className="group-hover:translate-x-1 transition-transform" />
                  </button>
                </motion.div>
              ) : (
                <motion.div
                  key="register"
                  initial={{ opacity: 0, x: 10 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -10 }}
                  transition={{ duration: 0.4, ease: "easeInOut" }}
                  className="flex flex-col gap-4"
                >
                  <div>
                    <h2 className="text-xl font-bold text-nara-text tracking-tight">Create Account</h2>
                    <p className="text-nara-muted text-xs mt-0.5">Join the future of precision nutrition.</p>
                  </div>
                  <div className="space-y-3 mt-1">
                    <input type="text" placeholder="Full name" className="app-input py-3.5 text-sm" />
                    <input type="email" placeholder="Email address" className="app-input py-3.5 text-sm" />
                    <input type="password" placeholder="Create password" className="app-input py-3.5 text-sm" />
                  </div>
                  <button onClick={handleAuthAction} className="btn-primary py-3.5 mt-1 group">
                    Get Started <ArrowRight size={16} className="group-hover:translate-x-1 transition-transform" />
                  </button>
                </motion.div>
              )}
            </AnimatePresence>

            <div className="mt-6 flex items-center gap-4">
              <div className="flex-1 h-[1px] bg-slate-200/60"></div>
              <span className="text-[9px] text-slate-400 font-bold uppercase tracking-widest">Secure Access</span>
              <div className="flex-1 h-[1px] bg-slate-200/60"></div>
            </div>

            <div className="mt-4">
               <button className="btn-secondary py-3.5 text-sm">
                 <Apple size={18} className="fill-current" />
                 Continue with Apple
               </button>
            </div>
          </div>

          {/* Toggle State */}
          <div className="mt-6 text-center">
            <p className="text-nara-muted text-sm font-medium">
              {isLogin ? "New to NARA? " : "Already using NARA? "}
              <button 
                onClick={() => setIsLogin(!isLogin)}
                className="text-nara-hunter font-bold hover:text-nara-emerald transition-colors underline-offset-4 hover:underline"
              >
                {isLogin ? "Create account" : "Log in"}
              </button>
            </p>
          </div>
        </motion.div>
      </div>
      
      <footer className="mt-auto text-[9px] text-slate-400 font-bold uppercase tracking-[0.3em] z-10 opacity-60">
        Protocol Compliance v2.0
      </footer>
    </div>
  );
}
