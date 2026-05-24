'use client';

import { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ArrowRight, ChevronLeft, User, Activity, Ruler, Weight, Coffee, Footprints, Dumbbell, Zap } from 'lucide-react';

export default function Onboarding() {
  const [step, setStep] = useState(1);
  
  // Form State
  const [gender, setGender] = useState<'male' | 'female' | null>(null);
  const [age, setAge] = useState<string>('');
  const [height, setHeight] = useState<number>(170);
  const [weight, setWeight] = useState<number>(65);
  const [activity, setActivity] = useState<string | null>(null);

  // PAL Data
  const activityLevels = [
    { id: 'sedentary', title: 'Sedentary', desc: 'Little to no exercise, desk job.', icon: Coffee, val: 1.2 },
    { id: 'light', title: 'Lightly Active', desc: 'Moving around, 1-3 days of exercise.', icon: Footprints, val: 1.375 },
    { id: 'moderate', title: 'Moderately Active', desc: 'Regular training, 3-5 days a week.', icon: Dumbbell, val: 1.55 },
    { id: 'extra', title: 'Highly Active', desc: 'Intense daily exercise or physical job.', icon: Zap, val: 1.725 },
  ];

  // BMI Logic
  const bmi = useMemo(() => {
    if (!height || !weight) return 0;
    const heightInMeters = height / 100;
    return parseFloat((weight / (heightInMeters * heightInMeters)).toFixed(1));
  }, [height, weight]);

  const getBmiStatus = (val: number) => {
    if (val < 18.5) return { label: 'Underweight', color: 'text-blue-500' };
    if (val < 25) return { label: 'Normal', color: 'text-nara-emerald' };
    if (val < 30) return { label: 'Overweight', color: 'text-orange-500' };
    return { label: 'Obese', color: 'text-red-500' };
  };

  const bmiStatus = getBmiStatus(bmi);

  const nextStep = () => setStep(s => s + 1);
  const prevStep = () => setStep(s => s - 1);

  return (
    <div className="flex-1 flex flex-col px-6 py-8 relative overflow-hidden bg-mesh-gradient min-h-[100dvh]">
      
      {/* Top Header & Progress */}
      <header className="flex flex-col gap-6 mb-10 z-10">
        <div className="flex items-center justify-between">
          <button 
            onClick={() => step > 1 ? prevStep() : window.history.back()}
            className="w-10 h-10 flex items-center justify-center rounded-full bg-white/50 backdrop-blur-md border border-white/80 text-nara-text active:scale-90 transition-all"
          >
            <ChevronLeft size={20} />
          </button>
          <div className="flex items-center gap-1.5 text-nara-hunter font-bold text-[10px] uppercase tracking-[0.2em]">
            Step {step} of 4
          </div>
          <div className="w-10" /> {/* Spacer */}
        </div>

        {/* Progress Bar */}
        <div className="w-full h-1.5 bg-slate-200/50 rounded-full overflow-hidden">
          <motion.div 
            initial={{ width: '25%' }}
            animate={{ width: `${(step / 4) * 100}%` }}
            className="h-full bg-gradient-to-r from-nara-hunter to-nara-emerald"
          />
        </div>
      </header>

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col z-10 max-w-md mx-auto w-full pb-10">
        <AnimatePresence mode="wait">
          {step === 1 && (
            <motion.div
              key="step1"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
              className="flex flex-col gap-8"
            >
              <div className="space-y-2">
                <h1 className="text-3xl font-extrabold tracking-tight text-nara-text">Physical Identity</h1>
                <p className="text-nara-muted text-base">Let's start with your biometric signature.</p>
              </div>

              {/* Gender Toggle */}
              <div className="flex gap-4">
                <button 
                  onClick={() => setGender('male')}
                  className={`flex-1 p-6 rounded-3xl border transition-all flex flex-col items-center gap-3 ${
                    gender === 'male' 
                    ? 'bg-nara-hunter/10 border-nara-hunter shadow-float' 
                    : 'bg-white/40 border-white/80'
                  }`}
                >
                  <div className={`w-12 h-12 rounded-2xl flex items-center justify-center ${gender === 'male' ? 'bg-nara-hunter text-white' : 'bg-slate-100 text-slate-400'}`}>
                    <User size={24} />
                  </div>
                  <span className={`font-bold text-sm ${gender === 'male' ? 'text-nara-hunter' : 'text-slate-500'}`}>Male</span>
                </button>

                <button 
                  onClick={() => setGender('female')}
                  className={`flex-1 p-6 rounded-3xl border transition-all flex flex-col items-center gap-3 ${
                    gender === 'female' 
                    ? 'bg-nara-hunter/10 border-nara-hunter shadow-float' 
                    : 'bg-white/40 border-white/80'
                  }`}
                >
                  <div className={`w-12 h-12 rounded-2xl flex items-center justify-center ${gender === 'female' ? 'bg-nara-hunter text-white' : 'bg-slate-100 text-slate-400'}`}>
                    <User size={24} />
                  </div>
                  <span className={`font-bold text-sm ${gender === 'female' ? 'text-nara-hunter' : 'text-slate-500'}`}>Female</span>
                </button>
              </div>

              {/* Age Input */}
              <div className="space-y-3">
                <label className="text-sm font-bold text-nara-text px-1 uppercase tracking-wider opacity-60">Your Age</label>
                <input 
                  type="number" 
                  value={age}
                  onChange={(e) => setAge(e.target.value)}
                  placeholder="e.g. 24"
                  className="app-input text-xl font-bold"
                />
              </div>

              {/* Height & Weight Container */}
              <div className="glass-container p-6 space-y-8">
                {/* Height */}
                <div className="space-y-4">
                  <div className="flex justify-between items-center px-1">
                    <div className="flex items-center gap-2 text-nara-text font-bold">
                      <Ruler size={18} className="text-nara-hunter" /> Height
                    </div>
                    <div className="flex items-center gap-1 bg-white/50 px-3 py-1 rounded-xl border border-white/80">
                      <input 
                        type="number"
                        value={height}
                        onChange={(e) => setHeight(Math.min(250, Math.max(0, parseInt(e.target.value) || 0)))}
                        className="w-12 bg-transparent text-right font-black text-nara-hunter focus:outline-none"
                      />
                      <span className="text-xs font-bold text-slate-400">cm</span>
                    </div>
                  </div>
                  <input 
                    type="range" 
                    min="100" 
                    max="220" 
                    value={height}
                    onChange={(e) => setHeight(parseInt(e.target.value))}
                    className="w-full h-2 bg-slate-200 rounded-full appearance-none accent-nara-hunter cursor-pointer"
                  />
                </div>

                {/* Weight */}
                <div className="space-y-4">
                  <div className="flex justify-between items-center px-1">
                    <div className="flex items-center gap-2 text-nara-text font-bold">
                      <Weight size={18} className="text-nara-hunter" /> Weight
                    </div>
                    <div className="flex items-center gap-1 bg-white/50 px-3 py-1 rounded-xl border border-white/80">
                      <input 
                        type="number"
                        value={weight}
                        onChange={(e) => setWeight(Math.min(300, Math.max(0, parseInt(e.target.value) || 0)))}
                        className="w-12 bg-transparent text-right font-black text-nara-hunter focus:outline-none"
                      />
                      <span className="text-xs font-bold text-slate-400">kg</span>
                    </div>
                  </div>
                  <input 
                    type="range" 
                    min="30" 
                    max="150" 
                    value={weight}
                    onChange={(e) => setWeight(parseInt(e.target.value))}
                    className="w-full h-2 bg-slate-200 rounded-full appearance-none accent-nara-hunter cursor-pointer"
                  />
                </div>
              </div>

              {/* BMI Live Feedback */}
              <div className="flex items-center justify-between p-5 rounded-3xl bg-white/40 border border-white/80 border-dashed">
                <div className="flex flex-col">
                  <span className="text-[10px] font-black uppercase tracking-widest text-slate-400">Current BMI</span>
                  <span className={`text-xl font-bold ${bmiStatus.color}`}>{bmiStatus.label}</span>
                </div>
                <div className="text-3xl font-black text-nara-text opacity-80">{bmi}</div>
              </div>

              <div className="mt-4">
                <button 
                  disabled={!gender || !age}
                  onClick={nextStep}
                  className={`btn-primary ${(!gender || !age) ? 'opacity-50 grayscale cursor-not-allowed' : ''}`}
                >
                  Continue <ArrowRight size={20} />
                </button>
              </div>
            </motion.div>
          )}

          {step === 2 && (
            <motion.div
              key="step2"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
              className="flex flex-col gap-8"
            >
              <div className="space-y-2">
                <h1 className="text-3xl font-extrabold tracking-tight text-nara-text text-glow">Daily Activity</h1>
                <p className="text-nara-muted text-base">How much do you move on a typical day?</p>
              </div>

              <div className="grid grid-cols-1 gap-4">
                {activityLevels.map((level) => {
                  const Icon = level.icon;
                  const isActive = activity === level.id;
                  return (
                    <button
                      key={level.id}
                      onClick={() => setActivity(level.id)}
                      className={`p-6 rounded-[32px] border transition-all duration-300 flex items-center gap-5 text-left group ${
                        isActive 
                        ? 'bg-nara-hunter/10 border-nara-hunter shadow-float scale-[1.02]' 
                        : 'bg-white/40 border-white/80 hover:bg-white/60'
                      }`}
                    >
                      <div className={`w-14 h-14 rounded-2xl flex items-center justify-center transition-colors ${isActive ? 'bg-nara-hunter text-white' : 'bg-slate-100 text-slate-400 group-hover:bg-slate-200'}`}>
                        <Icon size={28} />
                      </div>
                      <div className="flex-1">
                        <h3 className={`font-bold text-lg leading-tight ${isActive ? 'text-nara-text' : 'text-slate-700'}`}>{level.title}</h3>
                        <p className={`text-sm mt-1 leading-snug ${isActive ? 'text-nara-hunter font-medium' : 'text-slate-500'}`}>{level.desc}</p>
                      </div>
                      {isActive && (
                        <motion.div 
                          initial={{ scale: 0 }}
                          animate={{ scale: 1 }}
                          className="w-6 h-6 rounded-full bg-nara-hunter flex items-center justify-center"
                        >
                           <ArrowRight size={14} className="text-white" />
                        </motion.div>
                      )}
                    </button>
                  );
                })}
              </div>

              <div className="mt-8">
                <button 
                  disabled={!activity}
                  onClick={nextStep}
                  className={`btn-primary ${!activity ? 'opacity-50 grayscale cursor-not-allowed' : ''}`}
                >
                  Continue <ArrowRight size={20} />
                </button>
                <p className="mt-4 text-center text-xs text-nara-muted font-medium uppercase tracking-widest opacity-60">
                   Used for TDEE Calculation
                </p>
              </div>
            </motion.div>
          )}

          {step > 2 && (
            <motion.div
              key="future"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="flex flex-col items-center justify-center pt-20"
            >
               <Activity size={64} className="text-nara-hunter animate-pulse mb-6" />
               <h2 className="text-xl font-bold text-nara-text">Step {step} is coming soon</h2>
               <p className="text-nara-muted mt-2 text-center max-w-[200px]">We're integrating regional food data.</p>
               <button onClick={prevStep} className="mt-8 text-nara-hunter font-bold underline">Go Back</button>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Decorative Blur Blobs */}
      <div className="absolute bottom-[-10%] right-[-10%] w-[300px] h-[300px] bg-nara-emerald/5 rounded-full blur-[100px] pointer-events-none" />
    </div>
  );
}
