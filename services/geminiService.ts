import { GoogleGenAI, Type, Modality } from "@google/genai";
import { Task, UserPreferences, ScheduleResponse, ImageSize } from '../types';

// --- Productivity / Schedule ---

export const generateSchedule = async (
  tasks: Task[],
  preferences: UserPreferences
): Promise<ScheduleResponse> => {
  const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
  const pendingTasks = tasks.filter(t => !t.isCompleted);
  
  if (pendingTasks.length === 0) {
    throw new Error("No pending tasks to schedule.");
  }

  const systemInstruction = `
    You are an intelligent, calm, and supportive personal AI assistant designed to help users organize their daily life, manage tasks, and improve productivity in a gentle, human-centered way.
    
    Your role is to understand the user’s routines, priorities, energy levels, and emotional state, and help them plan their day in a balanced and realistic manner.

    CORE BEHAVIOR
    - Speak in a friendly, caring, and motivating tone — like a supportive friend or mentor.
    - Never sound robotic, rushed, or overly technical.
    - Keep responses simple, warm, and easy to understand.
    - Be encouraging, not demanding.

    DAILY SCHEDULING LOGIC
    - Consider energy levels (low / medium / high)
    - Respect fixed commitments
    - Include breaks
    - Avoid overloading
    - Prioritize important tasks over urgent noise
    - Explain why the schedule is structured that way in the summary.
  `;

  const prompt = `
    Please create an optimal daily schedule based on the following:
    
    User Preferences:
    - Start Day: ${preferences.startOfDay}
    - End Day: ${preferences.endOfDay}
    - Wants Breaks: ${preferences.includeBreaks}
    - Focus Energy High: ${preferences.focusPreference}

    Pending Tasks:
    ${JSON.stringify(pendingTasks)}

    The "reason" field in the JSON should reflect the supportive persona (e.g., "I placed this here to match your morning energy").
    The "dailySummary" should be a warm, encouraging message explaining the plan.
  `;

  // Using gemini-3-flash-preview for better availability and speed for this task
  const response = await ai.models.generateContent({
    model: 'gemini-3-flash-preview', 
    contents: prompt,
    config: {
      systemInstruction: systemInstruction,
      responseMimeType: "application/json",
      responseSchema: {
        type: Type.OBJECT,
        properties: {
          schedule: {
            type: Type.ARRAY,
            items: {
              type: Type.OBJECT,
              properties: {
                startTime: { type: Type.STRING, description: "HH:MM 24hr format" },
                endTime: { type: Type.STRING, description: "HH:MM 24hr format" },
                activity: { type: Type.STRING, description: "Name of task or break" },
                type: { type: Type.STRING, enum: ["task", "break", "routine"] },
                reason: { type: Type.STRING, description: "Why this time? Keep it supportive." },
                durationMinutes: { type: Type.NUMBER }
              },
              required: ["startTime", "endTime", "activity", "type", "reason", "durationMinutes"]
            }
          },
          dailySummary: {
            type: Type.STRING,
            description: "A motivational, gentle summary of the day's plan."
          }
        },
        required: ["schedule", "dailySummary"]
      }
    }
  });

  const text = response.text;
  if (!text) {
      throw new Error("No response from AI");
  }
  return JSON.parse(text) as ScheduleResponse;
};

// --- Audio Transcription ---

export const transcribeAudio = async (audioBlob: Blob): Promise<string> => {
  const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
  const base64Audio = await blobToBase64(audioBlob);
  
  const response = await ai.models.generateContent({
    model: 'gemini-3-flash-preview',
    contents: {
      parts: [
        {
          inlineData: {
            mimeType: audioBlob.type, 
            data: base64Audio
          }
        },
        { text: "Transcribe this audio exactly as spoken." }
      ]
    }
  });

  return response.text || "";
};

// --- Text to Speech ---

export const generateSpeech = async (text: string): Promise<string> => {
  const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
  const response = await ai.models.generateContent({
    model: "gemini-2.5-flash-preview-tts",
    contents: [{ parts: [{ text }] }],
    config: {
      responseModalities: [Modality.AUDIO],
      speechConfig: {
        voiceConfig: {
          prebuiltVoiceConfig: { voiceName: 'Kore' },
        },
      },
    },
  });

  const audioData = response.candidates?.[0]?.content?.parts?.[0]?.inlineData?.data;
  if (!audioData) throw new Error("Failed to generate speech");
  return audioData;
};

// --- Image Generation & Editing ---

export const generateImage = async (prompt: string, size: ImageSize): Promise<string> => {
  const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
  
  // Use gemini-2.5-flash-image by default
  // Upgrade to gemini-3-pro-image-preview for high resolution (2K/4K)
  const model = (size === '2K' || size === '4K') 
    ? 'gemini-3-pro-image-preview' 
    : 'gemini-2.5-flash-image';

  const response = await ai.models.generateContent({
    model: model,
    contents: {
      parts: [{ text: prompt }]
    },
    config: {
      imageConfig: {
        aspectRatio: "1:1",
        ...(model === 'gemini-3-pro-image-preview' ? { imageSize: size } : {})
      }
    }
  });

  for (const candidate of response.candidates || []) {
      for (const part of candidate.content.parts) {
          if (part.inlineData && part.inlineData.data) {
              return part.inlineData.data;
          }
      }
  }
  
  throw new Error("Failed to generate image");
};

export const editImage = async (base64Image: string, mimeType: string, prompt: string): Promise<string> => {
  const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
  // Using gemini-2.5-flash-image for editing
  const model = 'gemini-2.5-flash-image';

  const response = await ai.models.generateContent({
    model: model,
    contents: {
      parts: [
        {
          inlineData: {
            data: base64Image,
            mimeType: mimeType,
          },
        },
        {
          text: prompt,
        },
      ],
    },
  });

  for (const candidate of response.candidates || []) {
      for (const part of candidate.content.parts) {
          if (part.inlineData && part.inlineData.data) {
              return part.inlineData.data;
          }
      }
  }

  throw new Error("Failed to edit image");
};

// --- Chat ---

export const chatWithAI = async (history: {role: string, parts: {text: string}[]}[], message: string) => {
  const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
  const chat = ai.chats.create({
    model: 'gemini-3-flash-preview', // Switched to Flash for general chat to avoid Pro permission issues
    history: history,
    config: {
      tools: [{ googleSearch: {} }] // Search Grounding
    }
  });

  const result = await chat.sendMessage({ message });
  
  // Extract grounding URLs
  const groundingChunks = result.candidates?.[0]?.groundingMetadata?.groundingChunks;
  const urls: string[] = [];
  if (groundingChunks) {
    groundingChunks.forEach((chunk: any) => {
      if (chunk.web?.uri) {
        urls.push(chunk.web.uri);
      }
    });
  }

  return {
    text: result.text,
    urls: urls
  };
};

// --- Helpers ---

const blobToBase64 = (blob: Blob): Promise<string> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onloadend = () => {
      const base64String = (reader.result as string).split(',')[1];
      resolve(base64String);
    };
    reader.onerror = reject;
    reader.readAsDataURL(blob);
  });
};