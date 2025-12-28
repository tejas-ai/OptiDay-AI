import React, { useEffect, useState } from 'react';
import { Key, AlertTriangle } from 'lucide-react';

const ApiKeyManager: React.FC = () => {
  const [needsKey, setNeedsKey] = useState(false);

  useEffect(() => {
    const checkKey = async () => {
      const win = window as any;
      if (win.aistudio && win.aistudio.hasSelectedApiKey) {
        const hasKey = await win.aistudio.hasSelectedApiKey();
        if (!hasKey) {
          setNeedsKey(true);
        }
      }
    };
    checkKey();
  }, []);

  const handleSelectKey = async () => {
    const win = window as any;
    if (win.aistudio && win.aistudio.openSelectKey) {
      await win.aistudio.openSelectKey();
      // Assume success and hide banner, or re-check
      const hasKey = await win.aistudio.hasSelectedApiKey();
      if (hasKey) {
        setNeedsKey(false);
      }
    }
  };

  if (!needsKey) return null;

  return (
    <div className="bg-indigo-900/40 border-b border-indigo-500/30 p-4 sticky top-16 z-10 backdrop-blur-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="bg-indigo-500/20 p-2 rounded-lg">
             <Key className="h-5 w-5 text-indigo-300" />
          </div>
          <div>
            <h3 className="font-semibold text-white text-sm">API Key Required</h3>
            <p className="text-indigo-200 text-xs mt-0.5">
              To use advanced AI features like Image Generation and Pro models, please select a valid API key.
            </p>
          </div>
        </div>
        <button
          onClick={handleSelectKey}
          className="w-full sm:w-auto px-4 py-2 bg-indigo-600 hover:bg-indigo-500 text-white text-sm font-medium rounded-lg transition-colors shadow-sm whitespace-nowrap"
        >
          Select API Key
        </button>
      </div>
    </div>
  );
};

export default ApiKeyManager;