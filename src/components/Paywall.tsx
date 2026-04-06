import React from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { X, Crown, Check, Zap, Heart, Coffee } from 'lucide-react';
import { db } from '../lib/firebase';
import { doc, updateDoc } from 'firebase/firestore';
import { UserProfile } from '../types';

export default function Paywall({ 
  profile, 
  onClose, 
  onSuccess 
}: { 
  profile: UserProfile; 
  onClose: () => void; 
  onSuccess: (updated: UserProfile) => void 
}) {
  const handleUpgrade = async () => {
    try {
      // In a real app, this would trigger Stripe. 
      // For this demo, we'll simulate a successful payment.
      const userRef = doc(db, 'users', profile.uid);
      await updateDoc(userRef, { isPremium: true });
      onSuccess({ ...profile, isPremium: true });
      onClose();
    } catch (error) {
      console.error("Upgrade failed", error);
    }
  };

  return (
    <div className="fixed inset-0 z-[200] flex items-center justify-center p-6">
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        onClick={onClose}
        className="absolute inset-0 bg-slate-900/80 backdrop-blur-md"
      />
      
      <motion.div
        initial={{ opacity: 0, scale: 0.9, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.9, y: 20 }}
        className="relative w-full max-w-xl bg-white rounded-[3rem] shadow-2xl overflow-hidden"
      >
        <button 
          onClick={onClose}
          className="absolute top-6 right-6 p-2 bg-slate-100 hover:bg-slate-200 rounded-full transition-colors z-10"
        >
          <X size={20} />
        </button>

        <div className="p-12 space-y-8">
          <div className="text-center space-y-4">
            <div className="w-20 h-20 bg-amber-100 text-amber-600 rounded-3xl flex items-center justify-center mx-auto shadow-xl shadow-amber-100/50 animate-bounce">
              <Crown size={40} />
            </div>
            <h2 className="text-4xl font-black text-slate-900 tracking-tight">Go Premium</h2>
            <p className="text-slate-500">Unlock the full power of AI and stand out in the marketplace.</p>
          </div>

          <div className="space-y-4">
            {[
              "Unlimited AI Resume Analysis",
              "Priority Placement in Marketplace",
              "Advanced 3D Motion Effects",
              "Custom Branding & Themes",
              "Direct Support from Experts"
            ].map((feature, i) => (
              <div key={i} className="flex items-center gap-3 bg-slate-50 p-4 rounded-2xl border border-slate-100">
                <div className="w-6 h-6 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center">
                  <Check size={14} />
                </div>
                <span className="font-semibold text-slate-700">{feature}</span>
              </div>
            ))}
          </div>

          <div className="pt-4 space-y-4">
            <button
              onClick={handleUpgrade}
              className="w-full bg-amber-500 text-white py-5 rounded-2xl font-black text-xl hover:bg-amber-600 transition-all shadow-xl shadow-amber-200 flex items-center justify-center gap-3 group"
            >
              <Zap size={24} className="group-hover:scale-125 transition-transform" />
              Upgrade for $9.99/mo
            </button>
            
            <div className="flex items-center justify-center gap-6 pt-4 border-t border-slate-100">
              <a 
                href="https://www.buymeacoffee.com" 
                target="_blank" 
                className="flex items-center gap-2 text-slate-500 hover:text-amber-600 font-bold text-sm transition-colors"
              >
                <Coffee size={18} />
                Support Us
              </a>
              <div className="w-1 h-1 bg-slate-200 rounded-full" />
              <div className="flex items-center gap-2 text-slate-500 font-bold text-sm">
                <Heart size={18} className="text-red-500" />
                Made with Love
              </div>
            </div>
          </div>
        </div>
      </motion.div>
    </div>
  );
}
