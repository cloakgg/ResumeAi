import React, { useState } from 'react';
import { motion } from 'motion/react';
import { Linkedin, Instagram, Facebook, Phone, CreditCard, Save, ArrowRight, Loader2, Link as LinkIcon } from 'lucide-react';
import { db } from '../lib/firebase';
import { doc, updateDoc } from 'firebase/firestore';
import { UserProfile } from '../types';

export default function SocialLinks({ profile, onComplete, onUpdate }: { profile: UserProfile; onComplete: () => void; onUpdate: (updated: UserProfile) => void }) {
  const [links, setLinks] = useState({
    linkedin: profile.linkedin || '',
    instagram: profile.instagram || '',
    facebook: profile.facebook || '',
    phoneNumber: profile.phoneNumber || '',
    stripeLink: profile.stripeLink || '',
    category: profile.category || 'General'
  });
  const [isSaving, setIsSaving] = useState(false);

  const handleSave = async () => {
    setIsSaving(true);
    try {
      await updateDoc(doc(db, 'users', profile.uid), links);
      onUpdate({ ...profile, ...links });
      onComplete();
    } catch (error) {
      console.error("Save error", error);
    } finally {
      setIsSaving(false);
    }
  };

  const inputs = [
    { id: 'linkedin', icon: <Linkedin size={20} />, label: 'LinkedIn URL', placeholder: 'linkedin.com/in/username' },
    { id: 'instagram', icon: <Instagram size={20} />, label: 'Instagram Username', placeholder: '@username' },
    { id: 'facebook', icon: <Facebook size={20} />, label: 'Facebook URL', placeholder: 'facebook.com/username' },
    { id: 'phoneNumber', icon: <Phone size={20} />, label: 'Personal Number', placeholder: '+1 (555) 000-0000' },
    { id: 'stripeLink', icon: <CreditCard size={20} />, label: 'Stripe Account Link', placeholder: 'buy.stripe.com/...' },
  ];

  return (
    <div className="max-w-2xl mx-auto space-y-10 py-8">
      <div className="text-center space-y-4">
        <div className="w-16 h-16 bg-blue-600 rounded-2xl flex items-center justify-center text-white mx-auto shadow-xl shadow-blue-100">
          <LinkIcon size={32} />
        </div>
        <h2 className="text-4xl font-black text-slate-900 tracking-tight">Connect Your World</h2>
        <p className="text-slate-500 max-w-md mx-auto">Add your social links and contact info to make it easy for recruiters and collaborators to reach you.</p>
      </div>

      <div className="bg-white p-10 rounded-[2.5rem] border border-slate-200 shadow-xl space-y-8">
        <div className="grid grid-cols-1 gap-6">
          {inputs.map((input) => (
            <div key={input.id} className="space-y-2">
              <label className="text-xs font-bold text-slate-400 uppercase tracking-wider flex items-center gap-2">
                {input.icon}
                {input.label}
              </label>
              <input
                type="text"
                value={(links as any)[input.id]}
                onChange={(e) => setLinks({ ...links, [input.id]: e.target.value })}
                placeholder={input.placeholder}
                className="w-full bg-slate-50 border border-slate-200 rounded-2xl px-6 py-4 focus:ring-4 ring-blue-500/10 focus:border-blue-500 outline-none transition-all"
              />
            </div>
          ))}

          <div className="space-y-2">
            <label className="text-xs font-bold text-slate-400 uppercase tracking-wider">Your Primary Category</label>
            <select 
              value={links.category}
              onChange={(e) => setLinks({ ...links, category: e.target.value })}
              className="w-full bg-slate-50 border border-slate-200 rounded-2xl px-6 py-4 focus:ring-4 ring-blue-500/10 focus:border-blue-500 outline-none transition-all appearance-none"
            >
              <option value="General">General</option>
              <option value="Tech">Technology</option>
              <option value="Design">Design</option>
              <option value="Marketing">Marketing</option>
              <option value="Sales">Sales</option>
              <option value="Management">Management</option>
            </select>
          </div>
        </div>

        <button
          onClick={handleSave}
          disabled={isSaving}
          className="w-full bg-blue-600 text-white py-5 rounded-2xl font-bold text-lg hover:bg-blue-700 transition-all shadow-xl shadow-blue-200 flex items-center justify-center gap-3 disabled:opacity-50 group"
        >
          {isSaving ? <Loader2 className="animate-spin" size={24} /> : <Save size={24} />}
          Complete Profile
          <ArrowRight className="group-hover:translate-x-1 transition-transform" />
        </button>
      </div>
    </div>
  );
}
