import React, { useState, useEffect } from 'react';
import Header from './components/Header';
import TaskForm from './components/TaskForm';
import TaskList from './components/TaskList';
import ScheduleDisplay from './components/ScheduleDisplay';
import Preferences from './components/Preferences';
import { Task, UserPreferences, ScheduleResponse } from './types';
import { generateSchedule } from './services/geminiService';

const DEFAULT_PREFERENCES: UserPreferences = {
  startOfDay: "09:00",
  endOfDay: "17:00",
  includeBreaks: true,
  focusPreference: "Morning"
};

const App: React.FC = () => {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [preferences, setPreferences] = useState<UserPreferences>(DEFAULT_PREFERENCES);
  const [schedule, setSchedule] = useState<ScheduleResponse | null>(null);
  const [isGenerating, setIsGenerating] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Theme State
  const [theme, setTheme] = useState<'light' | 'dark'>(() => {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem('optiday_theme');
      if (saved === 'dark' || saved === 'light') return saved;
      return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
    }
    return 'light';
  });

  // Apply theme class
  useEffect(() => {
    const root = window.document.documentElement;
    if (theme === 'dark') {
      root.classList.add('dark');
    } else {
      root.classList.remove('dark');
    }
    localStorage.setItem('optiday_theme', theme);
  }, [theme]);

  const toggleTheme = () => setTheme(prev => prev === 'light' ? 'dark' : 'light');

  // Load from local storage on mount
  useEffect(() => {
    const savedTasks = localStorage.getItem('optiday_tasks');
    const savedPrefs = localStorage.getItem('optiday_prefs');
    
    if (savedTasks) setTasks(JSON.parse(savedTasks));
    if (savedPrefs) setPreferences(JSON.parse(savedPrefs));
  }, []);

  // Save to local storage on change
  useEffect(() => {
    localStorage.setItem('optiday_tasks', JSON.stringify(tasks));
  }, [tasks]);

  useEffect(() => {
    localStorage.setItem('optiday_prefs', JSON.stringify(preferences));
  }, [preferences]);

  const handleAddTask = (task: Task) => {
    setTasks(prev => [...prev, task]);
    // Invalidate schedule if tasks change
    if (schedule) setSchedule(null); 
  };

  const handleToggleTask = (id: string) => {
    setTasks(prev => prev.map(t => 
      t.id === id ? { ...t, isCompleted: !t.isCompleted } : t
    ));
  };

  const handleDeleteTask = (id: string) => {
    setTasks(prev => prev.filter(t => t.id !== id));
    if (schedule) setSchedule(null);
  };

  const handleGenerateSchedule = async () => {
    setIsGenerating(true);
    setError(null);
    try {
      const pendingTasks = tasks.filter(t => !t.isCompleted);
      if (pendingTasks.length === 0) {
          setError("Please add or uncheck some tasks first.");
          setIsGenerating(false);
          return;
      }
      const result = await generateSchedule(tasks, preferences);
      setSchedule(result);
    } catch (err: any) {
      console.error(err);
      setError(err.message || "Failed to generate schedule. Please try again.");
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 flex flex-col font-sans transition-colors duration-200">
      <Header theme={theme} onToggleTheme={toggleTheme} />
      
      <main className="flex-grow max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8">
        
        {error && (
            <div className="mb-6 bg-red-50 dark:bg-red-900/20 border-l-4 border-red-500 p-4 rounded-r-lg flex items-center justify-between">
                <div className="flex">
                    <div className="flex-shrink-0">
                        <svg className="h-5 w-5 text-red-400" viewBox="0 0 20 20" fill="currentColor">
                            <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                        </svg>
                    </div>
                    <div className="ml-3">
                        <p className="text-sm text-red-700 dark:text-red-300">{error}</p>
                    </div>
                </div>
                <button onClick={() => setError(null)} className="text-red-500 hover:text-red-700 dark:hover:text-red-300">
                    <span className="sr-only">Close</span>
                    <svg className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                        <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
                    </svg>
                </button>
            </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          {/* Left Column: Tasks & Preferences */}
          <div className="lg:col-span-4 space-y-8">
            <section>
                <TaskForm onAddTask={handleAddTask} />
            </section>
            
            <section>
                <TaskList 
                    tasks={tasks} 
                    onToggleTask={handleToggleTask} 
                    onDeleteTask={handleDeleteTask} 
                />
            </section>

             <section>
                <Preferences prefs={preferences} onUpdate={setPreferences} />
            </section>
          </div>

          {/* Right Column: AI Schedule */}
          <div className="lg:col-span-8">
             <ScheduleDisplay 
                scheduleData={schedule} 
                isLoading={isGenerating} 
                onGenerate={handleGenerateSchedule}
                hasTasks={tasks.some(t => !t.isCompleted)}
             />
          </div>
        </div>
      </main>

      <footer className="bg-white dark:bg-slate-900 border-t border-slate-200 dark:border-slate-800 mt-12 py-6 transition-colors duration-200">
          <div className="max-w-7xl mx-auto px-4 text-center text-slate-400 dark:text-slate-500 text-sm">
              &copy; {new Date().getFullYear()} OptiDay AI. Optimized for productivity.
          </div>
      </footer>
    </div>
  );
};

export default App;