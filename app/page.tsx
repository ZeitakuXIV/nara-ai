'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import { ArrowRight, ShieldCheck, Loader2 } from 'lucide-react';

export default function AppEntry() {
  const [isLogin, setIsLogin] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [fullName, setFullName] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();

  // Basic validation
  const isFormValid = isLogin 
    ? email.includes('@') && password.length >= 6 
    : fullName.length > 2 && email.includes('@') && password.length >= 6;

  const handleAuthAction = async () => {
    if (!isFormValid) return;
    
    setIsLoading(true);
    // Simulate real auth delay (for future Supabase Auth integration)
    await new Promise(resolve => setTimeout(resolve, 1500));
    setIsLoading(false);
    
    router.push('/onboarding');
  };

  return (
    <div className="flex-1 flex flex-col relative justify-center">
      
      {/* Identity Section */}
      <div className="flex-1 flex flex-col justify-center items-center px-8 z-10 w-full">
        <motion.div 
          initial={{ y: -30, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          className="flex flex-col items-center mb-10"
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
          initial={{ y: 40, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          className="w-full max-w-sm"
        >
          <div className="glass-container p-8 relative overflow-hidden shadow-2xl">
            <AnimatePresence mode="wait">
              {isLogin ? (
                <motion.div key="login" initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: 10 }} className="flex flex-col gap-5">
                  <div className="text-center">
                    <h2 className="text-2xl font-bold text-nara-text tracking-tight">Welcome back</h2>
                    <p className="text-nara-muted text-xs mt-1 uppercase tracking-widest font-black opacity-60">Identity Verified</p>
                  </div>
                  <div className="space-y-3">
                    <input 
                      type="email" 
                      placeholder="Email address" 
                      className="app-input" 
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                    />
                    <input 
                      type="password" 
                      placeholder="Password" 
                      className="app-input" 
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                    />
                  </div>
                  <button 
                    onClick={handleAuthAction} 
                    disabled={!isFormValid || isLoading}
                    className={`btn-primary mt-2 transition-all ${(!isFormValid || isLoading) ? 'opacity-50 grayscale cursor-not-allowed' : ''}`}
                  >
                    {isLoading ? <Loader2 className="animate-spin" size={20} /> : <>Sign In <ArrowRight size={18} /></>}
                  </button>
                </motion.div>
              ) : (
                <motion.div key="reg" initial={{ opacity: 0, x: 10 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -10 }} className="flex flex-col gap-5">
                  <div className="text-center">
                    <h2 className="text-2xl font-bold text-nara-text tracking-tight">Create Account</h2>
                    <p className="text-nara-muted text-xs mt-1 uppercase tracking-widest font-black opacity-60">Begin Bio-Sensing</p>
                  </div>
                  <div className="space-y-3">
                    <input 
                      type="text" 
                      placeholder="Full name" 
                      className="app-input" 
                      value={fullName}
                      onChange={(e) => setFullName(e.target.value)}
                    />
                    <input 
                      type="email" 
                      placeholder="Email address" 
                      className="app-input" 
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                    />
                    <input 
                      type="password" 
                      placeholder="Create password" 
                      className="app-input" 
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                    />
                  </div>
                  <button 
                    onClick={handleAuthAction} 
                    disabled={!isFormValid || isLoading}
                    className={`btn-primary mt-2 transition-all ${(!isFormValid || isLoading) ? 'opacity-50 grayscale cursor-not-allowed' : ''}`}
                  >
                    {isLoading ? <Loader2 className="animate-spin" size={20} /> : <>Get Started <ArrowRight size={18} /></>}
                  </button>
                </motion.div>
              )}
            </AnimatePresence>

            <div className="mt-8 flex items-center gap-4 opacity-40">
              <div className="flex-1 h-[1px] bg-slate-300"></div>
              <span className="text-[9px] text-slate-500 font-black uppercase tracking-widest">NARA Protocol</span>
              <div className="flex-1 h-[1px] bg-slate-300"></div>
            </div>

            <p className="mt-6 text-center text-[11px] text-nara-muted leading-relaxed px-2">
              By continuing, you agree to NARA&apos;s analysis of your biometric data for nutritional reasoning.
            </p>
          </div>

          <div className="mt-8 text-center">
            <button onClick={() => setIsLogin(!isLogin)} className="text-nara-muted text-[15px] font-medium">
              {isLogin ? "New here? " : "Already sensing? "}
              <span className="text-nara-hunter font-bold underline decoration-nara-hunter/20">
                {isLogin ? "Create account" : "Log in"}
              </span>
            </button>
          </div>
        </motion.div>
      </div>
      
      <footer className="fixed bottom-0 left-0 w-full text-center pb-[calc(16px+env(safe-area-inset-bottom))] text-[9px] text-slate-400 font-bold uppercase tracking-[0.3em] opacity-40 z-10 pointer-events-none">
        Reasoning Protocol v2.5.0
      </footer>
    </div>
  );
}
