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
    <div className="app-content px-6">
      
      {/* Header - Balanced for Notch */}
      <header className="w-full max-w-md mx-auto flex flex-col gap-6 mt-8 mb-8 z-10 shrink-0">
        <div className="flex items-center justify-between">
          <button 
            onClick={() => step > 1 ? setStep(s => s - 1) : window.history.back()}
            className="w-10 h-10 flex items-center justify-center rounded-full bg-white/50 backdrop-blur-md border border-white/80 active:scale-90 transition-all"
          >
            <ChevronLeft size={20} />
          </button>
          <div className="text-[10px] font-black uppercase tracking-[0.2em] text-nara-hunter opacity-60">Step {step} of 4</div>
          <div className="w-10" />
        </div>
        <div className="w-full h-1 bg-slate-200/50 rounded-full overflow-hidden">
          <motion.div animate={{ width: `${(step / 4) * 100}%` }} className="h-full bg-nara-hunter" />
        </div>
      </header>

      <div className="w-full max-w-md mx-auto flex-1 flex flex-col z-10">
        <AnimatePresence mode="wait">
          {step === 1 && (
            <motion.div key="s1" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} className="space-y-8 pb-10">
              <div className="space-y-1">
                <h1 className="text-3xl font-black text-nara-text tracking-tight">Biometrics</h1>
                <p className="text-nara-muted text-sm font-medium">Let&apos;s calibrate your physical profile.</p>
              </div>

              <div className="flex gap-4">
                {(['male', 'female'] as const).map((g) => (
                  <button key={g} onClick={() => setGender(g)} className={`flex-1 p-6 rounded-[32px] border transition-all flex flex-col items-center gap-2 ${gender === g ? 'bg-nara-hunter/10 border-nara-hunter shadow-float' : 'bg-white/40 border-white/80'}`}>
                    <User className={`${gender === g ? 'text-nara-hunter' : 'text-slate-300'}`} size={24} />
                    <span className={`font-black text-[11px] uppercase tracking-widest ${gender === g ? 'text-nara-hunter' : 'text-slate-500'}`}>{g}</span>
                  </button>
                ))}
              </div>

              <div className="space-y-4">
                 <div className="space-y-2">
                   <label className="text-[10px] font-black uppercase text-slate-400 px-1 tracking-widest">Manual Age Input</label>
                   <input type="number" value={age} onChange={e => setAge(e.target.value)} placeholder="e.g. 24" className="app-input font-bold" />
                 </div>
                 
                 <div className="glass-container p-6 space-y-8">
                    <div className="space-y-4">
                       <div className="flex justify-between items-center">
                          <div className="flex items-center gap-2 text-nara-text font-black text-[11px] uppercase tracking-wider opacity-60">
                             <Ruler size={16} /> Height
                          </div>
                          <div className="flex items-center gap-1 bg-white/50 px-3 py-1 rounded-xl border border-white/80 shadow-sm">
                             <input 
                               type="number"
                               value={height}
                               onChange={(e) => setHeight(Math.min(250, Math.max(0, parseInt(e.target.value) || 0)))}
                               className="w-12 bg-transparent text-right font-black text-nara-hunter text-sm focus:outline-none"
                             />
                             <span className="text-[10px] font-black text-slate-400">cm</span>
                          </div>
                       </div>
                       <input type="range" min="120" max="220" value={height} onChange={e => setHeight(parseInt(e.target.value))} className="w-full h-1.5 bg-slate-200 rounded-full appearance-none accent-nara-hunter cursor-pointer" />
                    </div>

                    <div className="space-y-4">
                       <div className="flex justify-between items-center">
                          <div className="flex items-center gap-2 text-nara-text font-black text-[11px] uppercase tracking-wider opacity-60">
                             <Weight size={16} /> Weight
                          </div>
                          <div className="flex items-center gap-1 bg-white/50 px-3 py-1 rounded-xl border border-white/80 shadow-sm">
                             <input 
                               type="number"
                               value={weight}
                               onChange={(e) => setWeight(Math.min(300, Math.max(0, parseInt(e.target.value) || 0)))}
                               className="w-12 bg-transparent text-right font-black text-nara-hunter text-sm focus:outline-none"
                             />
                             <span className="text-[10px] font-black text-slate-400">kg</span>
                          </div>
                       </div>
                       <input type="range" min="30" max="180" value={weight} onChange={e => setWeight(parseInt(e.target.value))} className="w-full h-1.5 bg-slate-200 rounded-full appearance-none accent-nara-hunter cursor-pointer" />
                    </div>
                 </div>
              </div>

              <div className="flex justify-between items-center p-6 rounded-[32px] border border-dashed border-slate-300 bg-white/20">
                 <div className="flex flex-col">
                    <span className="text-[10px] font-black uppercase tracking-widest text-slate-400">BMI Index</span>
                    <span className={`font-black text-lg ${bmiStatus.color}`}>{bmiStatus.label}</span>
                 </div>
                 <span className="text-4xl font-black text-nara-text tracking-tighter">{bmi}</span>
              </div>
              <button disabled={!gender || !age} onClick={() => setStep(2)} className="btn-primary py-5">Continue <ArrowRight size={20} /></button>
            </motion.div>
          )}

          {step === 2 && (
            <motion.div key="s2" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} className="space-y-6 pb-10">
              <div className="space-y-1">
                 <h1 className="text-3xl font-black text-nara-text tracking-tight">Daily Activity</h1>
                 <p className="text-nara-muted text-sm font-medium">How much energy do you expend?</p>
              </div>
              <div className="grid gap-4">
                {activityLevels.map((l) => (
                  <button key={l.id} onClick={() => setActivity(l.id)} className={`p-6 rounded-[32px] border text-left flex items-center gap-5 transition-all ${activity === l.id ? 'bg-nara-hunter/10 border-nara-hunter scale-[1.02] shadow-float' : 'bg-white/40 border-white/80 hover:bg-white/60'}`}>
                    <div className={`w-14 h-14 rounded-2xl flex items-center justify-center shrink-0 ${activity === l.id ? 'bg-nara-hunter text-white shadow-soft' : 'bg-slate-100 text-slate-400'}`}><l.icon size={28} /></div>
                    <div className="flex-1">
                       <h3 className={`font-black text-lg ${activity === l.id ? 'text-nara-text' : 'text-slate-700'}`}>{l.title}</h3>
                       <p className="text-xs text-nara-muted mt-0.5 leading-snug">{l.desc}</p>
                    </div>
                  </button>
                ))}
              </div>
              <button disabled={!activity} onClick={() => setStep(3)} className="btn-primary py-5 mt-6">Continue <ArrowRight size={20} /></button>
            </motion.div>
          )}

          {step === 3 && (
            <motion.div key="s3" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} className="space-y-8 pb-10">
              <div className="space-y-1">
                 <h1 className="text-3xl font-black text-nara-text tracking-tight">Constraints</h1>
                 <p className="text-nara-muted text-sm font-medium">Personalize your dietary registry.</p>
              </div>
              <div className="space-y-3">
                 <label className="text-[10px] font-black uppercase text-slate-400 px-1 tracking-[0.2em]">Region (Indonesia)</label>
                 <input type="text" value={location} onChange={e => setLocation(e.target.value)} placeholder="e.g. Jakarta Selatan" className="app-input py-5 font-bold" />
              </div>
              <div className="space-y-4">
                 <label className="text-[10px] font-black uppercase text-slate-400 px-1 tracking-[0.2em]">Common Allergies</label>
                 <div className="flex flex-wrap gap-2">
                   {commonAllergies.map(a => (
                     <button key={a} onClick={() => toggleAllergy(a)} className={`px-5 py-3 rounded-full border text-[11px] font-black uppercase tracking-wider transition-all ${allergies.includes(a) ? 'bg-nara-hunter border-nara-hunter text-white shadow-soft' : 'bg-white/40 border-white/80 text-nara-muted'}`}>{a}</button>
                   ))}
                 </div>
              </div>
              {isAtRisk && (
                 <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} className="p-5 rounded-[32px] bg-red-50 border border-red-100 text-[11px] text-red-700 flex gap-4 italic font-bold">
                    <ShieldCheck className="shrink-0" size={18} /> 
                    Safety Shield: BMI below critical threshold. Portions will be scaled for nutrient density.
                 </motion.div>
              )}
              <button disabled={!location} onClick={() => setStep(4)} className="btn-primary py-5">Continue <ArrowRight size={20} /></button>
            </motion.div>
          )}

          {step === 4 && (
            <motion.div key="s4" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} className="space-y-8 pb-10">
              <div className="space-y-1 text-center">
                 <h1 className="text-3xl font-black text-nara-text tracking-tight">The Objective</h1>
                 <p className="text-nara-muted text-sm font-medium">Choose your primary dietary goal.</p>
              </div>
              <div className="grid gap-4">
                {dietGoals.map((g) => {
                  const disabled = isAtRisk && g.id === 'cutting';
                  return (
                    <button key={g.id} disabled={disabled} onClick={() => setGoal(g.id)} className={`p-6 rounded-[32px] border text-left flex items-center gap-5 transition-all ${disabled ? 'opacity-30 grayscale cursor-not-allowed' : goal === g.id ? 'bg-nara-hunter/10 border-nara-hunter scale-[1.02] shadow-float' : 'bg-white/40 border-white/80 hover:bg-white/60'}`}>
                      <div className={`w-14 h-14 rounded-2xl flex items-center justify-center shrink-0 ${goal === g.id ? 'bg-nara-hunter text-white shadow-soft' : 'bg-slate-100 text-slate-400'}`}><g.icon size={28} /></div>
                      <div className="flex-1">
                         <h3 className={`font-black text-lg ${goal === g.id ? 'text-nara-text' : 'text-slate-700'}`}>{g.title}</h3>
                         <p className="text-xs text-nara-muted mt-0.5 leading-snug">{disabled ? 'Restricted for medical safety.' : g.desc}</p>
                      </div>
                    </button>
                  );
                })}
              </div>
              <button disabled={!goal} onClick={() => setStep(5)} className="btn-primary py-6 mt-6">Generate Plan <Zap size={20} fill="currentColor" /></button>
            </motion.div>
          )}

          {step > 4 && (
            <motion.div key="fin" initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} className="flex-1 flex flex-col items-center justify-center text-center h-full pt-10">
              <div className="relative w-36 h-32 mb-10">
                  <motion.div animate={{ rotate: 360 }} transition={{ duration: 8, repeat: Infinity, ease: "linear" }} className="absolute inset-0 rounded-full border-4 border-dashed border-nara-hunter/30" />
                  <div className="absolute inset-0 flex items-center justify-center">
                     <div className="w-20 h-20 bg-nara-hunter rounded-[32px] flex items-center justify-center shadow-float animate-pulse">
                        <span className="text-white font-black text-3xl">N</span>
                     </div>
                  </div>
              </div>
              <h2 className="text-3xl font-black text-nara-text tracking-tighter uppercase">Calibrating NARA</h2>
              <p className="text-nara-muted mt-4 max-w-[260px] text-xs font-bold uppercase tracking-[0.2em] leading-loose">Optimizing CSP Portions & Ingredients...</p>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
