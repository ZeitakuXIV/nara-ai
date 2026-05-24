'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Share, MoreVertical, Download, Smartphone, Plus } from 'lucide-react';

export default function PWAInstallGuide() {
  const [show, setShow] = useState(false);
  const [platform, setPlatform] = useState<'ios' | 'android' | 'other'>('other');

  useEffect(() => {
    // Check if already in standalone mode
    const isStandalone = window.matchMedia('(display-mode: standalone)').matches || 
                        ('standalone' in window.navigator && (window.navigator as Navigator & { standalone: boolean }).standalone);
    
    // Check if user dismissed it in this session
    const isDismissed = sessionStorage.getItem('pwa_guide_dismissed');

    if (!isStandalone && !isDismissed) {
      const userAgent = window.navigator.userAgent.toLowerCase();
      if (/iphone|ipad|ipod/.test(userAgent)) {
        setPlatform('ios');
      } else if (/android/.test(userAgent)) {
        setPlatform('android');
      }
      
      // Delay to ensure user has seen the landing page
      const timer = setTimeout(() => setShow(true), 3000);
      return () => clearTimeout(timer);
    }
  }, []);

  const dismiss = () => {
    setShow(false);
    sessionStorage.setItem('pwa_guide_dismissed', 'true');
  };

  return (
    <AnimatePresence>
      {show && (
        <div className="fixed inset-0 z-[200] flex items-end justify-center p-6 bg-black/20 backdrop-blur-sm">
          <motion.div 
            initial={{ y: '100%' }}
            animate={{ y: 0 }}
            exit={{ y: '100%' }}
            transition={{ type: 'spring', damping: 25, stiffness: 300 }}
            className="w-full max-w-sm glass-container p-8 relative overflow-hidden"
          >
            {/* Background Accent */}
            <div className="absolute -top-10 -right-10 w-32 h-32 bg-nara-emerald/10 rounded-full blur-2xl" />
            
            <button 
              onClick={dismiss}
              className="absolute top-4 right-4 w-8 h-8 flex items-center justify-center rounded-full bg-slate-100 text-slate-400 active:scale-90 transition-all"
            >
              <X size={16} />
            </button>

            <div className="flex flex-col items-center text-center">
              <div className="w-16 h-16 bg-gradient-to-br from-nara-hunter to-nara-evergreen rounded-3xl flex items-center justify-center mb-6 shadow-float">
                <Smartphone className="text-white" size={32} />
              </div>
              
              <h2 className="text-2xl font-black text-nara-text tracking-tight mb-2">Install NARA App</h2>
              <p className="text-nara-muted text-sm leading-relaxed mb-8 px-2">
                Install NARA on your home screen for a seamless full-screen experience and better performance.
              </p>

              <div className="w-full space-y-4 bg-white/40 p-6 rounded-[32px] border border-white/60">
                <h3 className="text-[10px] font-black uppercase tracking-[0.2em] text-nara-hunter mb-4">How to Install</h3>
                
                {platform === 'ios' ? (
                  <div className="space-y-4 text-left">
                    <div className="flex items-start gap-4">
                      <div className="w-6 h-6 rounded-lg bg-nara-hunter/10 flex items-center justify-center shrink-0">
                         <Share size={14} className="text-nara-hunter" />
                      </div>
                      <p className="text-xs font-bold text-nara-text">1. Tap the <span className="text-blue-500">Share</span> button in Safari</p>
                    </div>
                    <div className="flex items-start gap-4">
                      <div className="w-6 h-6 rounded-lg bg-nara-hunter/10 flex items-center justify-center shrink-0">
                         <Plus size={14} className="text-nara-hunter" />
                      </div>
                      <p className="text-xs font-bold text-nara-text">2. Select <span className="text-nara-hunter">&quot;Add to Home Screen&quot;</span></p>
                    </div>
                  </div>
                ) : (
                  <div className="space-y-4 text-left">
                    <div className="flex items-start gap-4">
                      <div className="w-6 h-6 rounded-lg bg-nara-hunter/10 flex items-center justify-center shrink-0">
                         <MoreVertical size={14} className="text-nara-hunter" />
                      </div>
                      <p className="text-xs font-bold text-nara-text">1. Tap the <span className="text-slate-600">Menu</span> (three dots) in Chrome</p>
                    </div>
                    <div className="flex items-start gap-4">
                      <div className="w-6 h-6 rounded-lg bg-nara-hunter/10 flex items-center justify-center shrink-0">
                         <Download size={14} className="text-nara-hunter" />
                      </div>
                      <p className="text-xs font-bold text-nara-text">2. Tap <span className="text-nara-hunter">&quot;Install App&quot;</span> or &quot;Add to Home Screen&quot;</p>
                    </div>
                  </div>
                )}
              </div>

              <button 
                onClick={dismiss}
                className="btn-primary mt-8 py-4"
              >
                Got it!
              </button>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
