import { GoogleGenAI } from "@google/genai";
import type {
  CulturalCuriosity,
  Emotion,
  StoryBranch,
  TimeOfDay,
} from "../models/journey";

export interface GeneratedStoryResult {
  title: string;
  storyProse: string;
  visualPrompt: string;
  branches: StoryBranch[];
}

export async function generateMicroStory(params: {
  emotion: Emotion;
  timeOfDay: TimeOfDay;
  location: CulturalCuriosity;
  previousContext?: string;
}): Promise<GeneratedStoryResult> {
  const { emotion, timeOfDay, location, previousContext } = params;

  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    throw new Error("GEMINI_API_KEY is not defined in environment variables.");
  }

  const ai = new GoogleGenAI({
    apiKey,
    apiVersion: "v1beta",
  });

  const prompt = `You are the sensory soul of Kolkata in the cinematic observational tradition of Satyajit Ray.
Write a first-person micro-story for a visitor experiencing Kolkata.
Parameters:
- Emotion: ${emotion}
- Time of Day: ${timeOfDay}
- Cultural Location: ${location}
${previousContext ? `- Context: ${previousContext.slice(0, 1000)}` : ""}

Respond ONLY with valid JSON in this exact structure:
{
  "title": "Short evocative title",
  "storyProse": "Two short, resonant paragraphs separated by double newlines (under 140 words total). Emphasize physical senses: tram bells, river silt, roasted cardamom chai, teak shutters.",
  "visualPrompt": "A 35mm cinematic photograph of ${location} at ${timeOfDay}, ${emotion} mood, atmospheric lighting, celluloid grain.",
  "branches": [
    { "id": "branch-1", "label": "First wandering choice", "promptSeed": "Brief seed description" },
    { "id": "branch-2", "label": "Second wandering choice", "promptSeed": "Brief seed description" }
  ]
}`;

  const response = await ai.models.generateContent({
    model: "gemini-2.5-flash",
    contents: prompt,
    config: {
      responseMimeType: "application/json",
      temperature: 0.85,
    },
  });

  const text = response.text?.trim();
  if (!text) {
    throw new Error("Empty response returned by AI model.");
  }

  const cleaned = text
    .replace(/^```json\s*/i, "")
    .replace(/^```\s*/i, "")
    .replace(/\s*```$/i, "")
    .trim();

  return JSON.parse(cleaned) as GeneratedStoryResult;
}
