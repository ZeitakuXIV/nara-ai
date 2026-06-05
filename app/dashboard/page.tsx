'use client';

import { useState, useMemo, useRef, useEffect } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { motion, AnimatePresence } from 'framer-motion';
import { Calendar, User, ShieldCheck, Utensils, Zap, Target, RefreshCw, X, Check, Loader2 } from 'lucide-react';
import { PieChart, Pie, Cell, ResponsiveContainer } from 'recharts';
import { useUserStore } from '@/store/userStore';
import { calculateBMR, calculateTDEE, calculateTargetMacros } from '@/utils/nutrition';
import { supabase } from '@/utils/supabase';

export default function Dashboard() {
  const [selectedDayIndex, setSelectedDayIndex] = useState(0); // 0 (Mon) to 6 (Sun)
  const [mealPool, setMealPool] = useState<any[]>([]);
  const [weeklyPlanIndices, setWeeklyPlanIndices] = useState<number[]>([0, 1, 2, 3, 4, 5, 6]);
  const [isLoading, setIsLoading] = useState(true);
  
  const [isSwapModalOpen, setIsSwapModalOpen] = useState(false);
  const detailRef = useRef<HTMLDivElement>(null);
  const store = useUserStore();

  const days = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];

  // Load real data from Supabase
  useEffect(() => {
    const fetchLatestPlan = async () => {
      if (!store.email) return;

      try {
        // 1. Get user profile
        const { data: profile } = await supabase
          .from('user_profiles')
          .select('id')
          .eq('email', store.email)
          .single();

        if (!profile) return;

        // 2. Get latest meal plan
        const { data: plan, error } = await supabase
          .from('meal_plans')
          .select('*')
          .eq('user_id', profile.id)
          .order('created_at', { ascending: false })
          .limit(1)
          .single();

        if (plan && plan.plan_data) {
          // Normalize plan_data to ensure it has all needed fields for UI
          const normalizedPool = plan.plan_data.map((item: any, i: number) => ({
            id: item.id || `recipe_${i}`,
            title: item.title || item.recipe_name || 'NARA Specialty',
            image: item.image || `https://images.unsplash.com/photo-${[
                '1596797038530-2c107229654b', '1546069901-ba9599a7e63c', '1512621776951-a57141f2eefd'
              ][i % 3]}?q=80&w=800&auto=format&fit=crop`,
            calories: item.calories || 400,
            protein: item.protein || 25,
            carbs: item.carbs || 45,
            fat: item.fat || 12,
            scaling_reason: item.scaling_reason || 'Calibrated based on your province and biometrics.',
            ingredients: item.ingredients || [
              { name: 'Protein Source', qty: '150g' },
              { name: 'Carbohydrate', qty: '100g' }
            ]
          }));
          
          setMealPool(normalizedPool);
        } else {
           // Fallback to trigger recommendation if none exists (Cold Start)
           console.log("No plan found, please complete onboarding.");
        }
      } catch (err) {
        console.error("Dashboard Load Error:", err);
      } finally {
        setIsLoading(false);
      }
    };

    fetchLatestPlan();
  }, [store.email]);

  const bmr = useMemo(() => calculateBMR(store.weight, store.height, store.age, store.gender), [store]);
  const tdee = useMemo(() => calculateTDEE(bmr, store.activity), [bmr, store.activity]);
  const targetMacros = useMemo(() => calculateTargetMacros(tdee, store.goal), [tdee, store.goal]);

  const currentMealIndex = weeklyPlanIndices[selectedDayIndex];
  const currentMeal = mealPool.length > 0 ? mealPool[currentMealIndex] : null;

  const chartData = currentMeal ? [
    { name: 'Protein', value: currentMeal.protein, color: '#3D644D' },
    { name: 'Carbs', value: currentMeal.carbs, color: '#10B981' },
    { name: 'Fat', value: currentMeal.fat, color: '#5A8B6A' },
  ] : [];

  const handleSwapRecipe = (poolIndex: number) => {
    const newPlan = [...weeklyPlanIndices];
    newPlan[selectedDayIndex] = poolIndex;
    setWeeklyPlanIndices(newPlan);
    setIsSwapModalOpen(false);
    
    // Smooth scroll feedback
    setTimeout(() => {
      detailRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }, 200);
  };

  if (isLoading) {
    return (
      <div className="app-content bg-nara-light flex flex-col items-center justify-center">
         <Loader2 className="text-nara-hunter animate-spin mb-4" size={40} />
         <p className="text-sm font-black text-nara-hunter uppercase tracking-widest">Sensing Bio-Data...</p>
      </div>
    );
  }

  return (
    <div className="app-content bg-nara-light">
      
      <header className="px-6 pt-8 pb-4 flex justify-between items-end z-10 shrink-0">
        <div>
           <p className="text-[10px] font-black text-nara-hunter uppercase tracking-[0.2em] mb-1 opacity-60">
             Personal Goal: {store.goal}
           </p>
           <h1 className="text-3xl font-black text-nara-text tracking-tight">Nutrition Plan</h1>
        </div>
        <div className="w-12 h-12 rounded-2xl bg-white shadow-soft flex items-center justify-center border border-white">
           <Calendar className="text-nara-hunter" size={20} />
        </div>
      </header>

      <main className="px-6 flex-1 z-10 space-y-8 pb-40">
        {/* Day Selector */}
        <div className="flex gap-3 overflow-x-auto no-scrollbar py-2 -mx-2 px-2">
          {days.map((day, idx) => (
            <button
              key={day}
              onClick={() => setSelectedDayIndex(idx)}
              className={`flex flex-col items-center justify-center min-w-[70px] h-20 rounded-[28px] transition-all duration-300 border ${
                selectedDayIndex === idx 
                ? 'bg-nara-hunter text-white shadow-float border-nara-hunter scale-105' 
                : 'bg-white/50 text-nara-muted border-white/80'
              }`}
            >
              <span className="text-[9px] font-black uppercase tracking-widest opacity-60">{day.substring(0, 3)}</span>
              <span className="text-lg font-black">{idx + 1}</span>
            </button>
          ))}
        </div>

        {/* Featured Meal Card */}
        {currentMeal ? (
          <div className="space-y-5">
            <div className="flex items-center justify-between px-1">
                <h2 className="text-[11px] font-black text-slate-400 uppercase tracking-widest flex items-center gap-2">
                  <Utensils size={14} /> Today&apos;s Recommendation
                </h2>
                <button 
                  onClick={() => setIsSwapModalOpen(true)}
                  className="flex items-center gap-1.5 text-[10px] font-black text-nara-hunter uppercase bg-white px-3 py-1.5 rounded-full border border-slate-100 shadow-sm active:scale-95 transition-all"
                >
                  <RefreshCw size={12} /> Swap Menu
                </button>
            </div>

            <motion.div 
              key={`${currentMeal.id}-${selectedDayIndex}`}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              onClick={() => detailRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' })}
              className="relative w-full h-[400px] rounded-[48px] overflow-hidden shadow-soft border-4 border-white cursor-pointer"
            >
                <Image src={currentMeal.image} alt={currentMeal.title} fill className="object-cover" priority unoptimized />
                <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/20 to-transparent" />
                <div className="absolute top-6 left-6 flex gap-2">
                  <div className="bg-nara-hunter/90 backdrop-blur-md px-4 py-2 rounded-full border border-nara-hunter/40 text-[10px] text-white font-black">
                    {currentMeal.calories} KCAL
                  </div>
                </div>
                <div className="absolute bottom-10 left-8 right-8 text-left">
                  <p className="text-nara-emerald font-black text-[10px] uppercase tracking-[0.3em] mb-2">Expert Selection</p>
                  <h3 className="text-white text-3xl font-black leading-tight mb-4 tracking-tight">{currentMeal.title}</h3>
                  <div className="flex gap-4 opacity-80">
                      <div className="flex flex-col"><span className="text-white/40 text-[8px] font-bold uppercase">P</span><span className="text-white text-xs font-black">{currentMeal.protein}g</span></div>
                      <div className="flex flex-col"><span className="text-white/40 text-[8px] font-bold uppercase">C</span><span className="text-white text-xs font-black">{currentMeal.carbs}g</span></div>
                      <div className="flex flex-col"><span className="text-white/40 text-[8px] font-bold uppercase">F</span><span className="text-white text-xs font-black">{currentMeal.fat}g</span></div>
                  </div>
                </div>
            </motion.div>
          </div>
        ) : (
          <div className="glass-container p-12 flex flex-col items-center justify-center text-center bg-white/20">
             <Zap size={32} className="text-nara-hunter animate-pulse mb-6" />
             <h3 className="text-xl font-black text-nara-text tracking-tight mb-2">Awaiting Analysis</h3>
             <p className="text-sm text-nara-muted leading-relaxed">Complete onboarding to generate your personalized NARA plan.</p>
             <Link href="/onboarding" className="btn-primary mt-8 py-4">Start Onboarding</Link>
          </div>
        )}

        {currentMeal && (
          <div className="space-y-6" ref={detailRef}>
            <div className="glass-container p-8 grid grid-cols-2 gap-4 shadow-xl">
               <div className="flex flex-col justify-center">
                  <h3 className="text-[11px] font-black text-nara-text mb-4 uppercase tracking-widest opacity-60">Macro Distribution</h3>
                  <div className="space-y-3">
                     {chartData.map((d) => (
                        <div key={d.name} className="flex items-center justify-between">
                           <div className="flex items-center gap-2 text-[11px] font-bold uppercase text-slate-500">
                              <div className="w-1.5 h-1.5 rounded-full" style={{ backgroundColor: d.color }} />
                              <span>{d.name}</span>
                           </div>
                           <span className="text-[11px] font-black text-nara-text">{d.value}g</span>
                        </div>
                     ))}
                  </div>
               </div>
               <div className="h-32 w-full relative flex items-center justify-center">
                  <ResponsiveContainer width="100%" height="100%">
                     <PieChart>
                        <Pie data={chartData} innerRadius={40} outerRadius={55} paddingAngle={5} dataKey="value" isAnimationActive={true}>
                           {chartData.map((entry, index) => ( <Cell key={`cell-${index}`} fill={entry.color} /> ))}
                        </Pie>
                     </PieChart>
                  </ResponsiveContainer>
                  <div className="absolute flex flex-col items-center">
                     <span className="text-lg font-black text-nara-hunter leading-none">{currentMeal.calories}</span>
                     <span className="text-[8px] font-black uppercase text-slate-400 tracking-[0.2em] mt-1">KCAL</span>
                  </div>
               </div>
            </div>

            <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="p-7 rounded-[40px] bg-gradient-to-br from-nara-hunter to-nara-evergreen text-white shadow-float relative overflow-hidden">
               <div className="flex items-center gap-2 mb-3">
                  <ShieldCheck size={18} className="text-nara-emerald" />
                  <span className="text-[10px] font-black uppercase tracking-[0.2em] text-nara-emerald">Expert Reasoning Insight</span>
               </div>
               <p className="text-white/80 text-[14px] leading-relaxed italic">&quot;{currentMeal.scaling_reason}&quot;</p>
            </motion.div>

            <div className="glass-container p-8 shadow-lg">
               <h3 className="text-[10px] font-black text-nara-text mb-6 uppercase tracking-widest opacity-60">Scaled Ingredients</h3>
               <div className="space-y-4">
                  {currentMeal.ingredients.map((ing: any, i: number) => (
                     <div key={i} className="flex items-center justify-between p-4 bg-white/40 rounded-2xl border border-white/80 shadow-sm">
                        <span className="text-sm font-bold text-nara-text">{ing.name}</span>
                        <span className="text-[11px] font-black text-nara-hunter bg-white px-3 py-1.5 rounded-xl border border-slate-100 shadow-sm">{ing.qty || ing.amount}</span>
                     </div>
                  ))}
               </div>
            </div>
          </div>
        )}
      </main>

      {/* SWAP MODAL */}
      <AnimatePresence>
        {isSwapModalOpen && (
          <div className="fixed inset-0 z-[200] flex items-end justify-center bg-black/40 backdrop-blur-md">
             <motion.div initial={{ y: '100%' }} animate={{ y: 0 }} exit={{ y: '100%' }} className="w-full max-w-md h-[80vh] bg-white rounded-t-[48px] overflow-hidden flex flex-col shadow-2xl">
                <div className="p-6 border-b border-slate-100 flex items-center justify-between shrink-0">
                   <h2 className="text-xl font-black text-nara-text tracking-tight">AI Suitability Pool (Top 20)</h2>
                   <button onClick={() => setIsSwapModalOpen(false)} className="w-10 h-10 rounded-full bg-slate-50 flex items-center justify-center text-slate-400 active:scale-90"><X size={20} /></button>
                </div>
                <div className="flex-1 overflow-y-auto p-6 space-y-4 no-scrollbar">
                   {mealPool.map((meal, idx) => {
                      const isActive = weeklyPlanIndices[selectedDayIndex] === idx;
                      return (
                        <button key={meal.id} onClick={() => handleSwapRecipe(idx)} className={`w-full p-4 rounded-[32px] border flex items-center gap-4 transition-all active:scale-95 ${isActive ? 'bg-nara-hunter/5 border-nara-hunter' : 'bg-white border-slate-100'}`}>
                           <div className="w-16 h-16 rounded-2xl overflow-hidden relative shrink-0">
                              <Image src={meal.image} alt={meal.title} fill className="object-cover" unoptimized />
                           </div>
                           <div className="flex-1 text-left">
                              <h4 className="font-bold text-nara-text text-sm leading-tight">{meal.title}</h4>
                              <p className="text-[10px] text-slate-400 font-bold">{meal.calories} KCAL • {meal.protein}g Protein</p>
                           </div>
                           {isActive ? <div className="w-8 h-8 rounded-full bg-nara-hunter flex items-center justify-center text-white"><Check size={16} /></div> : <RefreshCw size={16} className="text-slate-200" />}
                        </button>
                      );
                   })}
                </div>
             </motion.div>
          </div>
        )}
      </AnimatePresence>

      <nav className="fixed bottom-0 left-0 right-0 h-[calc(84px+env(safe-area-inset-bottom))] bg-white/80 backdrop-blur-[32px] border-t border-white shadow-[0_-10px_40px_rgba(0,0,0,0.05)] flex items-stretch justify-center gap-12 px-6 z-[100] pb-[env(safe-area-inset-bottom)]">
         <Link href="/dashboard" className="nav-hitbox text-nara-hunter max-w-[80px]">
            <Target size={24} fill="currentColor" />
            <span className="text-[10px] font-black uppercase mt-1.5 tracking-widest">Plan</span>
         </Link>
         <Link href="/profile" className="nav-hitbox text-slate-400 hover:text-nara-hunter transition-colors max-w-[80px]">
            <User size={24} />
            <span className="text-[10px] font-black uppercase mt-1.5 tracking-widest">Profile</span>
         </Link>
      </nav>
    </div>
  );
}
