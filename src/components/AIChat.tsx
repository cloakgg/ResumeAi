import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Send, Bot, User, Sparkles, Loader2, Wand2, CheckCircle2, ChevronRight } from 'lucide-react';
import { generateResume } from '../lib/gemini';
import { db, auth } from '../lib/firebase';
import { collection, addDoc, serverTimestamp } from 'firebase/firestore';
import { Resume } from '../types';

const PRESET_QUESTIONS = [
  {
    id: 'role',
    question: "What's your current or target job title?",
    options: ['Software Engineer', 'Product Designer', 'Marketing Manager', 'Sales Representative', 'Data Analyst', 'Other']
  },
  {
    id: 'experience',
    question: "How many years of experience do you have?",
    options: ['Entry Level (0-2)', 'Mid Level (3-5)', 'Senior (5-10)', 'Expert (10+)']
  },
  {
    id: 'industry',
    question: "Which industry are you focusing on?",
    options: ['Technology', 'Healthcare', 'Finance', 'Education', 'Creative Arts', 'Other']
  }
];

export default function AIChat({ onGenerated }: { onGenerated: (resume: Resume) => void }) {
  const [step, setStep] = useState(0);
  const [answers, setAnswers] = useState<Record<string, string>>({});
  const [messages, setMessages] = useState<{ role: 'user' | 'model'; text: string }[]>([
    { role: 'model', text: "Hi! I'm your AI Resume Assistant. Let's build your perfect resume. I'll start with a few quick questions to get the basics right." }
  ]);
  const [input, setInput] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [isGenerating, setIsGenerating] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages]);

  const handleOptionSelect = (option: string) => {
    const currentQ = PRESET_QUESTIONS[step];
    const newAnswers = { ...answers, [currentQ.id]: option };
    setAnswers(newAnswers);
    
    setMessages(prev => [
      ...prev, 
      { role: 'user', text: option }
    ]);

    if (step < PRESET_QUESTIONS.length - 1) {
      setStep(step + 1);
      setMessages(prev => [
        ...prev,
        { role: 'model', text: PRESET_QUESTIONS[step + 1].question }
      ]);
    } else {
      setStep(PRESET_QUESTIONS.length);
      setMessages(prev => [
        ...prev,
        { role: 'model', text: "Great! I've got the basics. Is there anything specific you'd like to highlight in your resume? (e.g., specific projects, awards, or skills)" }
      ]);
    }
  };

  const handleSend = async () => {
    if (!input.trim() || isTyping) return;

    const userMessage = input.trim();
    setInput('');
    setMessages(prev => [...prev, { role: 'user', text: userMessage }]);
    setIsTyping(true);

    try {
      const { GoogleGenAI } = await import("@google/genai");
      const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY! });
      const chat = ai.models.generateContent({
        model: "gemini-3-flash-preview",
        contents: [
          ...messages.map(m => ({ role: m.role, parts: [{ text: m.text }] })),
          { role: 'user', parts: [{ text: userMessage }] }
        ],
        config: {
          systemInstruction: "You are a helpful AI assistant that helps users build their resumes. You have already gathered some basic info. Now, help the user refine their details. Once you have enough info, tell them you are ready to generate the resume and include the keyword 'GENERATE_NOW'.",
        }
      });

      const result = await chat;
      const aiText = result.text || "I'm sorry, I couldn't process that.";
      
      setMessages(prev => [...prev, { role: 'model', text: aiText }]);
    } catch (error) {
      console.error("Chat error", error);
      setMessages(prev => [...prev, { role: 'model', text: "Oops, something went wrong. Let's try again." }]);
    } finally {
      setIsTyping(false);
    }
  };

  const handleGenerate = async () => {
    setIsGenerating(true);
    try {
      const history = messages.map(m => ({ role: m.role, parts: [{ text: m.text }] }));
      const content = await generateResume(history);
      
      const resumeData = {
        userId: auth.currentUser?.uid,
        content: content || '',
        category: answers.industry || 'General',
        published: false,
        stars: 0,
        reviewCount: 0,
        createdAt: serverTimestamp(),
      };

      const docRef = await addDoc(collection(db, 'resumes'), resumeData);
      onGenerated({ id: docRef.id, ...resumeData } as Resume);
    } catch (error) {
      console.error("Generation error", error);
    } finally {
      setIsGenerating(false);
    }
  };

  const showGenerateButton = messages.some(m => m.text.includes('GENERATE_NOW') || m.text.toLowerCase().includes('ready to generate')) || step >= PRESET_QUESTIONS.length;

  return (
    <div className="max-w-3xl mx-auto h-[calc(100vh-180px)] flex flex-col bg-white rounded-[2rem] border border-slate-200 shadow-xl overflow-hidden">
      {/* Header */}
      <div className="px-8 py-6 border-b border-slate-100 flex items-center justify-between bg-slate-50/50">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-blue-600 rounded-xl flex items-center justify-center text-white shadow-lg shadow-blue-100">
            <Bot size={24} />
          </div>
          <div>
            <h2 className="font-bold text-slate-800">AI Resume Assistant</h2>
            <p className="text-xs text-slate-500 flex items-center gap-1">
              <span className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse" />
              Structured Flow Active
            </p>
          </div>
        </div>
        {showGenerateButton && (
          <button
            onClick={handleGenerate}
            disabled={isGenerating}
            className="bg-emerald-600 text-white px-4 py-2 rounded-xl text-sm font-bold hover:bg-emerald-700 transition-all flex items-center gap-2 shadow-lg shadow-emerald-100 disabled:opacity-50"
          >
            {isGenerating ? <Loader2 className="animate-spin" size={16} /> : <Wand2 size={16} />}
            Generate Resume
          </button>
        )}
      </div>

      {/* Messages */}
      <div 
        ref={scrollRef}
        className="flex-1 overflow-y-auto p-8 space-y-6 scroll-smooth"
      >
        <AnimatePresence initial={false}>
          {messages.map((msg, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 10, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
            >
              <div className={`flex gap-3 max-w-[85%] ${msg.role === 'user' ? 'flex-row-reverse' : ''}`}>
                <div className={`w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 ${msg.role === 'user' ? 'bg-blue-100 text-blue-600' : 'bg-slate-100 text-slate-600'}`}>
                  {msg.role === 'user' ? <User size={16} /> : <Bot size={16} />}
                </div>
                <div className={`p-4 rounded-2xl text-sm leading-relaxed ${
                  msg.role === 'user' 
                    ? 'bg-blue-600 text-white rounded-tr-none shadow-md' 
                    : 'bg-slate-50 text-slate-700 border border-slate-100 rounded-tl-none'
                }`}>
                  {msg.text.replace('GENERATE_NOW', '')}
                </div>
              </div>
            </motion.div>
          ))}
          {isTyping && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="flex justify-start"
            >
              <div className="bg-slate-50 border border-slate-100 p-4 rounded-2xl rounded-tl-none flex gap-1">
                <span className="w-1.5 h-1.5 bg-slate-300 rounded-full animate-bounce" />
                <span className="w-1.5 h-1.5 bg-slate-300 rounded-full animate-bounce [animation-delay:0.2s]" />
                <span className="w-1.5 h-1.5 bg-slate-300 rounded-full animate-bounce [animation-delay:0.4s]" />
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Options/Input */}
      <div className="p-6 bg-slate-50/50 border-t border-slate-100">
        {step < PRESET_QUESTIONS.length ? (
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
            {PRESET_QUESTIONS[step].options.map((option) => (
              <button
                key={option}
                onClick={() => handleOptionSelect(option)}
                className="bg-white border border-slate-200 p-3 rounded-xl text-sm font-semibold text-slate-700 hover:border-blue-500 hover:text-blue-600 hover:bg-blue-50 transition-all flex items-center justify-between group"
              >
                {option}
                <ChevronRight size={14} className="opacity-0 group-hover:opacity-100 transition-opacity" />
              </button>
            ))}
          </div>
        ) : (
          <div className="relative flex items-center">
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleSend()}
              placeholder="Type more details or click Generate..."
              className="w-full bg-white border border-slate-200 rounded-2xl px-6 py-4 pr-14 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all shadow-sm"
            />
            <button
              onClick={handleSend}
              disabled={!input.trim() || isTyping}
              className="absolute right-2 p-3 bg-blue-600 text-white rounded-xl hover:bg-blue-700 transition-all disabled:opacity-50 disabled:bg-slate-300"
            >
              <Send size={20} />
            </button>
          </div>
        )}
        <p className="text-[10px] text-slate-400 text-center mt-3 uppercase tracking-widest font-bold">
          {step < PRESET_QUESTIONS.length ? 'Select an option to continue' : 'Powered by Gemini AI'}
        </p>
      </div>
    </div>
  );
}

