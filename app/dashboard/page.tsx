'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image';
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

// Mock Data
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
  const router = useRouter();
  
  const currentMeal = selectedDay.meals && selectedDay.meals.length > 0 
    ? selectedDay.meals[activeMealIndex] || selectedDay.meals[0]
    : null;

  const chartData = currentMeal ? [
    { name: 'Protein', value: currentMeal.protein, color: '#3D644D' },
    { name: 'Carbs', value: currentMeal.carbs, color: '#10B981' },
    { name: 'Fat', value: currentMeal.fat, color: '#5A8B6A' },
  ] : [];

  return (
    <div className="flex-1 flex flex-col bg-nara-light h-[100dvh] relative overflow-hidden safe-top">
      
      {/* Mesh Background */}
      <div className="absolute top-0 right-0 w-full h-[400px] bg-mesh-gradient opacity-60 pointer-events-none" />

      {/* Top Bar */}
      <header className="px-6 pt-8 pb-4 flex justify-between items-end z-10 shrink-0">
        <div>
           <p className="text-[10px] font-bold text-nara-hunter uppercase tracking-[0.2em] mb-1">Act Layer</p>
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
              className={`flex flex-col items-center justify-center min-w-[60px] h-16 rounded-2xl transition-all duration-300 border ${
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

        {/* Current Meal Display */}
        {currentMeal && (
          <div className="space-y-6">
            <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} className="relative h-[280px] rounded-[32px] overflow-hidden shadow-float">
                <Image 
                  src={currentMeal.image} 
                  alt={currentMeal.title} 
                  fill
                  className="object-cover" 
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />
                <div className="absolute top-4 left-4 flex gap-2">
                    <div className="bg-white/20 backdrop-blur-md px-3 py-1 rounded-full border border-white/30 text-[9px] text-white font-bold uppercase">{currentMeal.type}</div>
                    <div className="bg-nara-hunter/80 backdrop-blur-md px-3 py-1 rounded-full border border-nara-hunter/40 text-[9px] text-white font-bold">{currentMeal.calories} KCAL</div>
                </div>
                <div className="absolute bottom-6 left-6 right-6">
                    <h3 className="text-white text-xl font-black leading-tight">{currentMeal.title}</h3>
                </div>
            </motion.div>

            <div className="glass-container p-6 grid grid-cols-2 gap-4">
               <div className="flex flex-col justify-center">
                  <h3 className="text-sm font-black text-nara-text mb-4 uppercase tracking-wider">Macros</h3>
                  <div className="space-y-2">
                     {chartData.map((d) => (
                        <div key={d.name} className="flex items-center justify-between">
                           <span className="text-[11px] font-bold text-slate-500">{d.name}</span>
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
                     <span className="text-sm font-black text-nara-hunter">{currentMeal.protein}g</span>
                  </div>
               </div>
            </div>

            <div className="p-5 rounded-[28px] bg-gradient-to-br from-nara-hunter to-nara-evergreen text-white shadow-soft">
               <div className="flex items-center gap-2 mb-2">
                  <ShieldCheck size={16} className="text-nara-emerald" />
                  <span className="text-[9px] font-black uppercase tracking-widest text-nara-emerald">XAI Reasoning</span>
               </div>
               <p className="text-white/80 text-xs leading-relaxed italic">&quot;{currentMeal.scaling_reason}&quot;</p>
            </div>
          </div>
        )}
      </main>

      {/* Industrial Nav Bar with High-Hitbox Affordance */}
      <nav className="fixed bottom-0 left-0 right-0 h-[calc(80px+env(safe-area-inset-bottom))] bg-white/80 backdrop-blur-3xl border-t border-white shadow-[0_-10px_40px_rgba(0,0,0,0.05)] flex items-stretch justify-around px-6 z-[100] pb-[env(safe-area-inset-bottom)]">
         <Link href="/dashboard" className="nav-hitbox text-nara-hunter">
            <Calendar size={24} fill="currentColor" />
            <span className="text-[10px] font-bold uppercase tracking-widest mt-1.5">Plan</span>
         </Link>
         <Link href="/chat" className="nav-hitbox text-slate-400">
            <MessageSquare size={24} />
            <span className="text-[10px] font-bold uppercase tracking-widest mt-1.5">Chat</span>
         </Link>
         <Link href="/profile" className="nav-hitbox text-slate-400">
            <User size={24} />
            <span className="text-[10px] font-bold uppercase tracking-widest mt-1.5">Profile</span>
         </Link>
      </nav>
    </div>
  );
}
