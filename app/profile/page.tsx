'use client';

import { useState, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  User, 
  Ruler, 
  Weight, 
  Calendar as AgeIcon, 
  MapPin, 
  Save, 
  RotateCcw,
  Target,
  ChevronDown,
  Loader2,
  Download,
  Activity,
  AlertCircle
} from 'lucide-react';
import { useUserStore } from '@/store/userStore';
import { calculateBMI } from '@/utils/nutrition';
import { INDONESIAN_PROVINCES } from '@/constants';
import { supabase } from '@/utils/supabase';

export default function Profile() {
  const store = useUserStore();
  const router = useRouter();
  const [isSaving, setIsSaving] = useState(false);
  const [clinicalError, setClinicalError] = useState<string | null>(null);

  const handleDownloadData = () => {
    const data = {
      app: "NARA AI",
      law_compliance: "UU PDP No. 27/2022 Art. 5 (Right to Data Portability)",
      exported_at: new Date().toISOString(),
      user_profile: {
        userId: store.userId,
        email: store.email,
        fullName: store.fullName,
        gender: store.gender,
        age: store.age,
        height_cm: store.height,
        weight_kg: store.weight,
        activity_level: store.activity,
        location_province: store.location,
        allergies: store.allergies,
        dietary_goal: store.goal
      },
      meal_plan: store.mealPlan
    };
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'nara_ai_user_data.json';
    a.click();
    URL.revokeObjectURL(url);
  };

  const bmi = useMemo(() => calculateBMI(store.weight, store.height), [store.weight, store.height]);

  const handleDeployChanges = async () => {
    // CLINICAL CROSS-VALIDATION
    const normalizedGoal = store.goal?.toLowerCase() || '';
    const isCutting = normalizedGoal === 'cutting' || normalizedGoal === 'weight_loss';
    const isBulking = normalizedGoal === 'bulking' || normalizedGoal === 'muscle_gain';

    if (isCutting && bmi < 18.5) {
      setClinicalError("Clinical Safety: BMI Anda < 18.5 (Underweight). Melakukan program Cutting (Defisit Kalori) sangat berbahaya. Pilih Maintenance atau Bulking.");
      setTimeout(() => setClinicalError(null), 8000);
      return;
    }
    if (isBulking && bmi >= 30.0) {
      setClinicalError("Clinical Safety: BMI Anda >= 30.0 (Obese). Melakukan program Bulking (Surplus Kalori) sangat berbahaya bagi jantung. Fokus pada Cutting.");
      setTimeout(() => setClinicalError(null), 8000);
      return;
    }

    setClinicalError(null);
    setIsSaving(true);
    try {
      // 1. Persist updated biometrics to Supabase
      if (store.userId) {
        await supabase.from('user_profiles').update({
          weight: store.weight,
          height: store.height,
          age: store.age,
          location: store.location,
          activity_level: store.activity,
          dietary_goal: store.goal
        }).eq('id', store.userId);
      }

      // 2. Clear cached meal plan so dashboard triggers a fresh AI recommendation
      store.clearMealPlan();

      // 3. Navigate to dashboard — it will detect mealPlan === null and re-fetch
      router.push('/dashboard');
    } catch (err) {
      console.error('Failed to save profile changes:', err);
      // Navigate anyway — worst case the old plan is still shown
      store.clearMealPlan();
      router.push('/dashboard');
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="app-content bg-nara-light">
      
      {/* Header */}
      <header className="px-6 pt-12 pb-6 flex items-center justify-between z-10 shrink-0">
        <div className="flex items-center gap-4">
           <h1 className="text-3xl font-black text-nara-text tracking-tight">Health Identity</h1>
        </div>
        <div className="w-12 h-12 rounded-2xl bg-nara-hunter flex items-center justify-center text-white font-black shadow-soft uppercase">
           {store.fullName ? store.fullName.substring(0, 2) : 'NA'}
        </div>
      </header>

      <main className="px-6 space-y-8 z-10 max-w-sm mx-auto w-full pb-40">
        
        {/* BMI & Stats Card */}
        <div className="glass-container p-8 flex items-center justify-between">
           <div className="space-y-1">
              <span className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">Bio-Status Index</span>
              <div className="flex items-baseline gap-2">
                 <span className="text-5xl font-black text-nara-text tracking-tighter">{bmi}</span>
                 <span className="text-[10px] font-black text-nara-emerald bg-nara-emerald/10 px-3 py-1 rounded-full uppercase tracking-widest">Verified</span>
              </div>
           </div>
           <div className="w-20 h-20 rounded-full border-[6px] border-nara-emerald/20 flex items-center justify-center relative">
              <motion.div animate={{ rotate: 360 }} transition={{ duration: 10, repeat: Infinity, ease: "linear" }} className="absolute inset-0 rounded-full border-t-[6px] border-nara-emerald" />
              <User size={28} className="text-nara-hunter" />
           </div>
        </div>

        {/* Biometrics */}
        <section className="space-y-4">
           <h2 className="text-[11px] font-black text-slate-400 uppercase tracking-widest px-2 opacity-60">Physical Telemetry</h2>
           <div className="grid grid-cols-1 gap-4">
              <div className="flex gap-4">
                 <div className="flex-1 glass-card p-6">
                    <div className="flex items-center gap-2 mb-4 text-nara-muted opacity-60">
                       <Weight size={16} /> <span className="text-[10px] font-black uppercase">Weight</span>
                    </div>
                    <div className="flex items-center gap-1">
                       <input type="number" value={store.weight} onChange={(e) => store.setBiometrics({ weight: Number(e.target.value) })} className="w-full bg-transparent text-3xl font-black text-nara-text focus:outline-none" />
                       <span className="text-sm font-bold text-slate-400">kg</span>
                    </div>
                 </div>
                 <div className="flex-1 glass-card p-6">
                    <div className="flex items-center gap-2 mb-4 text-nara-muted opacity-60">
                       <Ruler size={16} /> <span className="text-[10px] font-black uppercase">Height</span>
                    </div>
                    <div className="flex items-center gap-1">
                       <input type="number" value={store.height} onChange={(e) => store.setBiometrics({ height: Number(e.target.value) })} className="w-full bg-transparent text-3xl font-black text-nara-text focus:outline-none" />
                       <span className="text-sm font-bold text-slate-400">cm</span>
                    </div>
                 </div>
              </div>
              
              <div className="glass-card p-6 flex flex-col gap-6">
                 <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4">
                       <div className="w-12 h-12 rounded-2xl bg-nara-hunter/10 flex items-center justify-center text-nara-hunter shrink-0"><AgeIcon size={24} /></div>
                       <div>
                          <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest opacity-60">Age</span>
                          <input type="number" value={store.age} onChange={(e) => store.setBiometrics({ age: Number(e.target.value) })} className="w-full bg-transparent text-xl font-black text-nara-text focus:outline-none" />
                       </div>
                    </div>
                 </div>
                 
                 <div className="h-[1px] w-full bg-slate-100" />

                 <div className="space-y-3">
                    <div className="flex items-center gap-2 text-nara-muted opacity-60">
                       <MapPin size={16} /> <span className="text-[10px] font-black uppercase tracking-widest">Current Province</span>
                    </div>
                    <div className="relative">
                       <select 
                         value={store.location} 
                         onChange={(e) => store.setBiometrics({ location: e.target.value })} 
                         className="w-full bg-slate-50 border border-slate-100 rounded-2xl py-4 px-5 text-sm font-bold text-nara-text appearance-none focus:outline-none focus:ring-2 focus:ring-nara-hunter/20 transition-all"
                       >
                         {INDONESIAN_PROVINCES.map(p => (
                           <option key={p} value={p}>{p}</option>
                         ))}
                       </select>
                       <div className="absolute right-5 top-1/2 -translate-y-1/2 pointer-events-none text-slate-400">
                          <ChevronDown size={18} />
                       </div>
                    </div>
                 </div>

                 <div className="h-[1px] w-full bg-slate-100" />

                 <div className="space-y-3">
                    <div className="flex items-center gap-2 text-nara-muted opacity-60">
                       <Activity size={16} /> <span className="text-[10px] font-black uppercase tracking-widest">Daily Activity</span>
                    </div>
                    <div className="relative">
                       <select 
                         value={store.activity || ''} 
                         onChange={(e) => store.setBiometrics({ activity: e.target.value })} 
                         className="w-full bg-slate-50 border border-slate-100 rounded-2xl py-4 px-5 text-sm font-bold text-nara-text appearance-none focus:outline-none focus:ring-2 focus:ring-nara-hunter/20 transition-all"
                       >
                         <option value="sedentary">Sedentary (Jarang Olahraga)</option>
                         <option value="light">Lightly Active (1-3 hari/minggu)</option>
                         <option value="moderate">Moderately Active (3-5 hari/minggu)</option>
                         <option value="extra">Highly Active (Setiap Hari)</option>
                       </select>
                       <div className="absolute right-5 top-1/2 -translate-y-1/2 pointer-events-none text-slate-400">
                          <ChevronDown size={18} />
                       </div>
                    </div>
                 </div>

                 <div className="h-[1px] w-full bg-slate-100" />

                 <div className="space-y-3">
                    <div className="flex items-center gap-2 text-nara-muted opacity-60">
                       <Target size={16} /> <span className="text-[10px] font-black uppercase tracking-widest">Diet Goal</span>
                    </div>
                    <div className="relative">
                       <select 
                         value={store.goal || ''} 
                         onChange={(e) => store.setBiometrics({ goal: e.target.value })} 
                         className="w-full bg-slate-50 border border-slate-100 rounded-2xl py-4 px-5 text-sm font-bold text-nara-text appearance-none focus:outline-none focus:ring-2 focus:ring-nara-hunter/20 transition-all"
                       >
                         <option value="weight_loss">Cutting (Menurunkan BB)</option>
                         <option value="maintenance">Maintenance (Menjaga BB)</option>
                         <option value="muscle_gain">Bulking (Menaikkan BB/Otot)</option>
                       </select>
                       <div className="absolute right-5 top-1/2 -translate-y-1/2 pointer-events-none text-slate-400">
                          <ChevronDown size={18} />
                       </div>
                    </div>
                 </div>
              </div>
           </div>
        </section>

        <div className="flex flex-col gap-4 pt-6">
           <AnimatePresence>
             {clinicalError && (
               <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} className="p-4 bg-rose-500/10 border border-rose-500/20 rounded-2xl text-rose-600 flex items-start gap-3 mb-2">
                 <AlertCircle size={20} className="shrink-0 mt-0.5" />
                 <p className="text-[11px] font-bold leading-relaxed">{clinicalError}</p>
               </motion.div>
             )}
           </AnimatePresence>
           
           <button
             onClick={handleDeployChanges}
             disabled={isSaving}
             className="btn-primary py-5 shadow-xl disabled:opacity-60"
           >
             {isSaving ? <Loader2 size={20} className="animate-spin" /> : <Save size={20} />}
             {isSaving ? 'Saving...' : 'Deploy Changes'}
           </button>
           <button onClick={handleDownloadData} className="flex items-center justify-center gap-2 text-nara-hunter font-black text-[11px] uppercase tracking-widest py-4 bg-white/40 rounded-2xl border border-white/60 shadow-sm"><Download size={16} /> Download My Data (UU PDP)</button>
           <button onClick={() => store.resetProfile()} className="flex items-center justify-center gap-2 text-rose-500 font-black text-[11px] uppercase tracking-widest py-4 bg-white/40 rounded-2xl border border-white/60 shadow-sm"><RotateCcw size={16} /> Full Bio-Recalibration</button>
        </div>
      </main>

      <nav className="fixed bottom-0 left-0 right-0 h-[calc(84px+env(safe-area-inset-bottom))] bg-white/80 backdrop-blur-[32px] border-t border-white shadow-[0_-10px_40px_rgba(0,0,0,0.05)] flex items-stretch justify-center gap-12 px-6 z-[100] pb-[env(safe-area-inset-bottom)]">
         <Link href="/dashboard" className="nav-hitbox text-slate-400 hover:text-nara-hunter transition-colors max-w-[80px]">
            <Target size={24} />
            <span className="text-[10px] font-black uppercase mt-1.5 tracking-widest">Plan</span>
         </Link>
         <Link href="/profile" className="nav-hitbox text-nara-hunter max-w-[80px]">
            <User size={24} fill="currentColor" className="opacity-80" />
            <span className="text-[10px] font-black uppercase mt-1.5 tracking-widest">Profile</span>
         </Link>
      </nav>
    </div>
  );
}