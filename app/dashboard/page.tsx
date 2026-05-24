'use client';

import { useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { 
  Calendar, 
  MessageSquare, 
  User, 
  ShieldCheck, 
  Utensils, 
  Zap
} from 'lucide-react';
import { PieChart, Pie, Cell, ResponsiveContainer } from 'recharts';

const MOCK_MEAL_PLAN = [
  { 
    day: 'Monday', 
    id: 1,
    meals: [
      {
        type: 'Breakfast',
        title: 'Nasi Tim Ayam Kampung',
        image: 'https://images.unsplash.com/photo-1596797038530-2c107229654b?q=80&w=800&auto=format&fit=crop',
        calories: 345,
        protein: 24,
        carbs: 45,
        fat: 8,
        scaling_reason: 'Increased protein by 15g to match your Bulking goal. Used steaming method to preserve 95% micronutrients.',
        ingredients: [
          { name: 'Beras Merah Lokal', qty: '125g' },
          { name: 'Dada Ayam Kampung', qty: '110g' },
          { name: 'Minyak Wijen', qty: '5ml' }
        ]
      },
      {
        type: 'Lunch',
        title: 'Pepes Ikan Kembung',
        image: 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?q=80&w=800&auto=format&fit=crop',
        calories: 520,
        protein: 38,
        carbs: 20,
        fat: 12,
        scaling_reason: 'Utilized Ikan Kembung for high Omega-3. Portion scaled to maintain calorie deficit.',
        ingredients: [
          { name: 'Ikan Kembung', qty: '150g' },
          { name: 'Tahu Putih', qty: '50g' },
          { name: 'Daun Kemangi', qty: '10g' }
        ]
      }
    ]
  },
  { day: 'Tuesday', id: 2, meals: [] },
  { day: 'Wednesday', id: 3, meals: [] },
  { day: 'Thursday', id: 4, meals: [] },
  { day: 'Friday', id: 5, meals: [] },
  { day: 'Saturday', id: 6, meals: [] },
  { day: 'Sunday', id: 7, meals: [] }
];

export default function Dashboard() {
  const [selectedDay, setSelectedDay] = useState(MOCK_MEAL_PLAN[0]);
  const [activeMealIndex, setActiveMealIndex] = useState(0);
  
  const currentMeal = selectedDay.meals && selectedDay.meals.length > 0 
    ? selectedDay.meals[activeMealIndex] || selectedDay.meals[0]
    : null;

  const chartData = currentMeal ? [
    { name: 'Protein', value: currentMeal.protein, color: '#3D644D' },
    { name: 'Carbs', value: currentMeal.carbs, color: '#10B981' },
    { name: 'Fat', value: currentMeal.fat, color: '#5A8B6A' },
  ] : [];

  return (
    <div className="flex-1 flex flex-col h-[100dvh] relative overflow-hidden bg-nara-light">
      <div className="pwa-bg" />

      {/* Top Bar */}
      <header className="px-6 pt-[env(safe-area-inset-top,2rem)] pb-4 flex justify-between items-end z-10 shrink-0">
        <div>
           <p className="text-[10px] font-bold text-nara-hunter uppercase tracking-[0.2em] mb-1">Act Layer • Plan</p>
           <h1 className="text-2xl font-black text-nara-text tracking-tight">Nutrition Plan</h1>
        </div>
        <div className="w-10 h-10 rounded-xl bg-white shadow-soft flex items-center justify-center border border-white">
           <Calendar className="text-nara-hunter" size={18} />
        </div>
      </header>

      <main className="px-6 flex-1 z-10 space-y-6 overflow-y-auto no-scrollbar pb-40">
        {/* Day Selector */}
        <div className="flex gap-3 overflow-x-auto no-scrollbar py-2">
          {MOCK_MEAL_PLAN.map((d) => (
            <button
              key={d.id}
              onClick={() => { setSelectedDay(d); setActiveMealIndex(0); }}
              className={`flex flex-col items-center justify-center min-w-[64px] h-16 rounded-2xl transition-all duration-300 border ${
                selectedDay.id === d.id 
                ? 'bg-nara-hunter text-white shadow-float border-nara-hunter' 
                : 'bg-white/60 text-nara-muted border-white/80'
              }`}
            >
              <span className="text-[9px] font-bold uppercase tracking-widest opacity-60">{d.day.substring(0, 3)}</span>
              <span className="text-base font-black">{d.id}</span>
            </button>
          ))}
        </div>

        {/* Carousel of Meals */}
        <div className="space-y-4">
           <div className="flex items-center justify-between px-1">
              <h2 className="text-[10px] font-bold text-slate-400 uppercase tracking-widest flex items-center gap-2">
                <Utensils size={14} /> Recommended Meals
              </h2>
           </div>

           {selectedDay.meals.length > 0 ? (
             <div className="flex gap-4 overflow-x-auto no-scrollbar py-2">
                {selectedDay.meals.map((meal, idx) => (
                   <motion.button
                     key={idx}
                     onClick={() => setActiveMealIndex(idx)}
                     whileTap={{ scale: 0.98 }}
                     className={`relative min-w-[280px] h-[360px] rounded-[40px] overflow-hidden shadow-soft border-4 transition-all ${
                        activeMealIndex === idx ? 'border-nara-hunter' : 'border-transparent'
                     }`}
                   >
                      <Image src={meal.image} alt={meal.title} fill className="object-cover" priority unoptimized />
                      <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />
                      <div className="absolute top-6 left-6 flex gap-2">
                         <div className="bg-white/20 backdrop-blur-md px-3 py-1 rounded-full border border-white/30 text-[9px] text-white font-bold uppercase">{meal.type}</div>
                         <div className="bg-nara-hunter/80 backdrop-blur-md px-3 py-1 rounded-full border border-nara-hunter/40 text-[9px] text-white font-bold">{meal.calories} KCAL</div>
                      </div>
                      <div className="absolute bottom-8 left-8 right-8 text-left">
                         <h3 className="text-white text-xl font-black leading-tight mb-2">{meal.title}</h3>
                      </div>
                   </motion.button>
                ))}
             </div>
           ) : (
             <div className="glass-container p-12 flex flex-col items-center justify-center text-center">
                <Zap size={32} className="text-nara-hunter animate-pulse mb-6" />
                <h3 className="text-lg font-black text-nara-text tracking-tight mb-2">Refining Day {selectedDay.id}</h3>
                <p className="text-xs text-nara-muted leading-relaxed max-w-[200px]">NARA is calibrating your nutritional CSP matrix for this specific day.</p>
             </div>
           )}
        </div>

        {currentMeal && (
          <div className="space-y-6 pb-10">
            {/* Macro Chart with KCAL Center Label */}
            <div className="glass-container p-8 grid grid-cols-2 gap-4">
               <div className="flex flex-col justify-center">
                  <h3 className="text-xs font-black text-nara-text mb-4 uppercase tracking-wider opacity-60">Macro Distribution</h3>
                  <div className="space-y-3">
                     {chartData.map((d) => (
                        <div key={d.name} className="flex items-center justify-between">
                           <div className="flex items-center gap-2">
                              <div className="w-1.5 h-1.5 rounded-full" style={{ backgroundColor: d.color }} />
                              <span className="text-[11px] font-bold text-slate-500 uppercase">{d.name}</span>
                           </div>
                           <span className="text-[11px] font-black text-nara-text">{d.value}g</span>
                        </div>
                     ))}
                  </div>
               </div>
               <div className="h-32 w-full relative flex items-center justify-center">
                  <ResponsiveContainer width="100%" height="100%">
                     <PieChart>
                        <Pie data={chartData} innerRadius={35} outerRadius={50} paddingAngle={5} dataKey="value">
                           {chartData.map((entry, index) => ( <Cell key={`cell-${index}`} fill={entry.color} /> ))}
                        </Pie>
                     </PieChart>
                  </ResponsiveContainer>
                  <div className="absolute flex flex-col items-center">
                     <span className="text-base font-black text-nara-hunter">{currentMeal.calories}</span>
                     <span className="text-[8px] font-bold uppercase text-slate-400 tracking-widest">KCAL</span>
                  </div>
               </div>
            </div>

            {/* XAI Reasoning */}
            <div className="p-6 rounded-[32px] bg-gradient-to-br from-nara-hunter to-nara-evergreen text-white shadow-soft">
               <div className="flex items-center gap-2 mb-3">
                  <ShieldCheck size={18} className="text-nara-emerald" />
                  <span className="text-[10px] font-black uppercase tracking-[0.2em] text-nara-emerald">XAI Insight</span>
               </div>
               <p className="text-white/80 text-xs leading-relaxed italic">&quot;{currentMeal.scaling_reason}&quot;</p>
            </div>

            {/* Ingredients */}
            <div className="glass-container p-8">
               <h3 className="text-[10px] font-black text-nara-text mb-4 uppercase tracking-wider opacity-60">Scaled Ingredients</h3>
               <div className="space-y-4">
                  {currentMeal.ingredients.map((ing, i) => (
                     <div key={i} className="flex items-center justify-between p-4 bg-white/40 rounded-2xl border border-white/80 shadow-sm">
                        <span className="text-sm font-bold text-nara-text">{ing.name}</span>
                        <span className="text-[11px] font-black text-nara-hunter bg-white px-3 py-1 rounded-lg border border-slate-100 shadow-sm">{ing.qty}</span>
                     </div>
                  ))}
               </div>
            </div>
          </div>
        )}
      </main>

      {/* Nav Bar */}
      <nav className="fixed bottom-0 left-0 right-0 h-[calc(84px+env(safe-area-inset-bottom))] bg-white/80 backdrop-blur-3xl border-t border-white shadow-[0_-10px_40px_rgba(0,0,0,0.05)] flex items-stretch justify-around px-6 z-[100] pb-[env(safe-area-inset-bottom)]">
         <Link href="/dashboard" className="nav-hitbox text-nara-hunter">
            <Calendar size={24} fill="currentColor" />
            <span className="text-[10px] font-bold uppercase tracking-widest mt-1.5">Plan</span>
         </Link>
         <Link href="/chat" className="nav-hitbox text-slate-400 hover:text-nara-hunter transition-colors">
            <MessageSquare size={24} />
            <span className="text-[10px] font-bold uppercase tracking-widest mt-1.5">Chat</span>
         </Link>
         <Link href="/profile" className="nav-hitbox text-slate-400 hover:text-nara-hunter transition-colors">
            <User size={24} />
            <span className="text-[10px] font-bold uppercase tracking-widest mt-1.5">Profile</span>
         </Link>
      </nav>
    </div>
  );
}
