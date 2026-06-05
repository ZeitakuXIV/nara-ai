'use client';

import { useState, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import { ArrowRight, ChevronLeft, User, Ruler, Weight, Coffee, Footprints, Dumbbell, Zap, ShieldCheck, Heart } from 'lucide-react';
import { useUserStore } from '@/store/userStore';
import { calculateBMI, getBmiStatus } from '@/utils/nutrition';

export default function Onboarding() {
  const [step, setStep] = useState(1);
  const [isGenerating, setIsGenerating] = useState(false);
  const router = useRouter();

  // Connect to Zustand Store
  const store = useUserStore();

  const activityLevels = [
    { id: 'sedentary', title: 'Sedentary', desc: 'Little exercise.', icon: Coffee },
    { id: 'light', title: 'Lightly Active', desc: '1-3 days exercise.', icon: Footprints },
    { id: 'moderate', title: 'Moderately Active', desc: '3-5 days exercise.', icon: Dumbbell },
    { id: 'extra', title: 'Highly Active', desc: 'Intense daily exercise.', icon: Zap },
  ];

  const commonAllergies = ['Peanuts', 'Dairy', 'Eggs', 'Gluten', 'Soy', 'Seafood', 'Shellfish', 'Tree Nuts'];

  const dietGoals = [
    { id: 'cutting', title: 'Cutting', desc: 'Fat loss focus.', icon: Zap },
    { id: 'maintenance', title: 'Maintenance', desc: 'Health focus.', icon: Heart },
    { id: 'bulking', title: 'Bulking', desc: 'Muscle focus.', icon: Dumbbell },
  ];

  const bmi = calculateBMI(store.weight, store.height);
  const isAtRisk = bmi < 17.0 && bmi > 0;
  const bmiStatus = getBmiStatus(bmi);

  const handleGeneratePlan = async () => {
    setStep(5);
    setIsGenerating(true);

    try {
      // Real Async Fetch to Backend
      const response = await fetch('/api/plan', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          biometrics: {
            gender: store.gender,
            age: store.age,
            height: store.height,
            weight: store.weight,
            activity: store.activity,
            location: store.location,
            allergies: store.allergies,
            goal: store.goal
          }
        })
      });

      if (response.ok) {
        store.completeOnboarding();
        router.push('/dashboard');
      } else {
        console.error("Failed to generate plan");
        setStep(4); // Go back on error
      }
    } catch (err) {
      console.error(err);
      setStep(4);
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <div className="app-content px-6 bg-transparent">
      {/* Header - Balanced for Notch */}
      {step <= 4 && (
        <header className="w-full max-w-sm mx-auto flex flex-col gap-4 mt-6 mb-6 z-10 shrink-0">
          <div className="flex items-center justify-between">
            <button 
              onClick={() => step > 1 ? setStep(s => s - 1) : window.history.back()}
              className="w-9 h-9 flex items-center justify-center rounded-full bg-white/50 backdrop-blur-md border border-white/80 active:scale-90 transition-all"
            >
              <ChevronLeft size={18} />
            </button>
            <div className="text-[9px] font-black uppercase tracking-[0.2em] text-nara-hunter opacity-60">Step {step} of 4</div>
            <div className="w-9" />
          </div>
          <div className="w-full h-1 bg-slate-200/50 rounded-full overflow-hidden">
            <motion.div animate={{ width: `${(step / 4) * 100}%` }} className="h-full bg-nara-hunter" />
          </div>
        </header>
      )}

      <div className="w-full max-w-sm mx-auto flex-1 flex flex-col z-10">
        <AnimatePresence mode="wait">
          {step === 1 && (
            <motion.div key="s1" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} className="space-y-5 pb-6">
              <div>
                <h1 className="text-2xl font-black text-nara-text tracking-tight">Biometrics</h1>
                <p className="text-nara-muted text-xs font-medium">Calibrate your physical profile.</p>
              </div>

              <div className="flex gap-3">
                {(['male', 'female'] as const).map((g) => (
                  <button key={g} onClick={() => store.setBiometrics({ gender: g })} className={`flex-1 py-4 rounded-[28px] border transition-all flex flex-col items-center gap-1 ${store.gender === g ? 'bg-nara-hunter/10 border-nara-hunter shadow-float' : 'bg-white/40 border-white/80'}`}>
                    <User className={`${store.gender === g ? 'text-nara-hunter' : 'text-slate-300'}`} size={20} />
                    <span className={`font-black text-[10px] uppercase tracking-widest ${store.gender === g ? 'text-nara-hunter' : 'text-slate-500'}`}>{g}</span>
                  </button>
                ))}
              </div>

              <div className="space-y-3">
                 <div className="space-y-1.5">
                   <label className="text-[9px] font-black uppercase text-slate-400 px-1 tracking-widest">Age</label>
                   <input type="number" value={store.age || ''} onChange={e => store.setBiometrics({ age: parseInt(e.target.value) || 0 })} placeholder="e.g. 24" className="app-input py-3.5 text-base font-bold" />
                 </div>
                 
                 <div className="glass-container p-5 space-y-6 shadow-xl">
                    <div className="space-y-3">
                       <div className="flex justify-between items-center">
                          <div className="flex items-center gap-2 text-nara-text font-black text-[10px] uppercase tracking-wider opacity-60">
                             <Ruler size={14} /> Height
                          </div>
                          <div className="flex items-center gap-1 bg-white/50 px-2 py-0.5 rounded-lg border border-white/80 shadow-sm">
                             <input 
                               type="number"
                               value={store.height}
                               onChange={(e) => store.setBiometrics({ height: Math.min(250, Math.max(0, parseInt(e.target.value) || 0)) })}
                               className="w-10 bg-transparent text-right font-black text-nara-hunter text-sm focus:outline-none"
                             />
                             <span className="text-[10px] font-black text-slate-400">cm</span>
                          </div>
                       </div>
                       <input type="range" min="120" max="220" value={store.height} onChange={e => store.setBiometrics({ height: parseInt(e.target.value) })} className="w-full h-1.5 bg-slate-200 rounded-full appearance-none accent-nara-hunter cursor-pointer" />
                    </div>

                    <div className="space-y-3">
                       <div className="flex justify-between items-center">
                          <div className="flex items-center gap-2 text-nara-text font-black text-[10px] uppercase tracking-wider opacity-60">
                             <Weight size={14} /> Weight
                          </div>
                          <div className="flex items-center gap-1 bg-white/50 px-2 py-0.5 rounded-lg border border-white/80 shadow-sm">
                             <input 
                               type="number"
                               value={store.weight}
                               onChange={(e) => store.setBiometrics({ weight: Math.min(300, Math.max(0, parseInt(e.target.value) || 0)) })}
                               className="w-10 bg-transparent text-right font-black text-nara-hunter text-sm focus:outline-none"
                             />
                             <span className="text-[10px] font-black text-slate-400">kg</span>
                          </div>
                       </div>
                       <input type="range" min="30" max="180" value={store.weight} onChange={e => store.setBiometrics({ weight: parseInt(e.target.value) })} className="w-full h-1.5 bg-slate-200 rounded-full appearance-none accent-nara-hunter cursor-pointer" />
                    </div>
                 </div>
              </div>

              <div className="flex justify-between items-center p-5 rounded-[28px] border border-dashed border-slate-300 bg-white/20">
                 <div className="flex flex-col text-left">
                    <span className="text-[9px] font-black uppercase tracking-widest text-slate-400">Status</span>
                    <span className={`font-black text-sm uppercase ${bmiStatus.color}`}>{bmiStatus.label}</span>
                 </div>
                 <span className="text-3xl font-black text-nara-text tracking-tighter">{bmi}</span>
              </div>
              <button disabled={!store.gender || !store.age} onClick={() => setStep(2)} className="btn-primary py-4 mt-2">Continue <ArrowRight size={18} /></button>
            </motion.div>
          )}

          {step === 2 && (
            <motion.div key="s2" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} className="space-y-4 px-1 pb-10">
              <h1 className="text-2xl font-black text-nara-text tracking-tight">Daily Activity</h1>
              <div className="grid gap-3">
                {activityLevels.map((l) => (
                  <button key={l.id} onClick={() => store.setBiometrics({ activity: l.id })} className={`p-4 rounded-[28px] border text-left flex items-center gap-4 transition-all ${store.activity === l.id ? 'bg-nara-hunter/10 border-nara-hunter scale-[1.02] shadow-float' : 'bg-white/40 border-white/80 hover:bg-white/60'}`}>
                    <div className={`w-12 h-12 rounded-2xl flex items-center justify-center shrink-0 ${store.activity === l.id ? 'bg-nara-hunter text-white shadow-soft' : 'bg-slate-100 text-slate-400'}`}><l.icon size={24} /></div>
                    <div className="flex-1 pr-1">
                       <h3 className={`font-black text-base ${store.activity === l.id ? 'text-nara-text' : 'text-slate-700'}`}>{l.title}</h3>
                       <p className="text-[10px] text-nara-muted mt-0.5 leading-snug">{l.desc}</p>
                    </div>
                  </button>
                ))}
              </div>
              <button disabled={!store.activity} onClick={() => setStep(3)} className="btn-primary py-4 mt-6">Continue <ArrowRight size={18} /></button>
            </motion.div>
          )}

          {step === 3 && (
            <motion.div key="s3" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} className="space-y-8 px-1 pb-10">
              <h1 className="text-2xl font-black text-nara-text tracking-tight">Constraints</h1>
              <div className="space-y-2">
                 <label className="text-[10px] font-black uppercase text-slate-400 px-1 tracking-[0.2em]">Region (Indonesia)</label>
                 <input type="text" value={store.location} onChange={e => store.setBiometrics({ location: e.target.value })} placeholder="e.g. Jakarta Selatan" className="app-input py-5 font-bold" />
              </div>
              <div className="space-y-4">
                 <label className="text-[10px] font-black uppercase text-slate-400 px-1 tracking-[0.2em]">Common Allergies</label>
                 <div className="flex flex-wrap gap-2">
                   {commonAllergies.map(a => (
                     <button key={a} onClick={() => store.toggleAllergy(a)} className={`px-4 py-3 rounded-full border text-[11px] font-black uppercase tracking-wider transition-all ${store.allergies.includes(a) ? 'bg-nara-hunter border-nara-hunter text-white shadow-soft' : 'bg-white/40 border-white/80 text-nara-muted'}`}>{a}</button>
                   ))}
                 </div>
              </div>
              {isAtRisk && (
                 <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} className="p-5 rounded-[32px] bg-red-50 border border-red-100 text-[11px] text-red-700 flex gap-4 italic font-bold">
                    <ShieldCheck className="shrink-0" size={18} /> 
                    Safety Shield Active.
                 </motion.div>
              )}
              <button disabled={!store.location} onClick={() => setStep(4)} className="btn-primary py-5">Continue <ArrowRight size={20} /></button>
            </motion.div>
          )}

          {step === 4 && (
            <motion.div key="s4" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} className="space-y-6 px-1 pb-10">
              <h1 className="text-2xl font-black text-nara-text tracking-tight">Objective</h1>
              <div className="grid gap-3">
                {dietGoals.map((g) => {
                  const disabled = isAtRisk && g.id === 'cutting';
                  return (
                    <button key={g.id} disabled={disabled} onClick={() => store.setBiometrics({ goal: g.id })} className={`p-5 rounded-[28px] border text-left flex items-center gap-5 transition-all ${disabled ? 'opacity-30 grayscale cursor-not-allowed' : store.goal === g.id ? 'bg-nara-hunter/10 border-nara-hunter scale-[1.02] shadow-float' : 'bg-white/40 border-white/80 hover:bg-white/60'}`}>
                      <div className={`w-14 h-14 rounded-2xl flex items-center justify-center shrink-0 ${store.goal === g.id ? 'bg-nara-hunter text-white shadow-soft' : 'bg-slate-100 text-slate-400'}`}><g.icon size={28} /></div>
                      <div className="flex-1 pr-1">
                         <h3 className={`font-black text-lg ${store.goal === g.id ? 'text-nara-text' : 'text-slate-700'}`}>{g.title}</h3>
                         <p className="text-[10px] text-nara-muted mt-0.5 leading-snug">{disabled ? 'Restricted for safety.' : g.desc}</p>
                      </div>
                    </button>
                  );
                })}
              </div>
              <button disabled={!store.goal || isGenerating} onClick={handleGeneratePlan} className="btn-primary py-5 mt-6">
                {isGenerating ? 'Processing...' : 'Generate Plan'} <Zap size={20} fill="currentColor" />
              </button>
            </motion.div>
          )}

          {step > 4 && (
            <motion.div key="fin" initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} className="flex-1 flex flex-col items-center justify-center text-center h-full pt-10">
              <div className="relative w-32 h-32 mb-10 flex items-center justify-center">
                  <motion.div 
                    animate={{ rotate: 360 }} 
                    transition={{ duration: 8, repeat: Infinity, ease: "linear" }} 
                    className="absolute inset-0 rounded-full border-4 border-dashed border-nara-hunter/30 w-full h-full" 
                  />
                  <div className="w-20 h-20 bg-nara-hunter rounded-[32px] flex items-center justify-center shadow-float animate-pulse z-10">
                    <span className="text-white font-black text-3xl">N</span>
                  </div>
              </div>
              <h2 className="text-3xl font-black text-nara-text tracking-tighter uppercase">Calibrating NARA</h2>
              <p className="text-nara-muted mt-4 max-w-[260px] text-xs font-bold uppercase tracking-[0.2em] leading-loose">
                Connecting to Inference Engine...
              </p>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
