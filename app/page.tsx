'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import { ArrowRight, ShieldCheck, Loader2, AlertCircle } from 'lucide-react';
import { supabase } from '@/utils/supabase';
import { useUserStore } from '@/store/userStore';

export default function AppEntry() {
  const [isLogin, setIsLogin] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [fullName, setFullName] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  
  const router = useRouter();
  const store = useUserStore();

  // Basic validation
  const isFormValid = isLogin 
    ? email.includes('@') && password.length >= 6 
    : fullName.length > 2 && email.includes('@') && password.length >= 6;

  const handleAuthAction = async () => {
    if (!isFormValid) return;
    setIsLoading(true);
    setErrorMessage('');

    try {
      if (isLogin) {
        // 1. SIGN IN
        const { data, error } = await supabase.auth.signInWithPassword({
          email,
          password,
        });

        if (error) throw error;

        // 2. CHECK IF USER HAS PROFILE
        const { data: profile, error: profileError } = await supabase
          .from('user_profiles')
          .select('*')
          .eq('email', email)
          .single();

        if (profile) {
          // SYNC TO ZUSTAND
          store.setBiometrics({
            userId: data.user.id,
            email: profile.email,
            fullName: profile.full_name,
            gender: profile.gender,
            age: profile.age,
            height: profile.height,
            weight: profile.weight,
            activity: profile.activity_level,
            location: profile.location,
            allergies: profile.allergies || [],
            goal: profile.dietary_goal
          });
          store.completeOnboarding();
          router.push('/dashboard');
        } else {
          // Go to onboarding but save initial info
          store.setBiometrics({ userId: data.user.id, email, fullName: profile?.full_name || '' });
          router.push('/onboarding');
        }

      } else {
        // 3. REGISTER (SIGN UP)
        const { data, error } = await supabase.auth.signUp({
          email,
          password,
          options: {
            data: {
              full_name: fullName,
            }
          }
        });

        if (error) throw error;

        // Save initial info to Zustand
        store.setBiometrics({ 
          userId: data.user?.id || null, 
          email, 
          fullName 
        });
        
        router.push('/onboarding');
      }
    } catch (err: any) {
      setErrorMessage(err.message || 'Authentication failed');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex-1 flex flex-col relative justify-center">
      
      {/* Identity Section */}
      <div className="flex-1 flex flex-col justify-center items-center px-8 z-10 w-full">
        <motion.div 
          initial={{ y: -30, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          className="flex flex-col items-center mb-8"
        >
          <div className="w-20 h-20 bg-gradient-to-br from-nara-hunter to-nara-evergreen rounded-[28px] shadow-float flex items-center justify-center mb-5">
             <span className="text-white font-black text-3xl">N</span>
          </div>
          <h1 className="text-3xl font-extrabold tracking-tight text-nara-text mb-1 text-glow">N.A.R.A</h1>
          <div className="flex items-center gap-1.5 text-nara-emerald font-bold text-[9px] uppercase tracking-[0.2em] bg-nara-emerald/10 px-3 py-1 rounded-full border border-nara-emerald/20">
             <ShieldCheck size={10} /> Expert Reasoning System
          </div>
        </motion.div>

        {/* Auth Container */}
        <motion.div 
          initial={{ y: 40, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          className="w-full max-w-sm"
        >
          <div className="glass-container p-6 relative overflow-hidden shadow-2xl">
            {errorMessage && (
              <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} className="mb-4 p-3 bg-red-50 border border-red-100 rounded-2xl flex items-center gap-2 text-red-600 text-xs font-bold">
                <AlertCircle size={14} /> {errorMessage}
              </motion.div>
            )}

            <AnimatePresence mode="wait">
              {isLogin ? (
                <motion.div key="login" initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: 10 }} className="flex flex-col gap-4">
                  <div className="text-center">
                    <h2 className="text-xl font-bold text-nara-text tracking-tight">Welcome back</h2>
                  </div>
                  <div className="space-y-3">
                    <input 
                      type="email" 
                      placeholder="Email address" 
                      className="app-input py-3.5 text-sm" 
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                    />
                    <input 
                      type="password" 
                      placeholder="Password" 
                      className="app-input py-3.5 text-sm" 
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                    />
                  </div>
                  <button 
                    onClick={handleAuthAction} 
                    disabled={!isFormValid || isLoading}
                    className={`btn-primary py-3.5 mt-1 transition-all ${(!isFormValid || isLoading) ? 'opacity-50 grayscale cursor-not-allowed' : ''}`}
                  >
                    {isLoading ? <Loader2 className="animate-spin" size={18} /> : <>Sign In <ArrowRight size={16} /></>}
                  </button>
                </motion.div>
              ) : (
                <motion.div key="reg" initial={{ opacity: 0, x: 10 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -10 }} className="flex flex-col gap-4">
                  <div className="text-center">
                    <h2 className="text-xl font-bold text-nara-text tracking-tight">Create Account</h2>
                  </div>
                  <div className="space-y-3">
                    <input 
                      type="text" 
                      placeholder="Full name" 
                      className="app-input py-3.5 text-sm" 
                      value={fullName}
                      onChange={(e) => setFullName(e.target.value)}
                    />
                    <input 
                      type="email" 
                      placeholder="Email address" 
                      className="app-input py-3.5 text-sm" 
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                    />
                    <input 
                      type="password" 
                      placeholder="Create password" 
                      className="app-input py-3.5 text-sm" 
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                    />
                  </div>
                  <button 
                    onClick={handleAuthAction} 
                    disabled={!isFormValid || isLoading}
                    className={`btn-primary py-3.5 mt-1 transition-all ${(!isFormValid || isLoading) ? 'opacity-50 grayscale cursor-not-allowed' : ''}`}
                  >
                    {isLoading ? <Loader2 className="animate-spin" size={18} /> : <>Get Started <ArrowRight size={16} /></>}
                  </button>
                </motion.div>
              )}
            </AnimatePresence>

            <div className="mt-6 flex items-center gap-4 opacity-40">
              <div className="flex-1 h-[1px] bg-slate-300"></div>
              <span className="text-[8px] text-slate-500 font-black uppercase tracking-widest">NARA Protocol</span>
              <div className="flex-1 h-[1px] bg-slate-300"></div>
            </div>

            <p className="mt-5 text-center text-[10px] text-nara-muted leading-relaxed px-2">
              Secure biometric handshake powered by Supabase.
            </p>
          </div>

          <div className="mt-8 text-center">
            <button onClick={() => setIsLogin(!isLogin)} className="text-nara-muted text-sm font-medium">
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
