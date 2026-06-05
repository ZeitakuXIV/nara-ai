'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import { ArrowRight, ShieldCheck, Loader2 } from 'lucide-react';
import { supabase } from '@/utils/supabase';

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
    // Simulate real auth delay
    await new Promise(resolve => setTimeout(resolve, 1500));
    setIsLoading(false);
    
    router.push('/onboarding');
  };

  const handleGoogleLogin = async () => {
    if (!process.env.NEXT_PUBLIC_SUPABASE_URL || !process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY) {
      alert("Google Login is not configured. Please set up Supabase environment variables.");
      return;
    }
    try {
      const { error } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: {
          redirectTo: `${window.location.origin}/onboarding`,
        },
      });
      if (error) throw error;
    } catch (error: any) {
      alert(error.message || "Failed to connect to Google");
    }
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

            <div className="mt-8 flex items-center gap-4">
              <div className="flex-1 h-[1px] bg-slate-200/60"></div>
              <span className="text-[10px] text-slate-400 font-bold uppercase tracking-widest">Connect With</span>
              <div className="flex-1 h-[1px] bg-slate-200/60"></div>
            </div>

            <div className="mt-6">
               <button 
                onClick={handleGoogleLogin}
                className="btn-secondary w-full py-4 font-bold text-[16px] flex items-center justify-center gap-3 active:scale-95 transition-all"
               >
                 <svg width="20" height="20" viewBox="0 0 48 48">
                    <path fill="#EA4335" d="M24 9.5c3.54 0 6.71 1.22 9.21 3.6l6.85-6.85C35.9 2.38 30.47 0 24 0 14.62 0 6.51 5.38 2.56 13.22l7.98 6.19C12.43 13.72 17.74 9.5 24 9.5z"/>
                    <path fill="#4285F4" d="M46.98 24.55c0-1.57-.15-3.09-.45-4.55H24v9.02h12.94c-.58 2.96-2.26 5.48-4.78 7.18l7.73 6c4.51-4.18 7.09-10.36 7.09-17.65z"/>
                    <path fill="#FBBC05" d="M10.53 28.59c-.48-1.45-.76-2.99-.76-4.59s.27-3.14.76-4.59l-7.98-6.19C.92 16.46 0 20.12 0 24c0 3.88.92 7.54 2.56 10.78l7.97-6.19z"/>
                    <path fill="#34A853" d="M24 48c6.48 0 11.93-2.13 15.89-5.81l-7.73-6c-2.15 1.45-4.92 2.3-8.16 2.3-6.26 0-11.57-4.22-13.47-9.91l-7.98 6.19C6.51 42.62 14.62 48 24 48z"/>
                 </svg>
                 Continue with Google
               </button>
            </div>
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
        Protocol Compliance v2.0
      </footer>
    </div>
  );
}
