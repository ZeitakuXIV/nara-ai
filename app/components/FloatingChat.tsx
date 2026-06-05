'use client';

import { motion } from 'framer-motion';
import { MessageSquare } from 'lucide-react';
import { useRouter, usePathname } from 'next/navigation';
import { useEffect, useState } from 'react';

export default function FloatingChat() {
  const router = useRouter();
  const pathname = usePathname();
  const [mounted, setMounted] = useState(false);

  // Don't show on Auth pages
  const isHiddenPage = pathname === '/';

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted || isHiddenPage) return null;

  return (
    <motion.div
      drag
      dragMomentum={false}
      whileDrag={{ scale: 1.1, cursor: 'grabbing' }}
      whileTap={{ scale: 0.9 }}
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
