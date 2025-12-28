import React from 'react';
import { UserPreferences } from '../types';
import { Settings, Sun, Sunset, Coffee } from 'lucide-react';

interface PreferencesProps {
  prefs: UserPreferences;
  onUpdate: (prefs: UserPreferences) => void;
}

const Preferences: React.FC<PreferencesProps> = ({ prefs, onUpdate }) => {
  const handleChange = (key: keyof UserPreferences, value: any) => {
    onUpdate({ ...prefs, [key]: value });
  };

  return (
    <div className="bg-slate-800 rounded-xl shadow-sm border border-slate-700 p-6 transition-colors duration-200">
      <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
        <Settings className="h-5 w-5 text-indigo-500" />
        Preferences
      </h3>
      
      <div className="space-y-4">
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wide mb-1.5">Start Day</label>
            <div className="relative">
                <Sun className="absolute left-3 top-2.5 h-4 w-4 text-slate-500" />
                <input
                type="time"
                value={prefs.startOfDay}
                onChange={(e) => handleChange('startOfDay', e.target.value)}
                className="w-full pl-9 pr-2 py-2 border border-slate-600 rounded-lg text-sm focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 bg-slate-900 text-white transition-colors"
                />
            </div>
          </div>
          <div>
            <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wide mb-1.5">End Day</label>
            <div className="relative">
                <Sunset className="absolute left-3 top-2.5 h-4 w-4 text-slate-500" />
                <input
                type="time"
                value={prefs.endOfDay}
                onChange={(e) => handleChange('endOfDay', e.target.value)}
                className="w-full pl-9 pr-2 py-2 border border-slate-600 rounded-lg text-sm focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 bg-slate-900 text-white transition-colors"
                />
            </div>
          </div>
        </div>

        <div>
            <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wide mb-1.5">Peak Focus Time</label>
            <select
                value={prefs.focusPreference}
                onChange={(e) => handleChange('focusPreference', e.target.value)}
                className="w-full px-3 py-2 border border-slate-600 rounded-lg text-sm focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 bg-slate-900 text-white transition-colors"
            >
                <option value="Morning">Morning (8am - 12pm)</option>
                <option value="Afternoon">Afternoon (1pm - 5pm)</option>
                <option value="Evening">Evening (6pm - 9pm)</option>
            </select>
        </div>

        <div className="flex items-center justify-between pt-2">
            <div className="flex items-center gap-2">
                <div className="p-1.5 bg-emerald-900/30 rounded-md">
                    <Coffee className="h-4 w-4 text-emerald-400" />
                </div>
                <span className="text-sm font-medium text-slate-300">Suggest Breaks</span>
            </div>
            <label className="relative inline-flex items-center cursor-pointer">
                <input 
                    type="checkbox" 
                    checked={prefs.includeBreaks}
                    onChange={(e) => handleChange('includeBreaks', e.target.checked)}
                    className="sr-only peer" 
                />
                <div className="w-11 h-6 bg-slate-700 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-indigo-800 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-600 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-indigo-600"></div>
            </label>
        </div>
      </div>
    </div>
  );
};

export default Preferences;