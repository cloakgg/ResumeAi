import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Search, Filter, Star, MessageSquare, ExternalLink, Sparkles, Loader2, ArrowRight, X, Linkedin, Instagram, Facebook, Phone, CreditCard } from 'lucide-react';
import { db, auth } from '../lib/firebase';
import { collection, query, where, orderBy, onSnapshot, getDocs, doc, getDoc, addDoc, serverTimestamp, updateDoc, increment } from 'firebase/firestore';
import { Resume, UserProfile, Review } from '../types';
import ReactMarkdown from 'react-markdown';
import { analyzeResume } from '../lib/gemini';

export default function Marketplace({ isPremium, onUpgrade }: { isPremium?: boolean; onUpgrade: () => void }) {
  const [resumes, setResumes] = useState<Resume[]>([]);
  const [loading, setLoading] = useState(true);
  const [category, setCategory] = useState('All');
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedResume, setSelectedResume] = useState<Resume | null>(null);
  const [analysis, setAnalysis] = useState<string | null>(null);
  const [analyzing, setAnalyzing] = useState(false);
  const [reviews, setReviews] = useState<Review[]>([]);
  const [newReview, setNewReview] = useState({ rating: 5, comment: '' });
  const [submittingReview, setSubmittingReview] = useState(false);

  useEffect(() => {
    let q = query(collection(db, 'resumes'), where('published', '==', true), orderBy('stars', 'desc'));
    
    if (category !== 'All') {
      q = query(collection(db, 'resumes'), where('published', '==', true), where('category', '==', category), orderBy('stars', 'desc'));
    }

    const unsubscribe = onSnapshot(q, async (snapshot) => {
      const resumeData: Resume[] = [];
      for (const d of snapshot.docs) {
        const data = d.data() as Resume;
        // Fetch user profile for each resume
        const userDoc = await getDoc(doc(db, 'users', data.userId));
        resumeData.push({ ...data, id: d.id, user: userDoc.data() as UserProfile });
      }
      setResumes(resumeData);
      setLoading(false);
    });

    return unsubscribe;
  }, [category]);

  const handleAnalyze = async (content: string) => {
    if (!isPremium) {
      onUpgrade();
      return;
    }
    setAnalyzing(true);
    try {
      const result = await analyzeResume(content);
      setAnalysis(result || "Analysis failed.");
    } catch (error) {
      console.error("Analysis error", error);
    } finally {
      setAnalyzing(false);
    }
  };

  const fetchReviews = (resumeId: string) => {
    const q = query(collection(db, 'reviews'), where('resumeId', '==', resumeId), orderBy('createdAt', 'desc'));
    return onSnapshot(q, (snapshot) => {
      setReviews(snapshot.docs.map(d => ({ ...d.data(), id: d.id }) as Review));
    });
  };

  useEffect(() => {
    if (selectedResume) {
      const unsub = fetchReviews(selectedResume.id);
      return unsub;
    }
  }, [selectedResume]);

  const submitReview = async () => {
    if (!selectedResume || !auth.currentUser) return;
    setSubmittingReview(true);
    try {
      await addDoc(collection(db, 'reviews'), {
        resumeId: selectedResume.id,
        reviewerId: auth.currentUser.uid,
        reviewerName: auth.currentUser.displayName || 'Anonymous',
        rating: newReview.rating,
        comment: newReview.comment,
        createdAt: serverTimestamp()
      });
      
      // Update resume stats
      const resumeRef = doc(db, 'resumes', selectedResume.id);
      await updateDoc(resumeRef, {
        stars: increment(newReview.rating),
        reviewCount: increment(1)
      });

      setNewReview({ rating: 5, comment: '' });
    } catch (error) {
      console.error("Review error", error);
    } finally {
      setSubmittingReview(false);
    }
  };

  const filteredResumes = resumes.filter(r => 
    r.user?.displayName.toLowerCase().includes(searchTerm.toLowerCase()) ||
    r.content.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="space-y-10">
      {/* Header & Filters */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div>
          <h2 className="text-4xl font-black text-slate-900 tracking-tight">Creator Marketplace</h2>
          <p className="text-slate-500">Discover top talent and analyze their professional journeys.</p>
        </div>
        <div className="flex items-center gap-4">
          <div className="relative">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
            <input
              type="text"
              placeholder="Search creators..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="bg-white border border-slate-200 rounded-2xl pl-12 pr-6 py-3 focus:ring-4 ring-blue-500/10 outline-none w-full md:w-64 transition-all"
            />
          </div>
          <div className="flex bg-white border border-slate-200 rounded-2xl p-1">
            {['All', 'Tech', 'Design', 'Marketing'].map(cat => (
              <button
                key={cat}
                onClick={() => setCategory(cat)}
                className={`px-4 py-2 rounded-xl text-sm font-bold transition-all ${category === cat ? 'bg-blue-600 text-white shadow-lg shadow-blue-100' : 'text-slate-500 hover:text-slate-800'}`}
              >
                {cat}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Grid */}
      {loading ? (
        <div className="flex justify-center py-20">
          <Loader2 className="animate-spin text-blue-600" size={48} />
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {filteredResumes.map((resume, i) => (
            <motion.div
              key={resume.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              whileHover={{ 
                scale: 1.02, 
                rotateX: 5, 
                rotateY: -5,
                transition: { type: "spring", stiffness: 400, damping: 25 }
              }}
              transition={{ delay: i * 0.05 }}
              onClick={() => setSelectedResume(resume)}
              className="bg-white rounded-[2rem] border border-slate-200 p-8 shadow-sm hover:shadow-2xl transition-all cursor-pointer group relative overflow-hidden preserve-3d"
              style={{ perspective: "1000px" }}
            >
              {/* 3D Motion Effect Accent */}
              <div className="absolute top-0 right-0 w-32 h-32 bg-blue-500/5 rounded-full blur-3xl group-hover:bg-blue-500/10 transition-colors" />
              
              <div className="flex items-start justify-between mb-6">
                <div className="flex items-center gap-4">
                  <img 
                    src={resume.user?.photoURL || `https://picsum.photos/seed/${resume.id}/100/100`} 
                    alt={resume.user?.displayName} 
                    className="w-14 h-14 rounded-2xl object-cover border-2 border-white shadow-md"
                    referrerPolicy="no-referrer"
                  />
                  <div>
                    <h3 className="font-black text-slate-800 leading-tight">{resume.user?.displayName}</h3>
                    <span className="text-xs font-bold text-blue-600 bg-blue-50 px-2 py-0.5 rounded-full uppercase tracking-wider">
                      {resume.category}
                    </span>
                  </div>
                </div>
                <div className="flex flex-col items-end">
                  <div className="flex items-center gap-1 text-amber-500 font-black">
                    <Star size={16} fill="currentColor" />
                    {resume.reviewCount > 0 ? (resume.stars / resume.reviewCount).toFixed(1) : '0'}
                  </div>
                  <span className="text-[10px] text-slate-400 font-bold uppercase">{resume.reviewCount} Reviews</span>
                </div>
              </div>

              <div className="line-clamp-4 text-sm text-slate-600 leading-relaxed mb-6">
                <ReactMarkdown>{resume.content}</ReactMarkdown>
              </div>

              <div className="flex items-center justify-between pt-6 border-t border-slate-50">
                <div className="flex gap-2">
                  {resume.user?.linkedin && <Linkedin size={16} className="text-slate-400" />}
                  {resume.user?.instagram && <Instagram size={16} className="text-slate-400" />}
                </div>
                <button className="text-blue-600 font-bold text-sm flex items-center gap-1 group-hover:gap-2 transition-all">
                  View Resume
                  <ArrowRight size={16} />
                </button>
              </div>
            </motion.div>
          ))}
        </div>
      )}

      {/* Detail Modal */}
      <AnimatePresence>
        {selectedResume && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 sm:p-10">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => { setSelectedResume(null); setAnalysis(null); }}
              className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm"
            />
            <motion.div
              initial={{ opacity: 0, scale: 0.9, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 20 }}
              className="relative w-full max-w-6xl bg-white rounded-[3rem] shadow-2xl overflow-hidden flex flex-col max-h-[90vh]"
            >
              <button 
                onClick={() => { setSelectedResume(null); setAnalysis(null); }}
                className="absolute top-6 right-6 p-2 bg-slate-100 hover:bg-slate-200 rounded-full transition-colors z-10"
              >
                <X size={24} />
              </button>

              <div className="flex-1 overflow-y-auto">
                <div className="grid grid-cols-1 lg:grid-cols-2">
                  {/* Left: Resume Content */}
                  <div className="p-12 border-r border-slate-100 space-y-8">
                    <div className="flex items-center gap-6">
                      <img 
                        src={selectedResume.user?.photoURL} 
                        className="w-24 h-24 rounded-3xl object-cover shadow-xl"
                        referrerPolicy="no-referrer"
                      />
                      <div>
                        <h2 className="text-4xl font-black text-slate-900">{selectedResume.user?.displayName}</h2>
                        <p className="text-blue-600 font-bold uppercase tracking-widest text-sm">{selectedResume.category} Expert</p>
                        <div className="flex gap-4 mt-4">
                          {selectedResume.user?.linkedin && <a href={selectedResume.user.linkedin} target="_blank" className="text-slate-400 hover:text-blue-600"><Linkedin size={20} /></a>}
                          {selectedResume.user?.instagram && <a href={selectedResume.user.instagram} target="_blank" className="text-slate-400 hover:text-pink-600"><Instagram size={20} /></a>}
                          {selectedResume.user?.facebook && <a href={selectedResume.user.facebook} target="_blank" className="text-slate-400 hover:text-blue-800"><Facebook size={20} /></a>}
                          {selectedResume.user?.phoneNumber && <a href={`tel:${selectedResume.user.phoneNumber}`} className="text-slate-400 hover:text-emerald-600"><Phone size={20} /></a>}
                          {selectedResume.user?.stripeLink && <a href={selectedResume.user.stripeLink} target="_blank" className="text-slate-400 hover:text-indigo-600"><CreditCard size={20} /></a>}
                        </div>
                      </div>
                    </div>

                    <div className="prose prose-slate max-w-none bg-slate-50 p-10 rounded-3xl border border-slate-100">
                      <ReactMarkdown>{selectedResume.content}</ReactMarkdown>
                    </div>
                  </div>

                  {/* Right: AI Analysis & Reviews */}
                  <div className="p-12 bg-slate-50/50 space-y-10 overflow-y-auto">
                    {/* AI Analysis */}
                    <div className="space-y-6">
                      <div className="flex items-center justify-between">
                        <h3 className="text-2xl font-black flex items-center gap-2">
                          <Sparkles className="text-blue-600" />
                          AI Analysis
                        </h3>
                        {!analysis && (
                          <button
                            onClick={() => handleAnalyze(selectedResume.content)}
                            disabled={analyzing}
                            className="bg-blue-600 text-white px-6 py-2 rounded-xl font-bold text-sm hover:bg-blue-700 transition-all flex items-center gap-2 shadow-lg shadow-blue-100 disabled:opacity-50"
                          >
                            {analyzing ? <Loader2 className="animate-spin" size={18} /> : <Sparkles size={18} />}
                            Analyze with AI
                          </button>
                        )}
                      </div>
                      
                      {analysis && (
                        <motion.div
                          initial={{ opacity: 0, y: 10 }}
                          animate={{ opacity: 1, y: 0 }}
                          className="bg-white p-8 rounded-3xl border border-blue-100 shadow-sm prose prose-sm prose-blue"
                        >
                          <ReactMarkdown>{analysis}</ReactMarkdown>
                        </motion.div>
                      )}
                    </div>

                    {/* Reviews */}
                    <div className="space-y-6">
                      <h3 className="text-2xl font-black flex items-center gap-2">
                        <MessageSquare className="text-purple-600" />
                        Community Reviews
                      </h3>
                      
                      {/* Add Review */}
                      <div className="bg-white p-8 rounded-3xl border border-slate-200 shadow-sm space-y-4">
                        <div className="flex items-center gap-2">
                          {[1, 2, 3, 4, 5].map(s => (
                            <button 
                              key={s} 
                              onClick={() => setNewReview({ ...newReview, rating: s })}
                              className={`transition-all ${newReview.rating >= s ? 'text-amber-500 scale-110' : 'text-slate-200 hover:text-amber-200'}`}
                            >
                              <Star size={24} fill="currentColor" />
                            </button>
                          ))}
                        </div>
                        <textarea
                          placeholder="Add a comment..."
                          value={newReview.comment}
                          onChange={(e) => setNewReview({ ...newReview, comment: e.target.value })}
                          className="w-full bg-slate-50 border border-slate-100 rounded-2xl p-4 text-sm focus:ring-2 ring-blue-500/10 outline-none resize-none h-24"
                        />
                        <button
                          onClick={submitReview}
                          disabled={submittingReview || !newReview.comment.trim()}
                          className="w-full bg-slate-900 text-white py-3 rounded-xl font-bold text-sm hover:bg-slate-800 transition-all disabled:opacity-50"
                        >
                          {submittingReview ? <Loader2 className="animate-spin mx-auto" size={18} /> : 'Post Review'}
                        </button>
                      </div>

                      {/* Review List */}
                      <div className="space-y-4">
                        {reviews.map(review => (
                          <div key={review.id} className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm">
                            <div className="flex items-center justify-between mb-2">
                              <span className="font-bold text-slate-800">{review.reviewerName}</span>
                              <div className="flex items-center gap-1 text-amber-500">
                                <Star size={12} fill="currentColor" />
                                <span className="text-xs font-black">{review.rating}</span>
                              </div>
                            </div>
                            <p className="text-sm text-slate-600">{review.comment}</p>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
