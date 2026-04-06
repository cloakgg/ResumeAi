import { GoogleGenAI } from "@google/genai";

const getAI = () => {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) throw new Error("GEMINI_API_KEY is not set");
  return new GoogleGenAI({ apiKey });
};

export const generateResume = async (chatHistory: { role: string; parts: { text: string }[] }[]) => {
  const ai = getAI();
  const model = "gemini-3-flash-preview";
  
  const response = await ai.models.generateContent({
    model,
    contents: [
      ...chatHistory,
      { role: "user", parts: [{ text: "Based on our conversation, please generate a professional resume in Markdown format. Include sections for Summary, Experience, Education, and Skills. Make it look clean and professional." }] }
    ],
    config: {
      systemInstruction: "You are an expert resume builder. Your goal is to gather information from the user and then generate a high-quality resume. Be professional, encouraging, and concise.",
    }
  });

  return response.text;
};

export const analyzeResume = async (resumeContent: string) => {
  const ai = getAI();
  const model = "gemini-3-flash-preview";
  
  const response = await ai.models.generateContent({
    model,
    contents: `Analyze this resume and provide 3 key strengths and 3 areas for improvement. Format as Markdown.\n\nResume:\n${resumeContent}`,
    config: {
      systemInstruction: "You are a senior recruiter analyzing resumes. Be critical but constructive.",
    }
  });

  return response.text;
};

export const chatWithAI = async (message: string, history: any[]) => {
  const ai = getAI();
  const chat = ai.chats.create({
    model: "gemini-3-flash-preview",
    config: {
      systemInstruction: "You are a helpful AI assistant that helps users build their resumes. Ask one question at a time about their background, experience, and goals. Once you have enough info, tell them you are ready to generate the resume.",
    }
  });

  // Note: sendMessage only accepts message string, not full history in this simplified helper
  // For real history, we'd need to manage it carefully.
  const response = await chat.sendMessage({ message });
  return response.text;
};
