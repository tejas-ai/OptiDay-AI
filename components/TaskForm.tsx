import React, { useState } from 'react';
import { Plus, Clock, AlertCircle } from 'lucide-react';
import { Task, Priority } from '../types';

interface TaskFormProps {
  onAddTask: (task: Task) => void;
}

type DurationUnit = 'minutes' | 'hours' | 'days';

const TaskForm: React.FC<TaskFormProps> = ({ onAddTask }) => {
  const [title, setTitle] = useState('');
  const [durationValue, setDurationValue] = useState<number>(30);
  const [durationUnit, setDurationUnit] = useState<DurationUnit>('minutes');
  const [priority, setPriority] = useState<Priority>(Priority.MEDIUM);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) return;

    let calculatedDurationInMinutes = durationValue;
    if (durationUnit === 'hours') {
        calculatedDurationInMinutes = durationValue * 60;
    } else if (durationUnit === 'days') {
        // Converting days to minutes (1 day = 24 hours)
        calculatedDurationInMinutes = durationValue * 24 * 60;
    }

    // Ensure integer minutes for cleaner data, though decimals work too
    calculatedDurationInMinutes = Math.round(calculatedDurationInMinutes);

    const newTask: Task = {
      id: crypto.randomUUID(),
      title,
      duration: calculatedDurationInMinutes,
      priority,
      isCompleted: false,
    };

    onAddTask(newTask);
    setTitle('');
    setDurationValue(30);
    setDurationUnit('minutes');
    setPriority(Priority.MEDIUM);
  };

  return (
    <div className="bg-white dark:bg-slate-800 rounded-xl shadow-sm border border-slate-200 dark:border-slate-700 p-6 mb-6 transition-colors duration-200">
      <h3 className="text-lg font-semibold text-slate-800 dark:text-white mb-4 flex items-center gap-2">
        <Plus className="h-5 w-5 text-indigo-500" />
        Add New Task
      </h3>
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label htmlFor="title" className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Task Description</label>
          <input
            type="text"
            id="title"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="e.g., Review Q3 Marketing Report"
            className="w-full px-4 py-2 border border-slate-300 dark:border-slate-600 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 dark:bg-slate-900 dark:text-white dark:placeholder-slate-500 transition-colors"
            required
          />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label htmlFor="duration" className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Duration</label>
            <div className="flex rounded-lg shadow-sm">
                <div className="relative flex-grow focus-within:z-10">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                        <Clock className="h-4 w-4 text-slate-400 dark:text-slate-500" />
                    </div>
                    <input
                        type="number"
                        id="duration"
                        min="0.1"
                        step="0.1"
                        value={durationValue}
                        onChange={(e) => setDurationValue(Number(e.target.value))}
                        className="w-full pl-10 pr-4 py-2 border border-slate-300 dark:border-slate-600 rounded-l-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 dark:bg-slate-900 dark:text-white transition-colors"
                    />
                </div>
                <div className="-ml-px relative">
                     <select
                        value={durationUnit}
                        onChange={(e) => setDurationUnit(e.target.value as DurationUnit)}
                        className="h-full pl-3 pr-8 py-2 border border-slate-300 dark:border-slate-600 rounded-r-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 bg-slate-50 dark:bg-slate-800 text-slate-700 dark:text-slate-300 text-sm transition-colors border-l-0"
                    >
                        <option value="minutes">Mins</option>
                        <option value="hours">Hours</option>
                        <option value="days">Days</option>
                    </select>
                </div>
            </div>
          </div>

          <div>
            <label htmlFor="priority" className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Priority</label>
            <div className="relative">
              <AlertCircle className="absolute left-3 top-2.5 h-4 w-4 text-slate-400 dark:text-slate-500" />
              <select
                id="priority"
                value={priority}
                onChange={(e) => setPriority(e.target.value as Priority)}
                className="w-full pl-10 pr-4 py-2 border border-slate-300 dark:border-slate-600 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 bg-white dark:bg-slate-900 dark:text-white transition-colors"
              >
                <option value={Priority.HIGH}>High Priority</option>
                <option value={Priority.MEDIUM}>Medium Priority</option>
                <option value={Priority.LOW}>Low Priority</option>
              </select>
            </div>
          </div>
        </div>

        <button
          type="submit"
          className="w-full bg-slate-900 hover:bg-slate-800 dark:bg-indigo-600 dark:hover:bg-indigo-500 text-white font-medium py-2.5 rounded-lg transition-colors flex items-center justify-center gap-2"
        >
          <Plus className="h-4 w-4" />
          Add to List
        </button>
      </form>
    </div>
  );
};

export default TaskForm;