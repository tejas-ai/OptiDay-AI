import React, { useState } from 'react';
import { ScheduleResponse } from '../types';
import { Play, Coffee, Brain, Volume2, Loader2, StopCircle } from 'lucide-react';
import { generateSpeech } from '../services/geminiService';

interface ScheduleDisplayProps {
  scheduleData: ScheduleResponse | null;
  isLoading: boolean;
  onGenerate: () => void;
  hasTasks: boolean;
}

const ScheduleDisplay: React.FC<ScheduleDisplayProps> = ({ scheduleData, isLoading, onGenerate, hasTasks }) => {
  const [isPlaying, setIsPlaying] = useState(false);
  const [isGeneratingAudio, setIsGeneratingAudio] = useState(false);
  const [audioSource, setAudioSource] = useState<AudioBufferSourceNode | null>(null);
  const [audioContext, setAudioContext] = useState<AudioContext | null>(null);

  const handleReadAloud = async () => {
    if (isPlaying) {
      audioSource?.stop();
      setIsPlaying(false);
      return;
    }

    if (!scheduleData) return;

    try {
      setIsGeneratingAudio(true);
      // Construct a natural reading of the schedule
      const textToRead = `Here is your plan for the day. ${scheduleData.dailySummary}. Starting with your schedule: ` + 
        scheduleData.schedule.map(item => `At ${item.startTime}, ${item.activity}.`).join(' ');

      const base64Audio = await generateSpeech(textToRead);
      
      const ctx = new (window.AudioContext || (window as any).webkitAudioContext)();
      setAudioContext(ctx);

      // Decode
      const binaryString = atob(base64Audio);
      const len = binaryString.length;
      const bytes = new Uint8Array(len);
      for (let i = 0; i < len; i++) {
        bytes[i] = binaryString.charCodeAt(i);
      }

      const audioBuffer = await ctx.decodeAudioData(bytes.buffer);
      const source = ctx.createBufferSource();
      source.buffer = audioBuffer;
      source.connect(ctx.destination);
      source.onended = () => setIsPlaying(false);
      
      setAudioSource(source);
      source.start(0);
      setIsPlaying(true);
    } catch (err) {
      console.error("Failed to play audio", err);
    } finally {
      setIsGeneratingAudio(false);
    }
  };

  if (isLoading) {
    return (
      <div className="h-full flex flex-col items-center justify-center p-8 text-center min-h-[400px]">
        <div className="relative w-16 h-16 mb-6">
          <div className="absolute top-0 left-0 w-full h-full border-4 border-indigo-900/30 rounded-full"></div>
          <div className="absolute top-0 left-0 w-full h-full border-4 border-indigo-600 rounded-full border-t-transparent animate-spin"></div>
        </div>
        <h3 className="text-xl font-semibold text-white mb-2">Optimizing Your Day</h3>
        <p className="text-slate-400 max-w-xs mx-auto">Analyzing priorities, energy levels, and durations to build the perfect schedule...</p>
      </div>
    );
  }

  if (!scheduleData) {
    return (
      <div className="h-full flex flex-col items-center justify-center p-8 text-center min-h-[400px] bg-indigo-900/10 rounded-xl border-2 border-dashed border-indigo-800/50 transition-colors duration-200">
        <Brain className="h-12 w-12 text-indigo-600 mb-4" />
        <h3 className="text-lg font-semibold text-indigo-200 mb-2">Ready to get things in order?</h3>
        <p className="text-indigo-400/80 max-w-md mx-auto mb-6 leading-relaxed">
          Just share what you need to do, and I’ll gently help you shape a schedule that flows naturally with your energy and pace.<br className="hidden sm:block" />
          No stress — just a plan made for you.
        </p>
        <button
          onClick={onGenerate}
          disabled={!hasTasks}
          className={`px-6 py-3 rounded-lg font-medium shadow-md transition-all flex items-center gap-2 ${
            hasTasks 
            ? 'bg-indigo-600 hover:bg-indigo-700 text-white hover:shadow-lg' 
            : 'bg-indigo-800 text-white cursor-not-allowed'
          }`}
        >
          <Play className="h-5 w-5 fill-current" />
          Generate Optimal Schedule
        </button>
      </div>
    );
  }

  return (
    <div className="bg-slate-800 rounded-xl shadow-lg border border-slate-700 overflow-hidden transition-colors duration-200">
      <div className="bg-slate-950 text-white p-6">
        <div className="flex items-start justify-between">
          <div>
            <h2 className="text-2xl font-bold mb-2">Your Daily Blueprint</h2>
            <p className="text-indigo-200 text-sm leading-relaxed max-w-2xl">
              {scheduleData.dailySummary}
            </p>
          </div>
          <div className="flex gap-2">
             <button
              onClick={handleReadAloud}
              disabled={isGeneratingAudio}
              className="text-xs bg-slate-800 hover:bg-slate-700 text-indigo-400 border border-slate-700 px-3 py-1.5 rounded-full transition-colors font-medium whitespace-nowrap flex items-center gap-1"
            >
              {isGeneratingAudio ? <Loader2 className="h-3 w-3 animate-spin" /> : isPlaying ? <StopCircle className="h-3 w-3" /> : <Volume2 className="h-3 w-3" />}
              {isPlaying ? 'Stop' : 'Read Aloud'}
            </button>
            <button 
                onClick={onGenerate}
                className="text-xs bg-indigo-600 hover:bg-indigo-500 text-white px-3 py-1.5 rounded-full transition-colors font-medium whitespace-nowrap"
            >
                Regenerate
            </button>
          </div>
        </div>
      </div>

      <div className="p-6">
        <div className="relative pl-8 space-y-8 before:content-[''] before:absolute before:left-[19px] before:top-2 before:bottom-4 before:w-0.5 before:bg-slate-700">
          {scheduleData.schedule.map((item, index) => (
            <div key={index} className="relative group">
              {/* Timeline dot */}
              <div className={`absolute -left-[23px] top-1.5 h-3 w-3 rounded-full border-2 bg-slate-800 z-10 
                ${item.type === 'break' ? 'border-emerald-500' : 'border-indigo-500'}`}></div>
              
              <div className="flex flex-col sm:flex-row sm:items-start gap-4">
                <div className="min-w-[100px] flex-shrink-0">
                  <div className="font-mono text-sm font-bold text-slate-200">
                    {item.startTime} - {item.endTime}
                  </div>
                  <div className="text-xs text-slate-400 mt-0.5 font-medium">{item.durationMinutes} min</div>
                </div>

                <div className={`flex-1 rounded-lg p-4 border transition-all hover:shadow-md ${
                  item.type === 'break' 
                    ? 'bg-emerald-900/10 border-emerald-800/30' 
                    : item.type === 'routine'
                    ? 'bg-amber-900/10 border-amber-800/30'
                    : 'bg-slate-800/50 border-slate-700'
                }`}>
                  <div className="flex items-start justify-between gap-4">
                    <div>
                      <h4 className={`font-semibold text-lg ${
                        item.type === 'break' ? 'text-emerald-400' : 'text-slate-100'
                      }`}>
                        {item.type === 'break' && <Coffee className="inline-block h-5 w-5 mr-2 -mt-1" />}
                        {item.activity}
                      </h4>
                      <p className={`text-sm mt-1 ${
                        item.type === 'break' ? 'text-emerald-400/80' : 'text-slate-400'
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
        
        <div className="mt-8 pt-6 border-t border-slate-800 text-center">
            <p className="text-sm text-slate-500 italic">"The key is not to prioritize what's on your schedule, but to schedule your priorities."</p>
        </div>
      </div>
    </div>
  );
};

export default ScheduleDisplay;