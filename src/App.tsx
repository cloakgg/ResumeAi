import React, { useState, useEffect } from 'react';
import { onAuthStateChanged, User } from 'firebase/auth';
import { doc, getDoc, setDoc, serverTimestamp } from 'firebase/firestore';
import { auth, db, signInWithGoogle, logout } from './lib/firebase';
import { UserProfile, AppState, Resume } from './types';
import Landing from './components/Landing';
import AIChat from './components/AIChat';
import ResumeEditor from './components/ResumeEditor';
import SocialLinks from './components/SocialLinks';
import Marketplace from './components/Marketplace';
import Profile from './components/Profile';
import Paywall from './components/Paywall';
import { motion, AnimatePresence } from 'motion/react';
import { LogIn, LogOut, User as UserIcon, Briefcase, MessageSquare, Globe, Layout as LayoutIcon, Crown, Youtube } from 'lucide-react';

export default function App() {
  const [user, setUser] = useState<User | null>(null);
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [appState, setAppState] = useState<AppState>('landing');
  const [loading, setLoading] = useState(true);
  const [currentResume, setCurrentResume] = useState<Resume | null>(null);
  const [showPaywall, setShowPaywall] = useState(false);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      setUser(firebaseUser);
      if (firebaseUser) {
        const userDoc = await getDoc(doc(db, 'users', firebaseUser.uid));
        if (userDoc.exists()) {
          setProfile(userDoc.data() as UserProfile);
        } else {
          const newProfile: UserProfile = {
            uid: firebaseUser.uid,
            displayName: firebaseUser.displayName || 'Anonymous',
            email: firebaseUser.email || '',
            photoURL: firebaseUser.photoURL || '',
            isPremium: false,
            createdAt: serverTimestamp(),
          };
          await setDoc(doc(db, 'users', firebaseUser.uid), newProfile);
          setProfile(newProfile);
        }
      } else {
        setProfile(null);
        setAppState('landing');
      }
      setLoading(false);
    });
    return unsubscribe;
  }, []);

  const handleLogin = async () => {
    try {
      await signInWithGoogle();
    } catch (error) {
      console.error("Login failed", error);
    }
  };

  const checkPremium = (action: () => void) => {
    if (profile?.isPremium) {
      action();
    } else {
      setShowPaywall(true);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50">
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ repeat: Infinity, duration: 1, ease: "linear" }}
          className="w-12 h-12 border-4 border-blue-500 border-t-transparent rounded-full"
        />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 font-sans selection:bg-blue-100 selection:text-blue-900">
      {/* Navigation */}
      <nav className="sticky top-0 z-50 bg-white/80 backdrop-blur-md border-b border-slate-200 px-6 py-4 flex items-center justify-between">
        <div 
          className="flex items-center gap-2 cursor-pointer group"
          onClick={() => setAppState('landing')}
        >
          <div className="w-10 h-10 bg-blue-600 rounded-xl flex items-center justify-center text-white shadow-lg shadow-blue-200 group-hover:scale-110 transition-transform">
            <Briefcase size={24} />
          </div>
          <span className="text-xl font-bold tracking-tight text-slate-800">ResumeAI</span>
        </div>

        <div className="flex items-center gap-6">
          {user ? (
            <>
              <button 
                onClick={() => setAppState('marketplace')}
                className={`flex items-center gap-2 text-sm font-medium transition-colors ${appState === 'marketplace' ? 'text-blue-600' : 'text-slate-600 hover:text-blue-600'}`}
              >
                <Globe size={18} />
                Marketplace
              </button>
              <button 
                onClick={() => setAppState('chat')}
                className={`flex items-center gap-2 text-sm font-medium transition-colors ${appState === 'chat' ? 'text-blue-600' : 'text-slate-600 hover:text-blue-600'}`}
              >
                <MessageSquare size={18} />
                Create Resume
              </button>
              {!profile?.isPremium && (
                <button 
                  onClick={() => setShowPaywall(true)}
                  className="flex items-center gap-2 bg-amber-100 text-amber-700 px-3 py-1.5 rounded-lg text-xs font-bold hover:bg-amber-200 transition-colors"
                >
                  <Crown size={14} />
                  Go Premium
                </button>
              )}
              <div className="h-6 w-px bg-slate-200 mx-2" />
              <button 
                onClick={() => setAppState('profile')}
                className="flex items-center gap-2 group"
              >
                <div className="relative">
                  <img 
                    src={profile?.photoURL || 'https://picsum.photos/seed/user/100/100'} 
                    alt="Profile" 
                    className="w-8 h-8 rounded-full border border-slate-200 group-hover:ring-2 ring-blue-500/20 transition-all"
                    referrerPolicy="no-referrer"
                  />
                  {profile?.isPremium && (
                    <div className="absolute -top-1 -right-1 bg-amber-500 text-white p-0.5 rounded-full border-2 border-white">
                      <Crown size={8} />
                    </div>
                  )}
                </div>
                <span className="text-sm font-semibold text-slate-700 hidden sm:inline">{profile?.displayName}</span>
              </button>
              <button 
                onClick={logout}
                className="p-2 text-slate-400 hover:text-red-500 transition-colors"
                title="Logout"
              >
                <LogOut size={20} />
              </button>
            </>
          ) : (
            <button
              onClick={handleLogin}
              className="flex items-center gap-2 bg-blue-600 text-white px-5 py-2.5 rounded-full font-semibold hover:bg-blue-700 transition-all shadow-lg shadow-blue-200 active:scale-95"
            >
              <LogIn size={18} />
              Sign In
            </button>
          )}
        </div>
      </nav>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-6 py-8 min-h-[calc(100vh-160px)]">
        <AnimatePresence mode="wait">
          {appState === 'landing' && (
            <motion.div
              key="landing"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
            >
              <Landing onStart={() => user ? setAppState('chat') : handleLogin()} />
            </motion.div>
          )}

          {appState === 'chat' && user && profile && (
            <motion.div
              key="chat"
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
            >
              <AIChat 
                profile={profile}
                onGenerated={(resume) => {
                  setCurrentResume(resume);
                  setAppState('edit');
                }} 
              />
            </motion.div>
          )}

          {appState === 'edit' && currentResume && profile && (
            <motion.div
              key="edit"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
            >
              <ResumeEditor 
                resume={currentResume} 
                profile={profile}
                onNext={() => setAppState('marketplace')}
                onUpdate={(updated) => setCurrentResume(updated)}
              />
            </motion.div>
          )}

          {appState === 'social' && profile && (
            <motion.div
              key="social"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
            >
              <SocialLinks 
                profile={profile} 
                onComplete={() => setAppState('marketplace')} 
                onUpdate={(updated) => setProfile(updated)}
              />
            </motion.div>
          )}

          {appState === 'marketplace' && (
            <motion.div
              key="marketplace"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
            >
              <Marketplace isPremium={profile?.isPremium} onUpgrade={() => setShowPaywall(true)} />
            </motion.div>
          )}

          {appState === 'profile' && profile && (
            <motion.div
              key="profile"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
            >
              <Profile profile={profile} />
            </motion.div>
          )}
        </AnimatePresence>
      </main>

      {/* Global Footer */}
      <footer className="bg-white border-t border-slate-200 py-8 px-6">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center text-white">
              <Briefcase size={18} />
            </div>
            <span className="font-bold text-slate-800">ResumeAI</span>
          </div>
          
          <div className="flex items-center gap-8">
            <a href="https://youtube.com" target="_blank" rel="noopener noreferrer" className="text-slate-400 hover:text-red-500 transition-colors flex items-center gap-2 text-sm font-bold">
              <Youtube size={18} />
              YouTube
            </a>
            <a href="#" className="text-slate-400 hover:text-blue-500 transition-colors text-sm font-bold">Privacy</a>
            <a href="#" className="text-slate-400 hover:text-blue-500 transition-colors text-sm font-bold">Terms</a>
          </div>

          <p className="text-slate-400 text-xs font-medium">
            © 2026 ResumeAI. Empowering careers with AI.
          </p>
        </div>
      </footer>

      {/* Paywall Modal */}
      <AnimatePresence>
        {showPaywall && profile && (
          <Paywall 
            profile={profile} 
            onClose={() => setShowPaywall(false)} 
            onSuccess={(updated) => setProfile(updated)}
          />
        )}
      </AnimatePresence>
    </div>
  );
}

