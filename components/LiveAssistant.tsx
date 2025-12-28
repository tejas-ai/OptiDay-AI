import React, { useEffect, useRef, useState } from 'react';
import { GoogleGenAI, LiveServerMessage, Modality } from '@google/genai';
import { Mic, MicOff, Radio, X, Loader2 } from 'lucide-react';

const LiveAssistant: React.FC = () => {
  const [isActive, setIsActive] = useState(false);
  const [isConnecting, setIsConnecting] = useState(false);
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [audioContext, setAudioContext] = useState<AudioContext | null>(null);
  
  // Refs for cleanup
  const sessionRef = useRef<any>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const sourceRef = useRef<MediaStreamAudioSourceNode | null>(null);
  const processorRef = useRef<ScriptProcessorNode | null>(null);
  const audioQueueRef = useRef<{buffer: AudioBuffer, time: number}[]>([]);
  const nextStartTimeRef = useRef<number>(0);

  const startSession = async () => {
    setIsConnecting(true);
    try {
      const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
      
      const ctx = new (window.AudioContext || (window as any).webkitAudioContext)({ sampleRate: 24000 });
      setAudioContext(ctx);

      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      streamRef.current = stream;

      const inputCtx = new (window.AudioContext || (window as any).webkitAudioContext)({ sampleRate: 16000 });
      const source = inputCtx.createMediaStreamSource(stream);
      const processor = inputCtx.createScriptProcessor(4096, 1, 1);
      
      sourceRef.current = source;
      processorRef.current = processor;

      source.connect(processor);
      processor.connect(inputCtx.destination);

      const sessionPromise = ai.live.connect({
        model: 'gemini-2.5-flash-native-audio-preview-09-2025',
        config: {
          responseModalities: [Modality.AUDIO],
          speechConfig: {
            voiceConfig: { prebuiltVoiceConfig: { voiceName: 'Zephyr' } },
          },
          systemInstruction: "You are OptiDay's voice assistant. Be helpful, concise, and friendly.",
        },
        callbacks: {
          onopen: () => {
            console.log('Live session opened');
            setIsConnecting(false);
            setIsActive(true);
          },
          onmessage: async (message: LiveServerMessage) => {
            const base64Audio = message.serverContent?.modelTurn?.parts?.[0]?.inlineData?.data;
            if (base64Audio) {
              const binary = atob(base64Audio);
              const bytes = new Uint8Array(binary.length);
              for (let i = 0; i < binary.length; i++) bytes[i] = binary.charCodeAt(i);
              
              const pcmData = new Int16Array(bytes.buffer);
              const buffer = ctx.createBuffer(1, pcmData.length, 24000);
              const channelData = buffer.getChannelData(0);
              for (let i = 0; i < pcmData.length; i++) {
                channelData[i] = pcmData[i] / 32768.0;
              }

              const source = ctx.createBufferSource();
              source.buffer = buffer;
              source.connect(ctx.destination);
              
              const currentTime = ctx.currentTime;
              const startTime = Math.max(currentTime, nextStartTimeRef.current);
              source.start(startTime);
              nextStartTimeRef.current = startTime + buffer.duration;
            }
          },
          onclose: () => {
            console.log('Live session closed');
            stopSession();
          },
          onerror: (err) => {
            console.error('Live session error', err);
            stopSession();
          }
        }
      });

      sessionRef.current = sessionPromise;

      processor.onaudioprocess = (e) => {
        const inputData = e.inputBuffer.getChannelData(0);
        // Resample to 16k if needed or just convert to PCM16
        // Simple conversion to PCM16
        const pcm16 = new Int16Array(inputData.length);
        for (let i = 0; i < inputData.length; i++) {
            pcm16[i] = inputData[i] * 32768;
        }
        
        // Encode to base64
        let binary = '';
        const bytes = new Uint8Array(pcm16.buffer);
        const len = bytes.byteLength;
        for (let i = 0; i < len; i++) {
            binary += String.fromCharCode(bytes[i]);
        }
        const base64 = btoa(binary);

        sessionPromise.then(session => {
             session.sendRealtimeInput({
                media: {
                    mimeType: 'audio/pcm;rate=16000',
                    data: base64
                }
             });
        });
      };

    } catch (err) {
      console.error("Failed to start live session", err);
      setIsConnecting(false);
      stopSession();
    }
  };

  const stopSession = () => {
    if (sessionRef.current) {
        // We can't strictly cancel the promise, but we can close via connection if available
        // The API doesn't expose a clean `close()` method on the promise itself in the snippet provided
        // But usually we just stop sending data and close audio contexts
    }
    
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(t => t.stop());
    }
    if (processorRef.current) processorRef.current.disconnect();
    if (sourceRef.current) sourceRef.current.disconnect();
    if (audioContext) audioContext.close();

    setIsActive(false);
    setIsConnecting(false);
    nextStartTimeRef.current = 0;
  };

  return (
    <>
      {/* Static Widget (In-flow) */}
      {!isActive && (
        <div className="bg-slate-800 rounded-xl shadow-sm border border-slate-700 p-5 mb-8 transition-colors duration-200">
            <div className="flex items-center justify-between gap-4">
                <div className="flex items-center gap-3">
                     <div className="p-2.5 bg-indigo-900/50 rounded-lg border border-indigo-500/30">
                        <Radio className="h-5 w-5 text-indigo-400" />
                    </div>
                    <div>
                        <h3 className="font-semibold text-white text-sm">Live Voice Mode</h3>
                        <p className="text-xs text-slate-400 mt-0.5">Plan your day hands-free</p>
                    </div>
                </div>
                <button
                  onClick={startSession}
                  disabled={isConnecting}
                  className="flex items-center gap-2 px-4 py-2 bg-indigo-600 hover:bg-indigo-500 text-white text-sm font-medium rounded-lg transition-colors shadow-sm whitespace-nowrap"
                >
                  {isConnecting ? <Loader2 className="h-4 w-4 animate-spin" /> : <Mic className="h-4 w-4" />}
                  <span>Start</span>
                </button>
            </div>
        </div>
      )}

      {/* Active Overlay (Modal) */}
      {isActive && (
        <div className="fixed inset-0 bg-slate-950/90 backdrop-blur-md z-50 flex flex-col items-center justify-center">
            <div className="relative">
                 <div className="absolute inset-0 bg-indigo-500 rounded-full opacity-20 animate-ping"></div>
                 <div className="relative bg-slate-800 p-8 rounded-full border-2 border-indigo-500 shadow-2xl shadow-indigo-500/20">
                    <Mic className="h-12 w-12 text-indigo-400" />
                 </div>
            </div>
            
            <h2 className="mt-8 text-2xl font-bold text-white">Listening...</h2>
            <p className="text-slate-400 mt-2">Speak naturally to your assistant</p>

            <button 
                onClick={stopSession}
                className="mt-12 flex items-center gap-2 px-6 py-3 bg-red-500/10 hover:bg-red-500/20 text-red-400 border border-red-500/50 rounded-full transition-colors"
            >
                <X className="h-5 w-5" />
                End Session
            </button>
        </div>
      )}
    </>
  );
};

export default LiveAssistant;