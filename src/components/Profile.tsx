import React, { useState, useEffect } from 'react';
import { motion } from 'motion/react';
import { User, Mail, Calendar, Briefcase, Star, MessageSquare, Edit, Linkedin, Instagram, Facebook, Phone, CreditCard, Loader2, Coffee } from 'lucide-react';
import { db, auth } from '../lib/firebase';
import { collection, query, where, getDocs, doc, getDoc } from 'firebase/firestore';
import { UserProfile, Resume } from '../types';
import ReactMarkdown from 'react-markdown';

export default function Profile({ profile }: { profile: UserProfile }) {
  const [userResumes, setUserResumes] = useState<Resume[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchResumes = async () => {
      const q = query(collection(db, 'resumes'), where('userId', '==', profile.uid));
      const snapshot = await getDocs(q);
      setUserResumes(snapshot.docs.map(d => ({ ...d.data(), id: d.id }) as Resume));
      setLoading(false);
    };
    fetchResumes();
  }, [profile.uid]);

  return (
    <div className="max-w-6xl mx-auto space-y-12 py-8">
      {/* Profile Header */}
      <div className="bg-white rounded-[3rem] border border-slate-200 p-12 shadow-xl flex flex-col md:flex-row items-center gap-12 relative overflow-hidden">
        <div className="absolute top-0 right-0 w-64 h-64 bg-blue-500/5 rounded-full blur-3xl -mr-32 -mt-32" />
        
        <div className="relative">
          <img 
            src={profile.photoURL || 'https://picsum.photos/seed/user/200/200'} 
            alt={profile.displayName} 
            className="w-48 h-48 rounded-[2.5rem] object-cover shadow-2xl border-4 border-white"
            referrerPolicy="no-referrer"
          />
          <div className="absolute -bottom-4 -right-4 bg-blue-600 text-white p-4 rounded-2xl shadow-xl">
            <User size={24} />
          </div>
        </div>

        <div className="flex-1 space-y-6 text-center md:text-left">
          <div>
            <h1 className="text-5xl font-black text-slate-900 tracking-tight">{profile.displayName}</h1>
            <p className="text-blue-600 font-bold uppercase tracking-widest mt-2">{profile.category || 'General'} Professional</p>
          </div>

          <div className="flex flex-wrap justify-center md:justify-start gap-6 text-slate-500 font-medium">
            <div className="flex items-center gap-2">
              <Mail size={18} className="text-blue-500" />
              {profile.email}
            </div>
            <div className="flex items-center gap-2">
              <Calendar size={18} className="text-blue-500" />
              Joined {profile.createdAt?.toDate ? profile.createdAt.toDate().toLocaleDateString() : 'Recently'}
            </div>
          </div>

          <div className="flex flex-wrap justify-center md:justify-start gap-4">
            {profile.linkedin && <a href={profile.linkedin} target="_blank" className="p-3 bg-slate-50 rounded-xl text-slate-400 hover:text-blue-600 hover:bg-blue-50 transition-all"><Linkedin size={20} /></a>}
            {profile.instagram && <a href={profile.instagram} target="_blank" className="p-3 bg-slate-50 rounded-xl text-slate-400 hover:text-pink-600 hover:bg-pink-50 transition-all"><Instagram size={20} /></a>}
            {profile.facebook && <a href={profile.facebook} target="_blank" className="p-3 bg-slate-50 rounded-xl text-slate-400 hover:text-blue-800 hover:bg-blue-50 transition-all"><Facebook size={20} /></a>}
            {profile.phoneNumber && <a href={`tel:${profile.phoneNumber}`} className="p-3 bg-slate-50 rounded-xl text-slate-400 hover:text-emerald-600 hover:bg-emerald-50 transition-all"><Phone size={20} /></a>}
            {profile.stripeLink && <a href={profile.stripeLink} target="_blank" className="p-3 bg-slate-50 rounded-xl text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 transition-all"><CreditCard size={20} /></a>}
          </div>

          <div className="pt-6 border-t border-slate-100 flex items-center gap-4">
            <a 
              href="https://www.buymeacoffee.com" 
              target="_blank"
              className="flex items-center gap-2 bg-amber-50 text-amber-700 px-4 py-2 rounded-xl text-sm font-bold hover:bg-amber-100 transition-all"
            >
              <Coffee size={18} />
              Support Our Mission
            </a>
            <p className="text-xs text-slate-400 font-medium italic">Help us keep the AI running for everyone!</p>
          </div>
        </div>
      </div>

      {/* Resumes Section */}
      <div className="space-y-8">
        <div className="flex items-center justify-between">
          <h2 className="text-3xl font-black text-slate-900 tracking-tight flex items-center gap-3">
            <Briefcase className="text-blue-600" />
            Your Resumes
          </h2>
        </div>

        {loading ? (
          <div className="flex justify-center py-12">
            <Loader2 className="animate-spin text-blue-600" size={32} />
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {userResumes.map((resume) => (
              <motion.div
                key={resume.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                whileHover={{ 
                  scale: 1.02, 
                  rotateX: 5, 
                  rotateY: 5,
                  transition: { type: "spring", stiffness: 400, damping: 25 }
                }}
                className="bg-white p-8 rounded-[2rem] border border-slate-200 shadow-sm hover:shadow-2xl transition-all group preserve-3d"
                style={{ perspective: "1000px" }}
              >
                <div className="flex items-center justify-between mb-6">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-slate-50 rounded-xl flex items-center justify-center text-slate-400 group-hover:bg-blue-50 group-hover:text-blue-600 transition-colors">
                      <Briefcase size={20} />
                    </div>
                    <div>
                      <h3 className="font-bold text-slate-800 uppercase tracking-wide text-xs">{resume.category}</h3>
                      <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest">
                        {resume.published ? 'Public' : 'Private Draft'}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-4 text-slate-400">
                    <div className="flex items-center gap-1">
                      <Star size={14} />
                      <span className="text-xs font-bold">{resume.stars}</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <MessageSquare size={14} />
                      <span className="text-xs font-bold">{resume.reviewCount}</span>
                    </div>
                  </div>
                </div>
                
                <div className="line-clamp-6 text-sm text-slate-600 prose prose-sm prose-slate mb-6">
                  <ReactMarkdown>{resume.content}</ReactMarkdown>
                </div>

                <button className="w-full py-3 bg-slate-50 text-slate-600 rounded-xl font-bold text-sm hover:bg-slate-100 transition-all flex items-center justify-center gap-2">
                  <Edit size={16} />
                  Edit Resume
                </button>
              </motion.div>
            ))}
            {userResumes.length === 0 && (
              <div className="col-span-full py-20 text-center bg-white rounded-[2rem] border border-dashed border-slate-300">
                <p className="text-slate-400 font-medium">You haven't created any resumes yet.</p>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
