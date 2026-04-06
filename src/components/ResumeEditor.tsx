import React, { useState } from 'react';
import ReactMarkdown from 'react-markdown';
import { motion } from 'motion/react';
import { Edit3, Eye, Check, ArrowRight, Save, Globe, Loader2 } from 'lucide-react';
import { db } from '../lib/firebase';
import { doc, updateDoc } from 'firebase/firestore';
import { Resume } from '../types';

export default function ResumeEditor({ resume, onNext, onUpdate }: { resume: Resume; onNext: () => void; onUpdate: (updated: Resume) => void }) {
  const [isEditing, setIsEditing] = useState(false);
  const [content, setContent] = useState(resume.content);
  const [isSaving, setIsSaving] = useState(false);
  const [category, setCategory] = useState(resume.category || 'General');

  const handleSave = async () => {
    setIsSaving(true);
    try {
      await updateDoc(doc(db, 'resumes', resume.id), {
        content,
        category,
        published: true
      });
      onUpdate({ ...resume, content, category, published: true });
      setIsEditing(false);
    } catch (error) {
      console.error("Save error", error);
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="max-w-5xl mx-auto space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-black text-slate-900 tracking-tight">Review Your Resume</h2>
          <p className="text-slate-500">Fine-tune the details before publishing to the marketplace.</p>
        </div>
        <div className="flex items-center gap-3">
          <button
            onClick={() => setIsEditing(!isEditing)}
            className={`flex items-center gap-2 px-4 py-2 rounded-xl font-bold text-sm transition-all ${
              isEditing ? 'bg-slate-100 text-slate-600' : 'bg-blue-50 text-blue-600 hover:bg-blue-100'
            }`}
          >
            {isEditing ? <Eye size={18} /> : <Edit3 size={18} />}
            {isEditing ? 'Preview' : 'Edit Content'}
          </button>
          <button
            onClick={handleSave}
            disabled={isSaving}
            className="flex items-center gap-2 bg-emerald-600 text-white px-6 py-2.5 rounded-xl font-bold text-sm hover:bg-emerald-700 transition-all shadow-lg shadow-emerald-100 disabled:opacity-50"
          >
            {isSaving ? <Loader2 className="animate-spin" size={18} /> : <Globe size={18} />}
            Publish Now
          </button>
          <button
            onClick={onNext}
            className="flex items-center gap-2 bg-slate-900 text-white px-6 py-2.5 rounded-xl font-bold text-sm hover:bg-slate-800 transition-all shadow-lg shadow-slate-200"
          >
            Next
            <ArrowRight size={18} />
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
        {/* Sidebar Settings */}
        <div className="lg:col-span-1 space-y-6">
          <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm space-y-4">
            <h3 className="font-bold text-slate-800 flex items-center gap-2">
              <Check className="text-blue-600" size={18} />
              Resume Settings
            </h3>
            <div className="space-y-2">
              <label className="text-xs font-bold text-slate-400 uppercase tracking-wider">Category</label>
              <select 
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2 text-sm focus:ring-2 ring-blue-500/20 outline-none"
              >
                <option value="General">General</option>
                <option value="Tech">Technology</option>
                <option value="Design">Design</option>
                <option value="Marketing">Marketing</option>
                <option value="Sales">Sales</option>
                <option value="Management">Management</option>
              </select>
            </div>
            <div className="pt-4 border-t border-slate-100">
              <div className="flex items-center justify-between text-sm">
                <span className="text-slate-500">Status</span>
                <span className={`font-bold ${resume.published ? 'text-emerald-600' : 'text-amber-600'}`}>
                  {resume.published ? 'Published' : 'Draft'}
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Editor/Preview Area */}
        <div className="lg:col-span-3">
          <motion.div
            layout
            className="bg-white rounded-3xl border border-slate-200 shadow-xl overflow-hidden min-h-[600px]"
          >
            {isEditing ? (
              <textarea
                value={content}
                onChange={(e) => setContent(e.target.value)}
                className="w-full h-full min-h-[600px] p-10 font-mono text-sm leading-relaxed focus:outline-none resize-none bg-slate-50/30"
                placeholder="Write your resume in Markdown..."
              />
            ) : (
              <div className="p-12 prose prose-slate max-w-none prose-headings:font-black prose-headings:tracking-tight prose-p:text-slate-600 prose-li:text-slate-600">
                <ReactMarkdown>{content}</ReactMarkdown>
              </div>
            )}
          </motion.div>
        </div>
      </div>
    </div>
  );
}
