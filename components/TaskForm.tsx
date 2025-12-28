import React, { useState, useRef } from 'react';
import { Plus, Clock, AlertCircle, Mic, MicOff, Loader2 } from 'lucide-react';
import { Task, Priority } from '../types';
import { transcribeAudio } from '../services/geminiService';

interface TaskFormProps {
  onAddTask: (task: Task) => void;
}

type DurationUnit = 'minutes' | 'hours' | 'days';

const TaskForm: React.FC<TaskFormProps> = ({ onAddTask }) => {
  const [title, setTitle] = useState('');
  const [durationValue, setDurationValue] = useState<number>(30);
  const [durationUnit, setDurationUnit] = useState<DurationUnit>('minutes');
  const [priority, setPriority] = useState<Priority>(Priority.MEDIUM);
  const [isRecording, setIsRecording] = useState(false);
  const [isTranscribing, setIsTranscribing] = useState(false);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);

  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const mediaRecorder = new MediaRecorder(stream);
      mediaRecorderRef.current = mediaRecorder;
      const audioChunks: BlobPart[] = [];

      mediaRecorder.ondataavailable = (event) => {
        audioChunks.push(event.data);
      };

      mediaRecorder.onstop = async () => {
        setIsTranscribing(true);
        const audioBlob = new Blob(audioChunks, { type: 'audio/webm' });
        try {
          const text = await transcribeAudio(audioBlob);
          setTitle(prev => (prev ? `${prev} ${text}` : text));
        } catch (error) {
          console.error("Transcription failed", error);
        } finally {
          setIsTranscribing(false);
          stream.getTracks().forEach(track => track.stop());
        }
      };

      mediaRecorder.start();
      setIsRecording(true);
    } catch (err) {
      console.error("Error accessing microphone", err);
    }
  };

  const stopRecording = () => {
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop();
      setIsRecording(false);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) return;

    let calculatedDurationInMinutes = durationValue;
    if (durationUnit === 'hours') {
        calculatedDurationInMinutes = durationValue * 60;
    } else if (durationUnit === 'days') {
        calculatedDurationInMinutes = durationValue * 24 * 60;
    }

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
    <div className="bg-slate-800 rounded-xl shadow-sm border border-slate-700 p-6 mb-6 transition-colors duration-200">
      <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
        <Plus className="h-5 w-5 text-indigo-500" />
        Add New Task
      </h3>
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label htmlFor="title" className="block text-sm font-medium text-slate-300 mb-1">Task Description</label>
          <div className="flex gap-2">
            <input
                type="text"
                id="title"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="e.g., Review Q3 Marketing Report"
                className="w-full px-4 py-2 border border-slate-600 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 bg-slate-900 text-white placeholder-slate-500 transition-colors"
            />
            <button
                type="button"
                onClick={isRecording ? stopRecording : startRecording}
                disabled={isTranscribing}
                className={`p-2 rounded-lg border flex items-center justify-center transition-all ${
                    isRecording 
                    ? 'bg-red-500/20 border-red-500 text-red-400 animate-pulse' 
                    : 'bg-slate-700 border-slate-600 text-slate-300 hover:text-white'
                }`}
            >
                {isTranscribing ? <Loader2 className="h-5 w-5 animate-spin" /> : isRecording ? <MicOff className="h-5 w-5" /> : <Mic className="h-5 w-5" />}
            </button>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label htmlFor="duration" className="block text-sm font-medium text-slate-300 mb-1">Duration</label>
            <div className="flex rounded-lg shadow-sm">
                <div className="relative flex-grow focus-within:z-10">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                        <Clock className="h-4 w-4 text-slate-500" />
                    </div>
                    <input
                        type="number"
                        id="duration"
                        min="0.1"
                        step="0.1"
                        value={durationValue}
                        onChange={(e) => setDurationValue(Number(e.target.value))}
                        className="w-full pl-10 pr-4 py-2 border border-slate-600 rounded-l-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 bg-slate-900 text-white transition-colors"
                    />
                </div>
                <div className="-ml-px relative">
                     <select
                        value={durationUnit}
                        onChange={(e) => setDurationUnit(e.target.value as DurationUnit)}
                        className="h-full pl-3 pr-8 py-2 border border-slate-600 rounded-r-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 bg-slate-800 text-slate-300 text-sm transition-colors border-l-0"
                    >
                        <option value="minutes">Mins</option>
                        <option value="hours">Hours</option>
                        <option value="days">Days</option>
                    </select>
                </div>
            </div>
          </div>

          <div>
            <label htmlFor="priority" className="block text-sm font-medium text-slate-300 mb-1">Priority</label>
            <div className="relative">
              <AlertCircle className="absolute left-3 top-2.5 h-4 w-4 text-slate-500" />
              <select
                id="priority"
                value={priority}
                onChange={(e) => setPriority(e.target.value as Priority)}
                className="w-full pl-10 pr-4 py-2 border border-slate-600 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 bg-slate-900 text-white transition-colors"
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
          className="w-full bg-indigo-600 hover:bg-indigo-500 text-white font-medium py-2.5 rounded-lg transition-colors flex items-center justify-center gap-2"
        >
          <Plus className="h-4 w-4" />
          Add to List
        </button>
      </form>
    </div>
  );
};

export default TaskForm;