import React from 'react';
import { motion } from 'motion/react';
import { Sparkles, ArrowRight, Star, Users, Zap, Youtube, Heart, GraduationCap } from 'lucide-react';

export default function Landing({ onStart }: { onStart: () => void }) {
  return (
    <div className="space-y-24 py-12">
      {/* Hero Section */}
      <section className="text-center max-w-4xl mx-auto space-y-8">
        <motion.div
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          className="inline-flex items-center gap-2 bg-blue-50 text-blue-600 px-4 py-2 rounded-full text-sm font-bold tracking-wide uppercase"
        >
          <Sparkles size={16} />
          AI-Powered Career Growth
        </motion.div>
        
        <h1 className="text-6xl sm:text-7xl font-black text-slate-900 tracking-tight leading-[1.1]">
          Your Dream Job Starts with a <span className="text-blue-600">Perfect Resume</span>
        </h1>
        
        <p className="text-xl text-slate-600 max-w-2xl mx-auto leading-relaxed">
          Our intelligent AI guide walks you through a structured interview to capture your unique strengths. 
          Build a high-impact resume, connect your social presence, and join a thriving marketplace of top-tier creators.
        </p>

        <div className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-4">
          <button
            onClick={onStart}
            className="w-full sm:w-auto bg-blue-600 text-white px-10 py-5 rounded-2xl font-bold text-lg hover:bg-blue-700 transition-all shadow-xl shadow-blue-200 flex items-center justify-center gap-2 group"
          >
            Get Started Now
            <ArrowRight className="group-hover:translate-x-1 transition-transform" />
          </button>
          <button className="w-full sm:w-auto bg-white text-slate-700 border border-slate-200 px-10 py-5 rounded-2xl font-bold text-lg hover:bg-slate-50 transition-all">
            View Marketplace
          </button>
        </div>
      </section>

      {/* Teen Program Section */}
      <section className="bg-gradient-to-br from-indigo-600 to-blue-700 rounded-[3rem] p-12 text-white overflow-hidden relative">
        <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full blur-3xl -mr-32 -mt-32" />
        <div className="relative z-10 grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
          <div className="space-y-6">
            <div className="inline-flex items-center gap-2 bg-white/20 px-4 py-1.5 rounded-full text-xs font-bold uppercase tracking-widest">
              <GraduationCap size={14} />
              New: Teen Program
            </div>
            <h2 className="text-4xl font-black tracking-tight">Start Earning Early (Ages 12-17)</h2>
            <p className="text-indigo-100 text-lg leading-relaxed">
              Are you a teen looking to jumpstart your career? Our specialized Teen Program helps you build your first professional resume, 
              showcase your school projects, and find early earning opportunities in the creator economy.
            </p>
            <button 
              onClick={onStart}
              className="bg-white text-indigo-600 px-8 py-4 rounded-2xl font-bold hover:bg-indigo-50 transition-all shadow-lg"
            >
              Join Teen Program
            </button>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div className="bg-white/10 p-6 rounded-3xl backdrop-blur-sm border border-white/10">
              <h4 className="font-bold text-xl mb-1">First Resume</h4>
              <p className="text-indigo-100 text-sm">Professional templates for students.</p>
            </div>
            <div className="bg-white/10 p-6 rounded-3xl backdrop-blur-sm border border-white/10">
              <h4 className="font-bold text-xl mb-1">Skill Building</h4>
              <p className="text-indigo-100 text-sm">Learn what employers look for.</p>
            </div>
            <div className="bg-white/10 p-6 rounded-3xl backdrop-blur-sm border border-white/10">
              <h4 className="font-bold text-xl mb-1">Early Earning</h4>
              <p className="text-indigo-100 text-sm">Connect with teen-friendly gigs.</p>
            </div>
            <div className="bg-white/10 p-6 rounded-3xl backdrop-blur-sm border border-white/10">
              <h4 className="font-bold text-xl mb-1">Mentorship</h4>
              <p className="text-indigo-100 text-sm">Guidance from industry pros.</p>
            </div>
          </div>
        </div>
      </section>

      {/* Features Grid */}
      <section className="grid grid-cols-1 md:grid-cols-3 gap-8">
        {[
          {
            icon: <Zap className="text-amber-500" />,
            title: "AI Chat Builder",
            desc: "No more staring at a blank page. Just chat with our AI about your experience."
          },
          {
            icon: <Star className="text-purple-500" />,
            title: "Creator Marketplace",
            desc: "Publish your resume and get discovered by top companies and creators."
          },
          {
            icon: <Users className="text-emerald-500" />,
            title: "Community Reviews",
            desc: "Get feedback, stars, and comments to boost your profile to the top."
          }
        ].map((feature, i) => (
          <motion.div
            key={i}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.1 }}
            className="bg-white p-8 rounded-3xl border border-slate-100 shadow-sm hover:shadow-md transition-shadow"
          >
            <div className="w-12 h-12 bg-slate-50 rounded-2xl flex items-center justify-center mb-6">
              {feature.icon}
            </div>
            <h3 className="text-xl font-bold mb-3">{feature.title}</h3>
            <p className="text-slate-600 leading-relaxed">{feature.desc}</p>
          </motion.div>
        ))}
      </section>

      {/* Social Proof & Footer Socials */}
      <section className="bg-slate-900 rounded-[3rem] p-12 text-center text-white space-y-12 overflow-hidden relative">
        <div className="absolute top-0 left-0 w-full h-full opacity-10 pointer-events-none">
           <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-blue-500 rounded-full blur-[120px]" />
           <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-purple-500 rounded-full blur-[120px]" />
        </div>

        <div className="relative z-10 space-y-8">
          <div className="space-y-4">
            <h2 className="text-4xl font-bold">Trusted by 10,000+ Professionals</h2>
            <div className="flex flex-wrap justify-center gap-8 opacity-50">
              {['Google', 'Meta', 'Amazon', 'Netflix', 'Apple'].map(brand => (
                <span key={brand} className="text-2xl font-black tracking-tighter italic">{brand}</span>
              ))}
            </div>
          </div>

          <div className="pt-12 border-t border-white/10 flex flex-col md:flex-row items-center justify-between gap-8">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center text-white">
                <Sparkles size={18} />
              </div>
              <span className="text-lg font-bold">ResumeAI</span>
            </div>
            
            <div className="flex items-center gap-6">
              <a href="https://youtube.com" target="_blank" rel="noopener noreferrer" className="flex items-center gap-2 text-slate-400 hover:text-red-500 transition-colors group">
                <Youtube size={20} />
                <span className="text-sm font-bold group-hover:underline">YouTube</span>
              </a>
              <a href="#" className="flex items-center gap-2 text-slate-400 hover:text-blue-400 transition-colors group">
                <Users size={20} />
                <span className="text-sm font-bold group-hover:underline">Community</span>
              </a>
              <a href="#" className="flex items-center gap-2 text-slate-400 hover:text-pink-400 transition-colors group">
                <Heart size={20} />
                <span className="text-sm font-bold group-hover:underline">Support Us</span>
              </a>
            </div>

            <p className="text-slate-500 text-sm">
              © 2026 ResumeAI. All rights reserved.
            </p>
          </div>
        </div>
      </section>
    </div>
  );
}
