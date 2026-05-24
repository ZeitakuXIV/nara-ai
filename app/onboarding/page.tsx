'use client';

import { useState, useMemo, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import { ArrowRight, ChevronLeft, User, Ruler, Weight, Coffee, Footprints, Dumbbell, Zap, ShieldCheck, Target } from 'lucide-react';

export default function Onboarding() {
  const [step, setStep] = useState(1);
  const router = useRouter();

  useEffect(() => {
    if (step > 4) {
      const timer = setTimeout(() => { router.push('/dashboard'); }, 4000);
      return () => clearTimeout(timer);
    }
  }, [step, router]);
  
  const [gender, setGender] = useState<'male' | 'female' | null>(null);
  const [age, setAge] = useState<string>('');
  const [height, setHeight] = useState<number>(170);
  const [weight, setWeight] = useState<number>(65);
  const [activity, setActivity] = useState<string | null>(null);
  const [allergies, setAllergies] = useState<string[]>([]);
  const [location, setLocation] = useState<string>('');
  const [goal, setGoal] = useState<string | null>(null);

  const activityLevels = [
    { id: 'sedentary', title: 'Sedentary', desc: 'Little exercise.', icon: Coffee },
    { id: 'light', title: 'Lightly Active', desc: '1-3 days exercise.', icon: Footprints },
    { id: 'moderate', title: 'Moderately Active', desc: '3-5 days exercise.', icon: Dumbbell },
    { id: 'extra', title: 'Highly Active', desc: 'Intense daily exercise.', icon: Zap },
  ];

  const commonAllergies = ['Peanuts', 'Dairy', 'Eggs', 'Gluten', 'Soy', 'Seafood', 'Shellfish', 'Tree Nuts'];

  const dietGoals = [
    { id: 'cutting', title: 'Cutting', desc: 'Fat loss focus.', icon: Zap },
    { id: 'maintenance', title: 'Maintenance', desc: 'Health focus.', icon: Target },
    { id: 'bulking', title: 'Bulking', desc: 'Muscle focus.', icon: Target },
  ];

  const bmi = useMemo(() => {
    if (!height || !weight) return 0;
    const h = height / 100;
    return parseFloat((weight / (h * h)).toFixed(1));
  }, [height, weight]);

  const isAtRisk = bmi < 17.0;

  const toggleAllergy = (allergy: string) => {
    setAllergies(prev => prev.includes(allergy) ? prev.filter(a => a !== allergy) : [...prev, allergy]);
  };

  const getBmiStatus = (val: number) => {
    if (val < 18.5) return { label: 'Underweight', color: 'text-blue-500' };
    if (val < 25) return { label: 'Normal', color: 'text-nara-emerald' };
    if (val < 30) return { label: 'Overweight', color: 'text-orange-500' };
    return { label: 'Obese', color: 'text-red-500' };
  };

  const bmiStatus = getBmiStatus(bmi);

  return (
    <div className="h-[100dvh] w-full flex flex-col relative overflow-hidden bg-nara-light">
      <div className="pwa-bg" />

      {/* Header - Fixed with Safe Area */}
      <header className="w-full flex flex-col gap-4 px-6 pt-[env(safe-area-inset-top,2rem)] mb-6 z-10 shrink-0">
        <div className="flex items-center justify-between">
          <button 
            onClick={() => step > 1 ? setStep(s => s - 1) : window.history.back()}
            className="w-10 h-10 flex items-center justify-center rounded-full bg-white/50 border border-white/80"
          >
            <ChevronLeft size={20} />
          </button>
          <div className="text-[10px] font-bold uppercase tracking-widest text-nara-hunter">Step {step} of 4</div>
          <div className="w-10" />
        </div>
        <div className="w-full h-1 bg-slate-200/50 rounded-full overflow-hidden">
          <motion.div animate={{ width: `${(step / 4) * 100}%` }} className="h-full bg-nara-hunter" />
        </div>
      </header>

      {/* Main Content Area - Scrollable but contained */}
      <div className="flex-1 w-full flex flex-col z-10 overflow-y-auto no-scrollbar pb-[env(safe-area-inset-bottom,2rem)]">
        <div className="px-6 w-full max-w-sm mx-auto">
          <AnimatePresence mode="wait">
            {step === 1 && (
              <motion.div key="s1" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} className="space-y-6">
                <div>
                  <h1 className="text-2xl font-black tracking-tight">Biometrics</h1>
                  <p className="text-nara-muted text-xs">Define your physical identity.</p>
                </div>
                <div className="flex gap-3">
                  {(['male', 'female'] as const).map((g) => (
                    <button key={g} onClick={() => setGender(g)} className={`flex-1 p-4 rounded-[28px] border transition-all ${gender === g ? 'bg-nara-hunter/10 border-nara-hunter shadow-sm' : 'bg-white/40 border-white/80'}`}>
                      <User className={`mx-auto mb-1 ${gender === g ? 'text-nara-hunter' : 'text-slate-300'}`} size={20} />
                      <span className={`font-bold text-[10px] uppercase ${gender === g ? 'text-nara-hunter' : 'text-slate-400'}`}>{g}</span>
                    </button>
                  ))}
                </div>
                <div className="space-y-4">
                   <div className="space-y-1.5">
                     <label className="text-[10px] font-black uppercase text-slate-400 px-1">Age</label>
                     <input type="number" value={age} onChange={e => setAge(e.target.value)} placeholder="e.g. 24" className="app-input py-3.5 text-base font-bold" />
                   </div>
                   
                   <div className="glass-container p-5 space-y-6">
                      <div className="space-y-3">
                         <div className="flex justify-between items-center">
                            <div className="flex items-center gap-2 text-nara-text font-bold text-xs uppercase opacity-60">
                               <Ruler size={16} /> Height
                            </div>
                            <div className="flex items-center gap-1 bg-white/50 px-2 py-0.5 rounded-lg border border-white/80">
                               <input 
                                 type="number"
                                 value={height}
                                 onChange={(e) => setHeight(Math.min(250, Math.max(0, parseInt(e.target.value) || 0)))}
                                 className="w-10 bg-transparent text-right font-black text-nara-hunter text-sm focus:outline-none"
                               />
                               <span className="text-[10px] font-bold text-slate-400">cm</span>
                            </div>
                         </div>
                         <input type="range" min="120" max="220" value={height} onChange={e => setHeight(parseInt(e.target.value))} className="w-full h-1.5 bg-slate-200 rounded-full appearance-none accent-nara-hunter" />
                      </div>

                      <div className="space-y-3">
                         <div className="flex justify-between items-center">
                            <div className="flex items-center gap-2 text-nara-text font-bold text-xs uppercase opacity-60">
                               <Weight size={16} /> Weight
                            </div>
                            <div className="flex items-center gap-1 bg-white/50 px-2 py-0.5 rounded-lg border border-white/80">
                               <input 
                                 type="number"
                                 value={weight}
                                 onChange={(e) => setWeight(Math.min(300, Math.max(0, parseInt(e.target.value) || 0)))}
                                 className="w-10 bg-transparent text-right font-black text-nara-hunter text-sm focus:outline-none"
                               />
                               <span className="text-[10px] font-bold text-slate-400">kg</span>
                            </div>
                         </div>
                         <input type="range" min="30" max="180" value={weight} onChange={e => setWeight(parseInt(e.target.value))} className="w-full h-1.5 bg-slate-200 rounded-full appearance-none accent-nara-hunter" />
                      </div>
                   </div>
                </div>
                <div className="flex justify-between items-center p-4 rounded-[28px] border border-dashed border-slate-300">
                   <span className={`font-black text-xs uppercase ${bmiStatus.color}`}>{bmiStatus.label}</span>
                   <span className="text-xl font-black text-nara-text">{bmi} <span className="text-[10px] opacity-40">BMI</span></span>
                </div>
                <button disabled={!gender || !age} onClick={() => setStep(2)} className="btn-primary py-4">Continue <ArrowRight size={18} /></button>
              </motion.div>
            )}

            {step === 2 && (
              <motion.div key="s2" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} className="space-y-4">
                <h1 className="text-2xl font-black text-center mb-6">Daily Activity</h1>
                <div className="grid gap-3">
                  {activityLevels.map((l) => (
                    <button key={l.id} onClick={() => setActivity(l.id)} className={`p-4 rounded-[28px] border text-left flex items-center gap-4 transition-all ${activity === l.id ? 'bg-nara-hunter/10 border-nara-hunter scale-[1.02]' : 'bg-white/40 border-white/80'}`}>
                      <div className={`w-12 h-12 rounded-2xl flex items-center justify-center ${activity === l.id ? 'bg-nara-hunter text-white' : 'bg-slate-100 text-slate-400'}`}><l.icon size={24} /></div>
                      <div><h3 className="font-bold text-sm">{l.title}</h3><p className="text-[10px] text-slate-500">{l.desc}</p></div>
                    </button>
                  ))}
                </div>
                <button disabled={!activity} onClick={() => setStep(3)} className="btn-primary py-4 mt-6">Continue <ArrowRight size={18} /></button>
              </motion.div>
            )}

            {step === 3 && (
              <motion.div key="s3" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} className="space-y-6">
                <h1 className="text-2xl font-black">Regional Context</h1>
                <div className="space-y-2">
                   <label className="text-[10px] font-black uppercase text-slate-400 px-1">Region (Indonesia)</label>
                   <input type="text" value={location} onChange={e => setLocation(e.target.value)} placeholder="e.g. Jakarta Selatan" className="app-input py-4 text-sm font-bold" />
                </div>
                <div className="space-y-3">
                   <label className="text-[10px] font-black uppercase text-slate-400 px-1">Common Allergies</label>
                   <div className="flex flex-wrap gap-2">
                     {commonAllergies.map(a => (
                       <button key={a} onClick={() => toggleAllergy(a)} className={`px-4 py-2 rounded-full border text-[10px] font-bold transition-all ${allergies.includes(a) ? 'bg-nara-hunter text-white' : 'bg-white/40 border-white/80'}`}>{a}</button>
                     ))}
                   </div>
                </div>
                {isAtRisk && <div className="p-4 rounded-[28px] bg-red-50 border border-red-100 text-[10px] text-red-700 flex gap-3 italic"><ShieldCheck className="shrink-0" size={14} /> Safety Shield Active: Low BMI detected.</div>}
                <button disabled={!location} onClick={() => setStep(4)} className="btn-primary py-4">Continue <ArrowRight size={18} /></button>
              </motion.div>
            )}

            {step === 4 && (
              <motion.div key="s4" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} className="space-y-4">
                <h1 className="text-2xl font-black text-center mb-6">The Objective</h1>
                <div className="grid gap-3">
                  {dietGoals.map((g) => {
                    const disabled = isAtRisk && g.id === 'cutting';
                    return (
                      <button key={g.id} disabled={disabled} onClick={() => setGoal(g.id)} className={`p-4 rounded-[28px] border text-left flex items-center gap-4 transition-all ${disabled ? 'opacity-30 grayscale cursor-not-allowed' : goal === g.id ? 'bg-nara-hunter/10 border-nara-hunter scale-[1.02]' : 'bg-white/40 border-white/80'}`}>
                        <div className={`w-12 h-12 rounded-2xl flex items-center justify-center ${goal === g.id ? 'bg-nara-hunter text-white' : 'bg-slate-100 text-slate-400'}`}><g.icon size={24} /></div>
                        <div><h3 className="font-bold text-sm">{g.title}</h3><p className="text-[10px] text-slate-500">{g.desc}</p></div>
                      </button>
                    );
                  })}
                </div>
                <button disabled={!goal} onClick={() => setStep(5)} className="btn-primary py-5 mt-6">Generate Plan <Zap size={18} /></button>
              </motion.div>
            )}

            {step > 4 && (
              <motion.div key="fin" initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} className="flex-1 flex flex-col items-center justify-center text-center pt-20">
                <div className="relative w-32 h-32 mb-10">
                    <motion.div 
                      animate={{ rotate: 360 }} 
                      transition={{ duration: 8, repeat: Infinity, ease: "linear" }} 
                      className="absolute inset-0 rounded-full border-4 border-dashed border-nara-hunter/20" 
                    />
                    <div className="absolute inset-0 flex items-center justify-center">
                       <div className="w-20 h-20 bg-nara-hunter rounded-3xl flex items-center justify-center shadow-float animate-pulse">
                          <span className="text-white font-black text-3xl">N</span>
                       </div>
                    </div>
                </div>
                <h2 className="text-2xl font-black tracking-tight">Calibrating NARA</h2>
                <p className="text-nara-muted mt-4 max-w-[240px] text-xs leading-relaxed uppercase tracking-widest font-bold">Scaling ingredients for your signature...</p>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </div>
  );
}
