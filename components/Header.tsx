import React from 'react';
import { Sparkles, CalendarClock, MessageSquare } from 'lucide-react';

interface HeaderProps {
  onToggleChat?: () => void;
  isChatOpen?: boolean;
}

const Header: React.FC<HeaderProps> = ({ onToggleChat, isChatOpen }) => {
  return (
    <header className="bg-slate-900 border-b border-slate-800 sticky top-0 z-50 h-16">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-full">
        <div className="flex justify-between items-center h-full">
          <div className="flex items-center gap-2">
            <div className="bg-indigo-600 p-2 rounded-lg shadow-sm">
              <CalendarClock className="h-6 w-6 text-white" />
            </div>
            <div>
              <h1 className="text-xl font-bold text-white tracking-tight">OptiDay AI</h1>
              <p className="text-xs text-slate-400 font-medium hidden sm:block">Intelligent Daily Scheduling</p>
            </div>
          </div>
          <div className="flex items-center gap-4">
             <div className="hidden sm:flex items-center gap-1 text-sm font-medium text-indigo-400 bg-indigo-900/30 px-3 py-1.5 rounded-full border border-indigo-800/50">
                <Sparkles className="h-4 w-4" />
                <span>Powered by Gemini</span>
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