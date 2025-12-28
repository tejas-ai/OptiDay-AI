import React from 'react';
import { Task, Priority } from '../types';
import { CheckCircle2, Circle, Clock, Trash2 } from 'lucide-react';

interface TaskListProps {
  tasks: Task[];
  onToggleTask: (id: string) => void;
  onDeleteTask: (id: string) => void;
}

const TaskList: React.FC<TaskListProps> = ({ tasks, onToggleTask, onDeleteTask }) => {
  const getPriorityColor = (p: Priority) => {
    switch (p) {
      case Priority.HIGH: return 'text-red-400 bg-red-900/30 border-red-800/50';
      case Priority.MEDIUM: return 'text-amber-400 bg-amber-900/30 border-amber-800/50';
      case Priority.LOW: return 'text-emerald-400 bg-emerald-900/30 border-emerald-800/50';
    }
  };

  const formatDuration = (minutes: number) => {
    if (minutes < 60) return `${minutes}m`;
    if (minutes === 60) return '1h';
    if (minutes < 1440) {
        const h = Math.floor(minutes / 60);
        const m = minutes % 60;
        return m > 0 ? `${h}h ${m}m` : `${h}h`;
    }
    const d = Math.floor(minutes / 1440);
    const remainingMins = minutes % 1440;
    const h = Math.floor(remainingMins / 60);
    const m = remainingMins % 60;
    
    let str = `${d}d`;
    if (h > 0) str += ` ${h}h`;
    if (m > 0) str += ` ${m}m`;
    return str;
  };

  if (tasks.length === 0) {
    return (
      <div className="text-center py-12 px-4 border-2 border-dashed border-slate-700 rounded-xl transition-colors duration-200">
        <p className="text-slate-400 text-sm">No tasks yet. Add some tasks to generate your schedule.</p>
      </div>
    );
  }

  return (
    <div className="space-y-3">
        <div className="flex justify-between items-center mb-2">
            <h3 className="text-lg font-semibold text-white">Your Task List</h3>
            <span className="text-xs text-slate-400 font-medium bg-slate-800 px-2 py-1 rounded-full">{tasks.length} tasks</span>
        </div>
      {tasks.map((task) => (
        <div
          key={task.id}
          className={`group flex items-center justify-between p-4 rounded-lg border transition-all duration-200 ${
            task.isCompleted 
              ? 'bg-slate-900 border-slate-800 opacity-60' 
              : 'bg-slate-800 border-slate-700 hover:border-indigo-500/50 hover:shadow-sm'
          }`}
        >
          <div className="flex items-center gap-3 flex-1 min-w-0">
            <button
              onClick={() => onToggleTask(task.id)}
              className={`flex-shrink-0 transition-colors ${task.isCompleted ? 'text-indigo-400' : 'text-slate-600 hover:text-indigo-400'}`}
            >
              {task.isCompleted ? <CheckCircle2 className="h-6 w-6" /> : <Circle className="h-6 w-6" />}
            </button>
            <div className="flex-1 min-w-0">
              <p className={`font-medium truncate ${task.isCompleted ? 'text-slate-500 line-through' : 'text-slate-100'}`}>
                {task.title}
              </p>
              <div className="flex items-center gap-3 mt-1">
                <span className={`text-xs px-2 py-0.5 rounded-full border ${getPriorityColor(task.priority)}`}>
                  {task.priority}
                </span>
                <span className="flex items-center gap-1 text-xs text-slate-400">
                  <Clock className="h-3 w-3" />
                  {formatDuration(task.duration)}
                </span>
              </div>
            </div>
          </div>
          <button
            onClick={() => onDeleteTask(task.id)}
            className="ml-3 text-slate-600 hover:text-red-400 transition-colors opacity-0 group-hover:opacity-100 focus:opacity-100"
            aria-label="Delete task"
          >
            <Trash2 className="h-5 w-5" />
          </button>
        </div>
      ))}
    </div>
  );
};

export default TaskList;