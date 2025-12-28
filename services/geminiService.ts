import { GoogleGenAI, Type } from "@google/genai";
import { Task, UserPreferences, ScheduleResponse } from '../types';

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

export const generateSchedule = async (
  tasks: Task[],
  preferences: UserPreferences
): Promise<ScheduleResponse> => {
  const pendingTasks = tasks.filter(t => !t.isCompleted);
  
  if (pendingTasks.length === 0) {
    throw new Error("No pending tasks to schedule.");
  }

  const prompt = `
    You are an expert productivity assistant.
    Create an optimal daily schedule based on the following tasks and user preferences.
    
    User Preferences:
    - Start Day: ${preferences.startOfDay}
    - End Day: ${preferences.endOfDay}
    - Wants Breaks: ${preferences.includeBreaks}
    - Focus Energy High: ${preferences.focusPreference}

    Pending Tasks:
    ${JSON.stringify(pendingTasks)}

    Rules:
    1. Prioritize HIGH priority tasks during the user's focus preference time if possible.
    2. Group similar tasks if efficient.
    3. Include short breaks (5-15 mins) if "Wants Breaks" is true, especially after long tasks.
    4. Ensure the schedule fits within the Start and End times. If not all tasks fit, prioritize High/Medium tasks and explain why in the summary.
    5. The "reason" field should explain WHY this task was placed here (e.g., "Scheduled during peak focus time" or "Quick win to start the day").
  `;

  const response = await ai.models.generateContent({
    model: 'gemini-3-flash-preview',
    contents: prompt,
    config: {
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
                reason: { type: Type.STRING, description: "Why this time?" },
                durationMinutes: { type: Type.NUMBER }
              },
              required: ["startTime", "endTime", "activity", "type", "reason", "durationMinutes"]
            }
          },
          dailySummary: {
            type: Type.STRING,
            description: "A motivational summary of the day's plan and strategy."
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