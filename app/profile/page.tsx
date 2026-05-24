'use client';

import { useState, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { 
  User, 
  Ruler, 
  Weight, 
  Calendar as AgeIcon, 
  Target, 
  MapPin, 
  ShieldAlert, 
  Save, 
  RotateCcw,
  ArrowLeft,
  MessageSquare
} from 'lucide-react';

export default function Profile() {
  // Mock Initial State (Simulating data from Onboarding)
  const [weight, setWeight] = useState(65);
  const [height, setHeight] = useState(170);
  const [age, setAge] = useState(24);
  const [location, setLocation] = useState('Jakarta Selatan');
  const [goal, setGoal] = useState('bulking');
  const [allergies, setAllergies] = useState(['Seafood', 'Dairy']);
  const router = useRouter();

  const commonAllergies = ['Peanuts', 'Dairy', 'Eggs', 'Gluten', 'Soy', 'Seafood', 'Shellfish', 'Tree Nuts'];

  // BMI Calculation
  const bmi = useMemo(() => {
    const heightInMeters = height / 100;
    return parseFloat((weight / (heightInMeters * heightInMeters)).toFixed(1));
  }, [height, weight]);

  const toggleAllergy = (allergy: string) => {
    setAllergies(prev => 
      prev.includes(allergy) ? prev.filter(a => a !== allergy) : [...prev, allergy]
    );
  };

  return (
    <div className="flex-1 flex flex-col bg-nara-light min-h-screen pb-32 relative overflow-hidden">
      {/* Background Decor */}
      <div className="absolute top-0 right-0 w-full h-[300px] bg-mesh-gradient opacity-40 pointer-events-none" />

      {/* Header */}
      <header className="px-6 pt-12 pb-6 flex items-center justify-between z-10">
        <div className="flex items-center gap-4">
           <button onClick={() => window.history.back()} className="w-10 h-10 rounded-full bg-white/80 backdrop-blur-md flex items-center justify-center shadow-sm">
              <ArrowLeft size={20} />
           </button>
           <h1 className="text-2xl font-black text-nara-text tracking-tight">Health Identity</h1>
        </div>
        <div className="w-10 h-10 rounded-2xl bg-nara-hunter flex items-center justify-center text-white font-bold">
           VA
        </div>
      </header>

      <main className="px-6 space-y-6 z-10 max-w-md mx-auto w-full">
        
        {/* BMI & Stats Overview Card */}
        <div className="glass-container p-6 flex items-center justify-between bg-gradient-to-br from-white/60 to-nara-emerald/5">
           <div className="space-y-1">
              <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Active BMI Score</span>
              <div className="flex items-baseline gap-2">
                 <span className="text-4xl font-black text-nara-text">{bmi}</span>
                 <span className="text-xs font-bold text-nara-emerald bg-nara-emerald/10 px-2 py-0.5 rounded-full">Normal</span>
              </div>
           </div>
           <div className="w-16 h-16 rounded-full border-4 border-nara-emerald/20 flex items-center justify-center relative">
              <motion.div 
                animate={{ rotate: 360 }}
                transition={{ duration: 10, repeat: Infinity, ease: "linear" }}
                className="absolute inset-0 rounded-full border-t-4 border-nara-emerald"
              />
              <User size={24} className="text-nara-hunter" />
           </div>
        </div>

        {/* Biometrics Section */}
        <section className="space-y-4">
           <h2 className="text-sm font-bold text-slate-400 uppercase tracking-widest px-1">Physical Metrics</h2>
           <div className="grid grid-cols-1 gap-4">
              {/* Weight & Height Row */}
              <div className="flex gap-4">
                 <div className="flex-1 bg-white/70 backdrop-blur-md p-5 rounded-[32px] border border-white/80 shadow-sm">
                    <div className="flex items-center gap-2 mb-3 text-nara-muted">
                       <Weight size={16} /> <span className="text-xs font-bold uppercase tracking-wider">Weight</span>
                    </div>
                    <div className="flex items-center gap-1">
                       <input 
                         type="number" 
                         value={weight} 
                         onChange={(e) => setWeight(Number(e.target.value))}
                         className="w-full bg-transparent text-2xl font-black text-nara-text focus:outline-none" 
                       />
                       <span className="text-sm font-bold text-slate-400">kg</span>
                    </div>
                 </div>
                 <div className="flex-1 bg-white/70 backdrop-blur-md p-5 rounded-[32px] border border-white/80 shadow-sm">
                    <div className="flex items-center gap-2 mb-3 text-nara-muted">
                       <Ruler size={16} /> <span className="text-xs font-bold uppercase tracking-wider">Height</span>
                    </div>
                    <div className="flex items-center gap-1">
                       <input 
                         type="number" 
                         value={height} 
                         onChange={(e) => setHeight(Number(e.target.value))}
                         className="w-full bg-transparent text-2xl font-black text-nara-text focus:outline-none" 
                       />
                       <span className="text-sm font-bold text-slate-400">cm</span>
                    </div>
                 </div>
              </div>
              
              {/* Age & Location Row */}
              <div className="bg-white/70 backdrop-blur-md p-5 rounded-[32px] border border-white/80 shadow-sm flex items-center justify-between">
                 <div className="flex items-center gap-4">
                    <div className="w-10 h-10 rounded-2xl bg-nara-hunter/10 flex items-center justify-center text-nara-hunter">
                       <AgeIcon size={20} />
                    </div>
                    <div>
                       <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Your Age</span>
                       <input 
                         type="number" 
                         value={age} 
                         onChange={(e) => setAge(Number(e.target.value))}
                         className="w-full bg-transparent text-lg font-black text-nara-text focus:outline-none" 
                       />
                    </div>
                 </div>
                 <div className="h-10 w-[1px] bg-slate-100 mx-2" />
                 <div className="flex items-center gap-4 flex-1 justify-end text-right">
                    <div className="text-right">
                       <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Location</span>
                       <input 
                         type="text" 
                         value={location} 
                         onChange={(e) => setLocation(e.target.value)}
                         className="w-full bg-transparent text-sm font-bold text-nara-text text-right focus:outline-none" 
                       />
                    </div>
                    <div className="w-10 h-10 rounded-2xl bg-nara-emerald/10 flex items-center justify-center text-nara-emerald">
                       <MapPin size={20} />
                    </div>
                 </div>
              </div>
           </div>
        </section>

        {/* Goal Selection */}
        <section className="space-y-4">
           <h2 className="text-sm font-bold text-slate-400 uppercase tracking-widest px-1">Active Objective</h2>
           <div className="flex gap-2 p-2 bg-white/50 backdrop-blur-md rounded-[28px] border border-white/80">
              {['cutting', 'maintenance', 'bulking'].map((g) => (
                 <button
                   key={g}
                   onClick={() => setGoal(g)}
                   className={`flex-1 py-3 rounded-[22px] text-[11px] font-black uppercase tracking-widest transition-all ${
                     goal === g 
                     ? 'bg-nara-hunter text-white shadow-soft' 
                     : 'text-slate-400 hover:text-nara-hunter'
                   }`}
                 >
                   {g}
                 </button>
              ))}
           </div>
        </section>

        {/* Allergy Registry */}
        <section className="space-y-4">
           <div className="flex items-center justify-between px-1">
              <h2 className="text-sm font-bold text-slate-400 uppercase tracking-widest flex items-center gap-2">
                 <ShieldAlert size={14} className="text-orange-500" /> Safety Registry
              </h2>
           </div>
           <div className="bg-white/70 backdrop-blur-md p-6 rounded-[32px] border border-white/80 shadow-sm">
              <div className="flex flex-wrap gap-2">
                 {commonAllergies.map((allergy) => {
                    const isSelected = allergies.includes(allergy);
                    return (
                       <button
                         key={allergy}
                         onClick={() => toggleAllergy(allergy)}
                         className={`px-4 py-2 rounded-full border text-[11px] font-black uppercase tracking-wider transition-all ${
                           isSelected 
                           ? 'bg-nara-evergreen border-nara-evergreen text-white shadow-soft' 
                           : 'bg-slate-50 border-slate-100 text-slate-400'
                         }`}
                       >
                         {allergy}
                       </button>
                    );
                 })}
              </div>
           </div>
        </section>

        {/* Action Buttons */}
        <div className="flex flex-col gap-4 pt-6">
           <button 
             onClick={() => router.push('/dashboard')}
             className="btn-primary flex items-center justify-center gap-2 py-5"
           >
              <Save size={20} /> Save Changes
           </button>
           <button 
             onClick={() => router.push('/onboarding')}
             className="flex items-center justify-center gap-2 text-nara-hunter font-bold text-sm hover:underline py-2"
           >
              <RotateCcw size={16} /> Recalculate Profile from Zero
           </button>
        </div>

      </main>

      {/* Re-use Bottom Nav */}
      <nav className="fixed bottom-6 left-6 right-6 h-20 bg-white/80 backdrop-blur-2xl rounded-[32px] border border-white shadow-[0_20px_50px_rgba(0,0,0,0.1)] flex items-center justify-around px-4 z-50">
         <button className="flex flex-col items-center gap-1 text-slate-400 hover:text-nara-hunter transition-colors" onClick={() => router.push('/dashboard')}>
            <div className="w-12 h-12 rounded-2xl flex items-center justify-center">
               <Target size={22} />
            </div>
            <span className="text-[10px] font-bold uppercase tracking-widest">Plan</span>
         </button>
         <button className="flex flex-col items-center gap-1 text-slate-400 hover:text-nara-hunter transition-colors" onClick={() => router.push('/chat')}>
            <div className="w-12 h-12 rounded-2xl flex items-center justify-center">
               <MessageSquare size={22} />
            </div>
            <span className="text-[10px] font-bold uppercase tracking-widest">Chat</span>
         </button>
         <button className="flex flex-col items-center gap-1 text-nara-hunter">
            <div className="w-12 h-12 bg-nara-hunter/10 rounded-2xl flex items-center justify-center">
               <User size={22} fill="currentColor" className="opacity-80" />
            </div>
            <span className="text-[10px] font-bold uppercase tracking-widest">Profile</span>
         </button>
      </nav>

    </div>
  );
}
