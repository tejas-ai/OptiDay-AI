import React, { useState, useEffect, useRef } from 'react';
import { Send, ExternalLink, Loader2, Sparkles, X } from 'lucide-react';
import { chatWithAI } from '../services/geminiService';
import { ChatMessage } from '../types';

interface ChatAssistantProps {
  isOpen: boolean;
  onClose: () => void;
}

const ChatAssistant: React.FC<ChatAssistantProps> = ({ isOpen, onClose }) => {
  const [messages, setMessages] = useState<ChatMessage[]>([
    { role: 'model', text: 'Hi! I can help you plan, prioritize, or answer questions.' }
  ]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    if (isOpen) {
        // Small delay to allow transition to start/finish slightly
        setTimeout(scrollToBottom, 300);
    }
  }, [messages, isOpen]);

  const handleSend = async () => {
    if (!input.trim()) return;

    const userMsg = { role: 'user' as const, text: input };
    setMessages(prev => [...prev, userMsg]);
    setInput('');
    setIsLoading(true);

    try {
      // Convert history for API
      const history = messages.map(m => ({
        role: m.role,
        parts: [{ text: m.text }]
      }));

      const response = await chatWithAI(history, userMsg.text);
      
      setMessages(prev => [...prev, {
        role: 'model',
        text: response.text || "I'm sorry, I couldn't generate a response.",
        groundingUrls: response.urls
      }]);
    } catch (error) {
      console.error(error);
      setMessages(prev => [...prev, { role: 'model', text: "Sorry, I encountered an error. Please try again." }]);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className={`fixed top-16 left-0 z-40 h-[calc(100vh-4rem)] w-full sm:w-96 bg-slate-900/95 backdrop-blur-md border-r border-slate-800 shadow-2xl flex flex-col transition-transform duration-300 ease-in-out ${isOpen ? 'translate-x-0' : '-translate-x-full'}`}>
        
        {/* Header */}
        <div className="p-4 border-b border-slate-700 flex items-center justify-between bg-slate-900/50">
            <div className="flex items-center gap-2">
                <div className="p-1.5 bg-indigo-900/50 rounded-lg border border-indigo-500/30">
                    <Sparkles className="h-4 w-4 text-indigo-400" />
                </div>
                <h3 className="font-semibold text-white text-sm">AI Assistant</h3>
            </div>
            <button 
                onClick={onClose}
                className="p-1 hover:bg-slate-800 rounded-full text-slate-400 hover:text-white transition-colors"
            >
                <X className="h-5 w-5" />
            </button>
        </div>

        {/* Messages */}
        <div className="flex-1 overflow-y-auto p-4 space-y-4 min-h-0 scrollbar-thin scrollbar-thumb-slate-700 scrollbar-track-transparent">
          {messages.map((msg, idx) => (
            <div key={idx} className={`flex flex-col ${msg.role === 'user' ? 'items-end' : 'items-start'}`}>
              <div className={`max-w-[90%] rounded-2xl px-4 py-2.5 text-sm leading-relaxed ${
                msg.role === 'user' 
                  ? 'bg-indigo-600 text-white rounded-br-sm' 
                  : 'bg-slate-800 border border-slate-700 text-slate-200 rounded-bl-sm'
              }`}>
                {msg.text}
              </div>
              {msg.groundingUrls && msg.groundingUrls.length > 0 && (
                <div className="mt-2 flex flex-wrap gap-2">
                  {msg.groundingUrls.map((url, uIdx) => (
                    <a 
                      key={uIdx} 
                      href={url} 
                      target="_blank" 
                      rel="noopener noreferrer"
                      className="text-xs flex items-center gap-1 text-indigo-400 hover:text-indigo-300 bg-indigo-900/30 px-2 py-1 rounded border border-indigo-800/50"
                    >
                      <ExternalLink className="h-3 w-3" />
                      Source
                    </a>
                  ))}
                </div>
              )}
            </div>
          ))}
          {isLoading && (
             <div className="flex justify-start">
               <div className="bg-slate-800 border border-slate-700 rounded-2xl rounded-bl-sm px-4 py-2.5">
                 <Loader2 className="h-4 w-4 animate-spin text-slate-400" />
               </div>
             </div>
          )}
          <div ref={messagesEndRef} />
        </div>

        {/* Input */}
        <div className="p-4 border-t border-slate-700 bg-slate-900/50">
          <div className="flex gap-2">
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleSend()}
              placeholder="Ask a question..."
              className="flex-1 bg-slate-800 border border-slate-700 text-white rounded-xl px-4 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-indigo-500 transition-colors"
            />
            <button 
              onClick={handleSend}
              disabled={isLoading || !input.trim()}
              className="p-2 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl disabled:opacity-50 disabled:cursor-not-allowed transition-colors shadow-lg shadow-indigo-900/20"
            >
              <Send className="h-4 w-4" />
            </button>
          </div>
        </div>
      </div>
  );
};

export default ChatAssistant;