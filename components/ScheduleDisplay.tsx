import React from 'react';
import { ScheduleResponse } from '../types';
import { Play, Coffee, Brain } from 'lucide-react';

interface ScheduleDisplayProps {
  scheduleData: ScheduleResponse | null;
  isLoading: boolean;
  onGenerate: () => void;
  hasTasks: boolean;
}

const ScheduleDisplay: React.FC<ScheduleDisplayProps> = ({ scheduleData, isLoading, onGenerate, hasTasks }) => {
  if (isLoading) {
    return (
      <div className="h-full flex flex-col items-center justify-center p-8 text-center min-h-[400px]">
        <div className="relative w-16 h-16 mb-6">
          <div className="absolute top-0 left-0 w-full h-full border-4 border-indigo-100 dark:border-indigo-900/30 rounded-full"></div>
          <div className="absolute top-0 left-0 w-full h-full border-4 border-indigo-600 rounded-full border-t-transparent animate-spin"></div>
        </div>
        <h3 className="text-xl font-semibold text-slate-800 dark:text-white mb-2">Optimizing Your Day</h3>
        <p className="text-slate-500 dark:text-slate-400 max-w-xs mx-auto">Analyzing priorities, energy levels, and durations to build the perfect schedule...</p>
      </div>
    );
  }

  if (!scheduleData) {
    return (
      <div className="h-full flex flex-col items-center justify-center p-8 text-center min-h-[400px] bg-indigo-50/50 dark:bg-indigo-900/10 rounded-xl border-2 border-dashed border-indigo-100 dark:border-indigo-800/50 transition-colors duration-200">
        <Brain className="h-12 w-12 text-indigo-300 dark:text-indigo-600 mb-4" />
        <h3 className="text-lg font-semibold text-indigo-900 dark:text-indigo-200 mb-2">Ready to Organize?</h3>
        <p className="text-indigo-600/70 dark:text-indigo-400/80 max-w-sm mx-auto mb-6">
          Add your tasks and let AI construct a personalized schedule tailored to your energy flow.
        </p>
        <button
          onClick={onGenerate}
          disabled={!hasTasks}
          className={`px-6 py-3 rounded-lg font-medium shadow-md transition-all flex items-center gap-2 ${
            hasTasks 
            ? 'bg-indigo-600 hover:bg-indigo-700 text-white hover:shadow-lg' 
            : 'bg-indigo-300 dark:bg-indigo-800 text-white cursor-not-allowed'
          }`}
        >
          <Play className="h-5 w-5 fill-current" />
          Generate Optimal Schedule
        </button>
      </div>
    );
  }

  return (
    <div className="bg-white dark:bg-slate-800 rounded-xl shadow-lg border border-slate-100 dark:border-slate-700 overflow-hidden transition-colors duration-200">
      <div className="bg-slate-900 dark:bg-slate-950 text-white p-6">
        <div className="flex items-start justify-between">
          <div>
            <h2 className="text-2xl font-bold mb-2">Your Daily Blueprint</h2>
            <p className="text-indigo-200 text-sm leading-relaxed max-w-2xl">
              {scheduleData.dailySummary}
            </p>
          </div>
          <button 
            onClick={onGenerate}
            className="text-xs bg-indigo-600 hover:bg-indigo-500 text-white px-3 py-1.5 rounded-full transition-colors font-medium whitespace-nowrap"
          >
            Regenerate
          </button>
        </div>
      </div>

      <div className="p-6">
        <div className="relative pl-8 space-y-8 before:content-[''] before:absolute before:left-[19px] before:top-2 before:bottom-4 before:w-0.5 before:bg-slate-200 dark:before:bg-slate-700">
          {scheduleData.schedule.map((item, index) => (
            <div key={index} className="relative group">
              {/* Timeline dot */}
              <div className={`absolute -left-[23px] top-1.5 h-3 w-3 rounded-full border-2 bg-white dark:bg-slate-800 z-10 
                ${item.type === 'break' ? 'border-emerald-500' : 'border-indigo-600 dark:border-indigo-500'}`}></div>
              
              <div className="flex flex-col sm:flex-row sm:items-start gap-4">
                <div className="min-w-[100px] flex-shrink-0">
                  <div className="font-mono text-sm font-bold text-slate-900 dark:text-slate-200">
                    {item.startTime} - {item.endTime}
                  </div>
                  <div className="text-xs text-slate-500 dark:text-slate-400 mt-0.5 font-medium">{item.durationMinutes} min</div>
                </div>

                <div className={`flex-1 rounded-lg p-4 border transition-all hover:shadow-md ${
                  item.type === 'break' 
                    ? 'bg-emerald-50 dark:bg-emerald-900/10 border-emerald-100 dark:border-emerald-800/30' 
                    : item.type === 'routine'
                    ? 'bg-amber-50 dark:bg-amber-900/10 border-amber-100 dark:border-amber-800/30'
                    : 'bg-white dark:bg-slate-800/50 border-slate-200 dark:border-slate-700'
                }`}>
                  <div className="flex items-start justify-between gap-4">
                    <div>
                      <h4 className={`font-semibold text-lg ${
                        item.type === 'break' ? 'text-emerald-800 dark:text-emerald-400' : 'text-slate-800 dark:text-slate-100'
                      }`}>
                        {item.type === 'break' && <Coffee className="inline-block h-5 w-5 mr-2 -mt-1" />}
                        {item.activity}
                      </h4>
                      <p className={`text-sm mt-1 ${
                        item.type === 'break' ? 'text-emerald-600 dark:text-emerald-400/80' : 'text-slate-500 dark:text-slate-400'
                      }`}>
                        {item.reason}
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
        
        <div className="mt-8 pt-6 border-t border-slate-100 dark:border-slate-800 text-center">
            <p className="text-sm text-slate-400 dark:text-slate-500 italic">"The key is not to prioritize what's on your schedule, but to schedule your priorities."</p>
        </div>
      </div>
    </div>
  );
};

export default ScheduleDisplay;