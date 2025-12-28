import React from 'react';
import { Sparkles, Brain, MessageSquare } from 'lucide-react';

interface HeaderProps {
  onToggleChat?: () => void;
  isChatOpen?: boolean;
}

const Header: React.FC<HeaderProps> = ({ onToggleChat, isChatOpen }) => {
  return (
    <header className="bg-slate-900 border-b border-slate-800 sticky top-0 z-50 h-16 transition-colors duration-300">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-full">
        <div className="flex justify-between items-center h-full">
          <div className="flex items-center gap-3">
            {/* Logo */}
            <div className="relative flex items-center justify-center w-10 h-10 rounded-full bg-gradient-to-tr from-teal-400 to-indigo-500 shadow-lg shadow-indigo-500/20 ring-1 ring-white/10">
              <Brain className="h-6 w-6 text-white stroke-[2.5]" />
            </div>
            {/* Brand Name */}
            <div>
              <h1 className="text-2xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-teal-100 to-indigo-100 tracking-tight">OptiDay</h1>
            </div>
          </div>
          <div className="flex items-center gap-4">
             <div className="hidden sm:flex items-center gap-1.5 text-xs font-medium text-slate-400 bg-slate-800/50 px-3 py-1.5 rounded-full border border-slate-700/50">
                <Sparkles className="h-3.5 w-3.5 text-indigo-400" />
                <span>AI Powered</span>
             </div>
             {onToggleChat && (
               <button 
                 onClick={onToggleChat}
                 className={`p-2 rounded-lg transition-all duration-200 border border-transparent ${
                   isChatOpen 
                     ? 'bg-indigo-600 text-white shadow-md' 
                     : 'text-slate-400 hover:text-white hover:bg-slate-800 hover:border-slate-700'
                 }`}
                 title="Toggle AI Assistant"
                 aria-label="Toggle AI Assistant"
               >
                 <MessageSquare className="h-5 w-5" />
               </button>
             )}
          </div>
        </div>
      </div>
    </header>
  );
};

export default Header;