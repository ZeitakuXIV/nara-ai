'use client';

import { useState, useMemo, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import { ArrowRight, ChevronLeft, User, Activity, Ruler, Weight, Coffee, Footprints, Dumbbell, Zap, ShieldCheck, Target } from 'lucide-react';

export default function Onboarding() {
  const [step, setStep] = useState(1);
  const router = useRouter();

  // Handle final transition
  useEffect(() => {
    if (step > 4) {
      const timer = setTimeout(() => {
        router.push('/dashboard');
      }, 4000); // 4 seconds of "Reasoning" animation
      return () => clearTimeout(timer);
    }
  }, [step, router]);
  
  // Form State
  const [gender, setGender] = useState<'male' | 'female' | null>(null);
  const [age, setAge] = useState<string>('');
  const [height, setHeight] = useState<number>(170);
  const [weight, setWeight] = useState<number>(65);
  const [activity, setActivity] = useState<string | null>(null);
  const [allergies, setAllergies] = useState<string[]>([]);
  const [location, setLocation] = useState<string>('');
  const [goal, setGoal] = useState<string | null>(null);

  // PAL Data
  const activityLevels = [
    { id: 'sedentary', title: 'Sedentary', desc: 'Little to no exercise, desk job.', icon: Coffee, val: 1.2 },
    { id: 'light', title: 'Lightly Active', desc: 'Moving around, 1-3 days of exercise.', icon: Footprints, val: 1.375 },
    { id: 'moderate', title: 'Moderately Active', desc: 'Regular training, 3-5 days a week.', icon: Dumbbell, val: 1.55 },
    { id: 'extra', title: 'Highly Active', desc: 'Intense daily exercise or physical job.', icon: Zap, val: 1.725 },
  ];

  const commonAllergies = [
    'Peanuts', 'Dairy', 'Eggs', 'Gluten', 'Soy', 'Seafood', 'Shellfish', 'Tree Nuts'
  ];

  const dietGoals = [
    { id: 'cutting', title: 'Cutting', desc: 'Fat loss while maintaining muscle.', icon: Zap },
    { id: 'maintenance', title: 'Maintenance', desc: 'Optimize health and stable weight.', icon: Activity },
    { id: 'bulking', title: 'Bulking', desc: 'Healthy weight and muscle gain.', icon: Target },
  ];

  // BMI Logic
  const bmi = useMemo(() => {
    if (!height || !weight) return 0;
    const heightInMeters = height / 100;
    return parseFloat((weight / (heightInMeters * heightInMeters)).toFixed(1));
  }, [height, weight]);

  const isAtRisk = bmi < 17.0;

  const toggleAllergy = (allergy: string) => {
    setAllergies(prev => 
      prev.includes(allergy) ? prev.filter(a => a !== allergy) : [...prev, allergy]
    );
  };

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
            {step <= 4 ? `Step ${step} of 4` : 'Processing'}
          </div>
          <div className="w-10" /> {/* Spacer */}
        </div>

        {/* Progress Bar */}
        <div className="w-full h-1.5 bg-slate-200/50 rounded-full overflow-hidden">
          <motion.div 
            initial={{ width: '25%' }}
            animate={{ width: `${Math.min((step / 4) * 100, 100)}%` }}
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

          {step === 3 && (
            <motion.div
              key="step3"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
              className="flex flex-col gap-8"
            >
              <div className="space-y-2">
                <h1 className="text-3xl font-extrabold tracking-tight text-nara-text">Safety & Region</h1>
                <p className="text-nara-muted text-base">Personalize your dietary constraints and location.</p>
              </div>

              <div className="space-y-3">
                <label className="text-sm font-bold text-nara-text px-1 uppercase tracking-wider opacity-60 flex items-center gap-2">
                   Your Region (Indonesia)
                </label>
                <input 
                  type="text" 
                  value={location}
                  onChange={(e) => setLocation(e.target.value)}
                  placeholder="e.g. Jakarta Selatan, Bali, Papua"
                  className="app-input"
                />
              </div>

              <div className="space-y-4">
                <label className="text-sm font-bold text-nara-text px-1 uppercase tracking-wider opacity-60">Common Allergens</label>
                <div className="flex flex-wrap gap-2">
                  {commonAllergies.map((allergy) => {
                    const isSelected = allergies.includes(allergy);
                    return (
                      <button
                        key={allergy}
                        onClick={() => toggleAllergy(allergy)}
                        className={`px-5 py-2.5 rounded-full border text-sm font-bold transition-all ${
                          isSelected 
                          ? 'bg-nara-hunter border-nara-hunter text-white shadow-soft' 
                          : 'bg-white/40 border-white/80 text-nara-muted hover:bg-white/60'
                        }`}
                      >
                        {allergy}
                      </button>
                    );
                  })}
                </div>
              </div>

              <AnimatePresence>
                {isAtRisk && (
                  <motion.div
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    className="p-5 rounded-3xl bg-red-50 border border-red-100 flex items-start gap-4 shadow-sm"
                  >
                    <div className="w-10 h-10 rounded-2xl bg-red-500 flex items-center justify-center shrink-0 text-white shadow-lg shadow-red-500/20">
                       <ShieldCheck size={20} />
                    </div>
                    <div>
                      <h4 className="text-sm font-bold text-red-900 uppercase tracking-tighter text-left">Safety Shield Active</h4>
                      <p className="text-xs text-red-700 leading-normal mt-1 text-left">
                        NARA has detected a health risk (BMI: {bmi}). We will prioritize nutrient density over caloric restriction.
                      </p>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>

              <div className="mt-4">
                <button 
                  disabled={!location}
                  onClick={nextStep}
                  className={`btn-primary ${!location ? 'opacity-50 grayscale cursor-not-allowed' : ''}`}
                >
                  Continue <ArrowRight size={20} />
                </button>
              </div>
            </motion.div>
          )}

          {step === 4 && (
            <motion.div
              key="step4"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
              className="flex flex-col gap-8"
            >
              <div className="space-y-2">
                <h1 className="text-3xl font-extrabold tracking-tight text-nara-text text-glow">The Objective</h1>
                <p className="text-nara-muted text-base">Select your primary dietary goal.</p>
              </div>

              <div className="grid grid-cols-1 gap-4">
                {dietGoals.map((g) => {
                  const Icon = g.icon;
                  const isActive = goal === g.id;
                  const isDisabled = isAtRisk && g.id === 'cutting';
                  
                  return (
                    <button
                      key={g.id}
                      disabled={isDisabled}
                      onClick={() => setGoal(g.id)}
                      className={`p-6 rounded-[32px] border transition-all duration-300 flex items-center gap-5 text-left group relative ${
                        isActive 
                        ? 'bg-nara-hunter/10 border-nara-hunter shadow-float scale-[1.02]' 
                        : isDisabled
                        ? 'bg-slate-50 border-slate-100 opacity-40 cursor-not-allowed'
                        : 'bg-white/40 border-white/80 hover:bg-white/60'
                      }`}
                    >
                      <div className={`w-14 h-14 rounded-2xl flex items-center justify-center transition-colors ${isActive ? 'bg-nara-hunter text-white' : 'bg-slate-100 text-slate-400'}`}>
                        <Icon size={28} />
                      </div>
                      <div className="flex-1">
                        <h3 className={`font-bold text-lg leading-tight ${isActive ? 'text-nara-text' : 'text-slate-700'}`}>{g.title}</h3>
                        <p className={`text-sm mt-1 leading-snug ${isActive ? 'text-nara-hunter font-medium' : 'text-slate-500'}`}>
                          {isDisabled ? 'Restricted for medical safety.' : g.desc}
                        </p>
                      </div>
                      {isActive && (
                        <motion.div 
                          layoutId="check"
                          className="w-6 h-6 rounded-full bg-nara-hunter flex items-center justify-center"
                        >
                           <ArrowRight size={14} className="text-white" />
                        </motion.div>
                      )}
                    </button>
                  );
                })}
              </div>

              {/* Sensing Summary */}
              <div className="p-6 rounded-3xl bg-white/20 border border-white/40">
                 <h4 className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 mb-4">Sensing Summary</h4>
                 <div className="grid grid-cols-2 gap-y-4 gap-x-2">
                    <div className="flex flex-col">
                       <span className="text-xs text-nara-muted font-medium">User Profile</span>
                       <span className="text-sm font-bold text-nara-text">{age}yo {gender}</span>
                    </div>
                    <div className="flex flex-col">
                       <span className="text-xs text-nara-muted font-medium">Health Status</span>
                       <span className={`text-sm font-bold ${bmiStatus.color}`}>{bmiStatus.label}</span>
                    </div>
                    <div className="flex flex-col col-span-2">
                       <span className="text-xs text-nara-muted font-medium">Location Context</span>
                       <span className="text-sm font-bold text-nara-text">{location}</span>
                    </div>
                 </div>
              </div>

              <div className="mt-4">
                <motion.button 
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  disabled={!goal}
                  onClick={nextStep}
                  className={`btn-primary w-full flex justify-center items-center gap-3 py-5 ${!goal ? 'opacity-50 grayscale cursor-not-allowed' : 'animate-pulse-subtle'}`}
                >
                  <span className="text-lg uppercase tracking-wider">Generate My Plan</span>
                  <Zap size={20} fill="white" className="animate-bounce" />
                </motion.button>
              </div>
            </motion.div>
          )}

          {step > 4 && (
            <motion.div
              key="finalizing"
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              className="flex flex-col items-center justify-center pt-10 text-center"
            >
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
               
               <h2 className="text-3xl font-extrabold text-nara-text tracking-tight">NARA is Reasoning</h2>
               <p className="text-nara-muted mt-4 max-w-[260px] leading-relaxed">
                  Calibrating local recipes and scaling portions to match your biometric signature...
               </p>
               
               <motion.div 
                 initial={{ opacity: 0 }}
                 animate={{ opacity: 1 }}
                 transition={{ delay: 2 }}
                 className="mt-12 w-full max-w-[200px]"
               >
                 <div className="flex items-center gap-2 mb-2">
                    <div className="w-1.5 h-1.5 rounded-full bg-nara-emerald animate-ping" />
                    <span className="text-[10px] font-bold uppercase tracking-widest text-nara-emerald">Optimizing CSP Matrix</span>
                 </div>
                 <div className="w-full h-1 bg-slate-100 rounded-full overflow-hidden">
                    <motion.div 
                      initial={{ x: '-100%' }}
                      animate={{ x: '0%' }}
                      transition={{ duration: 3, repeat: Infinity }}
                      className="h-full w-full bg-nara-emerald"
                    />
                 </div>
               </motion.div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Decorative Blur Blobs */}
      <div className="absolute bottom-[-10%] right-[-10%] w-[300px] h-[300px] bg-nara-emerald/5 rounded-full blur-[100px] pointer-events-none" />
    </div>
  );
}
