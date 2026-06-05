'use client';

import { motion } from 'framer-motion';
import { MessageSquare } from 'lucide-react';
import { useRouter, usePathname } from 'next/navigation';
import { useEffect, useState } from 'react';
import { useUserStore } from '@/store/userStore';

export default function FloatingChat() {
  const router = useRouter();
  const pathname = usePathname();
  const store = useUserStore();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  // CRITICAL: Strict Visibility Control
  // Hide if:
  // 1. Not mounted yet (Hydration safety)
  // 2. User is NOT onboarded (Safety during Auth/Onboarding)
  // 3. User is on Auth page (/)
  // 4. User is on Chat page (/chat)
  const isHidden = !mounted || !store.isOnboarded || pathname === '/' || pathname === '/chat' || pathname === '/onboarding';

  if (isHidden) return null;

  return (
    <motion.div
      drag
      dragMomentum={false}
      whileDrag={{ scale: 1.1, cursor: 'grabbing' }}
      whileTap={{ scale: 0.9 }}
      initial={{ opacity: 0, scale: 0.5 }}
      animate={{ opacity: 1, scale: 1 }}
      className="fixed z-[999] touch-none right-6 bottom-32"
    >
      <button
        onClick={() => router.push('/chat')}
        className="w-16 h-16 bg-gradient-to-br from-nara-hunter to-nara-evergreen rounded-full shadow-[0_10px_30px_rgba(61,100,77,0.4)] flex items-center justify-center border-2 border-white/30 backdrop-blur-md relative group"
      >
        <div className="absolute inset-0 rounded-full bg-nara-emerald animate-ping opacity-20 group-active:hidden" />
        
        <MessageSquare className="text-white" size={28} fill="currentColor" />
        
        {/* Small "N" Badge */}
        <div className="absolute -top-1 -right-1 w-6 h-6 bg-nara-emerald border-2 border-white rounded-full flex items-center justify-center shadow-sm">
           <span className="text-[10px] font-black text-white">N</span>
        </div>
      </button>
    </motion.div>
  );
}
